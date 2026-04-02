package com.warehouse.wms.controller;

import com.warehouse.wms.dto.DashboardDto;
import com.warehouse.wms.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@SuppressWarnings("null")
public class DashboardController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardDto> getSummary() {
        return ResponseEntity.ok(analyticsService.getDashboardSummary());
    }

    @GetMapping("/inventory-chart")
    public ResponseEntity<?> getInventoryChart() {
        return ResponseEntity.ok(analyticsService.getDashboardSummary().getInventoryChart());
    }

    @GetMapping("/order-stats")
    public ResponseEntity<?> getOrderStats() {
        DashboardDto summary = analyticsService.getDashboardSummary();
        return ResponseEntity.ok(summary.getMonthlyOrders());
    }
}
