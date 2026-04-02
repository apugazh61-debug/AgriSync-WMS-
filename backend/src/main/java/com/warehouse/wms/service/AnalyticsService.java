package com.warehouse.wms.service;

import com.warehouse.wms.dto.DashboardDto;
import com.warehouse.wms.repository.ProductRepository;
import com.warehouse.wms.repository.WarehouseRepository;
import com.warehouse.wms.repository.SupplierRepository;
import com.warehouse.wms.repository.OrderRepository;
import com.warehouse.wms.repository.InventoryRepository;
import com.warehouse.wms.model.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AnalyticsService {

    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final SupplierRepository supplierRepository;
    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;

    @Cacheable(value = "dashboard", key = "'summary'")
    public DashboardDto getDashboardSummary() {
        long totalProducts = productRepository.count();
        long totalWarehouses = warehouseRepository.count();
        long totalSuppliers = supplierRepository.count();
        long totalOrders = orderRepository.count();

        long lowStockItems = inventoryRepository.findAll().stream()
                .filter(i -> i.getStockQuantity() <= i.getReorderLevel())
                .count();

        long pendingOrders = orderRepository.countByStatus(Order.OrderStatus.PENDING);
        long dispatchedOrders = orderRepository.countByStatus(Order.OrderStatus.DISPATCHED);

        // Orders by status
        Map<String, Long> ordersByStatus = new HashMap<>();
        for (Order.OrderStatus status : Order.OrderStatus.values()) {
            ordersByStatus.put(status.name(), orderRepository.countByStatus(status));
        }

        // Inventory chart by warehouse
        List<Map<String, Object>> inventoryChart = warehouseRepository.findAll().stream()
                .map(w -> {
                    Map<String, Object> entry = new HashMap<>();
                    entry.put("warehouse", w.getName());
                    long totalStock = inventoryRepository.findByWarehouseId(w.getWarehouseId()).stream()
                            .mapToLong(i -> i.getStockQuantity())
                            .sum();
                    entry.put("stock", totalStock);
                    return entry;
                })
                .collect(Collectors.toList());

        // Monthly orders last 6 months
        List<Map<String, Object>> monthlyOrders = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime start = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0);
            LocalDateTime end = start.plusMonths(1);
            long count = orderRepository.findByOrderDateBetween(start, end).size();
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", start.getMonth().name());
            monthData.put("orders", count);
            monthlyOrders.add(monthData);
        }

        // Recent orders
        List<Map<String, Object>> recentOrders = orderRepository.findAll().stream()
                .sorted((a, b) -> b.getOrderDate().compareTo(a.getOrderDate()))
                .limit(5)
                .map(o -> {
                    Map<String, Object> entry = new HashMap<>();
                    entry.put("orderId", o.getOrderId());
                    entry.put("status", o.getStatus().name());
                    entry.put("orderDate", o.getOrderDate().toString());
                    entry.put("warehouseId", o.getWarehouseId());
                    return entry;
                })
                .collect(Collectors.toList());

        return DashboardDto.builder()
                .totalProducts(totalProducts)
                .totalWarehouses(totalWarehouses)
                .totalSuppliers(totalSuppliers)
                .totalOrders(totalOrders)
                .lowStockItems(lowStockItems)
                .pendingOrders(pendingOrders)
                .dispatchedOrders(dispatchedOrders)
                .ordersByStatus(ordersByStatus)
                .inventoryChart(inventoryChart)
                .monthlyOrders(monthlyOrders)
                .recentOrders(recentOrders)
                .build();
    }
}
