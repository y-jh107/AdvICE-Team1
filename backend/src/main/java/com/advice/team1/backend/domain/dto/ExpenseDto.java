package com.advice.team1.backend.domain.dto;

import com.advice.team1.backend.domain.entity.Expense;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Getter
@NoArgsConstructor
public class ExpenseDto {
    private Long id;
    private String name;
    private BigDecimal amount;
    private String payment;
    private String location;

    private LocalDate spentAt;
    private String currency;
    private String splitMode;

    public ExpenseDto(Expense expense) {
        this.id = expense.getId();
        this.name = expense.getName();
        this.amount = expense.getAmount();
        this.payment = expense.getPayment();
        this.location = expense.getLocation();

        this.spentAt = expense.getSpentAt();
        this.currency = expense.getCurrency();
        this.splitMode = expense.getSplitMode();
    }
}
