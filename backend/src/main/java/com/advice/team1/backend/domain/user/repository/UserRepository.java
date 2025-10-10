package com.advice.team1.backend.domain.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.advice.team1.backend.domain.user.entity.User;

import java.util.*;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
