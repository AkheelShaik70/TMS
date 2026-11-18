
package com.example.tms.dto;

public class ProfileResponse {

    private Long id;
    private String name;
    private String email;
    private String role;
    private String authProvider;
    private boolean hasPassword;

    public ProfileResponse() {
    }

    public ProfileResponse(
            Long id,
            String name,
            String email,
            String role,
            String authProvider,
            boolean hasPassword) {

        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.authProvider = authProvider;
        this.hasPassword = hasPassword;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public String getAuthProvider() {
        return authProvider;
    }

    public boolean isHasPassword() {
        return hasPassword;
    }
}
