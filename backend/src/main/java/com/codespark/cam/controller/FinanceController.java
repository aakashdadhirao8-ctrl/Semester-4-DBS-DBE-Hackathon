package com.codespark.cam.controller;

import com.codespark.cam.dto.RecordEmiRequest;
import com.codespark.cam.dto.RoiSimulationResponse;
import com.codespark.cam.model.AssetFinance;
import com.codespark.cam.model.EmiPayment;
import com.codespark.cam.service.FinanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/finances")
public class FinanceController {

    private final FinanceService financeService;

    public FinanceController(FinanceService financeService) {
        this.financeService = financeService;
    }

    @GetMapping
    public ResponseEntity<List<AssetFinance>> getAllFinances() {
        return ResponseEntity.ok(financeService.getAllFinances());
    }

    @GetMapping("/asset/{assetId}")
    public ResponseEntity<AssetFinance> getFinanceByAssetId(@PathVariable Long assetId) {
        AssetFinance finance = financeService.getFinanceByAssetId(assetId);
        if (finance == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(finance);
    }

    @GetMapping("/{financeId}/payments")
    public ResponseEntity<List<EmiPayment>> getPaymentHistory(@PathVariable Long financeId) {
        return ResponseEntity.ok(financeService.getPaymentHistory(financeId));
    }

    @PostMapping("/{financeId}/record-emi")
    public ResponseEntity<AssetFinance> recordEmi(
            @PathVariable Long financeId,
            @RequestBody(required = false) RecordEmiRequest request) {
        if (request == null) {
            request = new RecordEmiRequest();
        }
        return ResponseEntity.ok(financeService.recordEmiPayment(financeId, request));
    }

    @GetMapping("/{financeId}/simulate-early-payoff")
    public ResponseEntity<RoiSimulationResponse> simulateEarlyPayoff(
            @PathVariable Long financeId,
            @RequestParam BigDecimal lumpSum) {
        return ResponseEntity.ok(financeService.simulateEarlyPayoff(financeId, lumpSum));
    }
}
