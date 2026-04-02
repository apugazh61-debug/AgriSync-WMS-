package com.warehouse.wms.service;

import com.warehouse.wms.model.Warehouse;
import com.warehouse.wms.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;

    @CacheEvict(value = "warehouses", allEntries = true)
    public Warehouse createWarehouse(Warehouse warehouse) {
        return warehouseRepository.save(warehouse);
    }

    @Cacheable(value = "warehouses", key = "'all'")
    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findAll();
    }

    @Cacheable(value = "warehouses", key = "#id")
    public Warehouse getWarehouseById(String id) {
        return warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + id));
    }

    @CacheEvict(value = "warehouses", allEntries = true)
    public Warehouse updateWarehouse(String id, Warehouse updated) {
        Warehouse warehouse = getWarehouseById(id);
        if (updated.getName() != null) warehouse.setName(updated.getName());
        if (updated.getLocation() != null) warehouse.setLocation(updated.getLocation());
        if (updated.getCapacity() != null) warehouse.setCapacity(updated.getCapacity());
        if (updated.getManager() != null) warehouse.setManager(updated.getManager());
        return warehouseRepository.save(warehouse);
    }

    @CacheEvict(value = "warehouses", allEntries = true)
    public void deleteWarehouse(String id) {
        warehouseRepository.deleteById(id);
    }
}
