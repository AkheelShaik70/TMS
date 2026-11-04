
package com.example.tms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.tms.entity.Role;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(String name);

}

