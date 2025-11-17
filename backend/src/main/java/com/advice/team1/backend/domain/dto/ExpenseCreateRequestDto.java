package com.advice.team1.backend.domain.dto;

import java.math.BigDecimal;
import java.util.Date;
import java.time.LocalDate;

public record ExpenseCreateRequestDto(
        String name,
        BigDecimal amount,
        String payment,
        String memo,
        String location,
        LocalDate spentDate,
        String currency,
        String splitMode
) {}