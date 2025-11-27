package com.advice.team1.backend.service;

import com.advice.team1.backend.common.cache.FxCache;
import com.advice.team1.backend.common.config.FxProperties;
import com.advice.team1.backend.domain.dto.FxDailyDto;
import com.advice.team1.backend.domain.dto.FxDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FxService {

    private final FxCache fxCache;
    private final RestTemplate restTemplate;
    private final FxProperties fxProperties;

    public List<FxDailyDto> getWeeklyRates(LocalDate date, String currency) {
        List<FxDailyDto> result = new ArrayList<>();

        for (int i = 6; i >= 0; i--) {
            LocalDate target = date.minusDays(i);

            FxDto fx = getFxWithFallback(target, currency);
            if (fx == null) {
                result.add(new FxDailyDto(target, null));
            } else {
                BigDecimal rate = parseRate(fx);
                result.add(new FxDailyDto(target, rate));
            }
        }
        return result;
    }

    private BigDecimal parseRate(FxDto fx) {
        if (fx == null || fx.getDealBasRate() == null) return null;

        String raw = fx.getDealBasRate().replace(",", "").trim();
        BigDecimal val = new BigDecimal(raw);

        return val;
    }

    public FxDto getFxWithFallback(LocalDate date, String currency) {

        for (int i = 0; i < 5; i++) {   // 최대 5일 뒤로 fallback
            LocalDate fallbackDate = date.minusDays(i);

            List<FxDto> list = callApi(fallbackDate);
            FxDto match = list.stream()
                    .filter(dto -> dto.getCurrency().equals(currency))
                    .findFirst()
                    .orElse(null);

            if (match != null) return match;
        }

        return null;
    }

    public List<FxDto> callApi(LocalDate date) {
        String url = fxProperties.getUrl()
                + "?authkey=" + fxProperties.getApiKey()
                + "&searchdate=" + date.format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "&data=AP01";

        FxDto[] response = restTemplate.getForObject(url, FxDto[].class);
        if (response == null) return List.of();

        return Arrays.stream(response)
                .filter(dto -> dto.getCurrency() != null)
                .toList();
    }
}
