package com.metrologix.signature;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DigitalSignatureDto {
    private Long id;
    private Long testCaseId;
    private String testId;
    private Long signerId;
    private String signerName;
    private String signerUsername;
    private String signerRole;
    private String signatureReference;
    private String certificateSerialNumber;
    private String signatureDigest;
    private String signatureAlgorithm;
    private String declaration;
    private LocalDateTime signedAt;

    public static DigitalSignatureDto fromEntity(DigitalSignature ds) {
        if (ds == null) return null;
        return DigitalSignatureDto.builder()
                .id(ds.getId())
                .testCaseId(ds.getTestCase() != null ? ds.getTestCase().getId() : null)
                .testId(ds.getTestCase() != null ? ds.getTestCase().getTestId() : null)
                .signerId(ds.getSigner() != null ? ds.getSigner().getId() : null)
                .signerName(ds.getSigner() != null ? ds.getSigner().getFullName() : null)
                .signerUsername(ds.getSigner() != null ? ds.getSigner().getUsername() : null)
                .signerRole(ds.getSignerRole() != null ? ds.getSignerRole() :
                        (ds.getSigner() != null ? ds.getSigner().getRole().name() : "REVIEWER"))
                .signatureReference(ds.getSignatureReference())
                .certificateSerialNumber(ds.getCertificateSerialNumber())
                .signatureDigest(ds.getSignatureDigest())
                .signatureAlgorithm(ds.getSignatureAlgorithm())
                .declaration(ds.getDeclaration())
                .signedAt(ds.getSignedAt())
                .build();
    }
}
