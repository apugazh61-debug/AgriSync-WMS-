package com.warehouse.wms.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "purchase_orders")
public class PurchaseOrder {

    @Id
    private String id;
    private String poNumber;           // e.g. "PO-2026-AUT-081"
    private String supplierId;
    private String supplierName;
    private String warehouseId;
    private String warehouseName;

    private List<PurchaseOrderItem> items;
    private double totalAmount;
    
    private POStatus status;           // AUTO_SUGGESTED, APPROVED, ORDERED, RECEIVED, CANCELLED
    private String triggerReason;      // e.g. "Stock below reorder safety threshold (Deficit: 450 Bags)"
    private boolean isAiGenerated;

    private LocalDate expectedDeliveryDate;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private String approvedBy;

    public enum POStatus {
        AUTO_SUGGESTED,
        APPROVED,
        ORDERED,
        RECEIVED,
        CANCELLED
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurchaseOrderItem {
        private String productId;
        private String productName;
        private int quantity;
        private double unitPrice;
        private double subtotal;
        private String unit;
    }
}
