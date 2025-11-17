package com.advice.team1.backend.domain.dto;

public record ExpenseParticipantDetailDto(
        Long userId,
        String name,
        String email,
        Integer percent
) {}