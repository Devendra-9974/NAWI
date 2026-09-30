package com.metrologix.attachment;

import com.metrologix.audit.AuditService;
import com.metrologix.common.enums.AttachmentCategory;
import com.metrologix.common.exception.BadRequestException;
import com.metrologix.common.exception.ResourceNotFoundException;
import com.metrologix.instrument.Instrument;
import com.metrologix.instrument.InstrumentRepository;
import com.metrologix.testcase.TestCase;
import com.metrologix.testcase.TestCaseRepository;
import com.metrologix.testcase.TestExecution;
import com.metrologix.testcase.TestExecutionRepository;
import com.metrologix.user.User;
import com.metrologix.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final TestCaseRepository testCaseRepository;
    private final InstrumentRepository instrumentRepository;
    private final TestExecutionRepository testExecutionRepository;
    private final UserService userService;
    private final AuditService auditService;

    @Value("${app.storage.attachments-dir:./uploads/attachments}")
    private String attachmentsDir;

    public List<AttachmentDto> getAttachmentsByTestCase(Long testCaseId) {
        return attachmentRepository.findByTestCaseIdOrderByCreatedAtDesc(testCaseId).stream()
                .map(AttachmentDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<AttachmentDto> getAttachmentsByInstrument(Long instrumentId) {
        return attachmentRepository.findByInstrumentIdOrderByCreatedAtDesc(instrumentId).stream()
                .map(AttachmentDto::fromEntity)
                .collect(Collectors.toList());
    }

    public Attachment getAttachmentEntity(Long id) {
        return attachmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment", "id", id));
    }

    @Transactional
    public AttachmentDto uploadAttachment(MultipartFile file,
                                          AttachmentCategory category,
                                          Long testCaseId,
                                          Long instrumentId,
                                          Long testExecutionId,
                                          String description,
                                          Boolean includeInReport,
                                          String username) {
        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded file cannot be empty");
        }

        User user = userService.findByUsername(username);

        TestCase testCase = null;
        if (testCaseId != null) {
            testCase = testCaseRepository.findById(testCaseId)
                    .orElseThrow(() -> new ResourceNotFoundException("TestCase", "id", testCaseId));
        }

        Instrument instrument = null;
        if (instrumentId != null) {
            instrument = instrumentRepository.findById(instrumentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Instrument", "id", instrumentId));
        } else if (testCase != null) {
            instrument = testCase.getInstrument();
        }

        TestExecution testExecution = null;
        if (testExecutionId != null) {
            testExecution = testExecutionRepository.findById(testExecutionId)
                    .orElseThrow(() -> new ResourceNotFoundException("TestExecution", "id", testExecutionId));
        }

        try {
            Path targetDir = Paths.get(attachmentsDir);
            if (!Files.exists(targetDir)) {
                Files.createDirectories(targetDir);
            }

            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "attachment.bin";
            String ext = "";
            int dotIdx = originalName.lastIndexOf('.');
            if (dotIdx > 0) {
                ext = originalName.substring(dotIdx);
            }

            String safeFileName = UUID.randomUUID().toString() + "_" + originalName.replaceAll("[^a-zA-Z0-9.-]", "_");
            Path targetPath = targetDir.resolve(safeFileName);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            Attachment attachment = Attachment.builder()
                    .fileName(safeFileName)
                    .originalFileName(originalName)
                    .contentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                    .fileSize(file.getSize())
                    .category(category != null ? category : AttachmentCategory.OTHER_EVIDENCE)
                    .description(description)
                    .filePath(targetPath.toAbsolutePath().toString())
                    .uploadedBy(user)
                    .testCase(testCase)
                    .instrument(instrument)
                    .testExecution(testExecution)
                    .includeInReport(includeInReport != null ? includeInReport : true)
                    .build();

            Attachment saved = attachmentRepository.save(attachment);

            auditService.log(user.getId(), username, "ATTACHMENT_UPLOADED", "Attachment", saved.getId(),
                    "Uploaded " + saved.getCategory() + " (" + originalName + ", " + file.getSize() + " bytes)" +
                            (testCase != null ? " for test " + testCase.getTestId() : ""), null);

            return AttachmentDto.fromEntity(saved);

        } catch (IOException e) {
            log.error("Failed to store attachment file", e);
            throw new RuntimeException("Could not store attachment file: " + e.getMessage(), e);
        }
    }

    public byte[] getAttachmentBytes(Long id) {
        Attachment attachment = getAttachmentEntity(id);
        try {
            Path path = Paths.get(attachment.getFilePath());
            return Files.readAllBytes(path);
        } catch (IOException e) {
            throw new RuntimeException("Could not read attachment file: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteAttachment(Long id, String username) {
        Attachment attachment = getAttachmentEntity(id);
        User user = userService.findByUsername(username);

        // Security check: only uploader or admin can delete
        if (!user.getRole().name().equals("ADMIN") && !attachment.getUploadedBy().getId().equals(user.getId())) {
            throw new BadRequestException("You do not have permission to delete this attachment");
        }

        try {
            Path path = Paths.get(attachment.getFilePath());
            Files.deleteIfExists(path);
        } catch (Exception e) {
            log.warn("Failed to delete physical attachment file at {}: {}", attachment.getFilePath(), e.getMessage());
        }

        attachmentRepository.delete(attachment);

        auditService.log(user.getId(), username, "ATTACHMENT_DELETED", "Attachment", id,
                "Deleted attachment " + attachment.getOriginalFileName(), null);
    }
}
