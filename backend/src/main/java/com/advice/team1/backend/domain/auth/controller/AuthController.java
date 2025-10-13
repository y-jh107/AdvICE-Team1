package com.advice.team1.backend.domain.auth.controller;

import com.advice.team1.backend.domain.auth.service.AuthService;
import com.advice.team1.backend.common.response.ApiResponse;
import com.advice.team1.backend.domain.auth.dto.SignInDto;
import com.advice.team1.backend.domain.auth.dto.SignUpDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService auth;

    @PostMapping("/sign-up")
    public ResponseEntity<ApiResponse<Map<String, Object>>> signUp(@Validated @RequestBody SignUpDto req) {
        auth.signUp(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>("SU", "회원가입 성공.", Map.of("id", null)));
    }

    @PostMapping("/sign-in")
    public ResponseEntity<ApiResponse<Map<String, Object>>> signIn(@Validated @RequestBody SignInDto req) {
        var data = auth.signIn(req);
        return ResponseEntity.ok(new ApiResponse<>("SU", "로그인 성공.", data));
    }
}