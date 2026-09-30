package com.metrologix.instrument;

import com.metrologix.common.enums.AccuracyClass;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstrumentDto {
    private Long id;
    private String instrumentId;
    private Long manufacturerId;
    private String manufacturerName;
    private String modelName;
    private String modelNumber;
    private String serialNumber;
    private String instrumentType;
    private AccuracyClass accuracyClass;
    private String accuracyClassDisplay;
    private BigDecimal maxCapacity;
    private BigDecimal minCapacity;
    private BigDecimal scaleIntervalE;
    private BigDecimal scaleIntervalD;
    private String unit;
    private Integer numLoadCells;
    private String indicatorInfo;
    private String firmwareVersion;
    private String technicalSpecifications;
    private String photoPath;
    private BigDecimal numberOfIntervalsN; // n = Max / e
    private LocalDateTime createdAt;

    public static InstrumentDto fromEntity(Instrument i) {
        if (i == null) return null;

        BigDecimal n = null;
        if (i.getMaxCapacity() != null && i.getScaleIntervalE() != null && i.getScaleIntervalE().compareTo(BigDecimal.ZERO) > 0) {
            n = i.getMaxCapacity().divide(i.getScaleIntervalE(), 0, RoundingMode.HALF_UP);
        }

        return InstrumentDto.builder()
                .id(i.getId())
                .instrumentId(i.getInstrumentId())
                .manufacturerId(i.getManufacturer() != null ? i.getManufacturer().getId() : null)
                .manufacturerName(i.getManufacturer() != null ? i.getManufacturer().getName() : null)
                .modelName(i.getModelName())
                .modelNumber(i.getModelNumber())
                .serialNumber(i.getSerialNumber())
                .instrumentType(i.getInstrumentType())
                .accuracyClass(i.getAccuracyClass())
                .accuracyClassDisplay(i.getAccuracyClass() != null ? i.getAccuracyClass().getDisplayName() : null)
                .maxCapacity(i.getMaxCapacity())
                .minCapacity(i.getMinCapacity())
                .scaleIntervalE(i.getScaleIntervalE())
                .scaleIntervalD(i.getScaleIntervalD())
                .unit(i.getUnit())
                .numLoadCells(i.getNumLoadCells())
                .indicatorInfo(i.getIndicatorInfo())
                .firmwareVersion(i.getFirmwareVersion())
                .technicalSpecifications(i.getTechnicalSpecifications())
                .photoPath(i.getPhotoPath())
                .numberOfIntervalsN(n)
                .createdAt(i.getCreatedAt())
                .build();
    }
}
