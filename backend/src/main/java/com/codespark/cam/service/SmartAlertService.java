package com.codespark.cam.service;

import com.codespark.cam.dto.SmartAlertDTO;
import com.codespark.cam.model.Asset;
import com.codespark.cam.model.AssetFinance;
import com.codespark.cam.model.Department;
import com.codespark.cam.repository.AssetFinanceRepository;
import com.codespark.cam.repository.AssetRepository;
import com.codespark.cam.repository.DepartmentRepository;
import com.codespark.cam.repository.MaintenanceLogRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class SmartAlertService {

    private final AssetRepository assetRepository;
    private final MaintenanceLogRepository maintenanceLogRepository;
    private final DepartmentRepository departmentRepository;
    private final AssetFinanceRepository financeRepository;
    private final InflationService inflationService;

    public SmartAlertService(AssetRepository assetRepository,
                             MaintenanceLogRepository maintenanceLogRepository,
                             DepartmentRepository departmentRepository,
                             AssetFinanceRepository financeRepository,
                             InflationService inflationService) {
        this.assetRepository = assetRepository;
        this.maintenanceLogRepository = maintenanceLogRepository;
        this.departmentRepository = departmentRepository;
        this.financeRepository = financeRepository;
        this.inflationService = inflationService;
    }

    public List<SmartAlertDTO> generateSmartAlerts() {
        List<SmartAlertDTO> alerts = new ArrayList<>();

        // 1. Scrap vs. Repair Tipping Point Alerts
        List<Asset> assets = assetRepository.findAll();
        for (Asset asset : assets) {
            BigDecimal totalRepairs = maintenanceLogRepository.sumCostByAssetId(asset.getId());
            BigDecimal currentBookValue = inflationService.calculateCurrentBookValue(asset);

            if (totalRepairs.compareTo(BigDecimal.ZERO) > 0 && currentBookValue.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal threshold = currentBookValue.multiply(BigDecimal.valueOf(0.50));
                if (totalRepairs.compareTo(threshold) > 0) {
                    alerts.add(new SmartAlertDTO(
                            "SCRAP-" + asset.getId(),
                            "SCRAP_RECOMMENDATION",
                            "CRITICAL",
                            "Decommission Alert: " + asset.getName(),
                            "Accumulated repairs ($" + totalRepairs + ") exceed 50% of current book value ($" + currentBookValue + "). Recommend decommissioning for estimated salvage value ($" + asset.getSalvageValue() + ").",
                            asset.getAssetTag(),
                            asset.getId(),
                            asset.getAssignedEmployee() != null && asset.getAssignedEmployee().getDepartment() != null
                                    ? asset.getAssignedEmployee().getDepartment().getName() : "Unassigned"
                    ));
                }
            }
        }

        // 2. Department Budget Ceiling Alerts
        List<Department> departments = departmentRepository.findAll();
        for (Department dept : departments) {
            List<Asset> deptAssets = assetRepository.findByDepartmentId(dept.getId());
            BigDecimal totalAllocated = deptAssets.stream()
                    .map(Asset::getPurchaseCost)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (totalAllocated.compareTo(dept.getBudgetCeiling()) > 0) {
                alerts.add(new SmartAlertDTO(
                        "BUDGET-EXCEED-" + dept.getId(),
                        "BUDGET_EXCEEDED",
                        "CRITICAL",
                        "Budget Overrun: " + dept.getName(),
                        "Allocated asset value ($" + totalAllocated + ") exceeds approved department ceiling ($" + dept.getBudgetCeiling() + ") by $" + totalAllocated.subtract(dept.getBudgetCeiling()) + ".",
                        null,
                        null,
                        dept.getName()
                ));
            } else if (totalAllocated.compareTo(dept.getBudgetCeiling().multiply(BigDecimal.valueOf(0.85))) > 0) {
                alerts.add(new SmartAlertDTO(
                        "BUDGET-WARN-" + dept.getId(),
                        "BUDGET_WARNING",
                        "WARNING",
                        "Budget Warning: " + dept.getName(),
                        "Department has utilized over 85% of its authorized asset budget ($" + totalAllocated + " / $" + dept.getBudgetCeiling() + ").",
                        null,
                        null,
                        dept.getName()
                ));
            }
        }

        // 3. Asset Loan 100% Owned Milestone
        List<AssetFinance> finances = financeRepository.findAll();
        for (AssetFinance finance : finances) {
            if (Boolean.TRUE.equals(finance.getIsFullyPaid()) && "LOAN".equalsIgnoreCase(finance.getFinancingType())) {
                alerts.add(new SmartAlertDTO(
                        "LOAN-CLEAR-" + finance.getId(),
                        "LOAN_COMPLETED",
                        "SUCCESS",
                        "Asset 100% Capitalized: " + finance.getAsset().getName(),
                        "All " + finance.getTenureMonths() + " installments cleared! Company owns 100% equity in this asset with zero outstanding debt.",
                        finance.getAsset().getAssetTag(),
                        finance.getAsset().getId(),
                        null
                ));
            }
        }

        return alerts;
    }
}
