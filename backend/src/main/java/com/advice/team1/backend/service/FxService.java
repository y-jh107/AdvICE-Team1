package com.advice.team1.backend.service;

import com.advice.team1.backend.common.cache.FxCache;
import com.advice.team1.backend.common.config.FxProperties;
import com.advice.team1.backend.domain.dto.FxDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FxService {

    private final FxCache fxCache;
    private final RestTemplate restTemplate;
    private final FxProperties fxProperties;

    private static final Set<String> TARGET_CURRENCIES = Set.of(
            "USD", "JPY(100)", "CNY", "VND", "THB", "SGD",
            "EUR", "CAD", "GBP", "PHP", "HKD"
    );

    public List<FxDto> getFxRates() {

        LocalDate today = LocalDate.now();

        List<FxDto> cached = fxCache.get(today);
        if (cached != null) {
            return cached;
        }

        List<FxDto> fxRates = callApi(today);

        boolean invalid = fxRates.stream()
                .anyMatch(dto -> dto.getCurrency() == null);

        if (invalid) {
            LocalDate previous = today.minusDays(1);
            fxRates = callApi(previous);
        }

        fxCache.put(today, fxRates);

        return fxRates;
    }

    public List<FxDto> callApi(LocalDate date) {

        String url = fxProperties.getUrl()
                + "?authkey=" + fxProperties.getApiKey()
                + "&searchdate=" + date.format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "&data=AP01";

        System.out.println("CALL URL = " + url);

        FxDto[] response = restTemplate.getForObject(url, FxDto[].class);

        if (response == null) return List.of();

        return Arrays.stream(response)
                .filter(dto -> TARGET_CURRENCIES.contains(dto.getCurrency()))
                .collect(Collectors.toList());
    }
}
