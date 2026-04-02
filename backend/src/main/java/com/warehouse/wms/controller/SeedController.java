package com.warehouse.wms.controller;

import com.warehouse.wms.util.DataInitializer;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@SuppressWarnings("null")
public class SeedController {

    private final DataInitializer dataInitializer;

    @GetMapping("/seed")
    public String triggerSeed() {
        try {
            dataInitializer.run();
            return "✅ Agricultural Engine Synchronized: 200 Assets Loaded successfully!";
        } catch (Exception e) {
            return "❌ Seeding failed: " + e.getMessage();
        }
    }
}
