package in.cloudblitz.auth.dto;

public record AuthResponse(
    String token,
    UserDto user
) {}
