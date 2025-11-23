package com.advice.team1.backend.common.cache;

import com.advice.team1.backend.domain.entity.Receipt;
import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;

@Component
public class ReceiptCache {
    private final ConcurrentHashMap<String, Receipt> receipts = new ConcurrentHashMap<>();

    public boolean contains(String key) {
        return receipts.containsKey(key);
    }

    public Receipt get(String key) {
        return receipts.get(key);
    }

    public void put(String key, Receipt receipt) {
        receipts.put(key, receipt);
    }
}
