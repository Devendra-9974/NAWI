package com.metrologix.dashboard;

import com.metrologix.common.enums.TestResult;
import com.metrologix.common.enums.TestStatus;
import com.metrologix.instrument.InstrumentRepository;
import com.metrologix.report.ReportDto;
import com.metrologix.report.ReportRepository;
import com.metrologix.testcase.TestCase;
import com.metrologix.testcase.TestCaseDto;
import com.metrologix.testcase.TestCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final InstrumentRepository instrumentRepository;
    private final TestCaseRepository testCaseRepository;
    private final ReportRepository reportRepository;

    public DashboardStatsDto getDashboardMetrics() {
        long totalInstruments = instrumentRepository.count();
        long inProgress = testCaseRepository.countByStatus(TestStatus.TESTING) + testCaseRepository.countByStatus(TestStatus.DRAFT);
        long submitted = testCaseRepository.countByStatus(TestStatus.SUBMITTED);
        long underReview = testCaseRepository.countByStatus(TestStatus.UNDER_REVIEW);
        long approved = testCaseRepository.countByStatus(TestStatus.APPROVED) + testCaseRepository.countByStatus(TestStatus.REPORT_GENERATED);
        long rejected = testCaseRepository.countByStatus(TestStatus.REJECTED);
        long totalReports = reportRepository.count();
        long totalPass = testCaseRepository.countByOverallResult(TestResult.PASS);
        long totalFail = testCaseRepository.countByOverallResult(TestResult.FAIL);

        List<TestCaseDto> recentTests = testCaseRepository.findAll(
                PageRequest.of(0, 5, Sort.by("createdAt").descending()))
                .getContent().stream().map(TestCaseDto::fromEntity).collect(Collectors.toList());

        List<ReportDto> recentReports = reportRepository.findAll(
                PageRequest.of(0, 5, Sort.by("generatedAt").descending()))
                .getContent().stream().map(ReportDto::fromEntity).collect(Collectors.toList());

        List<TestCaseDto> pendingReviews = testCaseRepository.findByStatus(TestStatus.SUBMITTED)
                .stream().map(TestCaseDto::fromEntity).collect(Collectors.toList());

        Map<String, Long> statusDistribution = new HashMap<>();
        for (TestStatus s : TestStatus.values()) {
            long count = testCaseRepository.countByStatus(s);
            if (count > 0) statusDistribution.put(s.name(), count);
        }

        Map<String, Long> resultDistribution = new HashMap<>();
        resultDistribution.put("PASS", totalPass);
        resultDistribution.put("FAIL", totalFail);
        resultDistribution.put("INCOMPLETE", testCaseRepository.countByOverallResult(TestResult.INCOMPLETE));
        resultDistribution.put("PENDING", testCaseRepository.countByOverallResult(TestResult.PENDING));

        List<DashboardStatsDto.MonthlyMetric> monthlyMetrics = new ArrayList<>();
        try {
            List<Object[]> rows = testCaseRepository.findMonthlyTestCounts();
            for (Object[] r : rows) {
                if (r[0] != null && r[1] != null) {
                    monthlyMetrics.add(new DashboardStatsDto.MonthlyMetric(r[0].toString(), ((Number) r[1]).longValue()));
                }
            }
        } catch (Exception ignored) {}

        return DashboardStatsDto.builder()
                .totalInstruments(totalInstruments)
                .testsInProgress(inProgress)
                .testsSubmitted(submitted)
                .testsUnderReview(underReview)
                .testsApproved(approved)
                .testsRejected(rejected)
                .totalReportsGenerated(totalReports)
                .totalPass(totalPass)
                .totalFail(totalFail)
                .recentTests(recentTests)
                .recentReports(recentReports)
                .pendingReviewActions(pendingReviews)
                .statusDistribution(statusDistribution)
                .resultDistribution(resultDistribution)
                .monthlyTrends(monthlyMetrics)
                .build();
    }
}
