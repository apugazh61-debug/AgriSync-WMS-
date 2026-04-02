package com.warehouse.wms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemandPredictionDto {
    private String productId;
    private String productName;
    private double averageMonthlyDemand;
    private double predictedNextMonthDemand;
    private String trend;
    private List<Map<String, Object>> historicalData;
    private String recommendation;
}
