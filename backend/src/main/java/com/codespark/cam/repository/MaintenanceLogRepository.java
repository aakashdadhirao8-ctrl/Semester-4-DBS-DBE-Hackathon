package com.codespark.cam.repository;

import com.codespark.cam.model.MaintenanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface MaintenanceLogRepository extends JpaRepository<MaintenanceLog, Long> {
    List<MaintenanceLog> findByAssetIdOrderByMaintenanceDateDesc(Long assetId);

    @Query("SELECT COALESCE(SUM(m.cost), 0) FROM MaintenanceLog m WHERE m.asset.id = :assetId")
    BigDecimal sumCostByAssetId(@Param("assetId") Long assetId);

    @Query("SELECT COALESCE(SUM(m.cost), 0) FROM MaintenanceLog m")
    BigDecimal sumTotalMaintenanceCost();
}
