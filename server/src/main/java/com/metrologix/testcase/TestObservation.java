package com.metrologix.testcase;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.metrologix.common.enums.LoadDirection;
import com.metrologix.common.enums.LoadPosition;
import com.metrologix.common.enums.TestResult;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "test_observations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestObservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_execution_id", nullable = false)
    private TestExecution testExecution;

    @Column(name = "point_index", nullable = false)
    private Integer pointIndex;

    @Enumerated(EnumType.STRING)
    @Column(name = "load_direction", length = 20)
    @Builder.Default
    private LoadDirection loadDirection = LoadDirection.INCREASING;

    @Column(name = "applied_load", nullable = false, precision = 18, scale = 6)
    private BigDecimal appliedLoad;

    @Column(name = "nominal_value", precision = 18, scale = 6)
    private BigDecimal nominalValue;

    @Column(name = "indicated_value", nullable = false, precision = 18, scale = 6)
    private BigDecimal indicatedValue;

    @Column(name = "changeover_load", precision = 18, scale = 6)
    private BigDecimal changeoverLoad; // delta L

    @Enumerated(EnumType.STRING)
    @Column(name = "position_location", length = 50)
    private LoadPosition positionLocation;

    @Column(name = "error_value", precision = 18, scale = 6)
    private BigDecimal errorValue; // E = I + 0.5e - deltaL - L

    @Column(name = "corrected_error", precision = 18, scale = 6)
    private BigDecimal correctedError; // Ec = E - E0

    @Column(name = "mpe_value", precision = 18, scale = 6)
    private BigDecimal mpeValue; // Maximum Permissible Error (+/-)

    @Enumerated(EnumType.STRING)
    @Column(name = "point_compliance", length = 20)
    private TestResult pointCompliance; // PASS, FAIL

    @Column(name = "raw_data_json", columnDefinition = "TEXT")
    private String rawDataJson;
}
