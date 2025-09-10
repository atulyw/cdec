package in.cloudblitz.enrollment.dto;

import jakarta.validation.constraints.NotBlank;

public record EnrollmentRequest(
    @NotBlank(message = "Course ID is required")
    String courseId
) {}
