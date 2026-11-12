
package com.example.tms.config;

import com.example.tms.security.CustomUserDetailsService;
import com.example.tms.security.GoogleOAuth2SuccessHandler;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    // Configure database-based username and password authentication
    @Bean
    DaoAuthenticationProvider daoAuthenticationProvider(
            CustomUserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {

        // Spring Security 7 constructor
        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(userDetailsService);

        provider.setPasswordEncoder(passwordEncoder);

        return provider;
    }

    // Authentication manager used by AuthService during login
    @Bean
    AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {

        return configuration.getAuthenticationManager();
    }

    // Read user roles from the JWT token
    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {

        JwtGrantedAuthoritiesConverter authoritiesConverter =
                new JwtGrantedAuthoritiesConverter();

        authoritiesConverter.setAuthoritiesClaimName("roles");
        authoritiesConverter.setAuthorityPrefix("");

        JwtAuthenticationConverter converter =
                new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);

        return converter;
    }

    // Main Spring Security configuration
    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            DaoAuthenticationProvider provider,
            GoogleOAuth2SuccessHandler googleSuccessHandler,
            JwtAuthenticationConverter jwtAuthenticationConverter) throws Exception {

        http
                // Disable CSRF for our stateless REST API
                .csrf(csrf -> csrf.disable())

                // OAuth2 login requires a session for state validation
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                )

                // Register database authentication provider
                .authenticationProvider(provider)

                // Configure endpoint permissions
                .authorizeHttpRequests(auth -> auth

                        // Public endpoints
                        .requestMatchers(
                                "/api/auth/**",
                                "/oauth2/**",
                                "/login/**",
                                "/error",
                                "/actuator/health"
                        ).permitAll()

                        // Allow browser preflight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Only administrators can access admin APIs
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Administrators and agents can access agent APIs
                        .requestMatchers("/api/agents/**")
                        .hasAnyRole("ADMIN", "AGENT")

                        // All remaining endpoints require authentication
                        .anyRequest().authenticated()
                )

                // JWT bearer token authentication
                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt ->
                                jwt.jwtAuthenticationConverter(jwtAuthenticationConverter)
                        )
                )

                // Google OAuth2 login
                .oauth2Login(oauth2 ->
                        oauth2.successHandler(googleSuccessHandler)
                );

        return http.build();
    }
}
