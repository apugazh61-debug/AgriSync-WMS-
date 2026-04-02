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
}
