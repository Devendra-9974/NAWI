package com.metrologix.signature;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
@Table(name = "digital_signatures")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DigitalSignature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_case_id", nullable = false, unique = true)
    private TestCase testCase;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "signer_id", nullable = false)
    private User signer;

    @Column(name = "signature_reference", nullable = false, unique = true, length = 100)
    private String signatureReference; // e.g. SIG-LM-2026-A1B2C3

    @Column(name = "certificate_serial_number", length = 100)
    private String certificateSerialNumber;

    @Column(name = "signature_digest", nullable = false, length = 128)
    private String signatureDigest; // SHA-256 cryptographic seal

    @Column(name = "signature_algorithm", nullable = false, length = 100)
    @Builder.Default
    private String signatureAlgorithm = "SHA256withRSA / OIML Metrology Digital Seal";

    @Column(name = "declaration", columnDefinition = "TEXT")
    private String declaration;

    @Column(name = "signer_role", length = 50)
    private String signerRole;

    @CreationTimestamp
    @Column(name = "signed_at", updatable = false)
    private LocalDateTime signedAt;
}
