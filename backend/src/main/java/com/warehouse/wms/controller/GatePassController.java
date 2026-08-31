package com.warehouse.wms.controller;

import com.warehouse.wms.model.GatePass;
import com.warehouse.wms.service.ReportAndBarcodeService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gate-pass")
@RequiredArgsConstructor
public class GatePassController {

    private final ReportAndBarcodeService barcodeService;

    @GetMapping
    public ResponseEntity<List<GatePass>> getAllGatePasses() {
        return ResponseEntity.ok(barcodeService.getAllGatePasses());
    }

    @PostMapping("/issue")
    public ResponseEntity<GatePass> issueGatePass(@RequestBody IssueGatePassRequest req) {
        return ResponseEntity.ok(barcodeService.issueGatePassForOrder(
                req.getOrderId(), req.getVehicleNumber(), req.getDriverName(), req.getDriverPhone(), req.getTransporterName()));
    }

    @PutMapping("/{passNumber}/authorize-exit")
    public ResponseEntity<GatePass> authorizeExit(@PathVariable String passNumber) {
        return ResponseEntity.ok(barcodeService.verifyAndAuthorizeExit(passNumber));
    }

    @Data
    public static class IssueGatePassRequest {
        private String orderId;
        private String vehicleNumber;
        private String driverName;
        private String driverPhone;
        private String transporterName;
    }
}
