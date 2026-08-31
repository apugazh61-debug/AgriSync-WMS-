package com.warehouse.wms.service;

import com.warehouse.wms.model.BatchLot;
import com.warehouse.wms.repository.BatchLotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BatchExpiryService {

    private final BatchLotRepository batchLotRepository;

    /**
     * Nightly / Hourly recalculation of batch shelf life and expiration status
     */
    @Scheduled(fixedRate = 3600000) // Every 1 hour
    public void updateBatchShelfLifeStatus() {
        List<BatchLot> batches = batchLotRepository.findAll();
        LocalDate today = LocalDate.now();

        for (BatchLot batch : batches) {
            if (batch.getExpiryDate() != null) {
                int days = (int) ChronoUnit.DAYS.between(today, batch.getExpiryDate());
                batch.setDaysToExpiry(days);

                if (days < 0) {
                    batch.setExpiryStatus(BatchLot.ExpiryStatus.EXPIRED);
                } else if (days <= 15) {
                    batch.setExpiryStatus(BatchLot.ExpiryStatus.CRITICAL);
                } else if (days <= 45) {
                    batch.setExpiryStatus(BatchLot.ExpiryStatus.EXPIRING_SOON);
                } else if (days <= 120) {
                    batch.setExpiryStatus(BatchLot.ExpiryStatus.MATURING);
                } else {
                    batch.setExpiryStatus(BatchLot.ExpiryStatus.FRESH);
                }
                batch.setLastUpdated(LocalDateTime.now());
            }
        }
        batchLotRepository.saveAll(batches);
    }

    public List<BatchLot> getAllBatches() {
        return batchLotRepository.findAll();
    }

    public Optional<BatchLot> getBatchByNumber(String batchNumber) {
        return batchLotRepository.findByBatchNumber(batchNumber);
    }

    public List<BatchLot> getExpiringSoonBatches() {
        return batchLotRepository.findByExpiryDateBeforeAndRemainingQuantityGreaterThan(
                LocalDate.now().plusDays(45), 0);
    }

    /**
     * FEFO (First-Expired, First-Out) Algorithm for Outbound Order Fulfillment
     * Picks batches with the earliest expiry date first to prevent grain / seed decay.
     */
    public List<BatchLotAllocation> allocateBatchesFEFO(String productId, int requestedQuantity) {
        List<BatchLot> availableBatches = batchLotRepository.findByProductIdOrderByExpiryDateAsc(productId);
        List<BatchLotAllocation> allocations = new ArrayList<>();

        int remainingToAllocate = requestedQuantity;

        for (BatchLot batch : availableBatches) {
            if (batch.getRemainingQuantity() <= 0 || batch.getExpiryStatus() == BatchLot.ExpiryStatus.EXPIRED) {
                continue;
            }

            int allocateFromThis = Math.min(batch.getRemainingQuantity(), remainingToAllocate);
            allocations.add(new BatchLotAllocation(
                    batch.getBatchNumber(),
                    batch.getProductName(),
                    batch.getStorageBinLocation(),
                    batch.getExpiryDate(),
                    batch.getDaysToExpiry(),
                    allocateFromThis
            ));

            remainingToAllocate -= allocateFromThis;
            if (remainingToAllocate <= 0) break;
        }

        return allocations;
    }

    public BatchLot createBatch(BatchLot lot) {
        if (lot.getReceivedDate() == null) lot.setReceivedDate(LocalDate.now());
        if (lot.getCreatedAt() == null) lot.setCreatedAt(LocalDateTime.now());
        if (lot.getRemainingQuantity() == 0) lot.setRemainingQuantity(lot.getInitialQuantity());

        if (lot.getExpiryDate() != null) {
            int days = (int) ChronoUnit.DAYS.between(LocalDate.now(), lot.getExpiryDate());
            lot.setDaysToExpiry(days);
            lot.setExpiryStatus(days <= 15 ? BatchLot.ExpiryStatus.CRITICAL : 
                               days <= 45 ? BatchLot.ExpiryStatus.EXPIRING_SOON : BatchLot.ExpiryStatus.FRESH);
        }
        return batchLotRepository.save(lot);
    }

    public record BatchLotAllocation(
            String batchNumber,
            String productName,
            String binLocation,
            LocalDate expiryDate,
            int daysToExpiry,
            int allocatedQuantity
    ) {}
}
