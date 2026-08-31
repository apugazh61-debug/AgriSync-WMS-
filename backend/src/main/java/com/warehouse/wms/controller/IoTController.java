package com.warehouse.wms.controller;

import com.warehouse.wms.model.IoTSensorReading;
import com.warehouse.wms.service.IoTMonitoringService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/iot")
@RequiredArgsConstructor
public class IoTController {

    private final IoTMonitoringService ioTService;

    @GetMapping("/latest")
    public ResponseEntity<List<IoTSensorReading>> getLatestTelemetry() {
        return ResponseEntity.ok(ioTService.getLatestTelemetry());
    }

    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<List<IoTSensorReading>> getTelemetryByWarehouse(@PathVariable String warehouseId) {
        return ResponseEntity.ok(ioTService.getTelemetryByWarehouse(warehouseId));
    }

    @PostMapping("/simulate")
    public ResponseEntity<List<IoTSensorReading>> triggerSimulation() {
        ioTService.captureIoTSensorTelemetry();
        return ResponseEntity.ok(ioTService.getLatestTelemetry());
    }
}
