package com.codespark.cam.dto;

import java.math.BigDecimal;
import java.util.Map;

public class DashboardSummaryDTO {
    private Long totalHeadcount;
    private Long totalAssetCount;
    private BigDecimal totalAssetCost;
    private BigDecimal totalDebt;
    private BigDecimal netAssetEquity;
    private BigDecimal overallOwnershipPct;
    private MonthlyBurnDTO monthlyBurn;
    private GreenItStatsDTO greenItStats;
    private Map<String, Double> forexRates;

    public DashboardSummaryDTO() {}

    public Long getTotalHeadcount() { return totalHeadcount; }
    public void setTotalHeadcount(Long totalHeadcount) { this.totalHeadcount = totalHeadcount; }

    public Long getTotalAssetCount() { return totalAssetCount; }
    public void setTotalAssetCount(Long totalAssetCount) { this.totalAssetCount = totalAssetCount; }

    public BigDecimal getTotalAssetCost() { return totalAssetCost; }
    public void setTotalAssetCost(BigDecimal totalAssetCost) { this.totalAssetCost = totalAssetCost; }

    public BigDecimal getTotalDebt() { return totalDebt; }
    public void setTotalDebt(BigDecimal totalDebt) { this.totalDebt = totalDebt; }

    public BigDecimal getNetAssetEquity() { return netAssetEquity; }
    public void setNetAssetEquity(BigDecimal netAssetEquity) { this.netAssetEquity = netAssetEquity; }

    public BigDecimal getOverallOwnershipPct() { return overallOwnershipPct; }
    public void setOverallOwnershipPct(BigDecimal overallOwnershipPct) { this.overallOwnershipPct = overallOwnershipPct; }

    public MonthlyBurnDTO getMonthlyBurn() { return monthlyBurn; }
    public void setMonthlyBurn(MonthlyBurnDTO monthlyBurn) { this.monthlyBurn = monthlyBurn; }

    public GreenItStatsDTO getGreenItStats() { return greenItStats; }
    public void setGreenItStats(GreenItStatsDTO greenItStats) { this.greenItStats = greenItStats; }

    public Map<String, Double> getForexRates() { return forexRates; }
    public void setForexRates(Map<String, Double> forexRates) { this.forexRates = forexRates; }

    public static class MonthlyBurnDTO {
        private BigDecimal monthlyEmis;
        private BigDecimal monthlyMaintenanceAvg;
        private BigDecimal monthlyElectricityBill;
        private BigDecimal totalMonthlyBurn;

        public MonthlyBurnDTO() {}

        public BigDecimal getMonthlyEmis() { return monthlyEmis; }
        public void setMonthlyEmis(BigDecimal monthlyEmis) { this.monthlyEmis = monthlyEmis; }

        public BigDecimal getMonthlyMaintenanceAvg() { return monthlyMaintenanceAvg; }
        public void setMonthlyMaintenanceAvg(BigDecimal monthlyMaintenanceAvg) { this.monthlyMaintenanceAvg = monthlyMaintenanceAvg; }

        public BigDecimal getMonthlyElectricityBill() { return monthlyElectricityBill; }
        public void setMonthlyElectricityBill(BigDecimal monthlyElectricityBill) { this.monthlyElectricityBill = monthlyElectricityBill; }

        public BigDecimal getTotalMonthlyBurn() { return totalMonthlyBurn; }
        public void setTotalMonthlyBurn(BigDecimal totalMonthlyBurn) { this.totalMonthlyBurn = totalMonthlyBurn; }
    }

    public static class GreenItStatsDTO {
        private Integer totalWatts;
        private BigDecimal monthlyKwh;
        private BigDecimal monthlyCo2Kg;
        private String greenGrade;

        public GreenItStatsDTO() {}

        public Integer getTotalWatts() { return totalWatts; }
        public void setTotalWatts(Integer totalWatts) { this.totalWatts = totalWatts; }

        public BigDecimal getMonthlyKwh() { return monthlyKwh; }
        public void setMonthlyKwh(BigDecimal monthlyKwh) { this.monthlyKwh = monthlyKwh; }

        public BigDecimal getMonthlyCo2Kg() { return monthlyCo2Kg; }
        public void setMonthlyCo2Kg(BigDecimal monthlyCo2Kg) { this.monthlyCo2Kg = monthlyCo2Kg; }

        public String getGreenGrade() { return greenGrade; }
        public void setGreenGrade(String greenGrade) { this.greenGrade = greenGrade; }
    }
}
