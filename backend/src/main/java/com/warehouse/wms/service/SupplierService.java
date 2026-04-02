package com.warehouse.wms.service;

import com.warehouse.wms.model.Supplier;
import com.warehouse.wms.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class SupplierService {

    private final SupplierRepository supplierRepository;

    @CacheEvict(value = "suppliers", allEntries = true)
    public Supplier createSupplier(Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    @Cacheable(value = "suppliers", key = "'all'")
    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    @Cacheable(value = "suppliers", key = "#id")
    public Supplier getSupplierById(String id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + id));
    }

    @CacheEvict(value = "suppliers", allEntries = true)
    public Supplier updateSupplier(String id, Supplier updated) {
        Supplier supplier = getSupplierById(id);
        if (updated.getName() != null) supplier.setName(updated.getName());
        if (updated.getPhone() != null) supplier.setPhone(updated.getPhone());
        if (updated.getEmail() != null) supplier.setEmail(updated.getEmail());
        if (updated.getAddress() != null) supplier.setAddress(updated.getAddress());
        return supplierRepository.save(supplier);
    }

    @CacheEvict(value = "suppliers", allEntries = true)
    public void deleteSupplier(String id) {
        supplierRepository.deleteById(id);
    }
}
