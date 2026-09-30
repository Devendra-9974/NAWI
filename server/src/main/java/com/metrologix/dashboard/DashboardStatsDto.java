package com.metrologix.dashboard;

import com.metrologix.report.ReportDto;
import com.metrologix.testcase.TestCaseDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private long totalInstruments;
    private long testsInProgress;
    private long testsSubmitted;
    private long testsUnderReview;
    private long testsApproved;
    private long testsRejected;
    private long totalReportsGenerated;
    private long totalPass;
    private long totalFail;

    private List<TestCaseDto> recentTests;
    private List<ReportDto> recentReports;
    private List<TestCaseDto> pendingReviewActions;

    private Map<String, Long> statusDistribution;
    private Map<String, Long> resultDistribution;
    private List<MonthlyMetric> monthlyTrends;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MonthlyMetric {
        private String month;
        private long count;
    }
}
