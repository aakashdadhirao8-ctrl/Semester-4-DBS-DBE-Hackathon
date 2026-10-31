package com.codespark.cam.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "maintenance_logs")
public class MaintenanceLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal cost;

    @Column(name = "issue_description", nullable = false, length = 255)
    private String issueDescription;

    @Column(name = "service_provider", length = 120)
    private String serviceProvider;

    @Column(name = "maintenance_date", nullable = false)
    private LocalDate maintenanceDate;

    @Column(name = "is_resolved")
    private Boolean isResolved = true;

    public MaintenanceLog() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Asset getAsset() { return asset; }
    public void setAsset(Asset asset) { this.asset = asset; }

    public BigDecimal getCost() { return cost; }
    public void setCost(BigDecimal cost) { this.cost = cost; }

    public String getIssueDescription() { return issueDescription; }
    public void setIssueDescription(String issueDescription) { this.issueDescription = issueDescription; }

    public String getServiceProvider() { return serviceProvider; }
    public void setServiceProvider(String serviceProvider) { this.serviceProvider = serviceProvider; }

    public LocalDate getMaintenanceDate() { return maintenanceDate; }
    public void setMaintenanceDate(LocalDate maintenanceDate) { this.maintenanceDate = maintenanceDate; }

    public Boolean getIsResolved() { return isResolved; }
    public void setIsResolved(Boolean isResolved) { this.isResolved = isResolved; }
}
