package com.advice.team1.backend.common.cache;

import com.advice.team1.backend.domain.dto.FxDto;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class FxCache {

    private final Map<LocalDate, List<FxDto>> cache = new HashMap<>();

    private final int CACHE_DAYS = 7;

    public synchronized void put(LocalDate date, List<FxDto> fxRates) {
        cache.put(date, fxRates);
        cleanUp();
    }

    public synchronized List<FxDto> get(LocalDate date) {
        return cache.get(date);
    }

    public synchronized boolean hasToday() {
        return cache.containsKey(LocalDate.now());
    }

    private void cleanUp() {
        LocalDate thresholdDate = LocalDate.now().minusDays(CACHE_DAYS);
        cache.keySet().removeIf(date -> date.isBefore(thresholdDate));
    }
}
