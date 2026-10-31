package com.codespark.cam.service;

import com.codespark.cam.dto.DashboardSummaryDTO;
import com.codespark.cam.repository.AssetRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class GreenItService {

    private final AssetRepository assetRepository;
    private static final double HOURS_PER_DAY = 9.0;
    private static final double WORKING_DAYS_PER_MONTH = 22.0;
    private static final double TARIFF_PER_KWH = 0.14; // $0.14 per kWh benchmark
    private static final double CO2_KG_PER_KWH = 0.71; // 0.71 kg CO2 per kWh

    public GreenItService(AssetRepository assetRepository) {
        this.assetRepository = assetRepository;
    }

    public DashboardSummaryDTO.GreenItStatsDTO calculateGreenItMetrics() {
        Integer totalWatts = assetRepository.sumTotalPowerWatts();
        if (totalWatts == null) totalWatts = 0;

        double monthlyKwh = (totalWatts * HOURS_PER_DAY * WORKING_DAYS_PER_MONTH) / 1000.0;
        double monthlyCo2 = monthlyKwh * CO2_KG_PER_KWH;

        String grade;
        if (monthlyKwh < 1200) grade = "A+ (Ultra Efficient)";
        else if (monthlyKwh < 2500) grade = "A (Eco-Optimized)";
        else if (monthlyKwh < 4500) grade = "B (Standard Corporate)";
        else grade = "C (High Energy Footprint)";

        DashboardSummaryDTO.GreenItStatsDTO stats = new DashboardSummaryDTO.GreenItStatsDTO();
        stats.setTotalWatts(totalWatts);
        stats.setMonthlyKwh(BigDecimal.valueOf(monthlyKwh).setScale(1, RoundingMode.HALF_UP));
        stats.setMonthlyCo2Kg(BigDecimal.valueOf(monthlyCo2).setScale(1, RoundingMode.HALF_UP));
        stats.setGreenGrade(grade);

        return stats;
    }

    public BigDecimal calculateMonthlyElectricityBill() {
        Integer totalWatts = assetRepository.sumTotalPowerWatts();
        if (totalWatts == null) totalWatts = 0;
        double monthlyKwh = (totalWatts * HOURS_PER_DAY * WORKING_DAYS_PER_MONTH) / 1000.0;
        double bill = monthlyKwh * TARIFF_PER_KWH;
        return BigDecimal.valueOf(bill).setScale(2, RoundingMode.HALF_UP);
    }
}
