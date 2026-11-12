
package com.example.tms.service;

import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.tms.dto.AgentResponse;
import com.example.tms.dto.CreateAgentRequest;
import com.example.tms.entity.Role;
import com.example.tms.entity.User;
import com.example.tms.repository.RoleRepository;
import com.example.tms.repository.UserRepository;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AgentResponse createAgent(CreateAgentRequest request) {

        String email = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email is already registered."
            );
        }

        Role agentRole = roleRepository.findByName("AGENT")
                .orElseThrow(() -> new IllegalStateException(
                        "AGENT role has not been initialized."
                ));

        User agent = new User(
                request.name().trim(),
                email,
                passwordEncoder.encode(request.password()),
                agentRole
        );

        User savedAgent = userRepository.save(agent);

        return new AgentResponse(
                savedAgent.getId(),


                savedAgent.getName(),
                savedAgent.getEmail(),
                savedAgent.getRole().getName()
        );
    }
}
