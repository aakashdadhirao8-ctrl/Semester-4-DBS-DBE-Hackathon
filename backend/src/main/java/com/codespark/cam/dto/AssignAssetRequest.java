package com.codespark.cam.dto;

public class AssignAssetRequest {
    private Long employeeId;
    private String conditionNotes;

    public AssignAssetRequest() {}

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public String getConditionNotes() { return conditionNotes; }
    public void setConditionNotes(String conditionNotes) { this.conditionNotes = conditionNotes; }
}
