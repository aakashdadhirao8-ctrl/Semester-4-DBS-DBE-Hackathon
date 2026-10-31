package com.codespark.cam.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "emi_payments")
public class EmiPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "finance_id", nullable = false)
    private AssetFinance assetFinance;

    @Column(name = "installment_no", nullable = false)
    private Integer installmentNo;

    @Column(name = "amount_paid", nullable = false, precision = 15, scale = 2)
    private BigDecimal amountPaid;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Column(length = 255)
    private String remarks;

    public EmiPayment() {}

    public EmiPayment(Long id, AssetFinance assetFinance, Integer installmentNo, BigDecimal amountPaid, LocalDate paymentDate, String remarks) {
        this.id = id;
        this.assetFinance = assetFinance;
        this.installmentNo = installmentNo;
        this.amountPaid = amountPaid;
        this.paymentDate = paymentDate;
        this.remarks = remarks;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public AssetFinance getAssetFinance() { return assetFinance; }
    public void setAssetFinance(AssetFinance assetFinance) { this.assetFinance = assetFinance; }

    public Integer getInstallmentNo() { return installmentNo; }
    public void setInstallmentNo(Integer installmentNo) { this.installmentNo = installmentNo; }

    public BigDecimal getAmountPaid() { return amountPaid; }
    public void setAmountPaid(BigDecimal amountPaid) { this.amountPaid = amountPaid; }

    public LocalDate getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDate paymentDate) { this.paymentDate = paymentDate; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
