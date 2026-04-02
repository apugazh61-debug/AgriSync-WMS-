package com.warehouse.wms.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "inbound_shipments")
public class InboundShipment {

    @Id
    private String inboundId;

    private String supplierId;

    private String warehouseId;

    private LocalDate receivedDate;

    private String batchNumber;

    private List<InboundItem> items;
}
