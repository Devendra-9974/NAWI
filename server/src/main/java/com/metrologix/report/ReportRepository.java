package com.metrologix.report;

import com.metrologix.common.enums.FileFormat;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    Optional<Report> findByReportNumber(String reportNumber);
    List<Report> findByTestCaseId(Long testCaseId);
    Optional<Report> findByTestCaseIdAndFileFormat(Long testCaseId, FileFormat fileFormat);
    boolean existsByReportNumber(String reportNumber);

    long count();

    @Query("SELECT r FROM Report r WHERE " +
           "(:format IS NULL OR r.fileFormat = :format) AND " +
           "(:query IS NULL OR " +
           " LOWER(r.reportNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(r.testCase.testId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(r.testCase.instrument.instrumentId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(r.testCase.instrument.serialNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(r.testCase.instrument.modelName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(r.testCase.instrument.manufacturer.name) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Report> searchReports(
            @Param("format") FileFormat format,
            @Param("query") String query,
            Pageable pageable);
}
