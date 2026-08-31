package com.warehouse.wms.util;

import com.warehouse.wms.model.*;
import com.warehouse.wms.repository.*;
import com.warehouse.wms.service.IoTMonitoringService;
import com.warehouse.wms.service.ReportAndBarcodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
@SuppressWarnings("null")
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final WarehouseRepository warehouseRepository;
    private final SupplierRepository supplierRepository;
    private final OrderRepository orderRepository;
    private final InboundShipmentRepository inboundShipmentRepository;
    private final BatchLotRepository batchLotRepository;
    private final WarehouseZoneRepository zoneRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final GatePassRepository gatePassRepository;
    private final IoTMonitoringService ioTService;
    private final ReportAndBarcodeService barcodeService;
    private final BarcodeQrUtil barcodeQrUtil;

    @Override
    public void run(String... args) {
        System.out.println("🚜 Agricultural Data Catalyst Initializing...");
        
        // Clean existing collections to ensure synchronized relational integrity
        productRepository.deleteAll();
        inventoryRepository.deleteAll();
        warehouseRepository.deleteAll();
        supplierRepository.deleteAll();
        orderRepository.deleteAll();
        inboundShipmentRepository.deleteAll();
        batchLotRepository.deleteAll();
        zoneRepository.deleteAll();
        purchaseOrderRepository.deleteAll();
        gatePassRepository.deleteAll();

        // 1. Seed Professional Suppliers
        List<Supplier> suppliers = new ArrayList<>();
        String[][] supplierData = {
            {"Agri-Genetics Lab", "+91 90000 10001", "lab@agrigen.com", "Hyderabad Bio-Valley"},
            {"GreenRoot Fertilizers", "+91 90000 10002", "supply@greenroot.in", "Visakhapatnam SEZ"},
            {"PureSeeds National", "+91 90000 10003", "orders@pureseeds.org", "Punjab Grain Market"},
            {"EcoPest Solutions", "+91 90000 10004", "tech@ecopest.com", "Pune Research Center"},
            {"Bharat Farm Tools", "+91 90000 10005", "sales@bharatfarm.in", "Ludhiana Ind Area"},
            {"Organic Harvest Co", "+91 90000 10006", "hello@organicharvest.com", "Nilgiris Agri Zone"},
            {"SoilMaster Chem", "+91 90000 10007", "chem@soilmaster.com", "Gujarat Chem Estate"},
            {"International Crop Bank", "+91 90000 10008", "global@cropbank.int", "Chennai Agri Port"}
        };
        for (String[] data : supplierData) {
            Supplier s = Supplier.builder().name(data[0]).phone(data[1]).email(data[2]).address(data[3]).build();
            suppliers.add(supplierRepository.save(s));
        }

        // 2. Seed 6 Strategic Storage Depots
        List<Warehouse> warehouses = new ArrayList<>();
        String[][] whData = {
            {"Central Seed Depot", "Nagpur Hub", "20000"},
            {"North Grain Silos", "Chandigarh", "50000"},
            {"South Delta Cold Storage", "Thanjavur", "15000"},
            {"Western Agri Terminal", "Nashik", "30000"},
            {"Eastern Fertilizer Hub", "Kolkata", "25000"},
            {"Coastal Export Base", "Kochi", "10000"}
        };
        for (String[] data : whData) {
            Warehouse w = Warehouse.builder().name(data[0]).location(data[1]).capacity(Integer.parseInt(data[2])).manager("Senior Admin " + data[1]).build();
            warehouses.add(warehouseRepository.save(w));
        }

        // 3. Seed Multi-Zone Layout for Main Warehouses
        for (Warehouse wh : warehouses) {
            WarehouseZone.StorageBin bin1 = WarehouseZone.StorageBin.builder().binCode("BIN-A01").capacityUnits(500).storedUnits(380).isAvailable(false).productName("Basmati Paddy").build();
            WarehouseZone.StorageBin bin2 = WarehouseZone.StorageBin.builder().binCode("BIN-A02").capacityUnits(500).storedUnits(120).isAvailable(true).productName("Organic Wheat").build();
            WarehouseZone.StorageBin bin3 = WarehouseZone.StorageBin.builder().binCode("BIN-A03").capacityUnits(500).storedUnits(0).isAvailable(true).build();

            WarehouseZone silo = WarehouseZone.builder()
                    .warehouseId(wh.getWarehouseId())
                    .zoneCode("Z-SILO-" + wh.getName().substring(0, 3).toUpperCase())
                    .name(wh.getName() + " - Grain Silo Alpha")
                    .zoneType(WarehouseZone.ZoneType.GRAIN_SILO)
                    .totalCapacityTons(1200.0)
                    .occupiedCapacityTons(780.0)
                    .occupancyPercentage(65.0)
                    .targetTemperature(19.0)
                    .targetHumidity(58.0)
                    .ventilationStatus("ACTIVE_AERATION")
                    .bins(List.of(bin1, bin2, bin3))
                    .build();
            zoneRepository.save(silo);

            WarehouseZone coldVault = WarehouseZone.builder()
                    .warehouseId(wh.getWarehouseId())
                    .zoneCode("Z-COLD-" + wh.getName().substring(0, 3).toUpperCase())
                    .name(wh.getName() + " - Cold Chamber Vault")
                    .zoneType(WarehouseZone.ZoneType.COLD_STORAGE)
                    .totalCapacityTons(600.0)
                    .occupiedCapacityTons(490.0)
                    .occupancyPercentage(81.6)
                    .targetTemperature(4.0)
                    .targetHumidity(88.0)
                    .ventilationStatus("REFRIGERATED")
                    .bins(List.of(bin1, bin2))
                    .build();
            zoneRepository.save(coldVault);
        }

        // 4. Generate Products (Seeds, Fertilizers, Crops, Eco-Pesticides)
        Map<String, String[]> categories = new HashMap<>();
        categories.put("High-Yield Seeds", new String[]{"Basmati S3 Paddy", "Hybrid Maize X-12", "Organic Wheat Gold", "Sona Masuri G2", "Chilli Guntur S4", "Cotton BT-Elite", "Soybean Max-Pro", "Mustard Yellow G1", "Millet Ragi Super", "Tomato Hybrid Red"});
        categories.put("Advanced Fertilizers", new String[]{"NPK 19-19-19 Bio", "Water Soluble Potash", "Zinc-Sulfate 21%", "Chelated Micronutrients", "Neem-Coated Urea", "Organic Vermipost", "Liquid Seaweed Extract", "DAP Phosphatic Mix", "Ammonium Sulfate XL", "Boron Granules"});
        categories.put("Eco-Pesticides", new String[]{"Bio-Metarhizium", "Neem Oil 10000PPM", "Pheromone Trap Kit", "Fungicide Shield", "Termite Guard Elite", "Herbicides Zero-G", "Ant-Killer Organic", "Snail-Bane Granules", "Fruit-Fly Attractant", "Blight-Control Pro"});
        categories.put("Precision Tools", new String[]{"Soil PH/Moisture Pro", "Backpack Power Sprayer", "Electric Seeder v4", "Drip System Master", "Tractor Rotary Blade", "Mechanical Reaper", "Laser Land Leveler", "Digital Weighing Scale", "Storage Temp Sensor", "Pruning Saw Electric"});
        categories.put("Bulk Harvest", new String[]{"Dry Turmeric Bulbs", "Black Pepper G1", "Green Cardamom 8mm", "Raw Cashew Nuts", "Dry Ginger Dried", "Coffee Parchment", "CTC Tea Dust", "Groundnut Pods", "Sunflower Silage", "Coconut Copra Dry"});

        Random random = new Random();
        List<Product> products = new ArrayList<>();

        for (Map.Entry<String, String[]> entry : categories.entrySet()) {
            for (String baseItem : entry.getValue()) {
                for (int i = 1; i <= 4; i++) {
                    String name = baseItem + " (Batch " + (1000 + i) + ")";
                    String barcode = "AGRI-" + (100000 + random.nextInt(900000));
                    Product p = Product.builder()
                            .name(name)
                            .category(entry.getKey())
                            .price(BigDecimal.valueOf(250 + random.nextInt(10000)))
                            .barcode(barcode)
                            .qrCode(barcodeQrUtil.generateQrCodeBase64(barcode))
                            .supplierId(suppliers.get(random.nextInt(suppliers.size())).getSupplierId())
                            .createdDate(LocalDate.now().minusDays(random.nextInt(180)))
                            .build();
                    products.add(productRepository.save(p));
                }
            }
        }

        // 5. Populate Inventory & Agricultural FEFO Batch Lots (Multiple Lots per Product)
        for (int pIdx = 0; pIdx < products.size(); pIdx++) {
            Product p = products.get(pIdx);
            Warehouse wh = warehouses.get(random.nextInt(warehouses.size()));
            
            // Generate 2 to 3 distinct batches for each product
            int totalProductStock = 0;
            int numLots = 2 + (pIdx % 2); // 2 or 3 lots per product

            for (int lIdx = 1; lIdx <= numLots; lIdx++) {
                int lotQty = 80 + random.nextInt(250);
                totalProductStock += lotQty;

                LocalDate harvest = LocalDate.now().minusMonths(lIdx * 2);
                LocalDate expiry;
                
                if (lIdx == 1 && pIdx % 3 == 0) {
                    expiry = LocalDate.now().plusDays(10 + random.nextInt(20)); // Critical / Expiring soon
                } else if (lIdx == 1) {
                    expiry = LocalDate.now().plusDays(35 + random.nextInt(30)); // Maturing
                } else {
                    expiry = LocalDate.now().plusMonths(4 + (lIdx * 3)); // Fresh
                }

                int daysLeft = (int) java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), expiry);
                BatchLot.ExpiryStatus status = daysLeft <= 15 ? BatchLot.ExpiryStatus.CRITICAL :
                                              daysLeft <= 45 ? BatchLot.ExpiryStatus.EXPIRING_SOON :
                                              daysLeft <= 120 ? BatchLot.ExpiryStatus.MATURING : BatchLot.ExpiryStatus.FRESH;

                BatchLot lot = BatchLot.builder()
                        .batchNumber("LOT-" + LocalDate.now().getYear() + "-P" + (100 + pIdx) + "-L" + lIdx)
                        .productId(p.getProductId())
                        .productName(p.getName())
                        .warehouseId(wh.getWarehouseId())
                        .warehouseName(wh.getName())
                        .initialQuantity(lotQty + 50)
                        .remainingQuantity(lotQty)
                        .unit("BAGS")
                        .harvestDate(harvest)
                        .receivedDate(harvest.plusWeeks(2))
                        .expiryDate(expiry)
                        .qualityGrade(lIdx == 1 ? BatchLot.QualityGrade.SEED_CERTIFIED_EXPORT : BatchLot.QualityGrade.GRADE_A_PREMIUM)
                        .moistureAtIntake(12.0 + (random.nextDouble() * 2.2))
                        .storageBinLocation("SILO-A" + (1 + random.nextInt(3)) + " / BIN-" + (10 + random.nextInt(50)))
                        .expiryStatus(status)
                        .daysToExpiry(daysLeft)
                        .createdAt(LocalDateTime.now().minusDays(20))
                        .lastUpdated(LocalDateTime.now())
                        .build();
                batchLotRepository.save(lot);
            }

            Inventory inventory = Inventory.builder()
                    .productId(p.getProductId())
                    .warehouseId(wh.getWarehouseId())
                    .stockQuantity(totalProductStock)
                    .reorderLevel(100 + random.nextInt(150))
                    .lastUpdated(LocalDateTime.now().minusMinutes(random.nextInt(10000)))
                    .build();
            inventoryRepository.save(inventory);
        }

        // 6. Build Sample Purchase Orders (Auto-Replenishment)
        PurchaseOrder.PurchaseOrderItem poItem1 = PurchaseOrder.PurchaseOrderItem.builder()
                .productId(products.get(0).getProductId())
                .productName(products.get(0).getName())
                .quantity(450)
                .unitPrice(1200.0)
                .subtotal(540000.0)
                .unit("BAGS")
                .build();

        PurchaseOrder po1 = PurchaseOrder.builder()
                .poNumber("PO-2026-AUT-101")
                .supplierId(suppliers.get(0).getSupplierId())
                .supplierName(suppliers.get(0).getName())
                .warehouseId(warehouses.get(0).getWarehouseId())
                .warehouseName(warehouses.get(0).getName())
                .items(List.of(poItem1))
                .totalAmount(540000.0)
                .status(PurchaseOrder.POStatus.AUTO_SUGGESTED)
                .triggerReason("AI Sentinel: Stock dropped below safety threshold (Deficit: 450 Bags)")
                .isAiGenerated(true)
                .expectedDeliveryDate(LocalDate.now().plusDays(4))
                .createdAt(LocalDateTime.now().minusHours(2))
                .build();
        purchaseOrderRepository.save(po1);

        // 7. Build Sample Digital Gate Passes
        barcodeService.generateQRCodeBase64("TEST", 100, 100);
        GatePass.GatePassItem gpItem = GatePass.GatePassItem.builder()
                .productId(products.get(0).getProductId())
                .productName(products.get(0).getName())
                .batchNumber("LOT-2026-01-BASM")
                .quantity(350)
                .unit("BAGS")
                .build();

        GatePass gatePass = GatePass.builder()
                .passNumber("GP-AGRI-2026-901")
                .passType(GatePass.GatePassType.OUTBOUND_DISPATCH)
                .referenceId("ORD-9011")
                .warehouseId(warehouses.get(0).getWarehouseId())
                .warehouseName(warehouses.get(0).getName())
                .vehicleNumber("TN-28-AG-4412")
                .driverName("M. Murugan")
                .driverPhone("9842101234")
                .transporterName("Kaveri Agri Transport Logistics")
                .items(List.of(gpItem))
                .totalWeightKg(17500.0)
                .qrCodeBase64(barcodeService.generateQRCodeBase64("AGRI-WMS-GATEPASS:GP-AGRI-2026-901|VEHICLE:TN-28-AG-4412|DRIVER:M. Murugan", 260, 260))
                .verificationHash("3c8e41a998b2f1")
                .status(GatePass.GatePassStatus.ISSUED)
                .issuedAt(LocalDateTime.now().minusMinutes(40))
                .issuedBy("Security Dispatch Sentinel")
                .build();
        gatePassRepository.save(gatePass);

        // 8. Build Sample Customer Orders / Dispatches
        Order.OrderStatus[] statuses = {
                Order.OrderStatus.DISPATCHED, Order.OrderStatus.PENDING, Order.OrderStatus.DELIVERED,
                Order.OrderStatus.PROCESSING, Order.OrderStatus.DISPATCHED
        };
        for (int o = 1; o <= 12; o++) {
            Warehouse wh = warehouses.get(random.nextInt(warehouses.size()));
            Product p = products.get(random.nextInt(products.size()));
            OrderItem item = OrderItem.builder()
                    .orderItemId(UUID.randomUUID().toString())
                    .productId(p.getProductId())
                    .quantity(50 + random.nextInt(200))
                    .build();

            Order order = Order.builder()
                    .orderId("ORD-2026-" + (1000 + o))
                    .warehouseId(wh.getWarehouseId())
                    .status(statuses[o % statuses.length])
                    .orderDate(LocalDateTime.now().minusDays(random.nextInt(45)))
                    .items(List.of(item))
                    .build();
            orderRepository.save(order);
        }

        // 9. Capture Initial IoT Sensor Telemetry
        ioTService.captureIoTSensorTelemetry();

        System.out.println("✅ Agricultural Enterprise Engine Synchronized: IoT Telemetry, FEFO Lots, Multi-Zones, and AI POs Ready.");
    }
}
