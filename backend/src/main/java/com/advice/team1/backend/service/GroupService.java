package com.advice.team1.backend.service;

import com.advice.team1.backend.domain.dto.GroupDto;
import com.advice.team1.backend.domain.dto.GroupMemberRequestDto;
import com.advice.team1.backend.domain.dto.GroupRequestDto;
import com.advice.team1.backend.domain.entity.Group;
import com.advice.team1.backend.domain.entity.GroupMember;
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
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groups;
    private final GroupMemberRepository groupMembers;
    private final UserRepository users;

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
                            null,
                            null,
                            null
                    );
                })
                .collect(Collectors.toList());
    }
}
