package com.warehouse.wms.repository;

import com.warehouse.wms.model.InboundShipment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InboundShipmentRepository extends MongoRepository<InboundShipment, String> {
    List<InboundShipment> findBySupplierId(String supplierId);
    List<InboundShipment> findByWarehouseId(String warehouseId);
}
