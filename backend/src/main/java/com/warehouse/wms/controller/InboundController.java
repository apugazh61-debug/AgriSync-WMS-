package com.warehouse.wms.controller;

import com.warehouse.wms.model.InboundShipment;
import com.warehouse.wms.service.InboundService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inbound")
@RequiredArgsConstructor
@SuppressWarnings("null")
public class InboundController {

    private final InboundService inboundService;

    @PostMapping
    public ResponseEntity<InboundShipment> create(@RequestBody InboundShipment shipment) {
        return ResponseEntity.ok(inboundService.createInboundShipment(shipment));
    }

    @GetMapping
    public ResponseEntity<List<InboundShipment>> getAll() {
        return ResponseEntity.ok(inboundService.getAllInbound());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InboundShipment> getById(@PathVariable String id) {
        return ResponseEntity.ok(inboundService.getInboundById(id));
    }
}
