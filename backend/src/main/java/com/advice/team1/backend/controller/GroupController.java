package com.advice.team1.backend.controller;

import com.advice.team1.backend.common.response.ApiResponse;
import com.advice.team1.backend.common.security.CustomUserPrincipal;
import com.advice.team1.backend.domain.dto.GroupDto;
import com.advice.team1.backend.domain.dto.GroupRequestDto;
import com.advice.team1.backend.domain.entity.Group;
import com.advice.team1.backend.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    // 모임 목록 조회 (내가 속한 모임들)
    @GetMapping
    public ApiResponse<List<GroupDto>> getGroups(@AuthenticationPrincipal CustomUserPrincipal user) {
        Long userId = user.getId();
        List<GroupDto> groups = groupService.getGroupsByUserId(userId);
        return ApiResponse.success("모임 리스트 반환 성공", groups);
    }

    @PostMapping
    public ApiResponse<Object> create(@RequestBody GroupRequestDto req) {
        Group g = groupService.create(req);
        return new ApiResponse<>("SU", "모임 생성 성공.", g.getName());
        // 프론트에서 data 안 쓰면 여기 null 넣어도 됨
    }

    @PatchMapping("/{groupId}")
    public ApiResponse<Object> update(
            @PathVariable Long groupId,
            @RequestBody GroupRequestDto req
    ) {
        Group g = groupService.update(groupId, req);
        return new ApiResponse<>("SU", "모임 수정 성공.", g.getName());
    }
}
