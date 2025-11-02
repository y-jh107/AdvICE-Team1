package com.advice.team1.backend.domain.auth.dto;

import jakarta.validation.constraints.*;

public record SignInDto(
        @Email @NotBlank String email,
        @NotBlank String password
) {}
