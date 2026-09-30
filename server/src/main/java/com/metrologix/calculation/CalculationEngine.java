package com.metrologix.calculation;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class CalculationEngine {

    public static final int PRECISION_SCALE = 6;
    public static final RoundingMode ROUNDING_MODE = RoundingMode.HALF_UP;

    /**
     * Calculates the error before rounding according to OIML R 76-1:2006 Clause A.4.4.3:
     * E = I + 0.5 * e - deltaL - L
     *
     * If changeover load (deltaL) is not supplied:
     * E = I - L
     *
     * @param indicatedValue I (indication observed on instrument)
     * @param appliedLoad L (actual reference test load applied)
     * @param scaleIntervalE e (verification scale interval)
     * @param changeoverLoad deltaL (additional small weights added to reach next changeover point, optional)
     * @return Calculated error E
     */
    public BigDecimal calculateError(BigDecimal indicatedValue, BigDecimal appliedLoad,
                                   BigDecimal scaleIntervalE, BigDecimal changeoverLoad) {
        if (indicatedValue == null || appliedLoad == null) {
            throw new IllegalArgumentException("Indicated value and applied load cannot be null");
        }

        if (changeoverLoad != null && scaleIntervalE != null && scaleIntervalE.compareTo(BigDecimal.ZERO) > 0) {
            // E = I + 0.5*e - deltaL - L
            BigDecimal halfE = scaleIntervalE.multiply(new BigDecimal("0.5"));
            BigDecimal p = indicatedValue.add(halfE).subtract(changeoverLoad);
            return p.subtract(appliedLoad).setScale(PRECISION_SCALE, ROUNDING_MODE);
        } else {
            // Direct error: E = I - L
            return indicatedValue.subtract(appliedLoad).setScale(PRECISION_SCALE, ROUNDING_MODE);
        }
    }

    /**
     * Calculates corrected error according to OIML R 76 Clause A.4.4.3:
     * Ec = E - E0
     * where E0 is the error calculated at zero (or minimum load).
     */
    public BigDecimal calculateCorrectedError(BigDecimal error, BigDecimal errorAtZero) {
        if (error == null) {
            return null;
        }
        if (errorAtZero == null) {
            return error;
        }
        return error.subtract(errorAtZero).setScale(PRECISION_SCALE, ROUNDING_MODE);
    }

    /**
     * Calculates repeatability spread (difference between max and min indication)
     * Delta I = I_max - I_min
     */
    public BigDecimal calculateRepeatabilitySpread(List<BigDecimal> indications) {
        if (indications == null || indications.isEmpty()) {
            throw new IllegalArgumentException("Indications list cannot be null or empty");
        }
        BigDecimal min = indications.stream().min(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        BigDecimal max = indications.stream().max(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        return max.subtract(min).setScale(PRECISION_SCALE, ROUNDING_MODE);
    }

    /**
     * Calculates load expressed in units of verification scale intervals:
     * m_e = Load / e
     */
    public BigDecimal calculateLoadInScaleIntervals(BigDecimal load, BigDecimal scaleIntervalE) {
        if (load == null || scaleIntervalE == null || scaleIntervalE.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Invalid load or scale interval e");
        }
        return load.divide(scaleIntervalE, 4, ROUNDING_MODE);
    }
}
