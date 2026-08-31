package com.warehouse.wms.service;

import com.warehouse.wms.model.BatchLot;
import com.warehouse.wms.model.Inventory;
import com.warehouse.wms.model.StockMovement;
import com.warehouse.wms.repository.BatchLotRepository;
import com.warehouse.wms.repository.InventoryRepository;
import com.warehouse.wms.repository.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BatchExpiryService {

    private final BatchLotRepository batchLotRepository;
    private final InventoryRepository inventoryRepository;
    private final StockMovementRepository stockMovementRepository;

    /**
     * Recalculates shelf life, remaining days, and status for all active batches.
     */
    @Scheduled(fixedRate = 3600000)
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

    public List<BatchLot> getBatchesByProduct(String productId) {
        return batchLotRepository.findByProductIdOrderByExpiryDateAsc(productId);
    }

    public List<BatchLot> getExpiringSoonBatches() {
        return batchLotRepository.findByExpiryDateBeforeAndRemainingQuantityGreaterThan(
                LocalDate.now().plusDays(45), 0);
    }

    /**
     * FEFO (First-Expired, First-Out) Algorithm
     * Evaluates and returns optimal picking order prioritising earliest expiry dates.
     */
    public List<BatchLotAllocation> allocateBatchesFEFO(String productId, int requestedQuantity) {
        List<BatchLot> availableBatches = batchLotRepository.findByProductIdOrderByExpiryDateAsc(productId);
        List<BatchLotAllocation> allocations = new ArrayList<>();

        int remainingToAllocate = requestedQuantity;
        int pickOrder = 1;

        for (BatchLot batch : availableBatches) {
            if (batch.getRemainingQuantity() <= 0 || batch.getExpiryStatus() == BatchLot.ExpiryStatus.EXPIRED) {
                continue;
            }

            int allocateFromThis = Math.min(batch.getRemainingQuantity(), remainingToAllocate);
            allocations.add(new BatchLotAllocation(
                    batch.getId(),
                    batch.getBatchNumber(),
                    batch.getProductName(),
                    batch.getStorageBinLocation(),
                    batch.getWarehouseName(),
                    batch.getExpiryDate(),
                    batch.getDaysToExpiry(),
                    batch.getRemainingQuantity(),
                    allocateFromThis,
                    pickOrder++
            ));

            remainingToAllocate -= allocateFromThis;
            if (remainingToAllocate <= 0) break;
        }

        return allocations;
    }

    /**
     * Execute FEFO Outbound Dispatch:
     * Deducts the allocated quantities from the corresponding batch lots and inventory,
     * and logs stock movement records.
     */
    public FefoDispatchResult executeFefoDispatch(String productId, int quantity, String destination) {
        List<BatchLotAllocation> plan = allocateBatchesFEFO(productId, quantity);
        if (plan.isEmpty()) {
            throw new RuntimeException("No available unexpired lots found for product");
        }

        int totalDispatched = 0;
        List<String> affectedLots = new ArrayList<>();

        for (BatchLotAllocation alloc : plan) {
            BatchLot lot = batchLotRepository.findById(alloc.batchId())
                    .orElse(null);
            if (lot != null) {
                lot.setRemainingQuantity(Math.max(0, lot.getRemainingQuantity() - alloc.allocatedQuantity()));
                lot.setLastUpdated(LocalDateTime.now());
                batchLotRepository.save(lot);
                affectedLots.add(lot.getBatchNumber() + " (" + alloc.allocatedQuantity() + " Units)");
                totalDispatched += alloc.allocatedQuantity();

                // Update Warehouse Inventory
                Inventory inv = inventoryRepository.findByProductIdAndWarehouseId(productId, lot.getWarehouseId())
                        .orElse(null);
                if (inv != null) {
                    inv.setStockQuantity(Math.max(0, inv.getStockQuantity() - alloc.allocatedQuantity()));
                    inv.setLastUpdated(LocalDateTime.now());
                    inventoryRepository.save(inv);
                }

                // Log Stock Movement
                StockMovement movement = StockMovement.builder()
                        .movementId(UUID.randomUUID().toString())
                        .productId(productId)
                        .warehouseId(lot.getWarehouseId())
                        .type(StockMovement.MovementType.OUTBOUND)
                        .quantity(alloc.allocatedQuantity())
                        .timestamp(LocalDateTime.now())
                        .build();
                stockMovementRepository.save(movement);
            }
        }

        return new FefoDispatchResult(
                true,
                "FEFO Dispatch successfully executed: " + totalDispatched + " units allocated across " + plan.size() + " batch lot(s).",
                totalDispatched,
                affectedLots
        );
    }

    public BatchLot createBatch(BatchLot lot) {
        if (lot.getReceivedDate() == null) lot.setReceivedDate(LocalDate.now());
        if (lot.getCreatedAt() == null) lot.setCreatedAt(LocalDateTime.now());
        if (lot.getRemainingQuantity() == 0) lot.setRemainingQuantity(lot.getInitialQuantity());

        if (lot.getExpiryDate() != null) {
            int days = (int) ChronoUnit.DAYS.between(LocalDate.now(), lot.getExpiryDate());
            lot.setDaysToExpiry(days);
            lot.setExpiryStatus(days <= 0 ? BatchLot.ExpiryStatus.EXPIRED :
                               days <= 15 ? BatchLot.ExpiryStatus.CRITICAL : 
                               days <= 45 ? BatchLot.ExpiryStatus.EXPIRING_SOON : 
                               days <= 120 ? BatchLot.ExpiryStatus.MATURING : BatchLot.ExpiryStatus.FRESH);
        }
        return batchLotRepository.save(lot);
    }

    public void deleteBatch(String id) {
        batchLotRepository.deleteById(id);
    }

    public record BatchLotAllocation(
            String batchId,
            String batchNumber,
            String productName,
            String binLocation,
            String warehouseName,
            LocalDate expiryDate,
            int daysToExpiry,
            int currentStock,
            int allocatedQuantity,
            int pickPriorityOrder
    ) {}

    public record FefoDispatchResult(
            boolean success,
            String message,
            int totalDispatched,
            List<String> affectedLots
    ) {}
}
