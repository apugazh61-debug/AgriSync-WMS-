package com.warehouse.wms.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "stock_movements")
public class StockMovement {

    @Id
    private String movementId;

    private String productId;

    private String warehouseId;

    private MovementType type;

    private Integer quantity;

    private LocalDateTime timestamp;

    public enum MovementType {
        INBOUND, OUTBOUND
    }
}
