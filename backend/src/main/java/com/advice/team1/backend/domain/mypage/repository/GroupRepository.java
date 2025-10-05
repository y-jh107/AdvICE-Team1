package com.advice.team1.backend.domain.mypage.repository;

import com.advice.team1.backend.domain.group.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupRepository extends JpaRepository<GroupMember, Long> {
}
