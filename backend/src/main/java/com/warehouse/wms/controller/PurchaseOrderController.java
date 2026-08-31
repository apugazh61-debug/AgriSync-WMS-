package com.warehouse.wms.controller;

import com.warehouse.wms.model.PurchaseOrder;
import com.warehouse.wms.service.AutomatedReorderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final AutomatedReorderService reorderService;

    @GetMapping
    public ResponseEntity<List<PurchaseOrder>> getAllPurchaseOrders() {
        return ResponseEntity.ok(reorderService.getAllPurchaseOrders());
    }

    @PostMapping("/auto-evaluate")
    public ResponseEntity<List<PurchaseOrder>> triggerAutoReorder() {
        return ResponseEntity.ok(reorderService.evaluateAndGenerateAutomatedReorders());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<PurchaseOrder> approvePurchaseOrder(
            @PathVariable String id,
            @RequestParam(required = false, defaultValue = "Admin Sentinel") String approvedBy) {
        return ResponseEntity.ok(reorderService.approvePurchaseOrder(id, approvedBy));
    }
}
