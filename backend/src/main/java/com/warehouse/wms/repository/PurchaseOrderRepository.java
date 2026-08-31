package com.warehouse.wms.repository;

import com.warehouse.wms.model.PurchaseOrder;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends MongoRepository<PurchaseOrder, String> {
    Optional<PurchaseOrder> findByPoNumber(String poNumber);
    List<PurchaseOrder> findByStatusOrderByCreatedAtDesc(PurchaseOrder.POStatus status);
    List<PurchaseOrder> findBySupplierId(String supplierId);
    List<PurchaseOrder> findByWarehouseId(String warehouseId);
}
