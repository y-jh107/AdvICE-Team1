package com.advice.team1.backend.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Table(name="receipts")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Receipt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="receipt_id")
    private Long id;

    @Lob
    @Column(name="image")
    private byte[] image;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expense_id")
    private Expense expense;
}
