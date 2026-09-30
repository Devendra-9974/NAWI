package com.metrologix.standard;

import com.metrologix.common.enums.AccuracyClass;
import com.metrologix.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StandardService {

    private final StandardRepository standardRepository;
    private final StandardVersionRepository standardVersionRepository;
    private final RuleRepository ruleRepository;
    private final TestDefinitionRepository testDefinitionRepository;

    public List<Standard> getAllStandards() {
        return standardRepository.findAll();
    }

    public List<StandardVersion> getActiveVersions() {
        return standardVersionRepository.findByActiveTrue();
    }

    public StandardVersion getVersionById(Long id) {
        return standardVersionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StandardVersion", "id", id));
    }

    public List<Rule> getRulesByVersion(Long versionId) {
        return ruleRepository.findByStandardVersionId(versionId);
    }

    public List<Rule> getRulesByVersionAndClass(Long versionId, AccuracyClass accuracyClass) {
        return ruleRepository.findByStandardVersionIdAndAccuracyClass(versionId, accuracyClass);
    }

    public List<TestDefinition> getTestDefinitionsByVersion(Long versionId) {
        return testDefinitionRepository.findByStandardVersionIdAndActiveTrueOrderBySequenceOrderAsc(versionId);
    }
}
