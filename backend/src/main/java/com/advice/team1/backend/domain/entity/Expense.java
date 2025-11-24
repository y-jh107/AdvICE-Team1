package com.advice.team1.backend.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;

@Entity
@Table(name = "expenses")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Getter
@Builder
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="expense_id")
    private Long id;

    private String name;
    private BigDecimal amount;
    private String payment;
    private String memo;
    private String location;

    @Column(name="spent_at")
    private LocalDate spentAt;
    private String currency;

    @Column(name="split_mode")
    private String splitMode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Group group;

    @OneToOne(mappedBy = "expense", cascade = CascadeType.ALL)
    private Receipt receipt;
}
