package com.codespark.cam.dto;

public class SmartAlertDTO {
    private String id;
    private String type; // SCRAP_RECOMMENDATION, BUDGET_EXCEEDED, LOAN_COMPLETED, WARRANTY_EXPIRY
    private String severity; // CRITICAL, WARNING, SUCCESS, INFO
    private String title;
    private String message;
    private String assetTag;
    private Long assetId;
    private String departmentName;

    public SmartAlertDTO() {}

    public SmartAlertDTO(String id, String type, String severity, String title, String message, String assetTag, Long assetId, String departmentName) {
        this.id = id;
        this.type = type;
        this.severity = severity;
        this.title = title;
        this.message = message;
        this.assetTag = assetTag;
        this.assetId = assetId;
        this.departmentName = departmentName;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getAssetTag() { return assetTag; }
    public void setAssetTag(String assetTag) { this.assetTag = assetTag; }

    public Long getAssetId() { return assetId; }
    public void setAssetId(Long assetId) { this.assetId = assetId; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
}
