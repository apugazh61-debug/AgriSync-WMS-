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
@Document(collection = "orders")
public class Order {

    @Id
    private String orderId;

    private String warehouseId;

    private LocalDateTime orderDate;

    private OrderStatus status;

    private List<OrderItem> items;

    public enum OrderStatus {
        PENDING, PROCESSING, DISPATCHED, DELIVERED, CANCELLED
    }
}
