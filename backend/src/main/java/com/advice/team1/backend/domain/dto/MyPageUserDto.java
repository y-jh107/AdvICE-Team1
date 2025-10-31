package com.advice.team1.backend.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MyPageUserDto {
    private Long userId;
    private String name;
    private String email;
    private String phone;
}
