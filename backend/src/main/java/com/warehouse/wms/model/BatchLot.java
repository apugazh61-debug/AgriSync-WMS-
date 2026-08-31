package com.warehouse.wms.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "batch_lots")
public class BatchLot {

    @Id
    private String id;
    private String batchNumber;        // e.g. "LOT-2026-PADDY-04"
    private String productId;
    private String productName;
    private String warehouseId;
    private String warehouseName;
    private String zoneId;
    private String supplierId;
    private String supplierName;

    private int initialQuantity;
    private int remainingQuantity;
    private String unit;                // KG, BAGS, TONNES

    private LocalDate harvestDate;
    private LocalDate receivedDate;
    private LocalDate expiryDate;

    private QualityGrade qualityGrade;  // GRADE_A, GRADE_B, SEED_CERTIFIED
    private double moistureAtIntake;    // %
    private String storageBinLocation;  // e.g. "SILO-A2 / BIN-08"

    private ExpiryStatus expiryStatus;  // FRESH, MATURING, EXPIRING_SOON, EXPIRED
    private int daysToExpiry;
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdated;

    public enum QualityGrade {
        GRADE_A_PREMIUM,
        GRADE_B_STANDARD,
        SEED_CERTIFIED_EXPORT,
        ORGANIC_VERIFIED
    }

    public enum ExpiryStatus {
        FRESH,
        MATURING,
        EXPIRING_SOON, // < 45 days
        CRITICAL,      // < 15 days
        EXPIRED
    }
}
