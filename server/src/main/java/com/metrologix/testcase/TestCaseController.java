package com.metrologix.testcase;

import com.metrologix.common.dto.ApiResponse;
import com.metrologix.common.enums.TestResult;
import com.metrologix.common.enums.TestStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tests")
@RequiredArgsConstructor
@Tag(name = "Test Cases", description = "NAWI Test Case workflow, observation entry, and evaluation endpoints")
public class TestCaseController {

    private final TestCaseService testCaseService;

    @GetMapping
    @Operation(summary = "Get all test cases")
    public ResponseEntity<ApiResponse<List<TestCaseDto>>> getAllTestCases() {
        return ResponseEntity.ok(ApiResponse.ok(testCaseService.getAllTestCases()));
    }

    @GetMapping("/search")
    @Operation(summary = "Search test cases with pagination and filters")
    public ResponseEntity<ApiResponse<Page<TestCaseDto>>> searchTestCases(
            @RequestParam(required = false) TestStatus status,
            @RequestParam(required = false) TestResult result,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                testCaseService.searchTestCases(status, result, query, PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get test case by ID")
    public ResponseEntity<ApiResponse<TestCaseDto>> getTestCaseById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(testCaseService.getTestCaseDtoById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    @Operation(summary = "Create a new NAWI test evaluation case")
    public ResponseEntity<ApiResponse<TestCaseDto>> createTestCase(
            @Valid @RequestBody CreateTestCaseRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TestCaseDto created = testCaseService.createTestCase(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Test case created successfully", created));
    }

    @PostMapping("/{id}/conditions")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    @Operation(summary = "Save laboratory and environmental conditions for test case")
    public ResponseEntity<ApiResponse<LaboratoryConditionDto>> saveLaboratoryConditions(
            @PathVariable Long id,
            @Valid @RequestBody LaboratoryConditionDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        LaboratoryConditionDto saved = testCaseService.saveLaboratoryConditions(id, dto, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Laboratory conditions recorded", saved));
    }

    @PostMapping("/{id}/executions/{executionId}/observations")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    @Operation(summary = "Record observation measurements for a test execution")
    public ResponseEntity<ApiResponse<TestExecutionDto>> recordObservations(
            @PathVariable Long id,
            @PathVariable Long executionId,
            @Valid @RequestBody ObservationBatchRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TestExecutionDto updated = testCaseService.recordObservations(id, executionId, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Observations recorded successfully", updated));
    }

    @PostMapping("/{id}/executions/{executionId}/calculate")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    @Operation(summary = "Run backend Calculation Engine and OIML R 76 Rule Compliance Engine")
    public ResponseEntity<ApiResponse<TestExecutionDto>> calculateAndEvaluate(
            @PathVariable Long id,
            @PathVariable Long executionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        TestExecutionDto evaluated = testCaseService.calculateAndEvaluateExecution(id, executionId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Calculations and compliance evaluation completed", evaluated));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    @Operation(summary = "Submit test case for reviewer inspection")
    public ResponseEntity<ApiResponse<TestCaseDto>> submitForReview(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        TestCaseDto submitted = testCaseService.submitForReview(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Test case submitted for review", submitted));
    }

    @PostMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('ADMIN', 'REVIEWER')")
    @Operation(summary = "Reviewer decision: Approve, Request changes, or Reject")
    public ResponseEntity<ApiResponse<TestCaseDto>> processReview(
            @PathVariable Long id,
            @Valid @RequestBody ReviewSubmissionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TestCaseDto result = testCaseService.processReview(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Review recorded successfully", result));
    }
}
