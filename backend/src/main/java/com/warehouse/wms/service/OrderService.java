package com.warehouse.wms.service;

import com.warehouse.wms.model.Order;
import com.warehouse.wms.model.OrderItem;
import com.warehouse.wms.model.StockMovement;
import com.warehouse.wms.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class OrderService {

    private final OrderRepository orderRepository;
    private final InventoryService inventoryService;

    public Order createOrder(Order order) {
        order.setOrderId(UUID.randomUUID().toString());
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(Order.OrderStatus.PENDING);

        // Deduct from inventory for each item
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                item.setOrderItemId(UUID.randomUUID().toString());
                try {
                    inventoryService.updateInventory(
                            item.getProductId(),
                            order.getWarehouseId(),
                            item.getQuantity(),
                            StockMovement.MovementType.OUTBOUND
                    );
                } catch (Exception e) {
                    throw new RuntimeException("Cannot create order: " + e.getMessage());
                }
            }
        }

        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(String id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
    }

    public Order updateOrderStatus(String id, Order.OrderStatus status) {
        Order order = getOrderById(id);
        order.setStatus(status);
        return orderRepository.save(order);
    }

    public void deleteOrder(String id) {
        orderRepository.deleteById(id);
    }
}
