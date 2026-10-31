package com.codespark.cam.controller;

import com.codespark.cam.dto.AssignAssetRequest;
import com.codespark.cam.dto.CreateAssetRequest;
import com.codespark.cam.dto.InflationAnalysisDTO;
import com.codespark.cam.model.Asset;
import com.codespark.cam.model.CustodyHistory;
import com.codespark.cam.model.MaintenanceLog;
import com.codespark.cam.service.AssetService;
import com.codespark.cam.service.InflationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

    private final AssetService assetService;
    private final InflationService inflationService;

    public AssetController(AssetService assetService, InflationService inflationService) {
        this.assetService = assetService;
        this.inflationService = inflationService;
    }

    @GetMapping
    public ResponseEntity<List<Asset>> getAllAssets() {
        return ResponseEntity.ok(assetService.getAllAssets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Asset> getAssetById(@PathVariable Long id) {
        return ResponseEntity.ok(assetService.getAssetById(id));
    }

    @PostMapping
    public ResponseEntity<Asset> createAsset(@RequestBody CreateAssetRequest request) {
        return new ResponseEntity<>(assetService.createAsset(request), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<Asset> assignAsset(@PathVariable Long id, @RequestBody AssignAssetRequest request) {
        return ResponseEntity.ok(assetService.assignAsset(id, request));
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<Asset> returnAsset(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String conditionNotes = body != null ? body.get("conditionNotes") : "Returned to pool";
        return ResponseEntity.ok(assetService.returnAsset(id, conditionNotes));
    }

    @PostMapping("/{id}/maintenance")
    public ResponseEntity<MaintenanceLog> logMaintenance(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        BigDecimal cost = new BigDecimal(body.get("cost").toString());
        String issue = body.get("issueDescription").toString();
        String provider = body.getOrDefault("serviceProvider", "Internal IT").toString();
        return ResponseEntity.ok(assetService.logMaintenance(id, cost, issue, provider));
    }

    @GetMapping("/{id}/maintenance")
    public ResponseEntity<List<MaintenanceLog>> getMaintenanceHistory(@PathVariable Long id) {
        return ResponseEntity.ok(assetService.getMaintenanceHistory(id));
    }

    @GetMapping("/{id}/custody")
    public ResponseEntity<List<CustodyHistory>> getCustodyHistory(@PathVariable Long id) {
        return ResponseEntity.ok(assetService.getCustodyHistory(id));
    }

    @GetMapping("/{id}/inflation")
    public ResponseEntity<InflationAnalysisDTO> getInflationAnalysis(
            @PathVariable Long id,
            @RequestParam(required = false) Double rate) {
        Asset asset = assetService.getAssetById(id);
        return ResponseEntity.ok(inflationService.calculateInflationAnalysis(asset, rate));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        assetService.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/clear-all")
    public ResponseEntity<Map<String, String>> clearAllAssets() {
        assetService.clearAllAssets();
        return ResponseEntity.ok(Map.of("message", "All assets cleared successfully from database."));
    }
}
