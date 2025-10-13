package com.advice.team1.backend.domain.mypage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class ExpensesByDateItemDto {
    LocalDate date;
    BigDecimal amount;
}
