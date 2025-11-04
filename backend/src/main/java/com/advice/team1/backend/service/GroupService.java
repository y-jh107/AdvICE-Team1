package com.advice.team1.backend.service;

import com.advice.team1.backend.domain.dto.GroupDto;
import com.advice.team1.backend.domain.dto.MyPageGroupListDto;
import com.advice.team1.backend.repository.GroupMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {
    private final GroupMemberRepository groupMemberRepository;

    public List<GroupDto> getGroupsByUserId(Long userId) {
        return groupMemberRepository.findByUser_Id(userId)
                .stream()
                .map(gm -> new GroupDto(gm.getGroup()))
                .collect(Collectors.toList());
    }
}
