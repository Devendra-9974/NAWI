package com.metrologix.attachment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByTestCaseIdOrderByCreatedAtDesc(Long testCaseId);
    List<Attachment> findByInstrumentIdOrderByCreatedAtDesc(Long instrumentId);
    List<Attachment> findByTestCaseIdAndIncludeInReportTrue(Long testCaseId);
}
