package com.advice.team1.backend.controller;

import com.advice.team1.backend.common.response.ApiResponse;
import com.advice.team1.backend.domain.dto.GroupRequestDto;
import com.advice.team1.backend.domain.entity.Group;
import com.advice.team1.backend.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/group")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @PostMapping
    public ApiResponse<Object> create(@RequestBody GroupRequestDto req) {
        Group g = groupService.create(req);
        return new ApiResponse<>("SU", "모임 생성 성공.", "g_" + g.getId());
    }

    @PatchMapping("/{groupId}")
    public ApiResponse<Object> update(
            @PathVariable Long groupId,
            @RequestBody GroupRequestDto req
    ) {
        Group g = groupService.update(groupId, req);
        return new ApiResponse<>("SU", "모임 수정 성공.", "g_" + g.getId());
    }
}