package com.advice.team1.backend.domain.dto;

import java.math.BigDecimal;

public record ExpenseParticipantDetailDto(
        Long userId,
        String name,
        String email,
        BigDecimal myAmount
) {}