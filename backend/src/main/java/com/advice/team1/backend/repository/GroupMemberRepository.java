package com.advice.team1.backend.repository;

import com.advice.team1.backend.domain.dto.MyPageGroupListDto;
import com.advice.team1.backend.domain.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
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

    List<GroupMember> findByUser_Id(Long userId);

    boolean existsByGroup_IdAndUser_Id(Long groupId, Long userId);
}
