package com.advice.team1.backend.controller;

import com.advice.team1.backend.common.response.ApiResponse;
import com.advice.team1.backend.common.security.CustomUserPrincipal;
import com.advice.team1.backend.domain.dto.GroupDto;
import com.advice.team1.backend.domain.dto.GroupRequestDto;
import com.advice.team1.backend.domain.entity.Group;
import com.advice.team1.backend.service.GroupService;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    // 모임 목록 조회 (내가 속한 모임들)
    @GetMapping
    public ApiResponse<List<GroupDto>> getGroups(
            @AuthenticationPrincipal CustomUserPrincipal user) {
        Long userId = user.getId();
        List<GroupDto> groups = groupService.getGroupsByUserId(userId);
        return ApiResponse.success("모임 리스트 반환 성공", groups);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Object> create(@ModelAttribute GroupRequestDto req) throws IOException {
        Group g = groupService.create(req);
        return new ApiResponse<>("SU", "모임 생성 성공.", g.getName());
        // 프론트에서 data 안 쓰면 여기 null 넣어도 됨
    }

    @PatchMapping
    public ApiResponse<Object> update(
            @RequestParam Long groupId,
            @RequestBody GroupRequestDto req
    ) throws JsonProcessingException {
        Group g = groupService.update(groupId, req);
        return new ApiResponse<>("SU", "모임 수정 성공.", g.getName());
    }
}
