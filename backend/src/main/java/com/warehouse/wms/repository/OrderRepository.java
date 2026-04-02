package com.warehouse.wms.repository;

import com.warehouse.wms.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByStatus(Order.OrderStatus status);
    List<Order> findByWarehouseId(String warehouseId);
    List<Order> findByOrderDateBetween(LocalDateTime start, LocalDateTime end);
    long countByStatus(Order.OrderStatus status);
}
