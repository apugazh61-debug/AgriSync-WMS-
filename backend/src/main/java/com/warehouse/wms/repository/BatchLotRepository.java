package com.warehouse.wms.repository;

import com.warehouse.wms.model.BatchLot;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BatchLotRepository extends MongoRepository<BatchLot, String> {
    Optional<BatchLot> findByBatchNumber(String batchNumber);
    List<BatchLot> findByProductIdOrderByExpiryDateAsc(String productId);
    List<BatchLot> findByWarehouseIdOrderByExpiryDateAsc(String warehouseId);
    List<BatchLot> findByExpiryDateBeforeAndRemainingQuantityGreaterThan(LocalDate date, int minQty);
    List<BatchLot> findByExpiryStatus(BatchLot.ExpiryStatus status);
}
