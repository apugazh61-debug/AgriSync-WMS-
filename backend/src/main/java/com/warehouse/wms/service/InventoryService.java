package com.warehouse.wms.service;

import com.warehouse.wms.dto.InventoryDto;
import com.warehouse.wms.model.Inventory;
import com.warehouse.wms.model.StockMovement;
import com.warehouse.wms.repository.InventoryRepository;
import com.warehouse.wms.repository.ProductRepository;
import com.warehouse.wms.repository.StockMovementRepository;
import com.warehouse.wms.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final StockMovementRepository stockMovementRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final EmailService emailService;

    @Cacheable(value = "inventory", key = "'all'")
    public List<InventoryDto> getAllInventory() {
        return inventoryRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "inventory", key = "#productId")
    public List<InventoryDto> getInventoryByProduct(String productId) {
        return inventoryRepository.findByProductId(productId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @CacheEvict(value = "inventory", allEntries = true)
    public InventoryDto updateInventory(String productId, String warehouseId,
                                        int quantity, StockMovement.MovementType type) {
        Inventory inventory = inventoryRepository
                .findByProductIdAndWarehouseId(productId, warehouseId)
                .orElseGet(() -> Inventory.builder()
                        .inventoryId(UUID.randomUUID().toString())
                        .productId(productId)
                        .warehouseId(warehouseId)
                        .stockQuantity(0)
                        .reorderLevel(10)
                        .build());

        if (type == StockMovement.MovementType.INBOUND) {
            inventory.setStockQuantity(inventory.getStockQuantity() + quantity);
        } else {
            if (inventory.getStockQuantity() < quantity) {
                throw new RuntimeException("Insufficient stock");
            }
            inventory.setStockQuantity(inventory.getStockQuantity() - quantity);
        }
        inventory.setLastUpdated(LocalDateTime.now());
        Inventory saved = inventoryRepository.save(inventory);

        // Log stock movement
        StockMovement movement = StockMovement.builder()
                .movementId(UUID.randomUUID().toString())
                .productId(productId)
                .warehouseId(warehouseId)
                .type(type)
                .quantity(quantity)
                .timestamp(LocalDateTime.now())
                .build();
        stockMovementRepository.save(movement);

        // Broadcast real-time update via WebSocket
        InventoryDto dto = toDto(saved);
        messagingTemplate.convertAndSend("/topic/inventory-update", dto);

        // Check for low stock
        if (saved.getStockQuantity() <= saved.getReorderLevel()) {
            emailService.sendLowStockAlert(productId, saved.getStockQuantity(), saved.getReorderLevel());
            messagingTemplate.convertAndSend("/topic/low-stock-alert", dto);
        }

        return dto;
    }

    @Cacheable(value = "inventory", key = "'low-stock'")
    public List<InventoryDto> getLowStockItems() {
        return inventoryRepository.findAll().stream()
                .filter(i -> i.getStockQuantity() <= i.getReorderLevel())
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Scheduled(fixedRate = 300000) // every 5 minutes
    public void broadcastInventoryStatus() {
        List<InventoryDto> lowStock = getLowStockItems();
        if (!lowStock.isEmpty()) {
            messagingTemplate.convertAndSend("/topic/low-stock-alert", lowStock);
        }
    }

    private InventoryDto toDto(Inventory inv) {
        InventoryDto dto = new InventoryDto();
        dto.setInventoryId(inv.getInventoryId());
        dto.setProductId(inv.getProductId());
        dto.setWarehouseId(inv.getWarehouseId());
        dto.setStockQuantity(inv.getStockQuantity());
        dto.setReorderLevel(inv.getReorderLevel());
        dto.setLowStock(inv.getStockQuantity() <= inv.getReorderLevel());
        dto.setLastUpdated(inv.getLastUpdated() != null ? inv.getLastUpdated().toString() : null);

        productRepository.findById(inv.getProductId())
                .ifPresent(p -> dto.setProductName(p.getName()));
        warehouseRepository.findById(inv.getWarehouseId())
                .ifPresent(w -> dto.setWarehouseName(w.getName()));
        return dto;
    }
}
