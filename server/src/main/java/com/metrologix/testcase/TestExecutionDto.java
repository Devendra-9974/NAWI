package com.metrologix.testcase;

import com.metrologix.common.enums.TestResult;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestExecutionDto {
    private Long id;
    private Long testCaseId;
    private Long testDefinitionId;
    private String testCode;
    private String testName;
    private String category;
    private Integer sequenceOrder;
    private String status;
    private TestResult testResult;
    private String evaluatedRuleVersion;
    private String summaryNotes;
    private LocalDateTime executedAt;
    @Builder.Default
    private List<TestObservationDto> observations = new ArrayList<>();

    public static TestExecutionDto fromEntity(TestExecution e) {
        if (e == null) return null;
        return TestExecutionDto.builder()
                .id(e.getId())
                .testCaseId(e.getTestCase() != null ? e.getTestCase().getId() : null)
                .testDefinitionId(e.getTestDefinition() != null ? e.getTestDefinition().getId() : null)
                .testCode(e.getTestDefinition() != null ? e.getTestDefinition().getTestCode() : null)
                .testName(e.getTestDefinition() != null ? e.getTestDefinition().getTestName() : null)
                .category(e.getTestDefinition() != null ? e.getTestDefinition().getCategory() : null)
                .sequenceOrder(e.getTestDefinition() != null ? e.getTestDefinition().getSequenceOrder() : 1)
                .status(e.getStatus())
                .testResult(e.getTestResult())
                .evaluatedRuleVersion(e.getEvaluatedRuleVersion())
                .summaryNotes(e.getSummaryNotes())
                .executedAt(e.getExecutedAt())
                .observations(e.getObservations() != null ?
                        e.getObservations().stream().map(TestObservationDto::fromEntity).collect(Collectors.toList()) :
                        new ArrayList<>())
                .build();
    }
}
