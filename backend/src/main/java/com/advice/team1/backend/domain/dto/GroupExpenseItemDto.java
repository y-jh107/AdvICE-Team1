package com.advice.team1.backend.domain.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record GroupExpenseItemDto(
        Long expenseId,
        String name,
        BigDecimal amount,
        String currency,
        LocalDate spentAt
) {}