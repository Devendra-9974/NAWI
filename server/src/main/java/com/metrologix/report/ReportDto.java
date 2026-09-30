package com.metrologix.report;

import com.metrologix.common.enums.FileFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportDto {
    private Long id;
    private String reportNumber;
    private Long testCaseId;
    private String testId;
    private String instrumentId;
    private String instrumentModel;
    private String manufacturerName;
    private String overallResult;
    private Integer reportVersion;
    private FileFormat fileFormat;
    private String filePath;
    private Long fileSize;
    private String checksumSha256;
    private String digitalSignatureReference;
    private String signedByName;
    private String generatedByName;
    private LocalDateTime generatedAt;

    public static ReportDto fromEntity(Report r) {
        if (r == null) return null;
        return ReportDto.builder()
                .id(r.getId())
                .reportNumber(r.getReportNumber())
                .testCaseId(r.getTestCase() != null ? r.getTestCase().getId() : null)
                .testId(r.getTestCase() != null ? r.getTestCase().getTestId() : null)
                .instrumentId(r.getTestCase() != null && r.getTestCase().getInstrument() != null ?
                        r.getTestCase().getInstrument().getInstrumentId() : null)
                .instrumentModel(r.getTestCase() != null && r.getTestCase().getInstrument() != null ?
                        r.getTestCase().getInstrument().getModelName() : null)
                .manufacturerName(r.getTestCase() != null && r.getTestCase().getInstrument() != null &&
                        r.getTestCase().getInstrument().getManufacturer() != null ?
                        r.getTestCase().getInstrument().getManufacturer().getName() : null)
                .overallResult(r.getTestCase() != null && r.getTestCase().getOverallResult() != null ?
                        r.getTestCase().getOverallResult().name() : null)
                .reportVersion(r.getReportVersion())
                .fileFormat(r.getFileFormat())
                .filePath(r.getFilePath())
                .fileSize(r.getFileSize())
                .checksumSha256(r.getChecksumSha256())
                .digitalSignatureReference(r.getDigitalSignatureReference())
                .signedByName(r.getSignedByName())
                .generatedByName(r.getGeneratedBy() != null ? r.getGeneratedBy().getFullName() : null)
                .generatedAt(r.getGeneratedAt())
                .build();
    }
}
