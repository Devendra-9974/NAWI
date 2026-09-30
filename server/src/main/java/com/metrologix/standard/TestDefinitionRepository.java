package com.metrologix.standard;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestDefinitionRepository extends JpaRepository<TestDefinition, Long> {
    List<TestDefinition> findByStandardVersionIdAndActiveTrueOrderBySequenceOrderAsc(Long standardVersionId);
    Optional<TestDefinition> findByStandardVersionIdAndTestCode(Long standardVersionId, String testCode);
}
