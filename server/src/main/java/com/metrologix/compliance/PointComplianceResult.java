package com.metrologix.compliance;

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
public class PointComplianceResult {
    private TestResult status; // PASS or FAIL
    private BigDecimal calculatedError;
    private BigDecimal correctedError;
    private BigDecimal mpeValue;
    private String ruleApplied;
    private String rationale;
}
