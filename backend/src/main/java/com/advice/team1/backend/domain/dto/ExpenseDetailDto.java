package com.advice.team1.backend.domain.dto;

import java.math.BigDecimal;
import java.util.Date;

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
        String splitMode
) {}