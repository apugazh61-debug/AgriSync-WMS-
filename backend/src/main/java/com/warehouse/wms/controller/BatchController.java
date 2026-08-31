package com.warehouse.wms.controller;

import com.warehouse.wms.model.BatchLot;
import com.warehouse.wms.service.BatchExpiryService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/batches")
@RequiredArgsConstructor
public class BatchController {

    private final BatchExpiryService batchService;

    @GetMapping
    public ResponseEntity<List<BatchLot>> getAllBatches() {
        return ResponseEntity.ok(batchService.getAllBatches());
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<BatchLot>> getBatchesByProduct(@PathVariable String productId) {
        return ResponseEntity.ok(batchService.getBatchesByProduct(productId));
    }

    @GetMapping("/expiring-soon")
    public ResponseEntity<List<BatchLot>> getExpiringSoonBatches() {
        return ResponseEntity.ok(batchService.getExpiringSoonBatches());
    }

    @GetMapping("/fefo-allocation")
    public ResponseEntity<List<BatchExpiryService.BatchLotAllocation>> getFefoAllocation(
            @RequestParam String productId,
            @RequestParam(defaultValue = "100") int quantity) {
        return ResponseEntity.ok(batchService.allocateBatchesFEFO(productId, quantity));
    }

    @PostMapping("/fefo-dispatch")
    public ResponseEntity<BatchExpiryService.FefoDispatchResult> executeFefoDispatch(
            @RequestBody FefoDispatchRequest req) {
        return ResponseEntity.ok(batchService.executeFefoDispatch(req.getProductId(), req.getQuantity(), req.getDestination()));
    }

    @PostMapping
    public ResponseEntity<BatchLot> createBatch(@RequestBody BatchLot batchLot) {
        return ResponseEntity.ok(batchService.createBatch(batchLot));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBatch(@PathVariable String id) {
        batchService.deleteBatch(id);
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class FefoDispatchRequest {
        private String productId;
        private int quantity;
        private String destination;
    }
}
