package com.advice.team1.backend.repository.projection;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface ExpensesByDateProjection {
    LocalDate getD();
    BigDecimal getTotal();
}
