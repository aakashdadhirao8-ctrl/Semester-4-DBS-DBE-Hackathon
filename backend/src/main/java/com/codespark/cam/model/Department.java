package com.codespark.cam.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "departments")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(name = "budget_ceiling", nullable = false, precision = 15, scale = 2)
    private BigDecimal budgetCeiling = new BigDecimal("50000.00");

    @Column(name = "head_name", length = 100)
    private String headName;

    public Department() {}

    public Department(Long id, String name, String code, BigDecimal budgetCeiling, String headName) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.budgetCeiling = budgetCeiling;
        this.headName = headName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public BigDecimal getBudgetCeiling() { return budgetCeiling; }
    public void setBudgetCeiling(BigDecimal budgetCeiling) { this.budgetCeiling = budgetCeiling; }

    public String getHeadName() { return headName; }
    public void setHeadName(String headName) { this.headName = headName; }
}
