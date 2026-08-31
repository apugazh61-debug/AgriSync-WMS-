package com.warehouse.wms.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "warehouse_zones")
public class WarehouseZone {

    @Id
    private String id;
    private String warehouseId;
    private String zoneCode;           // e.g. "Z-SILO-01", "Z-COLD-02"
    private String name;               // e.g. "Paddy Grain Silo Alpha"
    private ZoneType zoneType;
    
    private double totalCapacityTons;
    private double occupiedCapacityTons;
    private double occupancyPercentage; // (occupied / total) * 100

    private double targetTemperature;  // °C
    private double targetHumidity;     // %
    private String ventilationStatus;  // ACTIVE_AERATION, CLOSED_HERMETIC, REFRIGERATED

    private List<StorageBin> bins;

    public enum ZoneType {
        GRAIN_SILO,
        COLD_STORAGE,
        DRY_BAG_WAREHOUSE,
        CHEMICAL_BUNKER
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StorageBin {
        private String binCode;        // "BIN-A01"
        private String currentBatchId;
        private String productName;
        private int capacityUnits;
        private int storedUnits;
        private boolean isAvailable;
    }
}
