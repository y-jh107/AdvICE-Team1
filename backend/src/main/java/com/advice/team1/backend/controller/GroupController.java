package com.advice.team1.backend.controller;

import com.advice.team1.backend.common.response.ApiResponse;
import com.advice.team1.backend.common.security.CustomUserPrincipal;
import com.advice.team1.backend.domain.dto.GroupDto;
import com.advice.team1.backend.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {
    private final GroupService groupService;

    @GetMapping
    public ApiResponse<List<GroupDto>> getGroups(@AuthenticationPrincipal CustomUserPrincipal user) {
        Long userId = user.getId();
        List<GroupDto> groups = groupService.getGroupsByUserId(userId);
        return ApiResponse.success("모임 리스트 반환 성공", groups);
    }
}
