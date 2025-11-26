package com.advice.team1.backend.domain.dto;

import java.util.List;

public record CalendarDto(
        List<CalendarItemDto> items
) {}
