package com.codespark.cam.repository;

import com.codespark.cam.model.CustodyHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustodyHistoryRepository extends JpaRepository<CustodyHistory, Long> {
    List<CustodyHistory> findByAssetIdOrderByActionDateDesc(Long assetId);
    List<CustodyHistory> findByEmployeeIdOrderByActionDateDesc(Long employeeId);
}
