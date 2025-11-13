package com.advice.team1.backend.controller;

import com.advice.team1.backend.domain.entity.User;
import com.advice.team1.backend.service.AuthService;
import com.advice.team1.backend.common.response.ApiResponse;
import com.advice.team1.backend.domain.dto.SignInDto;
import com.advice.team1.backend.domain.dto.SignUpDto;
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
    public ResponseEntity<ApiResponse<User>> signUp(@Validated @RequestBody SignUpDto req) {
        User u = auth.signUp(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>("SU", "회원가입 성공.", u));
    }

    @PostMapping("/sign-in")
    public ResponseEntity<ApiResponse<Map<String, Object>>> signIn(@Validated @RequestBody SignInDto req) {
        var data = auth.signIn(req);
        return ResponseEntity.ok(new ApiResponse<>("SU", "로그인 성공.", data));
    }
}