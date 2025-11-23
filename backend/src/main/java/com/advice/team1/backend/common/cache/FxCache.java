package com.advice.team1.backend.common.cache;

import com.advice.team1.backend.domain.dto.FxDto;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class FxCache {

    private final Map<String, FxDto> cache = new ConcurrentHashMap<>();

    private String key(LocalDate date, String currency) {
        return date.toString() + "_" + currency;
    }

    public FxDto get(LocalDate date, String currency) {
        return cache.get(key(date, currency));
    }

    public void put(LocalDate date, String currency, FxDto dto) {
        cache.put(key(date, currency), dto);
    }
}