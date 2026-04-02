package com.warehouse.wms.repository;

import com.warehouse.wms.model.StockMovement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockMovementRepository extends MongoRepository<StockMovement, String> {
    List<StockMovement> findByProductId(String productId);
    List<StockMovement> findByWarehouseId(String warehouseId);
    List<StockMovement> findByProductIdAndWarehouseId(String productId, String warehouseId);
    List<StockMovement> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
    List<StockMovement> findByProductIdAndTimestampBetween(String productId, LocalDateTime start, LocalDateTime end);
}
