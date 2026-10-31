package com.codespark.cam.dto;

import java.math.BigDecimal;

public class DepartmentCostPerSeatDTO {
    private Long departmentId;
    private String departmentName;
    private String code;
    private BigDecimal budgetCeiling;
    private Long headcount;
    private BigDecimal totalAssetValue;
    private BigDecimal costPerSeat;
    private Double budgetUtilizationPct;
    private Boolean isOverBudget;

    public DepartmentCostPerSeatDTO() {}

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public BigDecimal getBudgetCeiling() { return budgetCeiling; }
    public void setBudgetCeiling(BigDecimal budgetCeiling) { this.budgetCeiling = budgetCeiling; }

    public Long getHeadcount() { return headcount; }
    public void setHeadcount(Long headcount) { this.headcount = headcount; }

    public BigDecimal getTotalAssetValue() { return totalAssetValue; }
    public void setTotalAssetValue(BigDecimal totalAssetValue) { this.totalAssetValue = totalAssetValue; }

    public BigDecimal getCostPerSeat() { return costPerSeat; }
    public void setCostPerSeat(BigDecimal costPerSeat) { this.costPerSeat = costPerSeat; }

    public Double getBudgetUtilizationPct() { return budgetUtilizationPct; }
    public void setBudgetUtilizationPct(Double budgetUtilizationPct) { this.budgetUtilizationPct = budgetUtilizationPct; }

    public Boolean getIsOverBudget() { return isOverBudget; }
    public void setIsOverBudget(Boolean isOverBudget) { this.isOverBudget = isOverBudget; }
}
