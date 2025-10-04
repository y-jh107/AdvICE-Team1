package com.advice.team1.backend.domain.mypage.controller;

import com.advice.team1.backend.common.response.ApiResponse;
import com.advice.team1.backend.common.security.CustomUserPrincipal;
import com.advice.team1.backend.domain.mypage.dto.MyPageDto;
import com.advice.team1.backend.domain.mypage.service.MyPageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
public class MyPageController {

    //private final MyPageService myPageService;

    /** @GetMapping("/{userid}")
    public ResponseEntity<ApiResponse<MyPageDto>> getMyPage(
        @PathVariable("userId") Long pathUserId,
        @AuthenticationPrincipal CustomUserPrincipal me
    ) {
        Long userId = me.getId();

        try {
            MyPageDto dto = myPageService.buildMyPage()
        }
    }
        **/
}
