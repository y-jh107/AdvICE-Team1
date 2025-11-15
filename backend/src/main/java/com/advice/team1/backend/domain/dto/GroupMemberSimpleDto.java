package com.advice.team1.backend.domain.dto;

public record GroupMemberSimpleDto(
    Long userId,
    String name,
    String email
) {}
