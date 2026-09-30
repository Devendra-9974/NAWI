package com.metrologix.testcase;

import com.metrologix.common.enums.LoadDirection;
import com.metrologix.common.enums.LoadPosition;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ObservationBatchRequest {
    @NotNull(message = "Observations list cannot be null")
    private List<ObservationInputItem> observations;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ObservationInputItem {
        private Integer pointIndex;
        private LoadDirection loadDirection;
        @NotNull(message = "Applied load is required")
        private BigDecimal appliedLoad;
        private BigDecimal nominalValue;
        @NotNull(message = "Indicated value is required")
        private BigDecimal indicatedValue;
        private BigDecimal changeoverLoad;
        private LoadPosition positionLocation;
        private String rawDataJson;
    }
}
