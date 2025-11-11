package com.advice.team1.backend.domain.dto;

import com.advice.team1.backend.domain.entity.Group;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GroupDto {
    private Long id;
    private String name;
    private String memo;
    private LocalDate startDate;
    private LocalDate endDate;

    public GroupDto(Group group) {
        this.id = group.getId();
        this.name = group.getName();
        this.memo = group.getDescription();
        this.startDate = group.getStartDate();
        this.endDate = group.getEndDate();
    }
}
