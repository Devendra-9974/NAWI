package com.metrologix.testcase;

import com.metrologix.common.enums.TestResult;
import com.metrologix.common.enums.TestStatus;
import com.metrologix.instrument.InstrumentDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestCaseDto {
    private Long id;
    private String testId;
    private InstrumentDto instrument;
    private Long laboratoryId;
    private String laboratoryName;
    private Long standardVersionId;
    private String standardVersionCode;
    private Long technicianId;
    private String technicianName;
    private Long reviewerId;
    private String reviewerName;
    private TestStatus status;
    private TestResult overallResult;
    private LocalDate startDate;
    private LocalDate completionDate;
    private String remarks;
    private LaboratoryConditionDto laboratoryCondition;
    @Builder.Default
    private List<TestExecutionDto> testExecutions = new ArrayList<>();
    @Builder.Default
    private List<ReviewRecordDto> reviewRecords = new ArrayList<>();
    private com.metrologix.signature.DigitalSignatureDto digitalSignature;
    @Builder.Default
    private List<com.metrologix.attachment.AttachmentDto> attachments = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TestCaseDto fromEntity(TestCase t) {
        if (t == null) return null;
        return TestCaseDto.builder()
                .id(t.getId())
                .testId(t.getTestId())
                .instrument(InstrumentDto.fromEntity(t.getInstrument()))
                .laboratoryId(t.getLaboratory() != null ? t.getLaboratory().getId() : null)
                .laboratoryName(t.getLaboratory() != null ? t.getLaboratory().getLabName() : null)
                .standardVersionId(t.getStandardVersion() != null ? t.getStandardVersion().getId() : null)
                .standardVersionCode(t.getStandardVersion() != null ? t.getStandardVersion().getVersionCode() : null)
                .technicianId(t.getTechnician() != null ? t.getTechnician().getId() : null)
                .technicianName(t.getTechnician() != null ? t.getTechnician().getFullName() : null)
                .reviewerId(t.getReviewer() != null ? t.getReviewer().getId() : null)
                .reviewerName(t.getReviewer() != null ? t.getReviewer().getFullName() : null)
                .status(t.getStatus())
                .overallResult(t.getOverallResult())
                .startDate(t.getStartDate())
                .completionDate(t.getCompletionDate())
                .remarks(t.getRemarks())
                .laboratoryCondition(t.getLaboratoryCondition() != null ? LaboratoryConditionDto.fromEntity(t.getLaboratoryCondition()) : null)
                .testExecutions(t.getTestExecutions() != null ?
                        t.getTestExecutions().stream().map(TestExecutionDto::fromEntity).collect(Collectors.toList()) :
                        new ArrayList<>())
                .reviewRecords(t.getReviewRecords() != null ?
                        t.getReviewRecords().stream().map(ReviewRecordDto::fromEntity).collect(Collectors.toList()) :
                        new ArrayList<>())
                .digitalSignature(com.metrologix.signature.DigitalSignatureDto.fromEntity(t.getDigitalSignature()))
                .attachments(t.getAttachments() != null ?
                        t.getAttachments().stream().map(com.metrologix.attachment.AttachmentDto::fromEntity).collect(Collectors.toList()) :
                        new ArrayList<>())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
