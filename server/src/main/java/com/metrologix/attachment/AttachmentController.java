package com.metrologix.attachment;

import com.metrologix.common.dto.ApiResponse;
import com.metrologix.common.enums.AttachmentCategory;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/attachments")
@RequiredArgsConstructor
@Tag(name = "Attachments & Evidence", description = "Endpoints for uploading photographs and supporting testing documents")
public class AttachmentController {

    private final AttachmentService attachmentService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'REVIEWER', 'ADMIN')")
    @Operation(summary = "Upload photograph or supporting document")
    public ResponseEntity<ApiResponse<AttachmentDto>> uploadAttachment(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", defaultValue = "OTHER_EVIDENCE") AttachmentCategory category,
            @RequestParam(value = "testCaseId", required = false) Long testCaseId,
            @RequestParam(value = "instrumentId", required = false) Long instrumentId,
            @RequestParam(value = "testExecutionId", required = false) Long testExecutionId,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "includeInReport", defaultValue = "true") Boolean includeInReport,
            @AuthenticationPrincipal UserDetails userDetails) {

        String username = userDetails != null ? userDetails.getUsername() : "technician";
        AttachmentDto dto = attachmentService.uploadAttachment(
                file, category, testCaseId, instrumentId, testExecutionId, description, includeInReport, username);

        return ResponseEntity.ok(ApiResponse.ok("Attachment uploaded successfully", dto));
    }

    @GetMapping("/test/{testCaseId}")
    @Operation(summary = "Get all attachments for a specific test case")
    public ResponseEntity<ApiResponse<List<AttachmentDto>>> getAttachmentsByTestCase(@PathVariable Long testCaseId) {
        return ResponseEntity.ok(ApiResponse.ok(attachmentService.getAttachmentsByTestCase(testCaseId)));
    }

    @GetMapping("/instrument/{instrumentId}")
    @Operation(summary = "Get all attachments for a specific instrument")
    public ResponseEntity<ApiResponse<List<AttachmentDto>>> getAttachmentsByInstrument(@PathVariable Long instrumentId) {
        return ResponseEntity.ok(ApiResponse.ok(attachmentService.getAttachmentsByInstrument(instrumentId)));
    }

    @GetMapping("/{id}/download")
    @Operation(summary = "Download attachment file")
    public ResponseEntity<byte[]> downloadAttachment(@PathVariable Long id) {
        Attachment attachment = attachmentService.getAttachmentEntity(id);
        byte[] fileBytes = attachmentService.getAttachmentBytes(id);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getOriginalFileName() + "\"")
                .contentType(MediaType.parseMediaType(attachment.getContentType()))
                .body(fileBytes);
    }

    @GetMapping("/{id}/preview")
    @Operation(summary = "Inline preview for images or PDFs")
    public ResponseEntity<byte[]> previewAttachment(@PathVariable Long id) {
        Attachment attachment = attachmentService.getAttachmentEntity(id);
        byte[] fileBytes = attachmentService.getAttachmentBytes(id);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + attachment.getOriginalFileName() + "\"")
                .contentType(MediaType.parseMediaType(attachment.getContentType()))
                .body(fileBytes);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    @Operation(summary = "Delete an attachment")
    public ResponseEntity<ApiResponse<String>> deleteAttachment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : "technician";
        attachmentService.deleteAttachment(id, username);
        return ResponseEntity.ok(ApiResponse.ok("Attachment deleted successfully"));
    }
}
