package com.example.tms.security;

import java.io.IOException;
import java.util.Locale;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import com.example.tms.dto.AuthResponse;
import com.example.tms.entity.Role;
import com.example.tms.entity.User;
import com.example.tms.repository.RoleRepository;
import com.example.tms.repository.UserRepository;
import com.example.tms.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class GoogleOAuth2SuccessHandler implements AuthenticationSuccessHandler {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuthService authService;
    private final ObjectMapper objectMapper;

    public GoogleOAuth2SuccessHandler(UserRepository userRepository, RoleRepository roleRepository,
            AuthService authService, ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.authService = authService;
        this.objectMapper = objectMapper;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        OAuth2User googleUser = (OAuth2User) authentication.getPrincipal();
        String email = googleUser.getAttribute("email");
        String providerId = googleUser.getAttribute("sub");
        String name = googleUser.getAttribute("name");
        Boolean emailVerified = googleUser.getAttribute("email_verified");

        if (email == null || providerId == null || !Boolean.TRUE.equals(emailVerified)) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Google account email is not verified.");
            return;
        }

        email = email.trim().toLowerCase(Locale.ROOT);
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            Role customerRole = roleRepository.findByName("CUSTOMER")
                    .orElseThrow(() -> new IllegalStateException("CUSTOMER role has not been initialized."));
            user = new User(name == null || name.isBlank() ? email : name, email, null, customerRole);
            user.setAuthProvider("GOOGLE");
            user.setProviderId(providerId);
            user = userRepository.save(user);
        } else if (!"GOOGLE".equals(user.getAuthProvider())
                || !providerId.equals(user.getProviderId())) {
            response.sendError(HttpServletResponse.SC_CONFLICT,
                    "An account with this email already exists. Sign in using its original method.");
            return;
        }

        AuthResponse tokenResponse = authService.response(user);
        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), tokenResponse);
    }
}
