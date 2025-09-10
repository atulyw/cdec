package in.cloudblitz.enrollment.controller;

import in.cloudblitz.enrollment.dto.ApiResponse;
import in.cloudblitz.enrollment.dto.EnrollmentRequest;
import in.cloudblitz.enrollment.entity.Enrollment;
import in.cloudblitz.enrollment.service.EnrollmentService;
import in.cloudblitz.enrollment.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enroll")
@CrossOrigin(origins = "*")
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/")
    public ResponseEntity<ApiResponse<List<Enrollment>>> getUserEnrollments(HttpServletRequest request) {
        try {
            // Temporarily disable JWT validation for testing
            // String token = extractTokenFromRequest(request);
            // if (token == null) {
            //     return ResponseEntity.badRequest().body(ApiResponse.error("No token provided"));
            // }

            // String email = jwtUtil.extractEmail(token);
            // if (!jwtUtil.validateToken(token, email)) {
            //     return ResponseEntity.badRequest().body(ApiResponse.error("Invalid token"));
            // }

            // String userId = jwtUtil.extractUserId(token);
            // List<Enrollment> enrollments = enrollmentService.getUserEnrollments(userId);
            
            // Return empty list for now
            List<Enrollment> enrollments = List.of();
            return ResponseEntity.ok(ApiResponse.success(enrollments));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/")
    public ResponseEntity<ApiResponse<Enrollment>> enrollInCourse(
            @Valid @RequestBody EnrollmentRequest request,
            HttpServletRequest httpRequest) {
        try {
            String token = extractTokenFromRequest(httpRequest);
            if (token == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("No token provided"));
            }

            String email = jwtUtil.extractEmail(token);
            if (!jwtUtil.validateToken(token, email)) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Invalid token"));
            }

            String userId = jwtUtil.extractUserId(token);
            Enrollment enrollment = enrollmentService.enrollInCourse(userId, request);
            return ResponseEntity.ok(ApiResponse.success(enrollment));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("Enrollment service is healthy"));
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
