package com.warehouse.wms.repository;

import com.warehouse.wms.model.Inventory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends MongoRepository<Inventory, String> {
    Optional<Inventory> findByProductIdAndWarehouseId(String productId, String warehouseId);
    List<Inventory> findByProductId(String productId);
    List<Inventory> findByWarehouseId(String warehouseId);
    List<Inventory> findByStockQuantityLessThanEqual(Integer threshold);
}
