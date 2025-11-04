package com.advice.team1.backend.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class MyPageDto {
    MyPageUserDto user;
    List<MyPageGroupListDto> groups;
    ExpensesByDateDto expensesByDate;
}
