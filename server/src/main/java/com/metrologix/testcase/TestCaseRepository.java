package com.metrologix.testcase;

import com.metrologix.common.enums.TestResult;
import com.metrologix.common.enums.TestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestCaseRepository extends JpaRepository<TestCase, Long> {
    Optional<TestCase> findByTestId(String testId);
    boolean existsByTestId(String testId);

    List<TestCase> findByTechnicianId(Long technicianId);
    List<TestCase> findByStatus(TestStatus status);

    long countByStatus(TestStatus status);
    long countByOverallResult(TestResult result);

    @Query("SELECT t FROM TestCase t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:result IS NULL OR t.overallResult = :result) AND " +
           "(:query IS NULL OR " +
           " LOWER(t.testId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(t.instrument.instrumentId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(t.instrument.serialNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(t.instrument.modelName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(t.instrument.manufacturer.name) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<TestCase> searchTestCases(
            @Param("status") TestStatus status,
            @Param("result") TestResult result,
            @Param("query") String query,
            Pageable pageable);

    @Query("SELECT FUNCTION('DATE_FORMAT', t.createdAt, '%Y-%m') as month, COUNT(t) as count " +
           "FROM TestCase t GROUP BY FUNCTION('DATE_FORMAT', t.createdAt, '%Y-%m') ORDER BY month ASC")
    List<Object[]> findMonthlyTestCounts();
}
