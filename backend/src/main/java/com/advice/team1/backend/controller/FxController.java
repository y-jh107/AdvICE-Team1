package com.advice.team1.backend.controller;

import com.advice.team1.backend.common.response.ApiResponse;
import com.advice.team1.backend.domain.dto.FxDailyDto;
import com.advice.team1.backend.service.FxService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/fx")
@RequiredArgsConstructor
public class FxController {

    private final FxService fxService;

    @GetMapping
    public ApiResponse<List<FxDailyDto>> getWeeklyFx(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam("symbols") String currency
    ) {
        List<FxDailyDto> week = fxService.getWeeklyRates(date, currency);
        return ApiResponse.success("주간 환율 조회 성공", week);
    }
}