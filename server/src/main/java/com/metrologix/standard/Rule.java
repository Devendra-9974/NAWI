package com.metrologix.standard;

import com.metrologix.common.enums.AccuracyClass;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "rules")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Rule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "standard_version_id", nullable = false)
    private StandardVersion standardVersion;

    @Column(name = "test_code", nullable = false, length = 100)
    private String testCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "accuracy_class", nullable = false, length = 50)
    private AccuracyClass accuracyClass;

    @Column(name = "rule_name", nullable = false)
    private String ruleName;

    @Column(name = "min_load_e", nullable = false, precision = 18, scale = 4)
    private BigDecimal minLoadE;

    @Column(name = "max_load_e", nullable = false, precision = 18, scale = 4)
    private BigDecimal maxLoadE;

    @Column(name = "mpe_factor_e", nullable = false, precision = 18, scale = 4)
    private BigDecimal mpeFactorE;

    @Builder.Default
    @Column(name = "is_official")
    private boolean isOfficial = true;

    @Column(columnDefinition = "TEXT")
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
