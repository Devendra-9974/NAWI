package com.metrologix.signature;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DigitalSignatureRepository extends JpaRepository<DigitalSignature, Long> {
    Optional<DigitalSignature> findByTestCaseId(Long testCaseId);
    Optional<DigitalSignature> findBySignatureReference(String signatureReference);
    boolean existsByTestCaseId(Long testCaseId);
}
