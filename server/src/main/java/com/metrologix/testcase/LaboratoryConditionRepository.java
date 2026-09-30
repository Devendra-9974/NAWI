package com.metrologix.testcase;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LaboratoryConditionRepository extends JpaRepository<LaboratoryCondition, Long> {
    Optional<LaboratoryCondition> findByTestCaseId(Long testCaseId);
}
