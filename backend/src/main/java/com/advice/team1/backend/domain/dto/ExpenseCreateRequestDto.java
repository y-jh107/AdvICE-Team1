package com.advice.team1.backend.domain.dto;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

public record ExpenseCreateRequestDto(
        String name,
        BigDecimal amount,
        String payment,
        String memo,
        String location,
        Date spentAt,
        String currency,
        String splitMode,   // "empty" / "by_percent"
        List<ExpenseParticipantRequestDto> participants
) {}