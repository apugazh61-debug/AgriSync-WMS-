package com.warehouse.wms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryDto {
    private String inventoryId;
    private String productId;
    private String productName;
    private String warehouseId;
    private String warehouseName;
    private Integer stockQuantity;
    private Integer reorderLevel;
    private boolean lowStock;
    private String lastUpdated;
}
