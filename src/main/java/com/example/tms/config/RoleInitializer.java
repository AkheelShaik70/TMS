package com.example.tms.config;

import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.example.tms.entity.Role;
import com.example.tms.repository.RoleRepository;

@Configuration
public class RoleInitializer {
    @Bean
    CommandLineRunner initializeRoles(RoleRepository roleRepository) {
        return args -> {
            for (String roleName : List.of("CUSTOMER", "AGENT", "ADMIN")) {
                if (roleRepository.findByName(roleName).isEmpty()) {
                    roleRepository.save(new Role(roleName));
                }
            }
        };
    }
}
