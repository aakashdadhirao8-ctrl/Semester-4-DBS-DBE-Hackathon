package com.codespark.cam.dto;

import java.math.BigDecimal;

public class RoiSimulationResponse {
    private BigDecimal lumpSumPayment;
    private BigDecimal currentRemainingBalance;
    private BigDecimal newRemainingBalance;
    private Integer originalRemainingMonths;
    private Integer newRemainingMonths;
    private Integer monthsSaved;
    private BigDecimal totalInterestSaved;
    private BigDecimal newMonthlyEmi;

    public RoiSimulationResponse() {}

    public BigDecimal getLumpSumPayment() { return lumpSumPayment; }
    public void setLumpSumPayment(BigDecimal lumpSumPayment) { this.lumpSumPayment = lumpSumPayment; }

    public BigDecimal getCurrentRemainingBalance() { return currentRemainingBalance; }
    public void setCurrentRemainingBalance(BigDecimal currentRemainingBalance) { this.currentRemainingBalance = currentRemainingBalance; }

    public BigDecimal getNewRemainingBalance() { return newRemainingBalance; }
    public void setNewRemainingBalance(BigDecimal newRemainingBalance) { this.newRemainingBalance = newRemainingBalance; }

    public Integer getOriginalRemainingMonths() { return originalRemainingMonths; }
    public void setOriginalRemainingMonths(Integer originalRemainingMonths) { this.originalRemainingMonths = originalRemainingMonths; }

    public Integer getNewRemainingMonths() { return newRemainingMonths; }
    public void setNewRemainingMonths(Integer newRemainingMonths) { this.newRemainingMonths = newRemainingMonths; }

    public Integer getMonthsSaved() { return monthsSaved; }
    public void setMonthsSaved(Integer monthsSaved) { this.monthsSaved = monthsSaved; }

    public BigDecimal getTotalInterestSaved() { return totalInterestSaved; }
    public void setTotalInterestSaved(BigDecimal totalInterestSaved) { this.totalInterestSaved = totalInterestSaved; }

    public BigDecimal getNewMonthlyEmi() { return newMonthlyEmi; }
    public void setNewMonthlyEmi(BigDecimal newMonthlyEmi) { this.newMonthlyEmi = newMonthlyEmi; }
}
