package com.advice.team1.backend.repository;

import com.advice.team1.backend.domain.dto.GroupDto;
import com.advice.team1.backend.domain.entity.Group;
import com.advice.team1.backend.domain.entity.GroupMember;
import com.advice.team1.backend.domain.dto.MyPageGroupListDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GroupRepository extends JpaRepository<GroupMember, Long> {
    @Query("""
        select new com.advice.team1.backend.domain.dto.MyPageGroupListDto(
            g.id, g.name
        )
        from GroupMember gm
        join gm.group g
        where gm.user.id = :userId
        order by g.name asc
        """
    )
    List<MyPageGroupListDto> findByUserId(@Param("userId") long userId);
}
