package com.warehouse.wms.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "gate_passes")
public class GatePass {

    @Id
    private String id;
    private String passNumber;         // e.g. "GP-AGRI-2026-9021"
    private GatePassType passType;     // INBOUND_RECEIVING, OUTBOUND_DISPATCH
    
    private String referenceId;        // orderId or inboundShipmentId
    private String warehouseId;
    private String warehouseName;

    // Logistics & Vehicle Details
    private String vehicleNumber;      // e.g. "TN-28-AB-4412"
    private String driverName;
    private String driverPhone;
    private String transporterName;

    private List<GatePassItem> items;
    private double totalWeightKg;

    private String qrCodeBase64;       // Embedded Base64 QR code image
    private String verificationHash;   // SHA256 security checksum

    private GatePassStatus status;     // ISSUED, SECURITY_CHECKED_IN, DISPATCHED_OUT, CANCELLED
    private LocalDateTime issuedAt;
    private LocalDateTime gateExitAt;
    private String issuedBy;

    public enum GatePassType {
        INBOUND_RECEIVING,
        OUTBOUND_DISPATCH
    }

    public enum GatePassStatus {
        ISSUED,
        SECURITY_CHECKED_IN,
        DISPATCHED_OUT,
        CANCELLED
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GatePassItem {
        private String productId;
        private String productName;
        private String batchNumber;
        private int quantity;
        private String unit;
    }
}
