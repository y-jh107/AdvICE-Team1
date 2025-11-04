package com.advice.team1.backend.domain.dto;

import com.advice.team1.backend.domain.entity.Group;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MyPageGroupListDto {
    Long groupId;
    String name;

    public MyPageGroupListDto(Group group, String name) {
        this.groupId = group.getId();
        this.name = name;
    }
}
