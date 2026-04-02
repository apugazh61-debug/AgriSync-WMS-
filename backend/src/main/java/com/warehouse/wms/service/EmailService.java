package com.warehouse.wms.service;

import com.warehouse.wms.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class EmailService {

    private final JavaMailSender mailSender;
    private final ProductRepository productRepository;

    @Async
    public void sendLowStockAlert(String productId, int currentStock, int reorderLevel) {
        try {
            productRepository.findById(productId).ifPresent(product -> {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo("admin@warehouse.com");
                message.setSubject("⚠️ Low Stock Alert: " + product.getName());
                message.setText(String.format(
                        "Low stock alert!\n\nProduct: %s\nCurrent Stock: %d\nReorder Level: %d\n\nPlease reorder soon.",
                        product.getName(), currentStock, reorderLevel
                ));
                try {
                    mailSender.send(message);
                    log.info("Low stock alert sent for product: {}", product.getName());
                } catch (Exception e) {
                    log.error("Failed to send email: {}", e.getMessage());
                }
            });
        } catch (Exception e) {
            log.error("Email service error: {}", e.getMessage());
        }
    }
}
