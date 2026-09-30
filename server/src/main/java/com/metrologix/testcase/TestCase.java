package com.metrologix.testcase;

import com.metrologix.common.enums.TestResult;
import com.metrologix.common.enums.TestStatus;
import com.metrologix.instrument.Instrument;
import com.metrologix.laboratory.Laboratory;
import com.metrologix.standard.StandardVersion;
import com.metrologix.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "test_cases")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "test_id", nullable = false, unique = true, length = 50)
    private String testId; // e.g. TEST-2026-0001

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "instrument_id", nullable = false)
    private Instrument instrument;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "laboratory_id", nullable = false)
    private Laboratory laboratory;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "standard_version_id", nullable = false)
    private StandardVersion standardVersion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "technician_id", nullable = false)
    private User technician;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reviewer_id")
    private User reviewer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private TestStatus status = TestStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "overall_result", nullable = false, length = 50)
    @Builder.Default
    private TestResult overallResult = TestResult.PENDING;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "completion_date")
    private LocalDate completionDate;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @OneToOne(mappedBy = "testCase", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private LaboratoryCondition laboratoryCondition;

    @OneToMany(mappedBy = "testCase", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TestExecution> testExecutions = new ArrayList<>();

    @OneToMany(mappedBy = "testCase", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ReviewRecord> reviewRecords = new ArrayList<>();

    @OneToOne(mappedBy = "testCase", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private com.metrologix.signature.DigitalSignature digitalSignature;

    @OneToMany(mappedBy = "testCase", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<com.metrologix.attachment.Attachment> attachments = new java.util.ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
