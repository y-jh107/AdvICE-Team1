package com.advice.team1.backend.interfaces.dto;

import jakarta.validation.constraints.*;

public record SignInRequest(
        @Email @NotBlank String email,
        @NotBlank String password
) {}
