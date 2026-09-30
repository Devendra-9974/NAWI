package com.metrologix.compliance;

import com.metrologix.common.enums.TestResult;
import com.metrologix.ruleengine.MpeEvaluationResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class ComplianceEngineTest {

    private ComplianceEngine complianceEngine;

    @BeforeEach
    void setUp() {
        complianceEngine = new ComplianceEngine();
    }

    @Test
    @DisplayName("Point compliance: PASS when error within MPE limit")
    void testPointCompliancePass() {
        MpeEvaluationResult mpe = MpeEvaluationResult.builder()
                .ruleName("Class III Tier 2")
                .mpeValue(new BigDecimal("0.010000")) // +/- 10 g
                .build();

        BigDecimal error = new BigDecimal("0.007000"); // +7 g error
        PointComplianceResult result = complianceEngine.evaluatePoint(error, error, mpe);

        assertEquals(TestResult.PASS, result.getStatus());
        assertTrue(result.getRationale().contains("PASS"));
    }

    @Test
    @DisplayName("Point compliance: FAIL when error exceeds MPE limit")
    void testPointComplianceFail() {
        MpeEvaluationResult mpe = MpeEvaluationResult.builder()
                .ruleName("Class III Tier 2")
                .mpeValue(new BigDecimal("0.010000")) // +/- 10 g
                .build();

        BigDecimal error = new BigDecimal("0.012000"); // +12 g error -> EXCEEDS 10 g
        PointComplianceResult result = complianceEngine.evaluatePoint(error, error, mpe);

        assertEquals(TestResult.FAIL, result.getStatus());
        assertTrue(result.getRationale().contains("FAIL"));
    }

    @Test
    @DisplayName("Point compliance: PASS when negative error is within MPE limit")
    void testPointComplianceNegativeErrorPass() {
        MpeEvaluationResult mpe = MpeEvaluationResult.builder()
                .ruleName("Class III Tier 1")
                .mpeValue(new BigDecimal("0.005000")) // +/- 5 g
                .build();

        BigDecimal error = new BigDecimal("-0.004000"); // -4 g error
        PointComplianceResult result = complianceEngine.evaluatePoint(error, error, mpe);

        assertEquals(TestResult.PASS, result.getStatus());
    }

    @Test
    @DisplayName("Repeatability compliance evaluation: PASS when spread <= MPE")
    void testRepeatabilityPass() {
        BigDecimal spread = new BigDecimal("0.008000");
        BigDecimal mpeLimit = new BigDecimal("0.010000");

        PointComplianceResult result = complianceEngine.evaluateRepeatability(spread, mpeLimit);
        assertEquals(TestResult.PASS, result.getStatus());
    }

    @Test
    @DisplayName("Repeatability compliance evaluation: FAIL when spread > MPE")
    void testRepeatabilityFail() {
        BigDecimal spread = new BigDecimal("0.014000");
        BigDecimal mpeLimit = new BigDecimal("0.010000");

        PointComplianceResult result = complianceEngine.evaluateRepeatability(spread, mpeLimit);
        assertEquals(TestResult.FAIL, result.getStatus());
    }
}
