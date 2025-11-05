package com.advice.team1.backend.controller;

import com.advice.team1.backend.common.response.ApiResponse;
import com.advice.team1.backend.domain.dto.GroupRequestDto;
import com.advice.team1.backend.domain.entity.Group;
import com.advice.team1.backend.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/group")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @PostMapping
    public ResponseEntity<ApiResponse<Object>> create(@RequestBody GroupRequestDto req) {
        Group g = groupService.create(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>("SU", "모임 생성 성공.", "g_" + g.getId()));
    }

    @PatchMapping("/{groupId}")
    public ResponseEntity<ApiResponse<Object>> update(
            @PathVariable Long groupId,
            @RequestBody GroupRequestDto req
    ) {
        Group g = groupService.update(groupId, req);
        return ResponseEntity.ok(
                new ApiResponse<>("SU", "모임 수정 성공.", "g_" + g.getId())
        );
    }
}