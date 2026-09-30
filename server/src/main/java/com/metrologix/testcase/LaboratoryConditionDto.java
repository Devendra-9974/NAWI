package com.metrologix.testcase;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LaboratoryConditionDto {
    private Long id;
    private Long testCaseId;
    private LocalDateTime recordedAt;

    @NotNull(message = "Ambient temperature is required")
    @DecimalMin(value = "-20.0", message = "Temperature must be realistic")
    @DecimalMax(value = "60.0", message = "Temperature must be realistic")
    private BigDecimal temperatureCelsius;

    @NotNull(message = "Relative humidity is required")
    @DecimalMin(value = "0.0", message = "Humidity cannot be negative")
    @DecimalMax(value = "100.0", message = "Humidity cannot exceed 100%")
    private BigDecimal relativeHumidityPct;

    private BigDecimal atmosphericPressureHpa;
    private String referenceStandardsUsed;
    private String calibrationCertNo;
    private String operatorName;
    private String remarks;

    public static LaboratoryConditionDto fromEntity(LaboratoryCondition cond) {
        if (cond == null) return null;
        return LaboratoryConditionDto.builder()
                .id(cond.getId())
                .testCaseId(cond.getTestCase() != null ? cond.getTestCase().getId() : null)
                .recordedAt(cond.getRecordedAt())
                .temperatureCelsius(cond.getTemperatureCelsius())
                .relativeHumidityPct(cond.getRelativeHumidityPct())
                .atmosphericPressureHpa(cond.getAtmosphericPressureHpa())
                .referenceStandardsUsed(cond.getReferenceStandardsUsed())
                .calibrationCertNo(cond.getCalibrationCertNo())
                .operatorName(cond.getOperatorName())
                .remarks(cond.getRemarks())
                .build();
    }
}
