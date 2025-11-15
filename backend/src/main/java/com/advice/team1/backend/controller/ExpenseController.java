package com.advice.team1.backend.controller;

import com.advice.team1.backend.common.response.ApiResponse;
import com.advice.team1.backend.common.security.CustomUserPrincipal;
import com.advice.team1.backend.domain.dto.ExpenseDetailDto;
import com.advice.team1.backend.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

// 하나하나 조회용 컨트롤러
@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    // API명세서대로, GET /api/expenses/{expenseId}
    @GetMapping("/{expenseId}")
    public ApiResponse<ExpenseDetailDto> getExpense(
            @PathVariable Long expenseId,
            @AuthenticationPrincipal CustomUserPrincipal user
    ) {
        Long userId = user.getId();
        ExpenseDetailDto dto = expenseService.getExpense(expenseId, userId);
        return ApiResponse.success("지출 조회 성공", dto);
    }
}