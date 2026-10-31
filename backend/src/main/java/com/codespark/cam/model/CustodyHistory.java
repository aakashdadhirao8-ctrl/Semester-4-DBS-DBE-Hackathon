package com.codespark.cam.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "custody_histories")
public class CustodyHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @Column(name = "action_type", nullable = false, length = 30)
    private String actionType; // ASSIGNED, RETURNED, REASSIGNED

    @Column(name = "action_date", nullable = false)
    private LocalDate actionDate;

    @Column(name = "condition_notes", length = 255)
    private String conditionNotes;

    public CustodyHistory() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Asset getAsset() { return asset; }
    public void setAsset(Asset asset) { this.asset = asset; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public LocalDate getActionDate() { return actionDate; }
    public void setActionDate(LocalDate actionDate) { this.actionDate = actionDate; }

    public String getConditionNotes() { return conditionNotes; }
    public void setConditionNotes(String conditionNotes) { this.conditionNotes = conditionNotes; }
}
