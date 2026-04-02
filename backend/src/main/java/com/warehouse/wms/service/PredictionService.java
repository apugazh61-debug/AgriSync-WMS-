package com.warehouse.wms.service;

import com.warehouse.wms.dto.DemandPredictionDto;
import com.warehouse.wms.model.StockMovement;
import com.warehouse.wms.repository.ProductRepository;
import com.warehouse.wms.repository.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.Month;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class PredictionService {

    private final StockMovementRepository stockMovementRepository;
    private final ProductRepository productRepository;

    public DemandPredictionDto predictDemand(String productId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sixMonthsAgo = now.minusMonths(6);

        List<StockMovement> movements = stockMovementRepository
                .findByProductIdAndTimestampBetween(productId, sixMonthsAgo, now)
                .stream()
                .filter(m -> m.getType() == StockMovement.MovementType.OUTBOUND)
                .collect(Collectors.toList());

        // Group by month
        Map<Month, Long> monthlyDemand = new LinkedHashMap<>();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0);
            LocalDateTime monthEnd = monthStart.plusMonths(1);
            Month month = monthStart.getMonth();
            long demand = movements.stream()
                    .filter(m -> !m.getTimestamp().isBefore(monthStart) && m.getTimestamp().isBefore(monthEnd))
                    .mapToLong(StockMovement::getQuantity)
                    .sum();
            monthlyDemand.put(month, demand);
        }

        List<Long> demandValues = new ArrayList<>(monthlyDemand.values());
        double averageDemand = demandValues.stream().mapToLong(Long::longValue).average().orElse(0.0);

        // Simple linear regression for trend
        double predictedNext = calculatePrediction(demandValues);
        String trend = predictedNext > averageDemand ? "INCREASING" :
                       predictedNext < averageDemand ? "DECREASING" : "STABLE";

        String recommendation = generateRecommendation(trend, predictedNext, averageDemand);

        // Format historical data for charts
        List<Map<String, Object>> historicalData = new ArrayList<>();
        for (Map.Entry<Month, Long> entry : monthlyDemand.entrySet()) {
            Map<String, Object> point = new HashMap<>();
            point.put("month", entry.getKey().name());
            point.put("demand", entry.getValue());
            historicalData.add(point);
        }

        DemandPredictionDto dto = new DemandPredictionDto();
        dto.setProductId(productId);
        dto.setAverageMonthlyDemand(averageDemand);
        dto.setPredictedNextMonthDemand(Math.max(0, predictedNext));
        dto.setTrend(trend);
        dto.setHistoricalData(historicalData);
        dto.setRecommendation(recommendation);

        productRepository.findById(productId)
                .ifPresent(p -> dto.setProductName(p.getName()));

        return dto;
    }

    private double calculatePrediction(List<Long> values) {
        if (values.isEmpty()) return 0.0;
        int n = values.size();
        double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        for (int i = 0; i < n; i++) {
            sumX += i;
            sumY += values.get(i);
            sumXY += i * values.get(i);
            sumX2 += i * i;
        }
        double slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX + 0.0001);
        double intercept = (sumY - slope * sumX) / n;
        return slope * n + intercept; // predict next period
    }

    private String generateRecommendation(String trend, double predicted, double average) {
        return switch (trend) {
            case "INCREASING" -> String.format(
                "Demand is trending upward. Predicted demand: %.0f units. Consider increasing stock by ~%.0f units.",
                predicted, predicted * 1.2 - average
            );
            case "DECREASING" -> String.format(
                "Demand is trending downward. Predicted demand: %.0f units. Review reorder levels to avoid overstocking.",
                predicted
            );
            default -> String.format(
                "Demand is stable at ~%.0f units/month. Maintain current stock levels.",
                average
            );
        };
    }
}
