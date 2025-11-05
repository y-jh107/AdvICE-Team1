package com.advice.team1.backend.domain.dto;

import java.time.LocalDate;
import java.util.List;

public record GroupRequestDto(
        String name,
        String groupImage,
        List<GroupMemberRequestDto> members,
        LocalDate startDate,
        LocalDate endDate,
        String description
) {}