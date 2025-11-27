package com.advice.team1.backend.repository;

import com.advice.team1.backend.domain.entity.ExpenseParticipants;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseParticipantRepository extends JpaRepository<ExpenseParticipants, Long> {

    List<ExpenseParticipants> findByExpense_Id(Long expenseId);

    List<ExpenseParticipants> findByUser_Id(Long userId);
}