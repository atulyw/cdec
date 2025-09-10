package in.cloudblitz.auth.dto;

public record AuthResponse(
    String token,
    UserDto user
) {}

record UserDto(
    String id,
    String name,
    String email
) {}
