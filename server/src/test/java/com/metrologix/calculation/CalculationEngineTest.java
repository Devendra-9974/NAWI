package com.metrologix.calculation;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CalculationEngineTest {

    private CalculationEngine calculationEngine;

    @BeforeEach
    void setUp() {
        calculationEngine = new CalculationEngine();
    }

    @Test
    @DisplayName("Direct error calculation without changeover load: E = I - L")
    void testDirectErrorCalculation() {
        BigDecimal indicated = new BigDecimal("50.03");
        BigDecimal applied = new BigDecimal("50.00");

        BigDecimal error = calculationEngine.calculateError(indicated, applied, null, null);

        // Expected: 50.03 - 50.00 = +0.030000
        assertEquals(new BigDecimal("0.030000"), error);
    }

    @Test
    @DisplayName("OIML R 76 Clause A.4.4.3 changeover rounding error calculation: E = I + 0.5e - deltaL - L")
    void testChangeoverRoundingCalculation() {
        // e = 0.01 kg (10 g)
        BigDecimal e = new BigDecimal("0.01");
        BigDecimal indicated = new BigDecimal("10.00");
        BigDecimal deltaL = new BigDecimal("0.002"); // 2 g changeover weights added
        BigDecimal applied = new BigDecimal("10.00");

        // P = 10.00 + 0.5*0.01 - 0.002 = 10.00 + 0.005 - 0.002 = 10.003
        // E = P - L = 10.003 - 10.00 = +0.003000
        BigDecimal error = calculationEngine.calculateError(indicated, applied, e, deltaL);

        assertEquals(new BigDecimal("0.003000"), error);
    }

    @Test
    @DisplayName("Corrected error: Ec = E - E0")
    void testCorrectedError() {
        BigDecimal error = new BigDecimal("0.004000");
        BigDecimal errorAtZero = new BigDecimal("0.001000");

        BigDecimal corrected = calculationEngine.calculateCorrectedError(error, errorAtZero);

        assertEquals(new BigDecimal("0.003000"), corrected);
    }

    @Test
    @DisplayName("Repeatability spread: Delta I = max(I) - min(I)")
    void testRepeatabilitySpread() {
        List<BigDecimal> series = Arrays.asList(
                new BigDecimal("15.000"),
                new BigDecimal("15.004"),
                new BigDecimal("14.998")
        );

        BigDecimal spread = calculationEngine.calculateRepeatabilitySpread(series);

        // max: 15.004, min: 14.998 -> spread = 0.006000
        assertEquals(new BigDecimal("0.006000"), spread);
    }

    @Test
    @DisplayName("Load in scale intervals: m_e = L / e")
    void testLoadInScaleIntervals() {
        BigDecimal load = new BigDecimal("20.00");
        BigDecimal e = new BigDecimal("0.01");

        BigDecimal loadInE = calculationEngine.calculateLoadInScaleIntervals(load, e);

        // 20.00 / 0.01 = 2000.0000 e
        assertEquals(new BigDecimal("2000.0000"), loadInE);
    }
}
