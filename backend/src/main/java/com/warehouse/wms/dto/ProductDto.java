package com.warehouse.wms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
    private String productId;
    private String name;
    private String category;
    private BigDecimal price;
    private String barcode;
    private String qrCode;
    private String supplierId;
    private String supplierName;
    private LocalDate createdDate;

    // Scanned Agricultural Lot Context
    private String scannedBatchNumber;
    private LocalDate scannedExpiryDate;
    private Integer scannedDaysToExpiry;
    private String scannedBinLocation;
    private String scannedQualityGrade;
    private Integer scannedRemainingQuantity;
    private String scannedWarehouseName;
}
