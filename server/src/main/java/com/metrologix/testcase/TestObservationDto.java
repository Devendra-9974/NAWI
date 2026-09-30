package com.metrologix.testcase;

import com.metrologix.common.enums.LoadDirection;
import com.metrologix.common.enums.LoadPosition;
import com.metrologix.common.enums.TestResult;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestObservationDto {
    private Long id;
    private Long testExecutionId;
    private Integer pointIndex;
    private LoadDirection loadDirection;
    private BigDecimal appliedLoad;
    private BigDecimal nominalValue;
    private BigDecimal indicatedValue;
    private BigDecimal changeoverLoad;
    private LoadPosition positionLocation;
    private BigDecimal errorValue;
    private BigDecimal correctedError;
    private BigDecimal mpeValue;
    private TestResult pointCompliance;
    private String rawDataJson;

    public static TestObservationDto fromEntity(TestObservation o) {
        if (o == null) return null;
        return TestObservationDto.builder()
                .id(o.getId())
                .testExecutionId(o.getTestExecution() != null ? o.getTestExecution().getId() : null)
                .pointIndex(o.getPointIndex())
                .loadDirection(o.getLoadDirection())
                .appliedLoad(o.getAppliedLoad())
                .nominalValue(o.getNominalValue())
                .indicatedValue(o.getIndicatedValue())
                .changeoverLoad(o.getChangeoverLoad())
                .positionLocation(o.getPositionLocation())
                .errorValue(o.getErrorValue())
                .correctedError(o.getCorrectedError())
                .mpeValue(o.getMpeValue())
                .pointCompliance(o.getPointCompliance())
                .rawDataJson(o.getRawDataJson())
                .build();
    }
}
