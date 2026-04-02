package com.warehouse.wms.service;

import com.warehouse.wms.model.InboundItem;
import com.warehouse.wms.model.InboundShipment;
import com.warehouse.wms.model.StockMovement;
import com.warehouse.wms.repository.InboundShipmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class InboundService {

    private final InboundShipmentRepository inboundShipmentRepository;
    private final InventoryService inventoryService;

    public InboundShipment createInboundShipment(InboundShipment shipment) {
        shipment.setInboundId(UUID.randomUUID().toString());
        shipment.setReceivedDate(LocalDate.now());
        shipment.setBatchNumber("BATCH-" + System.currentTimeMillis());

        // Auto-update inventory for each inbound item
        if (shipment.getItems() != null) {
            for (InboundItem item : shipment.getItems()) {
                item.setInboundItemId(UUID.randomUUID().toString());
                try {
                    inventoryService.updateInventory(
                            item.getProductId(),
                            shipment.getWarehouseId(),
                            item.getQuantity(),
                            StockMovement.MovementType.INBOUND
                    );
                } catch (Exception e) {
                    log.error("Failed to update inventory for product {}: {}", item.getProductId(), e.getMessage());
                }
            }
        }

        return inboundShipmentRepository.save(shipment);
    }

    public List<InboundShipment> getAllInbound() {
        return inboundShipmentRepository.findAll();
    }

    public InboundShipment getInboundById(String id) {
        return inboundShipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inbound shipment not found: " + id));
    }
}
