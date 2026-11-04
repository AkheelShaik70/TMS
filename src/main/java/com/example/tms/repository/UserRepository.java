package com.example.tms.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.tms.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
