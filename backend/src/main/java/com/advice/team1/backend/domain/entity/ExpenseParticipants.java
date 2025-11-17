package com.advice.team1.backend.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "expense_participants")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ExpenseParticipants {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "expense_participant_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expense_id", nullable = false)
    private Expense expense;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private Integer percent;
    // 퍼센트 기반의 비율로 정수로 받고, PERCENT이면 숫자값, Equal이며는 null로 반환하기
}