package com.advice.team1.backend.domain.dto;

public record GroupMemberRequestDto (
        String name,
        String email,
        String role
) {}
