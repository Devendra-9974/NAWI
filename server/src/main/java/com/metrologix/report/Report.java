package com.metrologix.report;

import com.metrologix.common.enums.FileFormat;
import com.metrologix.testcase.TestCase;
import com.metrologix.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "report_number", nullable = false, unique = true, length = 100)
    private String reportNumber; // e.g. LM/2026/00001

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "test_case_id", nullable = false)
    private TestCase testCase;

    @Builder.Default
    @Column(name = "report_version")
    private Integer reportVersion = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "file_format", nullable = false, length = 20)
    private FileFormat fileFormat; // PDF, DOCX

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "checksum_sha256", length = 64)
    private String checksumSha256;

    @Column(name = "digital_signature_reference", length = 100)
    private String digitalSignatureReference;

    @Column(name = "signed_by_name", length = 150)
    private String signedByName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "generated_by")
    private User generatedBy;

    @CreationTimestamp
    @Column(name = "generated_at", updatable = false)
    private LocalDateTime generatedAt;
}
