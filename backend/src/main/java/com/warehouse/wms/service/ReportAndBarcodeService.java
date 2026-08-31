package com.warehouse.wms.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.warehouse.wms.model.GatePass;
import com.warehouse.wms.model.Inventory;
import com.warehouse.wms.model.Order;
import com.warehouse.wms.model.Product;
import com.warehouse.wms.repository.GatePassRepository;
import com.warehouse.wms.repository.InventoryRepository;
import com.warehouse.wms.repository.OrderRepository;
import com.warehouse.wms.repository.ProductRepository;
import com.warehouse.wms.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportAndBarcodeService {

    private final GatePassRepository gatePassRepository;
    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;

    /**
     * Generate Base64-encoded QR Code PNG image
     */
    public String generateQRCodeBase64(String text, int width, int height) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);
            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            byte[] pngData = pngOutputStream.toByteArray();
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(pngData);
        } catch (Exception e) {
            return "";
        }
    }

    /**
     * Issue a Digital Gate Pass for an outbound order or shipment
     */
    public GatePass issueGatePassForOrder(String orderId, String vehicleNumber, String driverName, String driverPhone, String transporter) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        String passNum = "GP-" + LocalDateTime.now().getYear() + "-" + (2000 + gatePassRepository.findAll().size() + 1);

        String checksumData = passNum + "|" + orderId + "|" + vehicleNumber + "|" + LocalDateTime.now();
        String hash = generateSha256(checksumData);

        // QR payload data
        String qrPayload = String.format("AGRI-WMS-GATEPASS:%s|ORDER:%s|VEHICLE:%s|DRIVER:%s|HASH:%s",
                passNum, orderId, vehicleNumber, driverName, hash.substring(0, 8));
        String qrCodeBase64 = generateQRCodeBase64(qrPayload, 260, 260);

        List<GatePass.GatePassItem> items = new ArrayList<>();
        if (order.getItems() != null) {
            for (var item : order.getItems()) {
                Product p = productRepository.findById(item.getProductId()).orElse(null);
                String pName = p != null ? p.getName() : "Agri Commodity";
                items.add(GatePass.GatePassItem.builder()
                        .productId(item.getProductId())
                        .productName(pName)
                        .batchNumber("LOT-" + item.getProductId().substring(0, Math.min(6, item.getProductId().length())))
                        .quantity(item.getQuantity())
                        .unit("UNITS")
                        .build());
            }
        }

        GatePass gatePass = GatePass.builder()
                .passNumber(passNum)
                .passType(GatePass.GatePassType.OUTBOUND_DISPATCH)
                .referenceId(orderId)
                .warehouseId(order.getWarehouseId())
                .warehouseName("Central Agri-Hub")
                .vehicleNumber(vehicleNumber != null ? vehicleNumber : "TN-28-AG-9988")
                .driverName(driverName != null ? driverName : "M. Selvam")
                .driverPhone(driverPhone != null ? driverPhone : "9842109876")
                .transporterName(transporter != null ? transporter : "TamilNadu Agro Logistics")
                .items(items)
                .totalWeightKg(items.size() * 350.0)
                .qrCodeBase64(qrCodeBase64)
                .verificationHash(hash)
                .status(GatePass.GatePassStatus.ISSUED)
                .issuedAt(LocalDateTime.now())
                .issuedBy("Security Dispatch Sentinel")
                .build();

        return gatePassRepository.save(gatePass);
    }

    public List<GatePass> getAllGatePasses() {
        return gatePassRepository.findAll();
    }

    public GatePass verifyAndAuthorizeExit(String passNumber) {
        GatePass pass = gatePassRepository.findByPassNumber(passNumber)
                .orElseThrow(() -> new RuntimeException("Gate pass not found: " + passNumber));
        pass.setStatus(GatePass.GatePassStatus.DISPATCHED_OUT);
        pass.setGateExitAt(LocalDateTime.now());
        return gatePassRepository.save(pass);
    }

    /**
     * Generate CSV Stock Audit Report
     */
    public String generateStockAuditCsv() {
        StringBuilder csv = new StringBuilder();
        csv.append("InventoryID,ProductID,ProductName,WarehouseName,StockQuantity,ReorderLevel,Status,StockValueINR\n");

        List<Inventory> inventories = inventoryRepository.findAll();
        for (Inventory inv : inventories) {
            Product p = productRepository.findById(inv.getProductId()).orElse(null);
            String pName = p != null ? p.getName() : "Unknown";
            double price = p != null && p.getPrice() != null ? p.getPrice().doubleValue() : 0.0;
            double value = inv.getStockQuantity() * price;
            String status = inv.getStockQuantity() <= inv.getReorderLevel() ? "LOW_STOCK_CRITICAL" : "HEALTHY";

            csv.append(String.format("%s,%s,\"%s\",\"Central Agri-Hub\",%d,%d,%s,%.2f\n",
                    inv.getInventoryId(), inv.getProductId(), pName, inv.getStockQuantity(), inv.getReorderLevel(), status, value));
        }
        return csv.toString();
    }

    private String generateSha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return "HASH_FAILED_" + System.currentTimeMillis();
        }
    }
}
