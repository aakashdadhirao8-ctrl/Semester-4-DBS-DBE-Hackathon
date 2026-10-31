package com.codespark.cam.repository;

import com.codespark.cam.model.AssetFinance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssetFinanceRepository extends JpaRepository<AssetFinance, Long> {
    Optional<AssetFinance> findByAssetId(Long assetId);
    List<AssetFinance> findByFinancingType(String financingType);
    List<AssetFinance> findByIsFullyPaidFalse();

    @Query("SELECT COALESCE(SUM(af.monthlyEmi), 0) FROM AssetFinance af WHERE af.isFullyPaid = false AND af.financingType = 'LOAN'")
    BigDecimal sumActiveMonthlyEmis();

    @Query("SELECT COALESCE(SUM(af.totalLoanAmount - (af.downPayment + (af.monthlyEmi * af.emisPaid))), 0) FROM AssetFinance af WHERE af.isFullyPaid = false AND af.financingType = 'LOAN'")
    BigDecimal calculateTotalRemainingDebt();
}
