package com.warehouse.wms.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "iot_sensor_readings")
public class IoTSensorReading {

    @Id
    private String id;
    private String warehouseId;
    private String warehouseName;
    private String zoneId;
    private String zoneName;
    private ZoneType zoneType;
    
    // Environmental telemetry
    private double temperatureCelsius;      // Ideal for grains: 15-22°C, Cold storage: 2-6°C
    private double humidityPercentage;       // Ambient Relative Humidity %
    private double grainMoisturePercentage;  // Paddy/Wheat ideal: 12-14%
    private double co2Ppm;                   // Carbon dioxide (indicator of microbial/pest activity)
    
    private SpoilageRiskLevel spoilageRisk;  // LOW, MODERATE, CRITICAL
    private String alertMessage;
    private LocalDateTime timestamp;

    public enum ZoneType {
        GRAIN_SILO,
        COLD_STORAGE,
        DRY_WAREHOUSE,
        FERTILIZER_BUNKER
    }

    public enum SpoilageRiskLevel {
        LOW,
        MODERATE,
        CRITICAL
    }
}
