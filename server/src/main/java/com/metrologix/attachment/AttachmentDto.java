package com.metrologix.attachment;

import com.metrologix.common.enums.AttachmentCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttachmentDto {
    private Long id;
    private String fileName;
    private String originalFileName;
    private String contentType;
    private Long fileSize;
    private AttachmentCategory category;
    private String description;
    private Long uploadedById;
    private String uploadedByName;
    private Long testCaseId;
    private Long instrumentId;
    private Long testExecutionId;
    private boolean includeInReport;
    private LocalDateTime createdAt;

    public static AttachmentDto fromEntity(Attachment attachment) {
        if (attachment == null) return null;
        return AttachmentDto.builder()
                .id(attachment.getId())
                .fileName(attachment.getFileName())
                .originalFileName(attachment.getOriginalFileName())
                .contentType(attachment.getContentType())
                .fileSize(attachment.getFileSize())
                .category(attachment.getCategory())
                .description(attachment.getDescription())
                .uploadedById(attachment.getUploadedBy() != null ? attachment.getUploadedBy().getId() : null)
                .uploadedByName(attachment.getUploadedBy() != null ? attachment.getUploadedBy().getFullName() : null)
                .testCaseId(attachment.getTestCase() != null ? attachment.getTestCase().getId() : null)
                .instrumentId(attachment.getInstrument() != null ? attachment.getInstrument().getId() : null)
                .testExecutionId(attachment.getTestExecution() != null ? attachment.getTestExecution().getId() : null)
                .includeInReport(attachment.isIncludeInReport())
                .createdAt(attachment.getCreatedAt())
                .build();
    }
}
