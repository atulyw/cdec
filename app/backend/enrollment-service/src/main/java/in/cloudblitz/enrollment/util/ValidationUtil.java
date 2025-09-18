package in.cloudblitz.enrollment.util;

import org.springframework.stereotype.Component;

@Component
public class ValidationUtil {

    // DEMO: Intentional code duplication for SonarCloud demonstration
    public boolean isValidUserId(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            return false;
        }
        if (userId.length() < 3) {
            return false;
        }
        if (userId.length() > 50) {
            return false;
        }
        return userId.matches("^[a-zA-Z0-9_]+$");
    }

    // DEMO: Duplicate validation logic (will be detected by SonarCloud)
    public boolean validateUserId(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            return false;
        }
        if (userId.length() < 3) {
            return false;
        }
        if (userId.length() > 50) {
            return false;
        }
        return userId.matches("^[a-zA-Z0-9_]+$");
    }

    // DEMO: Another duplicate method with similar logic
    public boolean checkUserId(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            return false;
        }
        if (userId.length() < 3) {
            return false;
        }
        if (userId.length() > 50) {
            return false;
        }
        return userId.matches("^[a-zA-Z0-9_]+$");
    }

    // DEMO: Duplicate course ID validation
    public boolean isValidCourseId(String courseId) {
        if (courseId == null || courseId.trim().isEmpty()) {
            return false;
        }
        if (courseId.length() < 1) {
            return false;
        }
        if (courseId.length() > 20) {
            return false;
        }
        return courseId.matches("^[a-zA-Z0-9_-]+$");
    }

    // DEMO: Another duplicate course ID validation method
    public boolean validateCourseId(String courseId) {
        if (courseId == null || courseId.trim().isEmpty()) {
            return false;
        }
        if (courseId.length() < 1) {
            return false;
        }
        if (courseId.length() > 20) {
            return false;
        }
        return courseId.matches("^[a-zA-Z0-9_-]+$");
    }

    // DEMO: Duplicate email validation logic
    public boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        return email.matches("^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})$");
    }

    // DEMO: Another duplicate email validation method
    public boolean validateEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        return email.matches("^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})$");
    }

    // DEMO: Duplicate string utility methods
    public String sanitizeInput(String input) {
        if (input == null) {
            return "";
        }
        return input.trim().replaceAll("[<>\"'&]", "");
    }

    // DEMO: Another duplicate sanitization method
    public String cleanInput(String input) {
        if (input == null) {
            return "";
        }
        return input.trim().replaceAll("[<>\"'&]", "");
    }

    // DEMO: Duplicate null check methods
    public boolean isNullOrEmpty(String value) {
        return value == null || value.trim().isEmpty();
    }

    // DEMO: Another duplicate null check method
    public boolean isEmptyOrNull(String value) {
        return value == null || value.trim().isEmpty();
    }
}
