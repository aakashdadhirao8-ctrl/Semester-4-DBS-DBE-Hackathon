package com.codespark.cam.repository;

import com.codespark.cam.model.EmiPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmiPaymentRepository extends JpaRepository<EmiPayment, Long> {
    List<EmiPayment> findByAssetFinanceIdOrderByInstallmentNoAsc(Long financeId);
}
