package com.warehouse.wms.config;

import com.warehouse.wms.model.User;
import com.warehouse.wms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            try {
                // User ID 1 / Password 123
                String quickId = "1";
                User user1 = userRepository.findByEmail(quickId).orElse(
                    User.builder().email(quickId).name("Admin").role(User.Role.ADMIN).build()
                );
                user1.setPassword(passwordEncoder.encode("123"));
                userRepository.save(user1);

                // Primary Admin Account
                String adminPhone = "9943205075";
                User admin = userRepository.findByEmail(adminPhone).orElse(
                    User.builder().email(adminPhone).name("Agri Admin").role(User.Role.ADMIN).build()
                );
                admin.setPassword(passwordEncoder.encode("PugazhAlfiya"));
                userRepository.save(admin);

                // Standard Demo Admin Account
                String demoEmail = "admin@wms.com";
                User demoAdmin = userRepository.findByEmail(demoEmail).orElse(
                    User.builder().email(demoEmail).name("System Admin").role(User.Role.ADMIN).build()
                );
                demoAdmin.setPassword(passwordEncoder.encode("password123"));
                userRepository.save(demoAdmin);

                System.out.println("Agri-WMS Admins Synchronized: ID 1, " + adminPhone + ", and " + demoEmail);
            } catch (Exception ignored) {
                System.err.println("Data seeder skipped: Could not connect to DB.");
            }
        };
    }
}
