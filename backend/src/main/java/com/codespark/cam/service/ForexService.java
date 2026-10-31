package com.codespark.cam.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class ForexService {

    @Value("${services.forex.api-url:https://open.er-api.com/v6/latest/USD}")
    private String forexApiUrl;

    private Map<String, Double> cachedRates = null;
    private long lastFetchTimestamp = 0;
    private static final long CACHE_TTL_MS = 3600000; // 1 hour

    public Map<String, Double> getForexRates() {
        long now = System.currentTimeMillis();
        if (cachedRates != null && (now - lastFetchTimestamp < CACHE_TTL_MS)) {
            return cachedRates;
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(forexApiUrl, Map.class);
            if (response != null && response.containsKey("rates")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> rawRates = (Map<String, Object>) response.get("rates");
                Map<String, Double> rates = new HashMap<>();
                rates.put("USD", 1.0);
                rates.put("INR", rawRates.containsKey("INR") ? ((Number) rawRates.get("INR")).doubleValue() : 87.20);
                rates.put("EUR", rawRates.containsKey("EUR") ? ((Number) rawRates.get("EUR")).doubleValue() : 0.92);
                rates.put("GBP", rawRates.containsKey("GBP") ? ((Number) rawRates.get("GBP")).doubleValue() : 0.79);
                cachedRates = rates;
                lastFetchTimestamp = now;
                return rates;
            }
        } catch (Exception e) {
            // Graceful fallback if offline or API blocked
        }

        // Default standard fallback rates
        Map<String, Double> fallback = new HashMap<>();
        fallback.put("USD", 1.0);
        fallback.put("INR", 87.25);
        fallback.put("EUR", 0.92);
        fallback.put("GBP", 0.79);
        return fallback;
    }
}
