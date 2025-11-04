package com.advice.team1.backend.service;

import com.advice.team1.backend.domain.dto.GroupDto;
import com.advice.team1.backend.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {
    private final GroupRepository groupRepository;

    public List<GroupDto> getGroupsByUserId(Long userId) {
        return groupRepository.findByMembers_UserId(userId)
                .stream()
                .map(GroupDto::new)
                .collect(Collectors.toList());
    }
}
