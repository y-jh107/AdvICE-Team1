package com.advice.team1.backend.domain.dto;

import java.time.LocalDate;

public record CalendarItemDto(
        Long id,
        String type,
        String name,
        LocalDate date
){}
