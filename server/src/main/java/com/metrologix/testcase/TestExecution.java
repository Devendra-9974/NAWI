package com.metrologix.testcase;

import com.metrologix.common.enums.TestResult;
import com.metrologix.standard.TestDefinition;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "test_executions", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"test_case_id", "test_definition_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestExecution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_case_id", nullable = false)
    private TestCase testCase;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "test_definition_id", nullable = false)
    private TestDefinition testDefinition;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "PENDING"; // PENDING, IN_PROGRESS, COMPLETED

    @Enumerated(EnumType.STRING)
    @Column(name = "test_result", nullable = false, length = 50)
    @Builder.Default
    private TestResult testResult = TestResult.PENDING;

    @Column(name = "evaluated_rule_version", length = 100)
    private String evaluatedRuleVersion;

    @Column(name = "summary_notes", columnDefinition = "TEXT")
    private String summaryNotes;

    @OneToMany(mappedBy = "testExecution", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("pointIndex ASC")
    @Builder.Default
    private List<TestObservation> observations = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "executed_at", updatable = false)
    private LocalDateTime executedAt;
}
