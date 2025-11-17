package com.advice.team1.backend.domain.dto;

import org.springframework.web.multipart.MultipartFile;

public record ReceiptRequestDto(
        MultipartFile image
) {}
