package com.advice.team1.backend.domain.dto;

public record ReceiptDto (
        Long id,
        Long expenseId,
        String image
) {}
