package com.advice.team1.backend.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "expense_participants")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@IdClass(ExpenseParticipants.class)
public class ExpenseParticipants {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expense_id", nullable = false)
    private Expense expense;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // DB: share_ratio decimal(6,4)
    @Column(name = "share_ratio")
    private BigDecimal shareRatio;

    // DB: share_amount decimal(14,2)
    @Column(name = "share_amount")
    private BigDecimal shareAmount;
}