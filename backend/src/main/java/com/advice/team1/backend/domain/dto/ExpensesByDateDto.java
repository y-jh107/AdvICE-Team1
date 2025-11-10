package com.advice.team1.backend.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class ExpensesByDateDto {
    List<ExpensesByDateItemDto> items;
}
