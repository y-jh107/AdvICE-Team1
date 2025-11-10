package com.advice.team1.backend.repository;

import com.advice.team1.backend.domain.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupRepository extends JpaRepository<Group, Long> {
}
