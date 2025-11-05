package com.advice.team1.backend.service;

import com.advice.team1.backend.domain.dto.GroupMemberRequestDto;
import com.advice.team1.backend.domain.dto.GroupRequestDto;
import com.advice.team1.backend.domain.entity.Group;
import com.advice.team1.backend.domain.entity.GroupMember;
import com.advice.team1.backend.repository.GroupRepository;
import com.advice.team1.backend.repository.GroupMemberRepository;
import com.advice.team1.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groups;
    private final GroupMemberRepository groupMembers;
    private final UserRepository users;

    @Transactional
    public Group create(GroupRequestDto req) {
        if (req.name() == null || req.name().isBlank()) {
            throw new IllegalArgumentException("모임명은 필수입니다.");
        }

        Group g = Group.builder()
                .name(req.name())
                .build();
        Group saved = groups.save(g);

        if (req.members() != null) {
            for (GroupMemberRequestDto m : req.members()) {
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
    public Group update(Long groupId, GroupRequestDto req) {
        Group g = groups.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("모임을 찾을 수 없습니다."));

        if (req.name() != null && !req.name().isBlank()) {
            g.changeName(req.name());
        }

        if (req.members() != null) {
            groupMembers.deleteAll(g.getGroupMembers());
            for (GroupMemberRequestDto m : req.members()) {
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
}
