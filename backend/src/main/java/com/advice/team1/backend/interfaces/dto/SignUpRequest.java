package com.advice.team1.backend.interfaces.dto;

import jakarta.validation.constraints.*;

public record SignUpRequest(
    @NotBlank String name,
    @Email @NotBlank String email,
    String phone,
    @Size(min = 8, message = "비밀번호는 8자 이상이어야 합니다.") @NotBlank String password
) {}
