package in.cloudblitz.auth.service;

import in.cloudblitz.auth.dto.AuthResponse;
import in.cloudblitz.auth.dto.LoginRequest;
import in.cloudblitz.auth.dto.RegisterRequest;
import in.cloudblitz.auth.entity.User;
import in.cloudblitz.auth.repository.UserRepository;
import in.cloudblitz.auth.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("User with this email already exists");
        }

        User user = new User(request.name(), request.email(), request.password());
        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, new AuthResponse.UserDto(user.getId(), user.getName(), user.getEmail()));
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, new AuthResponse.UserDto(user.getId(), user.getName(), user.getEmail()));
    }

    public AuthResponse.UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return new AuthResponse.UserDto(user.getId(), user.getName(), user.getEmail());
    }
}
