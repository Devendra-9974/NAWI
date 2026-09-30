package com.metrologix.instrument;

import com.metrologix.common.enums.AccuracyClass;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateInstrumentRequest {
    @NotNull(message = "Manufacturer ID is required")
    private Long manufacturerId;

    @NotBlank(message = "Model name is required")
    private String modelName;

    private String modelNumber;

    @NotBlank(message = "Serial number is required")
    private String serialNumber;

    @NotBlank(message = "Instrument type is required")
    private String instrumentType;

    @NotNull(message = "Accuracy class is required")
    private AccuracyClass accuracyClass;

    @NotNull(message = "Maximum capacity is required")
    @DecimalMin(value = "0.000001", message = "Max capacity must be positive")
    private BigDecimal maxCapacity;

    @NotNull(message = "Minimum capacity is required")
    @DecimalMin(value = "0.0", message = "Min capacity must be non-negative")
    private BigDecimal minCapacity;

    @NotNull(message = "Verification scale interval (e) is required")
    @DecimalMin(value = "0.000001", message = "Scale interval e must be positive")
    private BigDecimal scaleIntervalE;

    @NotNull(message = "Actual scale interval (d) is required")
    @DecimalMin(value = "0.000001", message = "Scale interval d must be positive")
    private BigDecimal scaleIntervalD;

    @Builder.Default
    private String unit = "kg";

    @Builder.Default
    private Integer numLoadCells = 1;

    private String indicatorInfo;
    private String firmwareVersion;
    private String technicalSpecifications;
    private String photoPath;
}
