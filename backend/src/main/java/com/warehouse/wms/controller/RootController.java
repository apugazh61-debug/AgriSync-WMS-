package com.warehouse.wms.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public ResponseEntity<?> root() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "system", "AgriSync Smart Warehouse Management System (WMS) API",
            "version", "1.0.0",
            "frontendUrl", "http://localhost:3000",
            "message", "Backend API is running successfully. Please visit the frontend application at http://localhost:3000"
        ));
    }

    @GetMapping("/api/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "message", "AgriSync API is healthy"
        ));
    }
}
