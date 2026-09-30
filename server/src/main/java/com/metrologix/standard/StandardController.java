package com.metrologix.standard;

import com.metrologix.common.dto.ApiResponse;
import com.metrologix.common.enums.AccuracyClass;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/standards")
@RequiredArgsConstructor
@Tag(name = "OIML Standards & Rules", description = "Regulatory versions and OIML R 76 rules")
public class StandardController {

    private final StandardService standardService;

    @GetMapping
    @Operation(summary = "Get all regulatory standards")
    public ResponseEntity<ApiResponse<List<Standard>>> getAllStandards() {
        return ResponseEntity.ok(ApiResponse.ok(standardService.getAllStandards()));
    }

    @GetMapping("/versions")
    @Operation(summary = "Get active standard versions")
    public ResponseEntity<ApiResponse<List<StandardVersion>>> getActiveVersions() {
        return ResponseEntity.ok(ApiResponse.ok(standardService.getActiveVersions()));
    }

    @GetMapping("/versions/{versionId}/rules")
    @Operation(summary = "Get versioned rules by standard version ID")
    public ResponseEntity<ApiResponse<List<Rule>>> getRules(
            @PathVariable Long versionId,
            @RequestParam(required = false) AccuracyClass accuracyClass) {
        if (accuracyClass != null) {
            return ResponseEntity.ok(ApiResponse.ok(standardService.getRulesByVersionAndClass(versionId, accuracyClass)));
        }
        return ResponseEntity.ok(ApiResponse.ok(standardService.getRulesByVersion(versionId)));
    }

    @GetMapping("/versions/{versionId}/test-definitions")
    @Operation(summary = "Get configured test definitions for standard version")
    public ResponseEntity<ApiResponse<List<TestDefinition>>> getTestDefinitions(@PathVariable Long versionId) {
        return ResponseEntity.ok(ApiResponse.ok(standardService.getTestDefinitionsByVersion(versionId)));
    }
}
