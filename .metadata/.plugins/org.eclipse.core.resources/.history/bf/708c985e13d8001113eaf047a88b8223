package com.example.tms.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.tms.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    // Find a user using their email
    Optional<User> findByEmail(String email);

    // Check whether an email is already registered
    boolean existsByEmail(String email);

}