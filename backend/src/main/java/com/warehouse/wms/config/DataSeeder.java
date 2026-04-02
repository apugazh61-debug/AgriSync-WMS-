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
                String adminPhone = "9943205075";
                User admin = userRepository.findByEmail(adminPhone).orElse(
                    User.builder().email(adminPhone).name("Agri Admin").role(User.Role.ADMIN).build()
                );
                admin.setPassword(passwordEncoder.encode("PugazhAlfiya"));
                userRepository.save(admin);
                System.out.println("Agri-WMS Admin Synchronized: " + adminPhone);
            } catch (Exception ignored) {
                System.err.println("Data seeder skipped: Could not connect to DB.");
            }
        };
    }
}
