package com.advice.team1.backend.domain.dto;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

public record ExpenseDetailDto(
        Long expenseId,
        Long groupId,
        String name,
        BigDecimal amount,
        String payment,
        String memo,
        String location,
        Date spentAt,
        String currency,
        String splitMode,
        List<ExpenseParticipantDetailDto> participants
) {}