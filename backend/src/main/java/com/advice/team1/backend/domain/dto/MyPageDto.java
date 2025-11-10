package com.advice.team1.backend.domain.dto;

import com.advice.team1.backend.domain.entity.GroupMember;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class MyPageDto {
    MyPageUserDto user;
    List<GroupMember> groups;
    ExpensesByDateDto expensesByDate;
}
