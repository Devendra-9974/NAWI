package com.metrologix.testcase;

import com.metrologix.audit.AuditService;
import com.metrologix.calculation.CalculationEngine;
import com.metrologix.common.enums.ReviewAction;
import com.metrologix.common.enums.TestResult;
import com.metrologix.common.enums.TestStatus;
import com.metrologix.compliance.ComplianceEngine;
import com.metrologix.compliance.PointComplianceResult;
import com.metrologix.common.exception.BadRequestException;
import com.metrologix.common.exception.ResourceNotFoundException;
import com.metrologix.instrument.Instrument;
import com.metrologix.instrument.InstrumentRepository;
import com.metrologix.laboratory.Laboratory;
import com.metrologix.laboratory.LaboratoryRepository;
import com.metrologix.ruleengine.MpeEvaluationResult;
import com.metrologix.ruleengine.OimlRuleEngine;
import com.metrologix.standard.StandardService;
import com.metrologix.standard.StandardVersion;
import com.metrologix.standard.StandardVersionRepository;
import com.metrologix.standard.TestDefinition;
import com.metrologix.user.User;
import com.metrologix.user.UserRepository;
import com.metrologix.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TestCaseService {

    private final TestCaseRepository testCaseRepository;
    private final LaboratoryConditionRepository laboratoryConditionRepository;
    private final TestExecutionRepository testExecutionRepository;
    private final TestObservationRepository testObservationRepository;
    private final ReviewRecordRepository reviewRecordRepository;
    private final InstrumentRepository instrumentRepository;
    private final LaboratoryRepository laboratoryRepository;
    private final StandardVersionRepository standardVersionRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final StandardService standardService;
    private final CalculationEngine calculationEngine;
    private final OimlRuleEngine oimlRuleEngine;
    private final ComplianceEngine complianceEngine;
    private final AuditService auditService;
    private final com.metrologix.signature.DigitalSignatureService digitalSignatureService;

    public List<TestCaseDto> getAllTestCases() {
        return testCaseRepository.findAll().stream()
                .map(TestCaseDto::fromEntity)
                .collect(Collectors.toList());
    }

    public Page<TestCaseDto> searchTestCases(TestStatus status, TestResult result, String query, Pageable pageable) {
        return testCaseRepository.searchTestCases(status, result, query, pageable)
                .map(TestCaseDto::fromEntity);
    }

    public TestCaseDto getTestCaseDtoById(Long id) {
        TestCase testCase = getTestCaseEntityById(id);
        return TestCaseDto.fromEntity(testCase);
    }

    public TestCase getTestCaseEntityById(Long id) {
        return testCaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TestCase", "id", id));
    }

    @Transactional
    public TestCaseDto createTestCase(CreateTestCaseRequest request, String username) {
        Instrument instrument = instrumentRepository.findById(request.getInstrumentId())
                .orElseThrow(() -> new ResourceNotFoundException("Instrument", "id", request.getInstrumentId()));

        Laboratory laboratory = laboratoryRepository.findById(request.getLaboratoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Laboratory", "id", request.getLaboratoryId()));

        StandardVersion standardVersion = standardVersionRepository.findById(request.getStandardVersionId())
                .orElseThrow(() -> new ResourceNotFoundException("StandardVersion", "id", request.getStandardVersionId()));

        User technician = userService.findByUsername(username);

        User reviewer = null;
        if (request.getReviewerId() != null) {
            reviewer = userRepository.findById(request.getReviewerId())
                    .orElseThrow(() -> new ResourceNotFoundException("User (Reviewer)", "id", request.getReviewerId()));
        }

        // Generate unique test ID: TEST-YYYY-XXXX
        long count = testCaseRepository.count() + 1;
        String testId = String.format("TEST-%d-%04d", Year.now().getValue(), count);
        while (testCaseRepository.existsByTestId(testId)) {
            count++;
            testId = String.format("TEST-%d-%04d", Year.now().getValue(), count);
        }

        TestCase testCase = TestCase.builder()
                .testId(testId)
                .instrument(instrument)
                .laboratory(laboratory)
                .standardVersion(standardVersion)
                .technician(technician)
                .reviewer(reviewer)
                .status(TestStatus.DRAFT)
                .overallResult(TestResult.PENDING)
                .startDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.now())
                .remarks(request.getRemarks())
                .build();

        TestCase saved = testCaseRepository.save(testCase);

        // Instantiate test executions for all active test definitions of this standard version
        List<TestDefinition> definitions = standardService.getTestDefinitionsByVersion(standardVersion.getId());
        List<TestExecution> executions = new ArrayList<>();
        for (TestDefinition def : definitions) {
            TestExecution exec = TestExecution.builder()
                    .testCase(saved)
                    .testDefinition(def)
                    .status("PENDING")
                    .testResult(TestResult.PENDING)
                    .build();
            executions.add(testExecutionRepository.save(exec));
        }
        saved.setTestExecutions(executions);

        auditService.log(technician.getId(), username, "TEST_CREATED", "TestCase", saved.getId(),
                "Created test case " + saved.getTestId() + " for instrument " + instrument.getInstrumentId(), null);

        return TestCaseDto.fromEntity(saved);
    }

    @Transactional
    public LaboratoryConditionDto saveLaboratoryConditions(Long testCaseId, LaboratoryConditionDto dto, String username) {
        TestCase testCase = getTestCaseEntityById(testCaseId);
        checkCanEditTest(testCase);

        LaboratoryCondition cond = laboratoryConditionRepository.findByTestCaseId(testCaseId)
                .orElse(LaboratoryCondition.builder().testCase(testCase).build());

        cond.setTemperatureCelsius(dto.getTemperatureCelsius());
        cond.setRelativeHumidityPct(dto.getRelativeHumidityPct());
        cond.setAtmosphericPressureHpa(dto.getAtmosphericPressureHpa());
        cond.setReferenceStandardsUsed(dto.getReferenceStandardsUsed());
        cond.setCalibrationCertNo(dto.getCalibrationCertNo());
        cond.setOperatorName(dto.getOperatorName());
        cond.setRemarks(dto.getRemarks());

        LaboratoryCondition saved = laboratoryConditionRepository.save(cond);
        if (testCase.getStatus() == TestStatus.DRAFT) {
            testCase.setStatus(TestStatus.TESTING);
            testCaseRepository.save(testCase);
        }

        return LaboratoryConditionDto.fromEntity(saved);
    }

    @Transactional
    public TestExecutionDto recordObservations(Long testCaseId, Long testExecutionId,
                                              ObservationBatchRequest request, String username) {
        TestCase testCase = getTestCaseEntityById(testCaseId);
        checkCanEditTest(testCase);

        TestExecution execution = testExecutionRepository.findById(testExecutionId)
                .orElseThrow(() -> new ResourceNotFoundException("TestExecution", "id", testExecutionId));

        if (!execution.getTestCase().getId().equals(testCaseId)) {
            throw new BadRequestException("TestExecution does not belong to the specified TestCase");
        }

        // Remove previous observations
        testObservationRepository.deleteByTestExecutionId(testExecutionId);
        execution.getObservations().clear();

        List<TestObservation> newObservations = new ArrayList<>();
        int idx = 1;
        for (ObservationBatchRequest.ObservationInputItem item : request.getObservations()) {
            TestObservation obs = TestObservation.builder()
                    .testExecution(execution)
                    .pointIndex(item.getPointIndex() != null ? item.getPointIndex() : idx++)
                    .loadDirection(item.getLoadDirection())
                    .appliedLoad(item.getAppliedLoad())
                    .nominalValue(item.getNominalValue())
                    .indicatedValue(item.getIndicatedValue())
                    .changeoverLoad(item.getChangeoverLoad())
                    .positionLocation(item.getPositionLocation())
                    .rawDataJson(item.getRawDataJson())
                    .build();
            newObservations.add(obs);
        }

        execution.getObservations().addAll(newObservations);
        execution.setStatus("IN_PROGRESS");
        TestExecution saved = testExecutionRepository.save(execution);

        if (testCase.getStatus() == TestStatus.DRAFT) {
            testCase.setStatus(TestStatus.TESTING);
            testCaseRepository.save(testCase);
        }

        return TestExecutionDto.fromEntity(saved);
    }

    @Transactional
    public TestExecutionDto calculateAndEvaluateExecution(Long testCaseId, Long testExecutionId, String username) {
        TestCase testCase = getTestCaseEntityById(testCaseId);
        checkCanEditTest(testCase);

        TestExecution execution = testExecutionRepository.findById(testExecutionId)
                .orElseThrow(() -> new ResourceNotFoundException("TestExecution", "id", testExecutionId));

        Instrument instrument = testCase.getInstrument();
        StandardVersion standardVersion = testCase.getStandardVersion();
        String testCode = execution.getTestDefinition().getTestCode();

        List<TestObservation> observations = testObservationRepository
                .findByTestExecutionIdOrderByPointIndexAsc(testExecutionId);

        if (observations.isEmpty()) {
            throw new BadRequestException("Cannot calculate: no observations recorded for this test");
        }

        // 1. Determine error at zero (E0) for corrected error calculation (Ec = E - E0)
        BigDecimal errorAtZero = BigDecimal.ZERO;
        for (TestObservation obs : observations) {
            if (obs.getAppliedLoad().compareTo(BigDecimal.ZERO) == 0) {
                errorAtZero = calculationEngine.calculateError(
                        obs.getIndicatedValue(),
                        obs.getAppliedLoad(),
                        instrument.getScaleIntervalE(),
                        obs.getChangeoverLoad()
                );
                break;
            }
        }

        boolean allPointsPass = true;

        // 2. Calculate error and evaluate compliance for each observation point
        for (TestObservation obs : observations) {
            BigDecimal error = calculationEngine.calculateError(
                    obs.getIndicatedValue(),
                    obs.getAppliedLoad(),
                    instrument.getScaleIntervalE(),
                    obs.getChangeoverLoad()
            );

            BigDecimal correctedError = calculationEngine.calculateCorrectedError(error, errorAtZero);

            // Determine OIML R 76 MPE
            MpeEvaluationResult mpeResult = oimlRuleEngine.determineMpe(
                    standardVersion,
                    instrument.getAccuracyClass(),
                    testCode,
                    obs.getAppliedLoad(),
                    instrument.getScaleIntervalE()
            );

            // Evaluate compliance
            PointComplianceResult compliance = complianceEngine.evaluatePoint(error, correctedError, mpeResult);

            obs.setErrorValue(error);
            obs.setCorrectedError(correctedError);
            obs.setMpeValue(mpeResult.getMpeValue());
            obs.setPointCompliance(compliance.getStatus());

            if (compliance.getStatus() != TestResult.PASS) {
                allPointsPass = false;
            }
        }

        testObservationRepository.saveAll(observations);

        // For Repeatability: check spread (Delta I = max - min)
        if ("REPEATABILITY".equals(testCode)) {
            List<BigDecimal> indications = observations.stream()
                    .map(TestObservation::getIndicatedValue)
                    .collect(Collectors.toList());
            BigDecimal spread = calculationEngine.calculateRepeatabilitySpread(indications);
            BigDecimal testLoad = observations.get(0).getAppliedLoad();
            MpeEvaluationResult mpeResult = oimlRuleEngine.determineMpe(
                    standardVersion,
                    instrument.getAccuracyClass(),
                    testCode,
                    testLoad,
                    instrument.getScaleIntervalE()
            );
            PointComplianceResult repCompliance = complianceEngine.evaluateRepeatability(spread, mpeResult.getMpeValue());
            if (repCompliance.getStatus() != TestResult.PASS) {
                allPointsPass = false;
            }
            execution.setSummaryNotes(String.format("Repeatability spread Delta I = %s %s. MPE limit = %s %s. Result: %s",
                    spread.stripTrailingZeros().toPlainString(), instrument.getUnit(),
                    mpeResult.getMpeValue().stripTrailingZeros().toPlainString(), instrument.getUnit(),
                    repCompliance.getStatus()));
        }

        execution.setStatus("COMPLETED");
        execution.setTestResult(allPointsPass ? TestResult.PASS : TestResult.FAIL);
        execution.setEvaluatedRuleVersion(standardVersion.getVersionCode());
        TestExecution updated = testExecutionRepository.save(execution);

        // Update overall test case result
        updateOverallCompliance(testCase);

        User user = userService.findByUsername(username);
        auditService.log(user.getId(), username, "CALCULATION_EXECUTED", "TestExecution", execution.getId(),
                "Executed OIML R 76 calculations & compliance for " + testCode + " -> " + execution.getTestResult(), null);

        return TestExecutionDto.fromEntity(updated);
    }

    private void updateOverallCompliance(TestCase testCase) {
        List<TestExecution> executions = testExecutionRepository.findByTestCaseId(testCase.getId());

        boolean hasFail = false;
        boolean allComplete = true;

        for (TestExecution exec : executions) {
            if (exec.getTestResult() == TestResult.FAIL) {
                hasFail = true;
            } else if (exec.getTestResult() == TestResult.PENDING || !"COMPLETED".equals(exec.getStatus())) {
                allComplete = false;
            }
        }

        if (hasFail) {
            testCase.setOverallResult(TestResult.FAIL);
        } else if (allComplete) {
            testCase.setOverallResult(TestResult.PASS);
        } else {
            testCase.setOverallResult(TestResult.INCOMPLETE);
        }

        testCaseRepository.save(testCase);
    }

    @Transactional
    public TestCaseDto submitForReview(Long testCaseId, String username) {
        TestCase testCase = getTestCaseEntityById(testCaseId);
        checkCanEditTest(testCase);

        if (testCase.getLaboratoryCondition() == null) {
            throw new BadRequestException("Cannot submit test: Laboratory conditions have not been recorded");
        }

        List<TestExecution> executions = testExecutionRepository.findByTestCaseId(testCaseId);
        boolean hasAnyCompleted = executions.stream().anyMatch(e -> "COMPLETED".equals(e.getStatus()));
        if (!hasAnyCompleted) {
            throw new BadRequestException("Cannot submit test: At least one test procedure must be executed");
        }

        testCase.setStatus(TestStatus.SUBMITTED);
        TestCase saved = testCaseRepository.save(testCase);

        User user = userService.findByUsername(username);
        ReviewRecord record = ReviewRecord.builder()
                .testCase(saved)
                .reviewer(user)
                .action(ReviewAction.SUBMIT)
                .comments("Test submitted for reviewer verification by " + user.getFullName())
                .build();
        reviewRecordRepository.save(record);

        auditService.log(user.getId(), username, "TEST_SUBMITTED", "TestCase", saved.getId(),
                "Submitted test case " + saved.getTestId() + " for review", null);

        return TestCaseDto.fromEntity(saved);
    }

    @Transactional
    public TestCaseDto processReview(Long testCaseId, ReviewSubmissionRequest request, String reviewerUsername) {
        TestCase testCase = getTestCaseEntityById(testCaseId);

        if (testCase.getStatus() != TestStatus.SUBMITTED && testCase.getStatus() != TestStatus.UNDER_REVIEW) {
            throw new BadRequestException("Test is not in a reviewable state (current state: " + testCase.getStatus() + ")");
        }

        User reviewer = userService.findByUsername(reviewerUsername);

        ReviewRecord record = ReviewRecord.builder()
                .testCase(testCase)
                .reviewer(reviewer)
                .action(request.getAction())
                .comments(request.getComments())
                .build();
        reviewRecordRepository.save(record);

        if (request.getAction() == ReviewAction.APPROVE) {
            testCase.setStatus(TestStatus.APPROVED);
            testCase.setReviewer(reviewer);
            testCase.setCompletionDate(LocalDate.now());
            auditService.log(reviewer.getId(), reviewerUsername, "TEST_APPROVED", "TestCase", testCase.getId(),
                    "Approved test case " + testCase.getTestId() + ". Verdict: " + testCase.getOverallResult(), null);

            // Automatically apply digital signature upon approval if requested or by default
            if (Boolean.TRUE.equals(request.getSignImmediately()) || request.getSignatureDeclaration() != null) {
                com.metrologix.signature.DigitalSignature signature = digitalSignatureService.signTestCase(testCase.getId(), reviewerUsername,
                        request.getSignatureDeclaration(), request.getSignerRole());
                testCase.setDigitalSignature(signature);
                auditService.log(reviewer.getId(), reviewerUsername, "REPORT_FINALIZED", "TestCase", testCase.getId(),
                        "Test case " + testCase.getTestId() + " finalized with legal digital signature", null);
            }
        } else if (request.getAction() == ReviewAction.REQUEST_CHANGES || request.getAction() == ReviewAction.REJECT) {
            testCase.setStatus(TestStatus.REJECTED);
            auditService.log(reviewer.getId(), reviewerUsername, "TEST_REJECTED", "TestCase", testCase.getId(),
                    "Rejected test case " + testCase.getTestId() + ". Reason: " + request.getComments(), null);
        }

        TestCase saved = testCaseRepository.save(testCase);
        return TestCaseDto.fromEntity(saved);
    }

    private void checkCanEditTest(TestCase testCase) {
        if (testCase.getStatus() == TestStatus.APPROVED ||
            testCase.getStatus() == TestStatus.REPORT_GENERATED ||
            testCase.getStatus() == TestStatus.ARCHIVED) {
            throw new BadRequestException("Test is finalized and cannot be modified (current status: " + testCase.getStatus() + ")");
        }
    }
}
