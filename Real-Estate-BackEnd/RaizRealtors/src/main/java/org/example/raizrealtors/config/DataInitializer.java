package org.example.raizrealtors.config;



import org.example.raizrealtors.user.Role;
import org.example.raizrealtors.user.User;
import org.example.raizrealtors.user.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedUsers() {

        return args -> {

            createUser(
                    "Admin",
                    "admin@raizrealtors.com",
                    "admin123",
                    Role.ADMIN
            );

            createUser(
                    "Kumar",
                    "sales@raizrealtors.com",
                    "sales123",
                    Role.SALES
            );

            createUser(
                    "Back Office",
                    "backoffice@raizrealtors.com",
                    "office123",
                    Role.BACK_OFFICE
            );

            createUser(
                    "Auditor",
                    "auditor@raizrealtors.com",
                    "audit123",
                    Role.AUDITOR
            );
        };
    }

    private void createUser(
            String name,
            String email,
            String password,
            Role role) {

        if (!userRepository.existsByEmail(email)) {

            userRepository.save(
                    User.builder()
                            .name(name)
                            .email(email)
                            .password(
                                    passwordEncoder.encode(password)
                            )
                            .role(role)
                            .active(true)
                            .build()
            );
        }
    }
}