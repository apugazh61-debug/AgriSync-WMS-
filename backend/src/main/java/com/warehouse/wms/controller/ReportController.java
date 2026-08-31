package com.warehouse.wms.controller;

import com.warehouse.wms.service.ReportAndBarcodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportAndBarcodeService reportService;

    @GetMapping("/stock-audit/csv")
    public ResponseEntity<byte[]> downloadStockAuditCsv() {
        String csvData = reportService.generateStockAuditCsv();
        byte[] bytes = csvData.getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Agri_WMS_Stock_Audit_" + System.currentTimeMillis() + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }
}
