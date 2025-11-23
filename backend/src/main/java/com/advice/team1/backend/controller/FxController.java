package com.advice.team1.backend.controller;

import com.advice.team1.backend.common.response.ApiResponse;
import com.advice.team1.backend.domain.dto.FxDto;
import com.advice.team1.backend.service.FxService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/fx")
@RequiredArgsConstructor
public class FxController {

    private final FxService fxService;

    @GetMapping
    public ApiResponse<List<FxDto>> getFx() {

        List<FxDto> fxRates = fxService.getFxRates();

        return ApiResponse.success("환율 정보 불러오기 성공", fxRates);
    }
}
