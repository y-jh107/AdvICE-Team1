package com.advice.team1.backend.controller;

import com.advice.team1.backend.common.cache.ReceiptCache;
import com.advice.team1.backend.common.response.ApiResponse;
import com.advice.team1.backend.common.security.CustomUserPrincipal;
import com.advice.team1.backend.domain.dto.ExpenseCreateRequestDto;
import com.advice.team1.backend.domain.dto.ExpenseDetailDto;
import com.advice.team1.backend.domain.dto.ReceiptDto;
import com.advice.team1.backend.domain.dto.ReceiptRequestDto;
import com.advice.team1.backend.domain.entity.Receipt;
import com.advice.team1.backend.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

// 하나하나 조회용 컨트롤러
@RestController
@RequestMapping("/api/groups/{groupId}/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;
    private final ReceiptCache receiptCache;

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

    @PostMapping(value="/{expenseId}/receipts", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<String> addReceipt (
            @PathVariable Long expenseId,
            @AuthenticationPrincipal CustomUserPrincipal user,
            @RequestHeader(value="Idempotency-Key", required=false) String idempotencyKey,
            @ModelAttribute ReceiptRequestDto req
    ) throws IOException {
        if (receiptCache.contains(idempotencyKey)) {
            return ApiResponse.success("이미 등록된 사진입니다.", null);
        }

        Receipt receipt = expenseService.addReceipt(expenseId, req);

        return ApiResponse.success("영수증 이미지 업로드 성공", "/api/expenses/" + expenseId + "/receipt");
    }

    @GetMapping("/receipts/{receiptId}")
    public ApiResponse<ReceiptDto> getReceipt(
            @PathVariable Long receiptId,
            @AuthenticationPrincipal CustomUserPrincipal user
    ) {
        ReceiptDto receiptDto = expenseService.getReceipt(receiptId);

        return ApiResponse.success("영수증 정보 불러오기 성공", receiptDto);
    }
}