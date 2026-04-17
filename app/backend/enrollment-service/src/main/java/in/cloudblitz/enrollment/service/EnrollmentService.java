package in.cloudblitz.enrollment.service;

import in.cloudblitz.enrollment.dto.EnrollmentRequest;
import in.cloudblitz.enrollment.entity.Enrollment;
import in.cloudblitz.enrollment.repository.EnrollmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;

@Service
public class EnrollmentService {

    private static final Logger log = LoggerFactory.getLogger(EnrollmentService.class);

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Value("${course.service.url}")
    private String courseServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public List<Enrollment> getUserEnrollments(String userId) {
        List<Enrollment> result = enrollmentRepository.findByUserId(userId);
        log.debug("getUserEnrollments userId={} count={}", userId, result.size());
        // Backfill titles for older enrollments created with placeholder titles.
        for (Enrollment e : result) {
            if (e.getCourseId() == null) continue;
            String currentTitle = e.getCourseTitle();
            if (currentTitle == null || currentTitle.isBlank() || "Unknown Course".equalsIgnoreCase(currentTitle)) {
                fetchCourseTitle(e.getCourseId()).ifPresent((title) -> {
                    e.setCourseTitle(title);
                    try {
                        enrollmentRepository.save(e);
                    } catch (Exception ex) {
                        log.warn("Failed to persist backfilled title enrollmentId={} courseId={}", e.getId(), e.getCourseId());
                    }
                });
            }
        }
        return result;
    }

    public Enrollment enrollInCourse(String userId, EnrollmentRequest request) {
        // Check if user is already enrolled in this course
        if (enrollmentRepository.existsByUserIdAndCourseId(userId, request.courseId())) {
            throw new RuntimeException("User is already enrolled in this course");
        }

        String courseTitle = fetchCourseTitle(request.courseId())
                .orElseGet(() -> {
                    log.warn("Course title lookup failed for courseId={}, using fallback title", request.courseId());
                    return "Course";
                });
        
        Enrollment enrollment = new Enrollment(userId, request.courseId(), courseTitle);
        return enrollmentRepository.save(enrollment);
    }

    private Optional<String> fetchCourseTitle(String courseId) {
        try {
            String base = courseServiceUrl != null ? courseServiceUrl.replaceAll("/+$", "") : "";
            String url = base + "/" + courseId;
            log.debug("Fetching course for enrollment courseId={} url={}", courseId, url);

            ResponseEntity<CourseApiResponse<CourseDto>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<>() {}
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                log.warn("Course lookup non-2xx courseId={} status={}", courseId, response.getStatusCode());
                return Optional.empty();
            }

            CourseApiResponse<CourseDto> body = response.getBody();
            if (body == null || !body.success() || body.data() == null) {
                log.warn("Course lookup invalid body courseId={} body={}", courseId, body);
                return Optional.empty();
            }

            String title = body.data().title();
            if (title == null || title.isBlank()) return Optional.empty();
            return Optional.of(title);
        } catch (RestClientException ex) {
            log.warn("Course lookup failed courseId={} error={}", courseId, ex.getMessage());
            return Optional.empty();
        }
    }

    private record CourseDto(String id, String title) {}

    private record CourseApiResponse<T>(boolean success, T data, String error) {}
}
