package com.warehouse.wms.repository;

import com.warehouse.wms.model.GatePass;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GatePassRepository extends MongoRepository<GatePass, String> {
    Optional<GatePass> findByPassNumber(String passNumber);
    Optional<GatePass> findByVerificationHash(String verificationHash);
    List<GatePass> findByStatusOrderByIssuedAtDesc(GatePass.GatePassStatus status);
    List<GatePass> findByWarehouseId(String warehouseId);
}
