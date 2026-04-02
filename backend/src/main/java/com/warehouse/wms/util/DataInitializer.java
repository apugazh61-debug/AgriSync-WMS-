package com.warehouse.wms.util;

import com.warehouse.wms.model.Product;
import com.warehouse.wms.model.Inventory;
import com.warehouse.wms.model.Warehouse;
import com.warehouse.wms.model.Supplier;
import com.warehouse.wms.model.Order;
import com.warehouse.wms.model.OrderItem;
import com.warehouse.wms.model.InboundShipment;
import com.warehouse.wms.model.InboundItem;
import com.warehouse.wms.repository.ProductRepository;
import com.warehouse.wms.repository.InventoryRepository;
import com.warehouse.wms.repository.WarehouseRepository;
import com.warehouse.wms.repository.SupplierRepository;
import com.warehouse.wms.repository.OrderRepository;
import com.warehouse.wms.repository.InboundShipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Objects;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

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
    private final BarcodeQrUtil barcodeQrUtil;

    @Override
    public void run(String... args) {
        System.out.println("🚜 Agricultural Data Catalyst Initialized...");
        
        // Always refresh data if we want exactly 200 new items
        productRepository.deleteAll();
        inventoryRepository.deleteAll();
        warehouseRepository.deleteAll();
        supplierRepository.deleteAll();
        orderRepository.deleteAll();
        inboundShipmentRepository.deleteAll();

        // 1. Seed 8 Professional Suppliers (Seed Labs & Chem Orgs)
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

        // 3. Generate exactly 200 Products
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
                // Each base item gets 4 variations (40 per category * 5 categories = 200)
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

        // 4. Populate Inventory (Sentinel Stock) - Ensure ALL 200 items have stock
        for (Product p : products) {
            // Assign each product to 1-3 warehouses
            int numWh = 1 + random.nextInt(3);
            List<Warehouse> shuffledWh = new ArrayList<>(warehouses);
            Collections.shuffle(shuffledWh);
            for (int i = 0; i < numWh; i++) {
                Inventory inventory = Objects.requireNonNull(
                    Inventory.builder()
                        .productId(p.getProductId())
                        .warehouseId(shuffledWh.get(i).getWarehouseId())
                        .stockQuantity(100 + random.nextInt(2000))
                        .reorderLevel(50 + random.nextInt(100))
                        .lastUpdated(LocalDateTime.now().minusMinutes(random.nextInt(10000)))
                        .build(),
                    "Inventory build() must not return null"
                );
                inventoryRepository.save(inventory);
            }
        }

        // 5. Build 60 Dispatch Orders
        for (int i = 0; i < 60; i++) {
            List<OrderItem> items = new ArrayList<>();
            for (int k = 0; k < 2 + random.nextInt(4); k++) {
                items.add(OrderItem.builder()
                        .productId(products.get(random.nextInt(products.size())).getProductId())
                        .quantity(1 + random.nextInt(20))
                        .build());
            }
            orderRepository.save(Objects.requireNonNull(Order.builder()
                    .warehouseId(warehouses.get(random.nextInt(warehouses.size())).getWarehouseId())
                    .orderDate(LocalDateTime.now().minusDays(random.nextInt(90)))
                    .status(Order.OrderStatus.values()[random.nextInt(Order.OrderStatus.values().length)])
                    .items(items)
                    .build()));
        }

        // 6. Build 40 Inbound Registry Records
        for (int i = 0; i < 40; i++) {
            List<InboundItem> items = new ArrayList<>();
            items.add(InboundItem.builder()
                    .productId(products.get(random.nextInt(products.size())).getProductId())
                    .quantity(500 + random.nextInt(1000))
                    .build());
            
            inboundShipmentRepository.save(Objects.requireNonNull(InboundShipment.builder()
                    .supplierId(suppliers.get(random.nextInt(suppliers.size())).getSupplierId())
                    .warehouseId(warehouses.get(random.nextInt(warehouses.size())).getWarehouseId())
                    .receivedDate(LocalDate.now().minusDays(random.nextInt(30)))
                    .batchNumber("AGRI-BATCH-" + (20000 + random.nextInt(80000)))
                    .items(items)
                    .build()));
        }

        System.out.println("✅ Agricultural Engine Synchronized: 200 High-Identity Assets Loaded.");
    }
}
