package com.codespark.cam.dto;

import java.math.BigDecimal;

public class RecordEmiRequest {
    private BigDecimal amountPaid;
    private String remarks;

    public RecordEmiRequest() {}

    public BigDecimal getAmountPaid() { return amountPaid; }
    public void setAmountPaid(BigDecimal amountPaid) { this.amountPaid = amountPaid; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
