package com.codespark.cam.service;

import com.codespark.cam.dto.DashboardSummaryDTO;
import com.codespark.cam.dto.DepartmentCostPerSeatDTO;
import com.codespark.cam.model.Asset;
import com.codespark.cam.model.Department;
import com.codespark.cam.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final EmployeeRepository employeeRepository;
    private final AssetRepository assetRepository;
    private final AssetFinanceRepository financeRepository;
    private final MaintenanceLogRepository maintenanceLogRepository;
    private final DepartmentRepository departmentRepository;
    private final GreenItService greenItService;
    private final ForexService forexService;

    public DashboardService(EmployeeRepository employeeRepository,
                            AssetRepository assetRepository,
                            AssetFinanceRepository financeRepository,
                            MaintenanceLogRepository maintenanceLogRepository,
                            DepartmentRepository departmentRepository,
                            GreenItService greenItService,
                            ForexService forexService) {
        this.employeeRepository = employeeRepository;
        this.assetRepository = assetRepository;
        this.financeRepository = financeRepository;
        this.maintenanceLogRepository = maintenanceLogRepository;
        this.departmentRepository = departmentRepository;
        this.greenItService = greenItService;
        this.forexService = forexService;
    }

    public DashboardSummaryDTO getDashboardSummary() {
        long totalHeadcount = employeeRepository.count();
        long totalAssets = assetRepository.count();

        BigDecimal totalAssetCost = assetRepository.sumTotalPurchaseCost();
        if (totalAssetCost == null) totalAssetCost = BigDecimal.ZERO;

        BigDecimal totalDebt = financeRepository.calculateTotalRemainingDebt();
        if (totalDebt == null || totalDebt.compareTo(BigDecimal.ZERO) < 0) totalDebt = BigDecimal.ZERO;

        BigDecimal netAssetEquity = totalAssetCost.subtract(totalDebt);
        if (netAssetEquity.compareTo(BigDecimal.ZERO) < 0) netAssetEquity = BigDecimal.ZERO;

        BigDecimal overallOwnershipPct;
        if (totalAssetCost.compareTo(BigDecimal.ZERO) > 0) {
            overallOwnershipPct = netAssetEquity.divide(totalAssetCost, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(1, RoundingMode.HALF_UP);
        } else {
            overallOwnershipPct = BigDecimal.valueOf(100.0);
        }

        // Monthly Outflows
        BigDecimal monthlyEmis = financeRepository.sumActiveMonthlyEmis();
        if (monthlyEmis == null) monthlyEmis = BigDecimal.ZERO;

        BigDecimal totalMaintenance = maintenanceLogRepository.sumTotalMaintenanceCost();
        if (totalMaintenance == null) totalMaintenance = BigDecimal.ZERO;
        BigDecimal monthlyMaintenanceAvg = totalMaintenance.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);

        BigDecimal monthlyElectricity = greenItService.calculateMonthlyElectricityBill();
        BigDecimal totalMonthlyBurn = monthlyEmis.add(monthlyMaintenanceAvg).add(monthlyElectricity);

        DashboardSummaryDTO.MonthlyBurnDTO monthlyBurn = new DashboardSummaryDTO.MonthlyBurnDTO();
        monthlyBurn.setMonthlyEmis(monthlyEmis);
        monthlyBurn.setMonthlyMaintenanceAvg(monthlyMaintenanceAvg);
        monthlyBurn.setMonthlyElectricityBill(monthlyElectricity);
        monthlyBurn.setTotalMonthlyBurn(totalMonthlyBurn);

        DashboardSummaryDTO.GreenItStatsDTO greenIt = greenItService.calculateGreenItMetrics();
        Map<String, Double> forex = forexService.getForexRates();

        DashboardSummaryDTO summary = new DashboardSummaryDTO();
        summary.setTotalHeadcount(totalHeadcount);
        summary.setTotalAssetCount(totalAssets);
        summary.setTotalAssetCost(totalAssetCost);
        summary.setTotalDebt(totalDebt);
        summary.setNetAssetEquity(netAssetEquity);
        summary.setOverallOwnershipPct(overallOwnershipPct);
        summary.setMonthlyBurn(monthlyBurn);
        summary.setGreenItStats(greenIt);
        summary.setForexRates(forex);

        return summary;
    }

    public List<DepartmentCostPerSeatDTO> getCostPerSeatBreakdown() {
        List<Department> departments = departmentRepository.findAll();
        List<DepartmentCostPerSeatDTO> list = new ArrayList<>();

        for (Department dept : departments) {
            long headcount = employeeRepository.countByDepartmentId(dept.getId());
            List<Asset> deptAssets = assetRepository.findByDepartmentId(dept.getId());

            BigDecimal totalAssetValue = deptAssets.stream()
                    .map(Asset::getPurchaseCost)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal costPerSeat = headcount > 0
                    ? totalAssetValue.divide(BigDecimal.valueOf(headcount), 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            double utilization = dept.getBudgetCeiling().compareTo(BigDecimal.ZERO) > 0
                    ? totalAssetValue.divide(dept.getBudgetCeiling(), 4, RoundingMode.HALF_UP).doubleValue() * 100.0
                    : 0.0;

            DepartmentCostPerSeatDTO dto = new DepartmentCostPerSeatDTO();
            dto.setDepartmentId(dept.getId());
            dto.setDepartmentName(dept.getName());
            dto.setCode(dept.getCode());
            dto.setBudgetCeiling(dept.getBudgetCeiling());
            dto.setHeadcount(headcount);
            dto.setTotalAssetValue(totalAssetValue);
            dto.setCostPerSeat(costPerSeat);
            dto.setBudgetUtilizationPct(Math.round(utilization * 10.0) / 10.0);
            dto.setIsOverBudget(totalAssetValue.compareTo(dept.getBudgetCeiling()) > 0);

            list.add(dto);
        }

        return list;
    }

    public List<Map<String, Object>> getCategoryDistribution() {
        List<Object[]> raw = assetRepository.getAssetDistributionByCategory();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : raw) {
            Map<String, Object> map = new HashMap<>();
            map.put("category", row[0]);
            map.put("count", row[1]);
            map.put("totalValue", row[2]);
            result.add(map);
        }
        return result;
    }
}
