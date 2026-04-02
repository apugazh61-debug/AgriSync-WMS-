package com.warehouse.wms.controller;

import com.warehouse.wms.model.StockMovement;
import com.warehouse.wms.repository.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-movements")
@RequiredArgsConstructor
@SuppressWarnings("null")
public class StockMovementController {

    private final StockMovementRepository stockMovementRepository;

    @GetMapping
    public ResponseEntity<List<StockMovement>> getAll() {
        return ResponseEntity.ok(stockMovementRepository.findAll());
    }

    @GetMapping("/{productId}")
    public ResponseEntity<List<StockMovement>> getByProductId(@PathVariable String productId) {
        return ResponseEntity.ok(stockMovementRepository.findByProductId(productId));
    }
}
