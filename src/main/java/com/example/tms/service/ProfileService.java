
package com.example.tms.service;

import java.util.Locale;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.tms.dto.ProfileResponse;
import com.example.tms.dto.UpdateProfileRequest;
import com.example.tms.entity.User;
import com.example.tms.repository.UserRepository;

@Service
public class ProfileService {

    private final UserRepository userRepository;

    public ProfileService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        return mapToResponse(user);
    }

    @Transactional
    public ProfileResponse updateProfile(
            Authentication authentication,
            UpdateProfileRequest request) {

        User user = getAuthenticatedUser(authentication);

        user.setName(request.getName().trim());

        User updatedUser = userRepository.save(user);

        return mapToResponse(updatedUser);
    }

    private User getAuthenticatedUser(Authentication authentication) {

        String email = authentication.getName().toLowerCase(Locale.ROOT);

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Authenticated user not found"));
    }

    private ProfileResponse mapToResponse(User user) {

        boolean hasPassword =
                user.getPassword() != null &&
                        !user.getPassword().isBlank();

        return new ProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().getName(),
                user.getAuthProvider(),
                hasPassword
        );
    }
}
