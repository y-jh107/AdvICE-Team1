package com.advice.team1.backend.domain.dto;

import java.math.BigDecimal;
import java.util.Date;

public record GroupExpenseItemDto(
        Long expenseId,
        String name,
        BigDecimal amount,
        String currency,
        Date spentAt
) {}