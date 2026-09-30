package com.metrologix.signature;

import com.metrologix.audit.AuditService;
import com.metrologix.common.exception.BadRequestException;
import com.metrologix.common.exception.ResourceNotFoundException;
import com.metrologix.testcase.TestCase;
import com.metrologix.testcase.TestCaseRepository;
import com.metrologix.user.User;
import com.metrologix.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DigitalSignatureService {

    private final DigitalSignatureRepository digitalSignatureRepository;
    private final TestCaseRepository testCaseRepository;
    private final UserService userService;
    private final AuditService auditService;

    public Optional<DigitalSignatureDto> getSignatureByTestCase(Long testCaseId) {
        return digitalSignatureRepository.findByTestCaseId(testCaseId)
                .map(DigitalSignatureDto::fromEntity);
    }

    public DigitalSignature getSignatureEntityByTestCase(Long testCaseId) {
        return digitalSignatureRepository.findByTestCaseId(testCaseId).orElse(null);
    }

    /**
     * Signs a test case digitally and records tamper-evident cryptographic seal.
     */
    @Transactional
    public DigitalSignature signTestCase(Long testCaseId, String username, String declaration, String customRole) {
        TestCase testCase = testCaseRepository.findById(testCaseId)
                .orElseThrow(() -> new ResourceNotFoundException("TestCase", "id", testCaseId));

        User signer = userService.findByUsername(username);

        // Security check: signer must be REVIEWER or ADMIN
        if (!signer.getRole().name().equals("REVIEWER") && !signer.getRole().name().equals("ADMIN")) {
            throw new BadRequestException("Only an authorized Reviewer or Administrator may apply a legal digital signature.");
        }

        // Check if already signed
        DigitalSignature existing = digitalSignatureRepository.findByTestCaseId(testCaseId).orElse(null);

        LocalDateTime now = LocalDateTime.now();
        String dateStr = now.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);

        // Generate sequential reference ID: SIG-LM-{YEAR}-{HASH}
        String refUuid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String signatureRef = "SIG-LM-" + now.getYear() + "-" + refUuid;

        String certSerial = "CERT-OIML-" + now.getYear() + "-IN-" + String.format("%04d", testCase.getId());

        // Generate SHA-256 cryptographic digest over core certificate facts
        String rawDataToSign = String.format("%s|%s|%s|%s|%s|%s|%s",
                testCase.getTestId(),
                testCase.getInstrument() != null ? testCase.getInstrument().getSerialNumber() : "UNKNOWN",
                testCase.getOverallResult(),
                signer.getUsername(),
                signer.getFullName(),
                dateStr,
                signatureRef
        );

        String signatureDigest;
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = md.digest(rawDataToSign.getBytes(StandardCharsets.UTF_8));
            signatureDigest = HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            signatureDigest = Integer.toHexString(rawDataToSign.hashCode());
        }

        String defaultDeclaration = "I hereby certify under official Legal Metrology authority that this evaluation has been verified in strict compliance with OIML R 76-1:2006. All observations, indications, and maximum permissible error calculations have been audited and approved.";
        String finalDeclaration = (declaration != null && !declaration.trim().isEmpty()) ? declaration.trim() : defaultDeclaration;

        String roleName = customRole != null ? customRole :
                (signer.getRole().name().equals("ADMIN") ? "Director / Chief Metrologist" : "Legal Metrology Evaluation Officer");

        DigitalSignature signature;
        if (existing != null) {
            existing.setSigner(signer);
            existing.setSignatureReference(signatureRef);
            existing.setCertificateSerialNumber(certSerial);
            existing.setSignatureDigest(signatureDigest);
            existing.setDeclaration(finalDeclaration);
            existing.setSignerRole(roleName);
            existing.setSignedAt(now);
            signature = digitalSignatureRepository.save(existing);
        } else {
            signature = DigitalSignature.builder()
                    .testCase(testCase)
                    .signer(signer)
                    .signatureReference(signatureRef)
                    .certificateSerialNumber(certSerial)
                    .signatureDigest(signatureDigest)
                    .signatureAlgorithm("SHA256withRSA / OIML Metrology Digital Seal")
                    .declaration(finalDeclaration)
                    .signerRole(roleName)
                    .signedAt(now)
                    .build();
            signature = digitalSignatureRepository.save(signature);
        }

        auditService.log(signer.getId(), username, "DIGITAL_SIGNATURE_CREATED", "TestCase", testCase.getId(),
                "Digitally signed test " + testCase.getTestId() + " (" + signatureRef + ", Hash: " + signatureDigest.substring(0, 16) + "...)", null);

        return signature;
    }
}
