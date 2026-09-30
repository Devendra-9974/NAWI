package com.metrologix.report;

import com.metrologix.common.dto.ApiResponse;
import com.metrologix.common.enums.FileFormat;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports & Digital Repository", description = "Report generation, preview, and repository download endpoints")
public class ReportController {

    private final ReportService reportService;

    @GetMapping
    @Operation(summary = "Get all reports")
    public ResponseEntity<ApiResponse<List<ReportDto>>> getAllReports() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getAllReports()));
    }

    @GetMapping("/search")
    @Operation(summary = "Search digital repository with pagination and filters")
    public ResponseEntity<ApiResponse<Page<ReportDto>>> searchReports(
            @RequestParam(required = false) FileFormat format,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                reportService.searchReports(format, query, PageRequest.of(page, size, Sort.by("generatedAt").descending()))));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get report metadata by ID")
    public ResponseEntity<ApiResponse<ReportDto>> getReportById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getReportById(id)));
    }

    @PostMapping("/test/{testCaseId}/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'REVIEWER', 'TECHNICIAN')")
    @Operation(summary = "Generate standardized report (PDF or DOCX)")
    public ResponseEntity<ApiResponse<ReportDto>> generateReport(
            @PathVariable Long testCaseId,
            @RequestParam(defaultValue = "PDF") FileFormat format,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : "technician";
        ReportDto report = reportService.generateReport(testCaseId, format, username);
        return ResponseEntity.ok(ApiResponse.ok("Report generated successfully", report));
    }

    @GetMapping("/{id}/download")
    @Operation(summary = "Download generated report file")
    public ResponseEntity<byte[]> downloadReport(@PathVariable Long id) {
        ReportDto report = reportService.getReportById(id);
        byte[] fileBytes = reportService.getReportFileBytes(id);

        String mediaType = report.getFileFormat() == FileFormat.PDF ?
                MediaType.APPLICATION_PDF_VALUE :
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

        String ext = report.getFileFormat() == FileFormat.PDF ? ".pdf" : ".docx";
        String filename = report.getReportNumber().replace("/", "_") + ext;

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(mediaType))
                .body(fileBytes);
    }

    @GetMapping("/{id}/preview")
    @Operation(summary = "Inline preview of generated PDF report")
    public ResponseEntity<byte[]> previewPdfReport(@PathVariable Long id) {
        ReportDto report = reportService.getReportById(id);
        byte[] fileBytes = reportService.getReportFileBytes(id);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + report.getReportNumber().replace("/", "_") + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(fileBytes);
    }
}
