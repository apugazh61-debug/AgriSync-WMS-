package com.warehouse.wms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDto {
    private long totalProducts;
    private long totalWarehouses;
    private long totalSuppliers;
    private long totalOrders;
    private long lowStockItems;
    private long lowStockCount; // Compatibility alias
    private long pendingOrders;
    private long pendingInboundCount; // Compatibility alias
    private long dispatchedOrders;
    private long totalStockUnits;
    private double totalStockValueInr;
    private long totalBatches;
    private long expiringLotsCount;
    private long criticalSpoilageAlerts;
    private long pendingPurchaseOrders;
    private Map<String, Long> ordersByStatus;
    private List<Map<String, Object>> inventoryChart;
    private List<Map<String, Object>> monthlyOrders;
    private List<Map<String, Object>> recentOrders;
}
