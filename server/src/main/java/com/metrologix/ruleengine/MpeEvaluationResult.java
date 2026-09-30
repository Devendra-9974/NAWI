package com.metrologix.ruleengine;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MpeEvaluationResult {
    private Long ruleId;
    private String ruleName;
    private String standardVersionCode;
    private BigDecimal loadInE;
    private BigDecimal mpeFactorE;
    private BigDecimal mpeValue; // in instrument engineering unit (e.g. kg, g)
    private String explanation;
}
