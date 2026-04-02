package com.warehouse.wms.service;

import com.warehouse.wms.dto.ProductDto;
import com.warehouse.wms.model.Product;
import com.warehouse.wms.repository.ProductRepository;
import com.warehouse.wms.repository.SupplierRepository;
import com.warehouse.wms.util.BarcodeQrUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class ProductService {

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final BarcodeQrUtil barcodeQrUtil;

    @CacheEvict(value = "products", allEntries = true)
    public ProductDto createProduct(ProductDto dto) {
        String barcode = barcodeQrUtil.generateBarcode();
        String qrData = "PRODUCT:" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String qrCode = barcodeQrUtil.generateQrCodeBase64(qrData);

        Product product = Product.builder()
                .name(dto.getName())
                .category(dto.getCategory())
                .price(dto.getPrice())
                .barcode(barcode)
                .qrCode(qrCode)
                .supplierId(dto.getSupplierId())
                .createdDate(LocalDate.now())
                .build();

        Product saved = productRepository.save(product);
        return toDto(saved);
    }

    @Cacheable(value = "products", key = "'all'")
    public List<ProductDto> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "products", key = "#id")
    public ProductDto getProductById(String id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return toDto(p);
    }

    public List<ProductDto> searchProducts(String query) {
        return productRepository.findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(query, query)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @CacheEvict(value = "products", allEntries = true)
    public ProductDto updateProduct(String id, ProductDto dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        if (dto.getName() != null) product.setName(dto.getName());
        if (dto.getCategory() != null) product.setCategory(dto.getCategory());
        if (dto.getPrice() != null) product.setPrice(dto.getPrice());
        if (dto.getSupplierId() != null) product.setSupplierId(dto.getSupplierId());
        return toDto(productRepository.save(product));
    }

    @CacheEvict(value = "products", allEntries = true)
    public void deleteProduct(String id) {
        productRepository.deleteById(id);
    }

    public List<ProductDto> bulkUploadFromExcel(MultipartFile file) throws IOException {
        List<ProductDto> createdProducts = new ArrayList<>();
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue; // skip header
                try {
                    ProductDto dto = new ProductDto();
                    dto.setName(getCellValue(row, 0));
                    dto.setCategory(getCellValue(row, 1));
                    String priceStr = getCellValue(row, 2);
                    if (priceStr != null && !priceStr.isEmpty()) {
                        dto.setPrice(new BigDecimal(priceStr));
                    }
                    dto.setSupplierId(getCellValue(row, 3));
                    createdProducts.add(createProduct(dto));
                } catch (Exception e) {
                    log.warn("Skipping row {} due to error: {}", row.getRowNum(), e.getMessage());
                }
            }
        }
        return createdProducts;
    }

    private String getCellValue(Row row, int index) {
        Cell cell = row.getCell(index);
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }

    private ProductDto toDto(Product p) {
        ProductDto dto = new ProductDto();
        dto.setProductId(p.getProductId());
        dto.setName(p.getName());
        dto.setCategory(p.getCategory());
        dto.setPrice(p.getPrice());
        dto.setBarcode(p.getBarcode());
        dto.setQrCode(p.getQrCode());
        dto.setSupplierId(p.getSupplierId());
        dto.setCreatedDate(p.getCreatedDate());
        if (p.getSupplierId() != null) {
            supplierRepository.findById(p.getSupplierId())
                    .ifPresent(s -> dto.setSupplierName(s.getName()));
        }
        return dto;
    }
}
