package com.advice.team1.backend.repository;

import com.advice.team1.backend.domain.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    List<GroupMember> findByUser_Id(Long userId);
}
