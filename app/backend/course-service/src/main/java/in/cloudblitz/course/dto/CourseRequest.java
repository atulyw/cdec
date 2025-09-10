package in.cloudblitz.course.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CourseRequest(
    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    String title,
    
    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 500, message = "Description must be between 10 and 500 characters")
    String description,
    
    @NotBlank(message = "Instructor is required")
    @Size(min = 2, max = 50, message = "Instructor name must be between 2 and 50 characters")
    String instructor,
    
    @NotNull(message = "Duration is required")
    @Positive(message = "Duration must be positive")
    Integer duration,
    
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    Double price
) {}
