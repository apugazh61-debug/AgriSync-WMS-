package com.warehouse.wms.controller;

import com.warehouse.wms.model.BatchLot;
import com.warehouse.wms.service.BatchExpiryService;
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

    @PostMapping
    public ResponseEntity<BatchLot> createBatch(@RequestBody BatchLot batchLot) {
        return ResponseEntity.ok(batchService.createBatch(batchLot));
    }
}
