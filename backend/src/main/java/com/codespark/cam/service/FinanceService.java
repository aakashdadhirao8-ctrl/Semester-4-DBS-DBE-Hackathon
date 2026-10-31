package com.codespark.cam.service;

import com.codespark.cam.dto.RecordEmiRequest;
import com.codespark.cam.dto.RoiSimulationResponse;
import com.codespark.cam.model.AssetFinance;
import com.codespark.cam.model.EmiPayment;
import com.codespark.cam.repository.AssetFinanceRepository;
import com.codespark.cam.repository.EmiPaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class FinanceService {

    private final AssetFinanceRepository financeRepository;
    private final EmiPaymentRepository emiPaymentRepository;

    public FinanceService(AssetFinanceRepository financeRepository, EmiPaymentRepository emiPaymentRepository) {
        this.financeRepository = financeRepository;
        this.emiPaymentRepository = emiPaymentRepository;
    }

    public List<AssetFinance> getAllFinances() {
        return financeRepository.findAll();
    }

    public AssetFinance getFinanceByAssetId(Long assetId) {
        return financeRepository.findByAssetId(assetId)
                .orElse(null);
    }

    public List<EmiPayment> getPaymentHistory(Long financeId) {
        return emiPaymentRepository.findByAssetFinanceIdOrderByInstallmentNoAsc(financeId);
    }

    @Transactional
    public AssetFinance recordEmiPayment(Long financeId, RecordEmiRequest request) {
        AssetFinance finance = financeRepository.findById(financeId)
                .orElseThrow(() -> new IllegalArgumentException("Asset Finance not found for id: " + financeId));

        if (Boolean.TRUE.equals(finance.getIsFullyPaid())) {
            throw new IllegalStateException("This asset loan is already fully paid and owned 100%!");
        }

        BigDecimal paymentAmount = request.getAmountPaid() != null ? request.getAmountPaid() : finance.getMonthlyEmi();
        int nextInstallment = finance.getEmisPaid() + 1;

        // Log the payment
        EmiPayment payment = new EmiPayment();
        payment.setAssetFinance(finance);
        payment.setInstallmentNo(nextInstallment);
        payment.setAmountPaid(paymentAmount);
        payment.setPaymentDate(LocalDate.now());
        payment.setRemarks(request.getRemarks() != null ? request.getRemarks() : "Monthly Installment #" + nextInstallment);
        emiPaymentRepository.save(payment);

        // Update Finance Record
        finance.setEmisPaid(nextInstallment);

        // Recalculate Ownership %
        BigDecimal totalAssetCost = finance.getAsset().getPurchaseCost();
        BigDecimal downPayment = finance.getDownPayment();
        BigDecimal totalEmisPaidValue = finance.getMonthlyEmi().multiply(BigDecimal.valueOf(nextInstallment));
        BigDecimal totalEquityPaid = downPayment.add(totalEmisPaidValue);

        BigDecimal ownershipPct;
        if (totalAssetCost.compareTo(BigDecimal.ZERO) > 0) {
            ownershipPct = totalEquityPaid.divide(totalAssetCost, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP);
        } else {
            ownershipPct = BigDecimal.valueOf(100.00);
        }

        if (ownershipPct.compareTo(BigDecimal.valueOf(100.00)) >= 0 || nextInstallment >= finance.getTenureMonths()) {
            ownershipPct = BigDecimal.valueOf(100.00);
            finance.setIsFullyPaid(true);
        }

        finance.setCurrentOwnershipPct(ownershipPct);
        return financeRepository.save(finance);
    }

    public RoiSimulationResponse simulateEarlyPayoff(Long financeId, BigDecimal lumpSum) {
        AssetFinance finance = financeRepository.findById(financeId)
                .orElseThrow(() -> new IllegalArgumentException("Asset Finance not found with id: " + financeId));

        BigDecimal monthlyEmi = finance.getMonthlyEmi();
        int totalTenure = finance.getTenureMonths();
        int emisPaid = finance.getEmisPaid();
        int remainingMonths = Math.max(0, totalTenure - emisPaid);

        BigDecimal totalRemainingObligation = monthlyEmi.multiply(BigDecimal.valueOf(remainingMonths));
        BigDecimal newRemainingBalance = totalRemainingObligation.subtract(lumpSum);
        if (newRemainingBalance.compareTo(BigDecimal.ZERO) < 0) {
            newRemainingBalance = BigDecimal.ZERO;
        }

        int newRemainingMonths;
        if (monthlyEmi.compareTo(BigDecimal.ZERO) > 0) {
            newRemainingMonths = newRemainingBalance.divide(monthlyEmi, 0, RoundingMode.CEILING).intValue();
        } else {
            newRemainingMonths = 0;
        }

        int monthsSaved = Math.max(0, remainingMonths - newRemainingMonths);

        // Estimate interest saved based on annual rate
        double annualRate = finance.getInterestRate() != null ? finance.getInterestRate().doubleValue() / 100.0 : 0.085;
        double monthlyRate = annualRate / 12.0;
        double interestSaved = lumpSum.doubleValue() * monthlyRate * monthsSaved;

        RoiSimulationResponse response = new RoiSimulationResponse();
        response.setLumpSumPayment(lumpSum);
        response.setCurrentRemainingBalance(totalRemainingObligation.setScale(2, RoundingMode.HALF_UP));
        response.setNewRemainingBalance(newRemainingBalance.setScale(2, RoundingMode.HALF_UP));
        response.setOriginalRemainingMonths(remainingMonths);
        response.setNewRemainingMonths(newRemainingMonths);
        response.setMonthsSaved(monthsSaved);
        response.setTotalInterestSaved(BigDecimal.valueOf(interestSaved).setScale(2, RoundingMode.HALF_UP));
        response.setNewMonthlyEmi(monthlyEmi);

        return response;
    }
}
