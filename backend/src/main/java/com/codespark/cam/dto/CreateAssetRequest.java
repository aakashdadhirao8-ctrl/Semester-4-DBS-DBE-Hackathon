package com.codespark.cam.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CreateAssetRequest {
    private String assetTag;
    private String name;
    private String category;
    private BigDecimal purchaseCost;
    private LocalDate purchaseDate;
    private String conditionStatus;
    private Long assignedEmployeeId;
    private Integer powerWatts;
    private Integer estimatedLifespanYears;
    private BigDecimal salvageValue;

    // Optional Financing parameters
    private String financingType; // OUTRIGHT, LOAN, LEASE
    private BigDecimal totalLoanAmount;
    private BigDecimal downPayment;
    private BigDecimal monthlyEmi;
    private BigDecimal interestRate;
    private Integer tenureMonths;

    public CreateAssetRequest() {}

    public String getAssetTag() { return assetTag; }
    public void setAssetTag(String assetTag) { this.assetTag = assetTag; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getPurchaseCost() { return purchaseCost; }
    public void setPurchaseCost(BigDecimal purchaseCost) { this.purchaseCost = purchaseCost; }

    public LocalDate getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDate purchaseDate) { this.purchaseDate = purchaseDate; }

    public String getConditionStatus() { return conditionStatus; }
    public void setConditionStatus(String conditionStatus) { this.conditionStatus = conditionStatus; }

    public Long getAssignedEmployeeId() { return assignedEmployeeId; }
    public void setAssignedEmployeeId(Long assignedEmployeeId) { this.assignedEmployeeId = assignedEmployeeId; }

    public Integer getPowerWatts() { return powerWatts; }
    public void setPowerWatts(Integer powerWatts) { this.powerWatts = powerWatts; }

    public Integer getEstimatedLifespanYears() { return estimatedLifespanYears; }
    public void setEstimatedLifespanYears(Integer estimatedLifespanYears) { this.estimatedLifespanYears = estimatedLifespanYears; }

    public BigDecimal getSalvageValue() { return salvageValue; }
    public void setSalvageValue(BigDecimal salvageValue) { this.salvageValue = salvageValue; }

    public String getFinancingType() { return financingType; }
    public void setFinancingType(String financingType) { this.financingType = financingType; }

    public BigDecimal getTotalLoanAmount() { return totalLoanAmount; }
    public void setTotalLoanAmount(BigDecimal totalLoanAmount) { this.totalLoanAmount = totalLoanAmount; }

    public BigDecimal getDownPayment() { return downPayment; }
    public void setDownPayment(BigDecimal downPayment) { this.downPayment = downPayment; }

    public BigDecimal getMonthlyEmi() { return monthlyEmi; }
    public void setMonthlyEmi(BigDecimal monthlyEmi) { this.monthlyEmi = monthlyEmi; }

    public BigDecimal getInterestRate() { return interestRate; }
    public void setInterestRate(BigDecimal interestRate) { this.interestRate = interestRate; }

    public Integer getTenureMonths() { return tenureMonths; }
    public void setTenureMonths(Integer tenureMonths) { this.tenureMonths = tenureMonths; }
}
