package com.metrologix.testcase;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "laboratory_conditions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LaboratoryCondition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_case_id", nullable = false, unique = true)
    private TestCase testCase;

    @CreationTimestamp
    @Column(name = "recorded_at")
    private LocalDateTime recordedAt;

    @Column(name = "temperature_celsius", nullable = false, precision = 6, scale = 2)
    private BigDecimal temperatureCelsius;

    @Column(name = "relative_humidity_pct", nullable = false, precision = 6, scale = 2)
    private BigDecimal relativeHumidityPct;

    @Column(name = "atmospheric_pressure_hpa", precision = 8, scale = 2)
    private BigDecimal atmosphericPressureHpa;

    @Column(name = "reference_standards_used")
    private String referenceStandardsUsed;

    @Column(name = "calibration_cert_no", length = 100)
    private String calibrationCertNo;

    @Column(name = "operator_name", length = 150)
    private String operatorName;

    @Column(columnDefinition = "TEXT")
    private String remarks;
}
