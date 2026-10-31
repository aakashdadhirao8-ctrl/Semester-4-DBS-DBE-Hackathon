package com.codespark.cam.dto;

import java.math.BigDecimal;
import java.util.List;

public class InflationAnalysisDTO {
    private Integer purchaseYear;
    private Integer currentYear;
    private BigDecimal originalCost;
    private BigDecimal purchasingPowerToday;
    private BigDecimal currentBookValue;
    private BigDecimal todayReplacementCost;
    private BigDecimal replacementDeficit;
    private BigDecimal projectedThreeYearCost;
    private BigDecimal projectedFiveYearCost;
    private Double benchmarkInflationRate;
    private List<YearlyProjectionPoint> trajectory;

    public InflationAnalysisDTO() {}

    public Integer getPurchaseYear() { return purchaseYear; }
    public void setPurchaseYear(Integer purchaseYear) { this.purchaseYear = purchaseYear; }

    public Integer getCurrentYear() { return currentYear; }
    public void setCurrentYear(Integer currentYear) { this.currentYear = currentYear; }

    public BigDecimal getOriginalCost() { return originalCost; }
    public void setOriginalCost(BigDecimal originalCost) { this.originalCost = originalCost; }

    public BigDecimal getPurchasingPowerToday() { return purchasingPowerToday; }
    public void setPurchasingPowerToday(BigDecimal purchasingPowerToday) { this.purchasingPowerToday = purchasingPowerToday; }

    public BigDecimal getCurrentBookValue() { return currentBookValue; }
    public void setCurrentBookValue(BigDecimal currentBookValue) { this.currentBookValue = currentBookValue; }

    public BigDecimal getTodayReplacementCost() { return todayReplacementCost; }
    public void setTodayReplacementCost(BigDecimal todayReplacementCost) { this.todayReplacementCost = todayReplacementCost; }

    public BigDecimal getReplacementDeficit() { return replacementDeficit; }
    public void setReplacementDeficit(BigDecimal replacementDeficit) { this.replacementDeficit = replacementDeficit; }

    public BigDecimal getProjectedThreeYearCost() { return projectedThreeYearCost; }
    public void setProjectedThreeYearCost(BigDecimal projectedThreeYearCost) { this.projectedThreeYearCost = projectedThreeYearCost; }

    public BigDecimal getProjectedFiveYearCost() { return projectedFiveYearCost; }
    public void setProjectedFiveYearCost(BigDecimal projectedFiveYearCost) { this.projectedFiveYearCost = projectedFiveYearCost; }

    public Double getBenchmarkInflationRate() { return benchmarkInflationRate; }
    public void setBenchmarkInflationRate(Double benchmarkInflationRate) { this.benchmarkInflationRate = benchmarkInflationRate; }

    public List<YearlyProjectionPoint> getTrajectory() { return trajectory; }
    public void setTrajectory(List<YearlyProjectionPoint> trajectory) { this.trajectory = trajectory; }

    public static class YearlyProjectionPoint {
        private Integer year;
        private BigDecimal depreciatedBookValue;
        private BigDecimal replacementCost;

        public YearlyProjectionPoint(Integer year, BigDecimal depreciatedBookValue, BigDecimal replacementCost) {
            this.year = year;
            this.depreciatedBookValue = depreciatedBookValue;
            this.replacementCost = replacementCost;
        }

        public Integer getYear() { return year; }
        public BigDecimal getDepreciatedBookValue() { return depreciatedBookValue; }
        public BigDecimal getReplacementCost() { return replacementCost; }
    }
}
