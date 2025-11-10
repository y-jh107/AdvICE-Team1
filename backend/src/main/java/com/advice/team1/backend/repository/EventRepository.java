package com.advice.team1.backend.repository;

import com.advice.team1.backend.domain.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByGroupId(Long groupId);
}
