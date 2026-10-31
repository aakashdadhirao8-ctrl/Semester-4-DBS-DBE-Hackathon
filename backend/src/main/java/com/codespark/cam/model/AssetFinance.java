package com.codespark.cam.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "asset_finances")
public class AssetFinance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "asset_id", nullable = false, unique = true)
    private Asset asset;

    @Column(name = "financing_type", nullable = false, length = 30)
    private String financingType = "LOAN"; // OUTRIGHT, LOAN, LEASE

    @Column(name = "total_loan_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalLoanAmount = BigDecimal.ZERO;

    @Column(name = "down_payment", nullable = false, precision = 15, scale = 2)
    private BigDecimal downPayment = BigDecimal.ZERO;

    @Column(name = "monthly_emi", nullable = false, precision = 15, scale = 2)
    private BigDecimal monthlyEmi = BigDecimal.ZERO;

    @Column(name = "interest_rate", precision = 5, scale = 2)
    private BigDecimal interestRate = new BigDecimal("8.50");

    @Column(name = "tenure_months", nullable = false)
    private Integer tenureMonths = 24;

    @Column(name = "emis_paid", nullable = false)
    private Integer emisPaid = 0;

    @Column(name = "current_ownership_pct", nullable = false, precision = 6, scale = 2)
    private BigDecimal currentOwnershipPct = new BigDecimal("20.00");

    @Column(name = "is_fully_paid", nullable = false)
    private Boolean isFullyPaid = false;

    public AssetFinance() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Asset getAsset() { return asset; }
    public void setAsset(Asset asset) { this.asset = asset; }

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

    public Integer getEmisPaid() { return emisPaid; }
    public void setEmisPaid(Integer emisPaid) { this.emisPaid = emisPaid; }

    public BigDecimal getCurrentOwnershipPct() { return currentOwnershipPct; }
    public void setCurrentOwnershipPct(BigDecimal currentOwnershipPct) { this.currentOwnershipPct = currentOwnershipPct; }

    public Boolean getIsFullyPaid() { return isFullyPaid; }
    public void setIsFullyPaid(Boolean isFullyPaid) { this.isFullyPaid = isFullyPaid; }
}
