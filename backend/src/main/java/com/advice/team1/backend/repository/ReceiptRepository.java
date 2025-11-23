package com.advice.team1.backend.repository;

import com.advice.team1.backend.domain.entity.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReceiptRepository extends JpaRepository<Receipt, Long> {

    Optional<Receipt> findByExpenseId(Long expenseId);
}
