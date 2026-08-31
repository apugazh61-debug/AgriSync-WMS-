package com.warehouse.wms.service;

import com.warehouse.wms.model.IoTSensorReading;
import com.warehouse.wms.model.Warehouse;
import com.warehouse.wms.repository.IoTSensorReadingRepository;
import com.warehouse.wms.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class IoTMonitoringService {

    private final IoTSensorReadingRepository sensorRepository;
    private final WarehouseRepository warehouseRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Periodically simulate IoT sensors telemetry across grain silos, cold storage, and dry warehouses.
     */
    @Scheduled(fixedRate = 60000) // Every 1 minute
    public void captureIoTSensorTelemetry() {
        List<Warehouse> warehouses = warehouseRepository.findAll();
        if (warehouses.isEmpty()) return;

        List<IoTSensorReading> newReadings = new ArrayList<>();

        for (Warehouse wh : warehouses) {
            // 1. Grain Silo Telemetry (Paddy / Wheat)
            newReadings.add(generateReading(wh, "SILO-01", "Paddy Grain Silo Alpha", 
                    IoTSensorReading.ZoneType.GRAIN_SILO, 18.0, 26.0, 50.0, 68.0, 11.5, 15.2, 420, 950));

            // 2. Cold Storage Telemetry (Fruits, Vegetables, Fresh Produce)
            newReadings.add(generateReading(wh, "COLD-01", "Cold Vault Chamber", 
                    IoTSensorReading.ZoneType.COLD_STORAGE, 2.0, 7.5, 80.0, 95.0, 8.0, 10.5, 380, 600));

            // 3. Dry Bagged Warehouse (Seeds, Grains, Pulses)
            newReadings.add(generateReading(wh, "DRY-01", "Dry Seed Bunker", 
                    IoTSensorReading.ZoneType.DRY_WAREHOUSE, 20.0, 30.0, 45.0, 62.0, 9.0, 12.5, 400, 750));
        }

        List<IoTSensorReading> saved = sensorRepository.saveAll(newReadings);

        // Broadcast to WebSocket clients
        try {
            messagingTemplate.convertAndSend("/topic/iot-telemetry", saved);
            
            // Check for critical spoilage warnings
            saved.stream()
                .filter(r -> r.getSpoilageRisk() == IoTSensorReading.SpoilageRiskLevel.CRITICAL)
                .forEach(crit -> messagingTemplate.convertAndSend("/topic/spoilage-alert", crit));
        } catch (Exception ignored) {}
    }

    public List<IoTSensorReading> getLatestTelemetry() {
        List<Warehouse> warehouses = warehouseRepository.findAll();
        List<IoTSensorReading> latest = new ArrayList<>();
        for (Warehouse wh : warehouses) {
            List<IoTSensorReading> readings = sensorRepository.findByWarehouseIdOrderByTimestampDesc(wh.getWarehouseId());
            if (!readings.isEmpty()) {
                latest.add(readings.get(0));
            }
        }
        if (latest.isEmpty()) {
            captureIoTSensorTelemetry();
            return sensorRepository.findAll();
        }
        return latest;
    }

    public List<IoTSensorReading> getTelemetryByWarehouse(String warehouseId) {
        return sensorRepository.findByWarehouseIdOrderByTimestampDesc(warehouseId);
    }

    public IoTSensorReading manualTriggerReading(String warehouseId, IoTSensorReading.ZoneType zoneType) {
        Warehouse wh = warehouseRepository.findById(warehouseId).orElse(null);
        if (wh == null) return null;

        IoTSensorReading reading = generateReading(wh, "ZONE-MANUAL", "On-Demand Telemetry", zoneType,
                20.0, 28.0, 50.0, 70.0, 12.0, 14.5, 450, 800);
        IoTSensorReading saved = sensorRepository.save(reading);
        messagingTemplate.convertAndSend("/topic/iot-telemetry", List.of(saved));
        return saved;
    }

    private IoTSensorReading generateReading(Warehouse wh, String zoneId, String zoneName,
                                            IoTSensorReading.ZoneType zoneType,
                                            double minTemp, double maxTemp,
                                            double minHum, double maxHum,
                                            double minMoist, double maxMoist,
                                            int minCo2, int maxCo2) {
        double temp = Math.round(ThreadLocalRandom.current().nextDouble(minTemp, maxTemp) * 10.0) / 10.0;
        double hum = Math.round(ThreadLocalRandom.current().nextDouble(minHum, maxHum) * 10.0) / 10.0;
        double moist = Math.round(ThreadLocalRandom.current().nextDouble(minMoist, maxMoist) * 10.0) / 10.0;
        double co2 = ThreadLocalRandom.current().nextInt(minCo2, maxCo2);

        // Agricultural Spoilage Risk Calculation Engine
        IoTSensorReading.SpoilageRiskLevel risk = IoTSensorReading.SpoilageRiskLevel.LOW;
        String alertMsg = "All environmental parameters optimal.";

        if (zoneType == IoTSensorReading.ZoneType.GRAIN_SILO && moist > 14.5) {
            risk = IoTSensorReading.SpoilageRiskLevel.CRITICAL;
            alertMsg = "CRITICAL: Grain moisture at " + moist + "% (Above 14.5% safe threshold)! Risk of fungal/mycotoxin mold. Activate Silo Aeration Fans.";
        } else if (zoneType == IoTSensorReading.ZoneType.COLD_STORAGE && temp > 6.5) {
            risk = IoTSensorReading.SpoilageRiskLevel.CRITICAL;
            alertMsg = "CRITICAL: Cold storage temp elevated to " + temp + "°C! Risk of perishable spoilage. Verify refrigeration compressor.";
        } else if (hum > 75.0 || moist > 13.5 || co2 > 800) {
            risk = IoTSensorReading.SpoilageRiskLevel.MODERATE;
            alertMsg = "WARNING: Elevated ambient humidity (" + hum + "%) or CO2 (" + co2 + " ppm). Monitor aeration.";
        }

        return IoTSensorReading.builder()
                .warehouseId(wh.getWarehouseId())
                .warehouseName(wh.getName())
                .zoneId(zoneId)
                .zoneName(zoneName)
                .zoneType(zoneType)
                .temperatureCelsius(temp)
                .humidityPercentage(hum)
                .grainMoisturePercentage(moist)
                .co2Ppm(co2)
                .spoilageRisk(risk)
                .alertMessage(alertMsg)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
