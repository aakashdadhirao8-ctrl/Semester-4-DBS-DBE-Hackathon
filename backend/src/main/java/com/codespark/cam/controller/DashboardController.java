package com.codespark.cam.controller;

import com.codespark.cam.dto.DashboardSummaryDTO;
import com.codespark.cam.dto.DepartmentCostPerSeatDTO;
import com.codespark.cam.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDTO> getSummary() {
        return ResponseEntity.ok(dashboardService.getDashboardSummary());
    }

    @GetMapping("/cost-per-seat")
    public ResponseEntity<List<DepartmentCostPerSeatDTO>> getCostPerSeat() {
        return ResponseEntity.ok(dashboardService.getCostPerSeatBreakdown());
    }

    @GetMapping("/category-distribution")
    public ResponseEntity<List<Map<String, Object>>> getCategoryDistribution() {
        return ResponseEntity.ok(dashboardService.getCategoryDistribution());
    }
}
