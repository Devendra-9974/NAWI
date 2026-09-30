package com.metrologix.ruleengine;

import com.metrologix.calculation.CalculationEngine;
import com.metrologix.common.enums.AccuracyClass;
import com.metrologix.common.exception.ResourceNotFoundException;
import com.metrologix.standard.Rule;
import com.metrologix.standard.RuleRepository;
import com.metrologix.standard.StandardVersion;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class OimlRuleEngine {

    private final RuleRepository ruleRepository;
    private final CalculationEngine calculationEngine;

    /**
     * Evaluates the applicable Maximum Permissible Error (mpe) for a given load according to
     * the versioned OIML R 76 rules.
     */
    public MpeEvaluationResult determineMpe(
            StandardVersion standardVersion,
            AccuracyClass accuracyClass,
            String testCode,
            BigDecimal appliedLoad,
            BigDecimal scaleIntervalE) {

        if (appliedLoad == null || scaleIntervalE == null || scaleIntervalE.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Applied load and scale interval e must be valid positive values");
        }

        BigDecimal loadInE = calculationEngine.calculateLoadInScaleIntervals(appliedLoad, scaleIntervalE);

        // Find matching rule in database for standardVersion, testCode, accuracyClass, and loadInE
        Optional<Rule> matchingRule = ruleRepository.findMatchingRule(
                standardVersion.getId(),
                testCode,
                accuracyClass,
                loadInE
        );

        if (matchingRule.isEmpty()) {
            // Fallback for edge cases (e.g. exactly 0 load)
            matchingRule = ruleRepository.findMatchingRule(
                    standardVersion.getId(),
                    testCode,
                    accuracyClass,
                    BigDecimal.ZERO
            );
        }

        Rule rule = matchingRule.orElseThrow(() -> new ResourceNotFoundException(
                String.format("No applicable OIML rule found for version %s, test %s, class %s at load %s e",
                        standardVersion.getVersionCode(), testCode, accuracyClass, loadInE)));

        BigDecimal mpeValue = rule.getMpeFactorE().multiply(scaleIntervalE)
                .setScale(CalculationEngine.PRECISION_SCALE, RoundingMode.HALF_UP);

        String explanation = String.format(
                "OIML R 76 (%s) - %s: Applied load = %s (%s e). Rule: %s (%s <= m <= %s e) => mpe = +/- %s e = +/- %s",
                standardVersion.getVersionCode(),
                accuracyClass.getDisplayName(),
                appliedLoad.stripTrailingZeros().toPlainString(),
                loadInE.stripTrailingZeros().toPlainString(),
                rule.getRuleName(),
                rule.getMinLoadE().stripTrailingZeros().toPlainString(),
                rule.getMaxLoadE().stripTrailingZeros().toPlainString(),
                rule.getMpeFactorE().stripTrailingZeros().toPlainString(),
                mpeValue.stripTrailingZeros().toPlainString()
        );

        return MpeEvaluationResult.builder()
                .ruleId(rule.getId())
                .ruleName(rule.getRuleName())
                .standardVersionCode(standardVersion.getVersionCode())
                .loadInE(loadInE)
                .mpeFactorE(rule.getMpeFactorE())
                .mpeValue(mpeValue)
                .explanation(explanation)
                .build();
    }
}
