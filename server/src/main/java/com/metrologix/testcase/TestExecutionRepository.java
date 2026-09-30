package com.metrologix.testcase;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestExecutionRepository extends JpaRepository<TestExecution, Long> {
    List<TestExecution> findByTestCaseId(Long testCaseId);
    Optional<TestExecution> findByTestCaseIdAndTestDefinitionId(Long testCaseId, Long testDefinitionId);
    Optional<TestExecution> findByTestCaseIdAndTestDefinitionTestCode(Long testCaseId, String testCode);
}
