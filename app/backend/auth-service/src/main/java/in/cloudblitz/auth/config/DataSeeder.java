package in.cloudblitz.auth.config;

import in.cloudblitz.auth.entity.User;
import in.cloudblitz.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public void run(String... args) throws Exception {
        seedDefaultUsers();
    }

    private void seedDefaultUsers() {
        // Create default admin user if it doesn't exist
        if (!userRepository.existsByEmail("ramesh@admin.com")) {
            User adminUser = new User(
                "Ramesh Admin",
                "ramesh@admin.com",
                passwordEncoder.encode("ramesh@admin")
            );
            userRepository.save(adminUser);
            System.out.println("Created default admin user: ramesh@admin.com with password: ramesh@admin");
        }

        // Create a test user if it doesn't exist
        if (!userRepository.existsByEmail("student@cloudblitz.in")) {
            User testUser = new User(
                "Test Student",
                "student@cloudblitz.in",
                passwordEncoder.encode("password123")
            );
            userRepository.save(testUser);
            System.out.println("Created test user: student@cloudblitz.in");
        }
    }
}
