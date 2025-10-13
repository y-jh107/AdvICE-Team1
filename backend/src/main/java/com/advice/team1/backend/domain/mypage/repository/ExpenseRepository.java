package com.advice.team1.backend.domain.mypage.repository;

import com.advice.team1.backend.domain.expense.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    @Query(value = """
        select date(spent_at) as d, sum(amount) as total 
        from expenses
        where user_id = :userId
        and (:from is null or spent_at >= :from)
        and (:to is null or spent_at < :to)
        group by d
        order by d
    """, nativeQuery = true)
    List<Object[]> expensesByDate(@Param("userId") Long userId,
                                  @Param("from")Instant from,
                                  @Param("to")Instant to);
}
