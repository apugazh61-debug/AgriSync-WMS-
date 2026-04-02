package com.warehouse.wms.controller;

import com.warehouse.wms.dto.DemandPredictionDto;
import com.warehouse.wms.service.PredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/prediction")
@RequiredArgsConstructor
@SuppressWarnings("null")
public class PredictionController {

    private final PredictionService predictionService;

    @GetMapping("/demand/{productId}")
    public ResponseEntity<DemandPredictionDto> predictDemand(@PathVariable String productId) {
        return ResponseEntity.ok(predictionService.predictDemand(productId));
    }
}
