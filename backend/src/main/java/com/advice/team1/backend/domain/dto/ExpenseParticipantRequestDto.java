package com.advice.team1.backend.domain.dto;

public record ExpenseParticipantRequestDto (
        Long userId,
        Integer percent   // splitMode = "PERCENT"일때만 의미이씀.
) {}
