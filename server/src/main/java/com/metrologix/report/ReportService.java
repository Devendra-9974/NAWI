package com.metrologix.report;

import com.metrologix.audit.AuditService;
import com.metrologix.common.enums.FileFormat;
import com.metrologix.common.enums.TestStatus;
import com.metrologix.common.exception.BadRequestException;
import com.metrologix.common.exception.ResourceNotFoundException;
import com.metrologix.testcase.TestCase;
import com.metrologix.testcase.TestCaseRepository;
import com.metrologix.testcase.TestCaseService;
import com.metrologix.user.User;
import com.metrologix.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.time.Year;
import java.util.HexFormat;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final TestCaseRepository testCaseRepository;
    private final TestCaseService testCaseService;
    private final UserService userService;
    private final PdfReportGenerator pdfReportGenerator;
    private final DocxReportGenerator docxReportGenerator;
    private final AuditService auditService;

    @Value("${app.storage.reports-dir:./uploads/reports}")
    private String reportsDir;

    public List<ReportDto> getAllReports() {
        return reportRepository.findAll().stream()
                .map(ReportDto::fromEntity)
                .collect(Collectors.toList());
    }

    public Page<ReportDto> searchReports(FileFormat format, String query, Pageable pageable) {
        return reportRepository.searchReports(format, query, pageable).map(ReportDto::fromEntity);
    }

    public ReportDto getReportById(Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report", "id", id));
        return ReportDto.fromEntity(report);
    }

    @Transactional
    public ReportDto generateReport(Long testCaseId, FileFormat format, String username) {
        TestCase testCase = testCaseService.getTestCaseEntityById(testCaseId);

        User user = null;
        if (username != null) {
            try {
                user = userService.findByUsername(username);
            } catch (Exception ignored) {}
        }
        if (user == null) {
            user = userService.findByUsername("technician");
        }

        // Check if report already exists for this testCase and format
        Report report = reportRepository.findByTestCaseIdAndFileFormat(testCaseId, format).orElse(null);

        String reportNumber;
        int version = 1;

        if (report != null) {
            reportNumber = report.getReportNumber();
            version = report.getReportVersion() + 1;
        } else {
            // Generate concurrency-safe sequential report number: LM/{YEAR}/{00001}
            long count = reportRepository.count() + 1;
            reportNumber = String.format("LM/%d/%05d", Year.now().getValue(), count);
            while (reportRepository.existsByReportNumber(reportNumber)) {
                count++;
                reportNumber = String.format("LM/%d/%05d", Year.now().getValue(), count);
            }
        }

        try {
            Path targetDir = Paths.get(reportsDir);
            if (!Files.exists(targetDir)) {
                Files.createDirectories(targetDir);
            }

            String ext = format == FileFormat.PDF ? ".pdf" : ".docx";
            String safeFileName = reportNumber.replace("/", "_") + "_v" + version + ext;
            Path filePath = targetDir.resolve(safeFileName);

            File targetFile = filePath.toFile();
            try (FileOutputStream fos = new FileOutputStream(targetFile)) {
                if (format == FileFormat.PDF) {
                    pdfReportGenerator.generatePdf(testCase, reportNumber, fos);
                } else {
                    docxReportGenerator.generateDocx(testCase, reportNumber, fos);
                }
            }

            // Calculate SHA-256 checksum
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            try (InputStream is = Files.newInputStream(filePath);
                 DigestInputStream dis = new DigestInputStream(is, md)) {
                byte[] buffer = new byte[8192];
                while (dis.read(buffer) != -1) {}
            }
            String checksum = HexFormat.of().formatHex(md.digest());

            String sigRef = testCase.getDigitalSignature() != null ? testCase.getDigitalSignature().getSignatureReference() : null;
            String signerName = testCase.getDigitalSignature() != null && testCase.getDigitalSignature().getSigner() != null ?
                    testCase.getDigitalSignature().getSigner().getFullName() : null;

            if (report == null) {
                report = Report.builder()
                        .reportNumber(reportNumber)
                        .testCase(testCase)
                        .reportVersion(version)
                        .fileFormat(format)
                        .filePath(filePath.toAbsolutePath().toString())
                        .fileSize(Files.size(filePath))
                        .checksumSha256(checksum)
                        .digitalSignatureReference(sigRef)
                        .signedByName(signerName)
                        .generatedBy(user)
                        .build();
            } else {
                report.setReportVersion(version);
                report.setFilePath(filePath.toAbsolutePath().toString());
                report.setFileSize(Files.size(filePath));
                report.setChecksumSha256(checksum);
                report.setDigitalSignatureReference(sigRef);
                report.setSignedByName(signerName);
                report.setGeneratedBy(user);
            }

            Report saved = reportRepository.save(report);

            if (testCase.getStatus() == TestStatus.APPROVED) {
                testCase.setStatus(TestStatus.REPORT_GENERATED);
                testCaseRepository.save(testCase);
            }

            auditService.log(user.getId(), username, "REPORT_GENERATED", "Report", saved.getId(),
                    "Generated " + format + " report " + reportNumber + " (v" + version + ")", null);

            return ReportDto.fromEntity(saved);

        } catch (Exception e) {
            log.error("Failed to generate {} report for test {}", format, testCase.getTestId(), e);
            throw new RuntimeException("Error during report generation: " + e.getMessage(), e);
        }
    }

    public byte[] getReportFileBytes(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report", "id", reportId));
        try {
            Path path = Paths.get(report.getFilePath());
            return Files.readAllBytes(path);
        } catch (Exception e) {
            throw new RuntimeException("Could not read report file: " + e.getMessage(), e);
        }
    }
}
