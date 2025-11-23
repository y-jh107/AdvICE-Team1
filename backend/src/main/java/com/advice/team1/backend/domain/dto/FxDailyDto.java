package com.advice.team1.backend.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class FxDailyDto {
    private LocalDate date;
    private BigDecimal rate;   // null이면 휴장일
}