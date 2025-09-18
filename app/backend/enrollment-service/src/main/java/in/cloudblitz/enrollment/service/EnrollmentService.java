package in.cloudblitz.enrollment.service;

import in.cloudblitz.enrollment.dto.EnrollmentRequest;
import in.cloudblitz.enrollment.entity.Enrollment;
import in.cloudblitz.enrollment.repository.EnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EnrollmentService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    public List<Enrollment> getUserEnrollments(String userId) {
        return enrollmentRepository.findByUserId(userId);
    }

    public Enrollment enrollInCourse(String userId, EnrollmentRequest request) {
        // Check if user is already enrolled in this course
        if (enrollmentRepository.existsByUserIdAndCourseId(userId, request.courseId())) {
            throw new RuntimeException("User is already enrolled in this course");
        }

        // For demo purposes, we'll use a hardcoded course title
        // In a real application, you would fetch this from the course service
        String courseTitle = getCourseTitle(request.courseId());
        
        Enrollment enrollment = new Enrollment(userId, request.courseId(), courseTitle);
        return enrollmentRepository.save(enrollment);
    }

    private String getCourseTitle(String courseId) {
        // This is a simplified version. In a real application, you would call the course service
        // or have a shared database to get the course title
        switch (courseId) {
            case "1":
                return "AWS Fundamentals";
            case "2":
                return "Docker & Kubernetes";
            case "3":
                return "Cloud Security Best Practices";
            default:
                return "Unknown Course";
        }
    }
}
