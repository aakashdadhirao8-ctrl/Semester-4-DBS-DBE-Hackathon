package com.codespark.cam.controller;

import com.codespark.cam.dto.SmartAlertDTO;
import com.codespark.cam.service.SmartAlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final SmartAlertService alertService;

    public AlertController(SmartAlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    public ResponseEntity<List<SmartAlertDTO>> getAlerts() {
        return ResponseEntity.ok(alertService.generateSmartAlerts());
    }
}
