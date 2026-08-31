package com.warehouse.wms.controller;

import com.warehouse.wms.model.WarehouseZone;
import com.warehouse.wms.repository.WarehouseZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/zones")
@RequiredArgsConstructor
public class WarehouseZoneController {

    private final WarehouseZoneRepository zoneRepository;

    @GetMapping
    public ResponseEntity<List<WarehouseZone>> getAllZones() {
        return ResponseEntity.ok(zoneRepository.findAll());
    }

    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<List<WarehouseZone>> getZonesByWarehouse(@PathVariable String warehouseId) {
        return ResponseEntity.ok(zoneRepository.findByWarehouseId(warehouseId));
    }

    @PostMapping
    public ResponseEntity<WarehouseZone> createZone(@RequestBody WarehouseZone zone) {
        if (zone.getTotalCapacityTons() > 0) {
            zone.setOccupancyPercentage((zone.getOccupiedCapacityTons() / zone.getTotalCapacityTons()) * 100.0);
        }
        return ResponseEntity.ok(zoneRepository.save(zone));
    }
}
