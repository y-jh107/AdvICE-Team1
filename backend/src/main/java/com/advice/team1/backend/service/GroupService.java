package com.advice.team1.backend.service;

import com.advice.team1.backend.domain.dto.*;
import com.advice.team1.backend.domain.entity.Expense;
import com.advice.team1.backend.domain.entity.Group;
import com.advice.team1.backend.domain.entity.GroupMember;
import com.advice.team1.backend.repository.ExpenseRepository;
import com.advice.team1.backend.repository.GroupMemberRepository;
import com.advice.team1.backend.repository.GroupRepository;
import com.advice.team1.backend.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groups;
    private final GroupMemberRepository groupMembers;
    private final UserRepository users;
    private final ExpenseRepository expenses;

    @Transactional
    public Group create(GroupRequestDto req) throws IOException {
        if (req.name() == null || req.name().isBlank()) {
            throw new IllegalArgumentException("모임명은 필수입니다.");
        }

        ObjectMapper mapper = new ObjectMapper();
        List<GroupMemberRequestDto> members = Arrays.asList(
                mapper.readValue(req.members(), GroupMemberRequestDto[].class)
        );

        LocalDate start = req.startDate();
        LocalDate end = req.endDate();

        Group g = Group.builder()
                .name(req.name())
                .description(req.description())
                .startDate(start)
                .endDate(end)
                .groupImage(req.groupImage().getBytes())
                .build();

        Group saved = groups.save(g);

        if (!members.isEmpty()) {
            for (GroupMemberRequestDto m : members) {
                users.findByEmail(m.email()).ifPresent(u -> {
                    GroupMember gm = GroupMember.builder()
                            .group(saved)
                            .user(u)
                            .build();
                    groupMembers.save(gm);
                });
            }
        }

        return saved;
    }

    @Transactional
    public Group update(Long groupId, GroupRequestDto req) throws JsonProcessingException {
        Group g = groups.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("모임을 찾을 수 없습니다."));

        ObjectMapper mapper = new ObjectMapper();
        List<GroupMemberRequestDto> members = Arrays.asList(
                mapper.readValue(req.members(), GroupMemberRequestDto[].class)
        );

        if (req.name() != null && !req.name().isBlank()) {
            g.changeName(req.name());
        }

        if (req.members() != null) {
            g.getGroupMembers().clear();
            for (GroupMemberRequestDto m : members) {
                users.findByEmail(m.email()).ifPresent(u -> {
                    GroupMember gm = GroupMember.builder()
                            .group(g)
                            .user(u)
                            .build();
                    groupMembers.save(gm);
                });
            }
        }

        return g;
    }

    @Transactional(readOnly = true)
    public List<GroupDto> getGroupsByUserId(Long userId) {
        return groupMembers.findByUser_Id(userId)
                .stream()
                .map(gm -> {
                    Group g = gm.getGroup();
                    return new GroupDto(
                            g.getId(),
                            g.getName(),
                            g.getDescription(),
                            g.getStartDate(),
                            g.getEndDate(),
                            Base64.getEncoder().encodeToString(g.getGroupImage())
                    );
                })
                .collect(Collectors.toList());
    }
    // 특정 모임 하나의 상세정보를 반환하는 부분 추가
    @Transactional(readOnly = true)
    public GroupDetailDto getGroupDetail(Long groupId, Long userId) {
        // 모임 멤버 여부 검증부분
        if (!groupMembers.existsByGroup_IdAndUser_Id(groupId, userId)) {
            throw new IllegalArgumentException("해당 모임의 멤버만 상세 정보를 조회할 수 있습니다.");
        }

        Group g = groups.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("모임을 찾을 수 없습니다."));

        // 멤버 리스트 구성
        List<GroupMemberSimpleDto> memberDtos = g.getGroupMembers().stream()
                .map(gm -> new GroupMemberSimpleDto(
                        gm.getUser().getId(),
                        gm.getUser().getName(),
                        gm.getUser().getEmail()
                ))
                .toList();

        // 지출 요약 리스트 구성
        List<GroupExpenseItemDto> expenseDtos = expenses.findByGroup_IdOrderBySpentAtDesc(groupId)
                .stream()
                .map(this::toGroupExpenseItemDto)
                .toList();

        return new GroupDetailDto(
                g.getId(),
                g.getName(),
                g.getDescription(),
                g.getStartDate(),
                g.getEndDate(),
                g.getGroupImage(),
                memberDtos,
                expenseDtos
        );
    }

    private GroupExpenseItemDto toGroupExpenseItemDto(Expense e) {
        return new GroupExpenseItemDto(
                e.getId(),
                e.getName(),
                e.getAmount(),
                e.getCurrency(),
                e.getSpentAt()
        );
    }
}
