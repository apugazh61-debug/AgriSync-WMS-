package com.warehouse.wms.repository;

import com.warehouse.wms.model.IoTSensorReading;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IoTSensorReadingRepository extends MongoRepository<IoTSensorReading, String> {
    List<IoTSensorReading> findByWarehouseIdOrderByTimestampDesc(String warehouseId);
    List<IoTSensorReading> findByWarehouseIdAndZoneTypeOrderByTimestampDesc(String warehouseId, IoTSensorReading.ZoneType zoneType);
    List<IoTSensorReading> findBySpoilageRisk(IoTSensorReading.SpoilageRiskLevel riskLevel);
    List<IoTSensorReading> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
}
