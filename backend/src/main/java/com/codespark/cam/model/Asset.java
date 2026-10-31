package com.codespark.cam.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "assets")
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "asset_tag", nullable = false, unique = true, length = 50)
    private String assetTag;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 50)
    private String category; // HARDWARE, SERVER, VEHICLE, MACHINERY, OFFICE_EQUIPMENT

    @Column(name = "purchase_cost", nullable = false, precision = 15, scale = 2)
    private BigDecimal purchaseCost;

    @Column(name = "purchase_date", nullable = false)
    private LocalDate purchaseDate;

    @Column(name = "condition_status", nullable = false, length = 30)
    private String conditionStatus = "GOOD"; // EXCELLENT, GOOD, FAIR, DAMAGED

    @Column(name = "allocation_status", nullable = false, length = 30)
    private String allocationStatus = "AVAILABLE"; // AVAILABLE, ASSIGNED, UNDER_MAINTENANCE, SCRAPPED

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_employee_id")
    private Employee assignedEmployee;

    @Column(name = "power_watts")
    private Integer powerWatts = 65; // Power rating in Watts

    @Column(name = "estimated_lifespan_years")
    private Integer estimatedLifespanYears = 4;

    @Column(name = "salvage_value", precision = 15, scale = 2)
    private BigDecimal salvageValue = BigDecimal.ZERO;

    public Asset() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public String getAllocationStatus() { return allocationStatus; }
    public void setAllocationStatus(String allocationStatus) { this.allocationStatus = allocationStatus; }

    public Employee getAssignedEmployee() { return assignedEmployee; }
    public void setAssignedEmployee(Employee assignedEmployee) { this.assignedEmployee = assignedEmployee; }

    public Integer getPowerWatts() { return powerWatts; }
    public void setPowerWatts(Integer powerWatts) { this.powerWatts = powerWatts; }

    public Integer getEstimatedLifespanYears() { return estimatedLifespanYears; }
    public void setEstimatedLifespanYears(Integer estimatedLifespanYears) { this.estimatedLifespanYears = estimatedLifespanYears; }

    public BigDecimal getSalvageValue() { return salvageValue; }
    public void setSalvageValue(BigDecimal salvageValue) { this.salvageValue = salvageValue; }
}
