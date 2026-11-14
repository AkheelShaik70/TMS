package com.example.tms.dto;

public record AuthResponse(String accessToken, String tokenType, long expiresIn, String email, String role) {}
