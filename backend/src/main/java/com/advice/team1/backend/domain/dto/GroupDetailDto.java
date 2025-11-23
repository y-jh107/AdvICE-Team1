package com.advice.team1.backend.domain.dto;

import java.time.LocalDate;
import java.util.List;

public record GroupDetailDto(
        Long id,
        String name,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        byte[] groupImage,
        List<GroupMemberSimpleDto> members,
        List<GroupExpenseItemDto> expenses
) {}
