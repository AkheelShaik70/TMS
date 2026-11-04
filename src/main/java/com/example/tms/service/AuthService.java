package com.example.tms.service;

import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.example.tms.dto.*;
import com.example.tms.entity.Role;
import com.example.tms.entity.User;
import com.example.tms.repository.RoleRepository;
import com.example.tms.repository.UserRepository;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;

    public AuthService(UserRepository userRepository, RoleRepository roleRepository,
            PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager,
            TokenService tokenService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered.");
        }
        Role customerRole = roleRepository.findByName("CUSTOMER")
                .orElseThrow(() -> new IllegalStateException("CUSTOMER role has not been initialized."));
        User user = new User(request.name().trim(), email,
                passwordEncoder.encode(request.password()), customerRole);
        user = userRepository.save(user);
        return response(user);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password()));
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials."));
        return response(user);
    }

    public AuthResponse response(User user) {
        return new AuthResponse(tokenService.generateToken(user), "Bearer",
                tokenService.getExpirationSeconds(), user.getEmail(), user.getRole().getName());
    }
}
