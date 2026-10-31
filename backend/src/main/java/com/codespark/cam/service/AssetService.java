package com.codespark.cam.service;

import com.codespark.cam.dto.AssignAssetRequest;
import com.codespark.cam.dto.CreateAssetRequest;
import com.codespark.cam.model.*;
import com.codespark.cam.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class AssetService {

    private final AssetRepository assetRepository;
    private final EmployeeRepository employeeRepository;
    private final AssetFinanceRepository financeRepository;
    private final CustodyHistoryRepository custodyHistoryRepository;
    private final MaintenanceLogRepository maintenanceLogRepository;

    public AssetService(AssetRepository assetRepository,
                        EmployeeRepository employeeRepository,
                        AssetFinanceRepository financeRepository,
                        CustodyHistoryRepository custodyHistoryRepository,
                        MaintenanceLogRepository maintenanceLogRepository) {
        this.assetRepository = assetRepository;
        this.employeeRepository = employeeRepository;
        this.financeRepository = financeRepository;
        this.custodyHistoryRepository = custodyHistoryRepository;
        this.maintenanceLogRepository = maintenanceLogRepository;
    }

    public List<Asset> getAllAssets() {
        return assetRepository.findAll();
    }

    public Asset getAssetById(Long id) {
        return assetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found with id: " + id));
    }

    @Transactional
    public Asset createAsset(CreateAssetRequest request) {
        Asset asset = new Asset();
        asset.setAssetTag(request.getAssetTag());
        asset.setName(request.getName());
        asset.setCategory(request.getCategory());
        asset.setPurchaseCost(request.getPurchaseCost());
        asset.setPurchaseDate(request.getPurchaseDate() != null ? request.getPurchaseDate() : LocalDate.now());
        asset.setConditionStatus(request.getConditionStatus() != null ? request.getConditionStatus() : "GOOD");
        asset.setAllocationStatus("AVAILABLE");
        asset.setPowerWatts(request.getPowerWatts() != null ? request.getPowerWatts() : 65);
        asset.setEstimatedLifespanYears(request.getEstimatedLifespanYears() != null ? request.getEstimatedLifespanYears() : 4);
        asset.setSalvageValue(request.getSalvageValue() != null ? request.getSalvageValue() : BigDecimal.ZERO);

        if (request.getAssignedEmployeeId() != null) {
            Employee emp = employeeRepository.findById(request.getAssignedEmployeeId()).orElse(null);
            if (emp != null) {
                asset.setAssignedEmployee(emp);
                asset.setAllocationStatus("ASSIGNED");
            }
        }

        Asset savedAsset = assetRepository.save(asset);

        // Handle Financing record
        AssetFinance finance = new AssetFinance();
        finance.setAsset(savedAsset);

        String financingType = request.getFinancingType() != null ? request.getFinancingType().toUpperCase() : "OUTRIGHT";
        finance.setFinancingType(financingType);

        if ("LOAN".equalsIgnoreCase(financingType)) {
            finance.setTotalLoanAmount(request.getTotalLoanAmount() != null ? request.getTotalLoanAmount() : savedAsset.getPurchaseCost());
            finance.setDownPayment(request.getDownPayment() != null ? request.getDownPayment() : BigDecimal.ZERO);
            finance.setMonthlyEmi(request.getMonthlyEmi() != null ? request.getMonthlyEmi() : BigDecimal.ZERO);
            finance.setInterestRate(request.getInterestRate() != null ? request.getInterestRate() : new BigDecimal("8.50"));
            finance.setTenureMonths(request.getTenureMonths() != null ? request.getTenureMonths() : 24);
            finance.setEmisPaid(0);

            // Initial ownership based on down payment
            if (savedAsset.getPurchaseCost().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal initialPct = finance.getDownPayment()
                        .divide(savedAsset.getPurchaseCost(), 4, java.math.RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
                finance.setCurrentOwnershipPct(initialPct.setScale(2, java.math.RoundingMode.HALF_UP));
            }
            finance.setIsFullyPaid(false);
        } else {
            finance.setTotalLoanAmount(BigDecimal.ZERO);
            finance.setDownPayment(savedAsset.getPurchaseCost());
            finance.setMonthlyEmi(BigDecimal.ZERO);
            finance.setTenureMonths(0);
            finance.setEmisPaid(0);
            finance.setCurrentOwnershipPct(new BigDecimal("100.00"));
            finance.setIsFullyPaid(true);
        }

        financeRepository.save(finance);

        // Record initial custody log if assigned
        if (savedAsset.getAssignedEmployee() != null) {
            CustodyHistory history = new CustodyHistory();
            history.setAsset(savedAsset);
            history.setEmployee(savedAsset.getAssignedEmployee());
            history.setActionType("ASSIGNED");
            history.setActionDate(LocalDate.now());
            history.setConditionNotes("Initial assignment upon creation");
            custodyHistoryRepository.save(history);
        }

        return savedAsset;
    }

    @Transactional
    public Asset assignAsset(Long assetId, AssignAssetRequest request) {
        Asset asset = getAssetById(assetId);
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with id: " + request.getEmployeeId()));

        asset.setAssignedEmployee(employee);
        asset.setAllocationStatus("ASSIGNED");
        Asset updated = assetRepository.save(asset);

        CustodyHistory history = new CustodyHistory();
        history.setAsset(updated);
        history.setEmployee(employee);
        history.setActionType("ASSIGNED");
        history.setActionDate(LocalDate.now());
        history.setConditionNotes(request.getConditionNotes() != null ? request.getConditionNotes() : "Handed over in good condition");
        custodyHistoryRepository.save(history);

        return updated;
    }

    @Transactional
    public Asset returnAsset(Long assetId, String conditionNotes) {
        Asset asset = getAssetById(assetId);
        Employee previousEmployee = asset.getAssignedEmployee();

        asset.setAssignedEmployee(null);
        asset.setAllocationStatus("AVAILABLE");
        Asset updated = assetRepository.save(asset);

        CustodyHistory history = new CustodyHistory();
        history.setAsset(updated);
        history.setEmployee(previousEmployee);
        history.setActionType("RETURNED");
        history.setActionDate(LocalDate.now());
        history.setConditionNotes(conditionNotes != null ? conditionNotes : "Returned to company IT pool");
        custodyHistoryRepository.save(history);

        return updated;
    }

    @Transactional
    public MaintenanceLog logMaintenance(Long assetId, BigDecimal cost, String issue, String serviceProvider) {
        Asset asset = getAssetById(assetId);
        asset.setAllocationStatus("UNDER_MAINTENANCE");
        assetRepository.save(asset);

        MaintenanceLog log = new MaintenanceLog();
        log.setAsset(asset);
        log.setCost(cost);
        log.setIssueDescription(issue);
        log.setServiceProvider(serviceProvider);
        log.setMaintenanceDate(LocalDate.now());
        log.setIsResolved(true);

        return maintenanceLogRepository.save(log);
    }

    public List<MaintenanceLog> getMaintenanceHistory(Long assetId) {
        return maintenanceLogRepository.findByAssetIdOrderByMaintenanceDateDesc(assetId);
    }

    public List<CustodyHistory> getCustodyHistory(Long assetId) {
        return custodyHistoryRepository.findByAssetIdOrderByActionDateDesc(assetId);
    }

    @Transactional
    public void deleteAsset(Long assetId) {
        financeRepository.findByAssetId(assetId).ifPresent(financeRepository::delete);
        custodyHistoryRepository.deleteAll(custodyHistoryRepository.findByAssetIdOrderByActionDateDesc(assetId));
        maintenanceLogRepository.deleteAll(maintenanceLogRepository.findByAssetIdOrderByMaintenanceDateDesc(assetId));
        assetRepository.deleteById(assetId);
    }

    @Transactional
    public void clearAllAssets() {
        custodyHistoryRepository.deleteAll();
        maintenanceLogRepository.deleteAll();
        financeRepository.deleteAll();
        assetRepository.deleteAll();
    }
}
