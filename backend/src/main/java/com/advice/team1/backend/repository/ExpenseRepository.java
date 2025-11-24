package com.advice.team1.backend.repository;

import com.advice.team1.backend.domain.entity.Expense;
import com.advice.team1.backend.repository.projection.ExpensesByDateProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    @Query(value = """
    select date(e.spent_at) as d, sum(e.amount) as total
    from expenses e
    join team_members gm on gm.team_id = e.team_id
    where gm.user_id = :userId
      and e.spent_at >= :from
      and e.spent_at < :to
    group by d
    order by d
    """, nativeQuery = true)
    List<ExpensesByDateProjection> expensesByDate(
            @Param("userId") Long userId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    List<Expense> findByGroup_IdOrderBySpentAtDesc(Long groupId);

    List<Expense> findByGroup_Id(Long groupId);
}
