package com.codespark.cam.repository;

import com.codespark.cam.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    Optional<Asset> findByAssetTag(String assetTag);
    List<Asset> findByCategory(String category);
    List<Asset> findByAllocationStatus(String allocationStatus);
    List<Asset> findByAssignedEmployeeId(Long employeeId);

    @Query("SELECT a FROM Asset a WHERE a.assignedEmployee.department.id = :departmentId")
    List<Asset> findByDepartmentId(@Param("departmentId") Long departmentId);

    @Query("SELECT COALESCE(SUM(a.purchaseCost), 0) FROM Asset a")
    BigDecimal sumTotalPurchaseCost();

    @Query("SELECT COALESCE(SUM(a.powerWatts), 0) FROM Asset a WHERE a.allocationStatus != 'SCRAPPED'")
    Integer sumTotalPowerWatts();

    @Query("SELECT a.category, COUNT(a), SUM(a.purchaseCost) FROM Asset a GROUP BY a.category")
    List<Object[]> getAssetDistributionByCategory();
}
