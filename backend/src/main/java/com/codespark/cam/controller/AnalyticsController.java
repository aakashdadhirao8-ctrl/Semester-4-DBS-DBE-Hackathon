package com.codespark.cam.controller;

import com.codespark.cam.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/forecast")
    public ResponseEntity<Map<String, Object>> getForecast() {
        return ResponseEntity.ok(analyticsService.getPredictiveAnalytics());
    }
}
