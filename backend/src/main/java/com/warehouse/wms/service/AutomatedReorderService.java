package com.warehouse.wms.service;

import com.warehouse.wms.model.Inventory;
import com.warehouse.wms.model.Product;
import com.warehouse.wms.model.PurchaseOrder;
import com.warehouse.wms.model.Supplier;
import com.warehouse.wms.model.Warehouse;
import com.warehouse.wms.repository.InventoryRepository;
import com.warehouse.wms.repository.ProductRepository;
import com.warehouse.wms.repository.PurchaseOrderRepository;
import com.warehouse.wms.repository.SupplierRepository;
import com.warehouse.wms.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AutomatedReorderService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    /**
     * Scans inventory for low-stock items and automatically generates Draft Purchase Orders
     * matching the optimal supplier.
     */
    public List<PurchaseOrder> evaluateAndGenerateAutomatedReorders() {
        List<Inventory> inventories = inventoryRepository.findAll();
        List<PurchaseOrder> generatedPOs = new ArrayList<>();
        List<Supplier> suppliers = supplierRepository.findAll();

        for (Inventory inv : inventories) {
            if (inv.getStockQuantity() <= inv.getReorderLevel()) {
                Product product = productRepository.findById(inv.getProductId()).orElse(null);
                Warehouse warehouse = warehouseRepository.findById(inv.getWarehouseId()).orElse(null);
                if (product == null || warehouse == null) continue;

                // Determine best supplier for product category
                Supplier bestSupplier = selectBestSupplier(suppliers);
                if (bestSupplier == null) continue;

                int orderQuantity = Math.max(100, (inv.getReorderLevel() * 3) - inv.getStockQuantity());
                double unitPrice = product.getPrice() != null ? product.getPrice().doubleValue() * 0.75 : 850.0;
                double subtotal = unitPrice * orderQuantity;

                String poNum = "PO-AUT-" + LocalDate.now().getYear() + "-" + (1000 + purchaseOrderRepository.findAll().size() + generatedPOs.size() + 1);

                PurchaseOrder.PurchaseOrderItem item = PurchaseOrder.PurchaseOrderItem.builder()
                        .productId(product.getProductId())
                        .productName(product.getName())
                        .quantity(orderQuantity)
                        .unitPrice(unitPrice)
                        .subtotal(subtotal)
                        .unit(product.getCategory() != null ? product.getCategory() : "UNITS")
                        .build();

                PurchaseOrder po = PurchaseOrder.builder()
                        .poNumber(poNum)
                        .supplierId(bestSupplier.getSupplierId())
                        .supplierName(bestSupplier.getName())
                        .warehouseId(warehouse.getWarehouseId())
                        .warehouseName(warehouse.getName())
                        .items(List.of(item))
                        .totalAmount(subtotal)
                        .status(PurchaseOrder.POStatus.AUTO_SUGGESTED)
                        .triggerReason("Automated AI replenishment: Stock (" + inv.getStockQuantity() + ") dropped below reorder threshold (" + inv.getReorderLevel() + ")")
                        .isAiGenerated(true)
                        .expectedDeliveryDate(LocalDate.now().plusDays(4))
                        .createdAt(LocalDateTime.now())
                        .build();

                PurchaseOrder saved = purchaseOrderRepository.save(po);
                generatedPOs.add(saved);
            }
        }
        return generatedPOs;
    }

    public List<PurchaseOrder> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll();
    }

    public PurchaseOrder approvePurchaseOrder(String id, String approvedBy) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase Order not found"));
        po.setStatus(PurchaseOrder.POStatus.APPROVED);
        po.setApprovedAt(LocalDateTime.now());
        po.setApprovedBy(approvedBy != null ? approvedBy : "Admin Sentinel");
        return purchaseOrderRepository.save(po);
    }

    private Supplier selectBestSupplier(List<Supplier> suppliers) {
        if (suppliers.isEmpty()) return null;
        return suppliers.get(0);
    }
}
