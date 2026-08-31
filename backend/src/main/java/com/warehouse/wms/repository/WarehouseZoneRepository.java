package com.warehouse.wms.repository;

import com.warehouse.wms.model.WarehouseZone;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseZoneRepository extends MongoRepository<WarehouseZone, String> {
    List<WarehouseZone> findByWarehouseId(String warehouseId);
    Optional<WarehouseZone> findByZoneCode(String zoneCode);
    List<WarehouseZone> findByZoneType(WarehouseZone.ZoneType zoneType);
}
