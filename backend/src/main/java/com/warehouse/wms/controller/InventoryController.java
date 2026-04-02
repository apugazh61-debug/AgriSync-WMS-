package com.warehouse.wms.controller;

import com.warehouse.wms.dto.InventoryDto;
import com.warehouse.wms.model.StockMovement;
import com.warehouse.wms.service.InventoryService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@SuppressWarnings("null")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<InventoryDto>> getAll() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }

    @GetMapping("/{productId}")
    public ResponseEntity<List<InventoryDto>> getByProductId(@PathVariable String productId) {
        return ResponseEntity.ok(inventoryService.getInventoryByProduct(productId));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryDto>> getLowStock() {
        return ResponseEntity.ok(inventoryService.getLowStockItems());
    }

    @PutMapping("/update")
    public ResponseEntity<InventoryDto> updateInventory(@RequestBody InventoryUpdateRequest request) {
        StockMovement.MovementType type = StockMovement.MovementType.valueOf(request.getType().toUpperCase());
        return ResponseEntity.ok(inventoryService.updateInventory(
                request.getProductId(), request.getWarehouseId(), request.getQuantity(), type));
    }

    @Data
    public static class InventoryUpdateRequest {
        private String productId;
        private String warehouseId;
        private int quantity;
        private String type;
    }
}
