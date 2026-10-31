package com.codespark.cam.service;

import com.codespark.cam.dto.InflationAnalysisDTO;
import com.codespark.cam.model.Asset;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class InflationService {

    private static final double DEFAULT_ANNUAL_INFLATION = 0.055; // 5.5% annual benchmark
    private static final double HARDWARE_ANNUAL_DEPRECIATION = 0.20; // 20% annual
    private static final double VEHICLE_ANNUAL_DEPRECIATION = 0.12;  // 12% annual
    private static final double SERVER_ANNUAL_DEPRECIATION = 0.18;   // 18% annual

    public InflationAnalysisDTO calculateInflationAnalysis(Asset asset, Double customInflationRate) {
        double inflationRate = customInflationRate != null ? customInflationRate : DEFAULT_ANNUAL_INFLATION;
        double depreciationRate = getDepreciationRate(asset.getCategory());

        int purchaseYear = asset.getPurchaseDate().getYear();
        int currentYear = LocalDate.now().getYear();
        int ageYears = Math.max(0, currentYear - purchaseYear);

        double originalCost = asset.getPurchaseCost().doubleValue();

        // 1. Backtrack purchasing power equivalent today: Cost * (1 + inflation)^age
        double purchasingPowerToday = originalCost * Math.pow(1.0 + inflationRate, ageYears);

        // 2. Depreciated current book value: Cost * (1 - depreciation)^age
        double salvage = asset.getSalvageValue() != null ? asset.getSalvageValue().doubleValue() : 0.0;
        double bookValue = Math.max(salvage, originalCost * Math.pow(1.0 - depreciationRate, ageYears));

        // 3. Today replacement cost (accounting for inflation on equipment)
        double todayReplacementCost = originalCost * Math.pow(1.0 + inflationRate, ageYears);

        // 4. Replacement Deficit = Replacement Cost - Current Book Value
        double deficit = todayReplacementCost - bookValue;

        // 5. Projected 3-year and 5-year replacement costs
        double projectedThreeYear = todayReplacementCost * Math.pow(1.0 + inflationRate, 3);
        double projectedFiveYear = todayReplacementCost * Math.pow(1.0 + inflationRate, 5);

        // 6. Generate Multi-Year Trajectory (Purchase Year to Current Year + 5)
        List<InflationAnalysisDTO.YearlyProjectionPoint> trajectory = new ArrayList<>();
        int startYear = purchaseYear;
        int endYear = currentYear + 5;

        for (int y = startYear; y <= endYear; y++) {
            int elapsed = y - purchaseYear;
            double bv = Math.max(salvage, originalCost * Math.pow(1.0 - depreciationRate, Math.max(0, elapsed)));
            double rc = originalCost * Math.pow(1.0 + inflationRate, elapsed);
            trajectory.add(new InflationAnalysisDTO.YearlyProjectionPoint(
                    y,
                    BigDecimal.valueOf(bv).setScale(2, RoundingMode.HALF_UP),
                    BigDecimal.valueOf(rc).setScale(2, RoundingMode.HALF_UP)
            ));
        }

        InflationAnalysisDTO dto = new InflationAnalysisDTO();
        dto.setPurchaseYear(purchaseYear);
        dto.setCurrentYear(currentYear);
        dto.setOriginalCost(BigDecimal.valueOf(originalCost).setScale(2, RoundingMode.HALF_UP));
        dto.setPurchasingPowerToday(BigDecimal.valueOf(purchasingPowerToday).setScale(2, RoundingMode.HALF_UP));
        dto.setCurrentBookValue(BigDecimal.valueOf(bookValue).setScale(2, RoundingMode.HALF_UP));
        dto.setTodayReplacementCost(BigDecimal.valueOf(todayReplacementCost).setScale(2, RoundingMode.HALF_UP));
        dto.setReplacementDeficit(BigDecimal.valueOf(deficit).setScale(2, RoundingMode.HALF_UP));
        dto.setProjectedThreeYearCost(BigDecimal.valueOf(projectedThreeYear).setScale(2, RoundingMode.HALF_UP));
        dto.setProjectedFiveYearCost(BigDecimal.valueOf(projectedFiveYear).setScale(2, RoundingMode.HALF_UP));
        dto.setBenchmarkInflationRate(inflationRate * 100);
        dto.setTrajectory(trajectory);

        return dto;
    }

    public BigDecimal calculateCurrentBookValue(Asset asset) {
        double originalCost = asset.getPurchaseCost().doubleValue();
        double depreciationRate = getDepreciationRate(asset.getCategory());
        int ageYears = Math.max(0, LocalDate.now().getYear() - asset.getPurchaseDate().getYear());
        double salvage = asset.getSalvageValue() != null ? asset.getSalvageValue().doubleValue() : 0.0;
        double bookValue = Math.max(salvage, originalCost * Math.pow(1.0 - depreciationRate, ageYears));
        return BigDecimal.valueOf(bookValue).setScale(2, RoundingMode.HALF_UP);
    }

    private double getDepreciationRate(String category) {
        if (category == null) return HARDWARE_ANNUAL_DEPRECIATION;
        return switch (category.toUpperCase()) {
            case "VEHICLE" -> VEHICLE_ANNUAL_DEPRECIATION;
            case "SERVER" -> SERVER_ANNUAL_DEPRECIATION;
            case "MACHINERY" -> 0.10;
            case "OFFICE_EQUIPMENT" -> 0.15;
            default -> HARDWARE_ANNUAL_DEPRECIATION;
        };
    }
}
