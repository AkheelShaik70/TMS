
package com.example.tms.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.tms.entity.PasswordResetToken;
import com.example.tms.entity.User;
import com.example.tms.repository.PasswordResetTokenRepository;
import com.example.tms.repository.UserRepository;

@Service
public class PasswordResetService {

    private static final int TOKEN_EXPIRY_MINUTES = 15;

    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final SecureRandom secureRandom = new SecureRandom();

    public PasswordResetService(
            PasswordResetTokenRepository tokenRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public String requestPasswordReset(String email) {

        userRepository.findByEmail(email.trim().toLowerCase())
                .filter(user -> "LOCAL".equalsIgnoreCase(user.getAuthProvider()))
                .ifPresent(user -> {

                    // Invalidate previous unused reset tokens.
                    List<PasswordResetToken> oldTokens =
                            tokenRepository.findByUserIdAndUsedFalse(user.getId());

                    oldTokens.forEach(token -> token.setUsed(true));

                    tokenRepository.saveAll(oldTokens);

                    // Generate a cryptographically secure token.
                    byte[] randomBytes = new byte[32];
                    secureRandom.nextBytes(randomBytes);

                    String rawToken = Base64.getUrlEncoder()
                            .withoutPadding()
                            .encodeToString(randomBytes);

                    // Store only the SHA-256 hash.
                    String tokenHash = hashToken(rawToken);

                    PasswordResetToken resetToken = new PasswordResetToken(
                            tokenHash,
                            user,
                            LocalDateTime.now().plusMinutes(TOKEN_EXPIRY_MINUTES));

                    tokenRepository.save(resetToken);

                    // Development only: simulate email delivery.
                    System.out.println(
                            "PASSWORD RESET LINK (DEVELOPMENT): " + rawToken);
                });

        // Generic message avoids revealing whether the email exists.
        return "If an eligible account exists, password reset instructions will be sent.";
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {

        String tokenHash = hashToken(rawToken);

        PasswordResetToken resetToken = tokenRepository
                .findByTokenHash(tokenHash)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid or expired password reset token."));

        if (resetToken.isUsed()
                || !resetToken.getExpiresAt().isAfter(LocalDateTime.now())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid or expired password reset token.");
        }

        User user = resetToken.getUser();

        if (!"LOCAL".equalsIgnoreCase(user.getAuthProvider())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Password reset is not available for this account.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark the token as used.
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }

    private String hashToken(String rawToken) {

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    rawToken.getBytes(StandardCharsets.UTF_8));

            return java.util.HexFormat.of().formatHex(hash);

        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(
                    "SHA-256 algorithm is unavailable.", exception);
        }
    }
}
