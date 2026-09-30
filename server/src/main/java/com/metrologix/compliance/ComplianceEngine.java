package com.metrologix.compliance;

import com.metrologix.common.enums.TestResult;
import com.metrologix.ruleengine.MpeEvaluationResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Slf4j
@Service
public class ComplianceEngine {

    /**
     * Evaluates a single observation point against applicable MPE.
     * Complies if |correctedError| <= mpeValue.
     */
    public PointComplianceResult evaluatePoint(
            BigDecimal error,
            BigDecimal correctedError,
            MpeEvaluationResult mpeResult) {

        BigDecimal errorToCheck = (correctedError != null) ? correctedError : error;
        if (errorToCheck == null) {
            return PointComplianceResult.builder()
                    .status(TestResult.INCOMPLETE)
                    .rationale("Error value is not calculated")
                    .build();
        }

        BigDecimal absError = errorToCheck.abs();
        BigDecimal mpe = mpeResult.getMpeValue();

        boolean passes = absError.compareTo(mpe) <= 0;
        TestResult status = passes ? TestResult.PASS : TestResult.FAIL;

        String rationale = String.format(
                "%s: |Corrected Error| = %s %s MPE Limit = %s. %s",
                status,
                absError.stripTrailingZeros().toPlainString(),
                passes ? "<=" : ">",
                mpe.stripTrailingZeros().toPlainString(),
                passes ? "Within permissible regulatory tolerance." : "EXCEEDS maximum permissible error limit!"
        );

        return PointComplianceResult.builder()
                .status(status)
                .calculatedError(error)
                .correctedError(correctedError)
                .mpeValue(mpe)
                .ruleApplied(mpeResult.getRuleName())
                .rationale(rationale)
                .build();
    }

    /**
     * Evaluates repeatability spread:
     * Complies if repeatability spread (Delta I) <= |mpe|
     */
    public PointComplianceResult evaluateRepeatability(BigDecimal spread, BigDecimal mpeLimit) {
        if (spread == null || mpeLimit == null) {
            return PointComplianceResult.builder()
                    .status(TestResult.INCOMPLETE)
                    .rationale("Missing repeatability data")
                    .build();
        }

        boolean passes = spread.compareTo(mpeLimit.abs()) <= 0;
        TestResult status = passes ? TestResult.PASS : TestResult.FAIL;

        String rationale = String.format(
                "Repeatability %s: Range Delta I = %s %s MPE Limit = %s",
                status,
                spread.stripTrailingZeros().toPlainString(),
                passes ? "<=" : ">",
                mpeLimit.abs().stripTrailingZeros().toPlainString()
        );

        return PointComplianceResult.builder()
                .status(status)
                .calculatedError(spread)
                .mpeValue(mpeLimit)
                .rationale(rationale)
                .build();
    }
}
