package com.advice.team1.backend.controller;

import com.advice.team1.backend.common.response.ApiResponse;
import com.advice.team1.backend.common.security.CustomUserPrincipal;
import com.advice.team1.backend.domain.dto.MyPageDto;
import com.advice.team1.backend.service.MyPageService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@Slf4j
@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
public class MyPageController {

    private final MyPageService myPageService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<MyPageDto>> getMyPage(
        @PathVariable Long userId,
        @AuthenticationPrincipal CustomUserPrincipal me,
        @RequestParam(required = false) Instant from,
        @RequestParam(required = false) Instant to
    ) {
        try {
            from = (from != null) ? from : Instant.now();
            to = (to != null) ? to : Instant.now();

            MyPageDto body = myPageService.buildMyPage(me.getId(), userId, from, to);

            return ResponseEntity.ok(ApiResponse.success("마이페이지 조회 성공.", body));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("AR", "로그인이 필요합니다."));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("NF", "사용자를 찾을 수 없습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("VF", e.getMessage()));
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("SE", "서버 오류입니다."));
        }
    }
}
