package com.metrologix.signature;

import com.metrologix.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/signatures")
@RequiredArgsConstructor
@Tag(name = "Digital Signatures", description = "Endpoints for digital signatures and metrological certification")
public class DigitalSignatureController {

    private final DigitalSignatureService digitalSignatureService;

    @GetMapping("/test/{testCaseId}")
    @Operation(summary = "Get digital signature details for a test case")
    public ResponseEntity<ApiResponse<DigitalSignatureDto>> getSignature(@PathVariable Long testCaseId) {
        return digitalSignatureService.getSignatureByTestCase(testCaseId)
                .map(dto -> ResponseEntity.ok(ApiResponse.ok(dto)))
                .orElse(ResponseEntity.ok(ApiResponse.ok("No digital signature applied yet", null)));
    }

    @PostMapping("/test/{testCaseId}/sign")
    @PreAuthorize("hasAnyRole('REVIEWER', 'ADMIN')")
    @Operation(summary = "Apply digital signature to an approved test case")
    public ResponseEntity<ApiResponse<DigitalSignatureDto>> signTestCase(
            @PathVariable Long testCaseId,
            @RequestBody(required = false) SignRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : "reviewer";
        String declaration = request != null ? request.getDeclaration() : null;
        String role = request != null ? request.getSignerRole() : null;

        DigitalSignature sig = digitalSignatureService.signTestCase(testCaseId, username, declaration, role);
        return ResponseEntity.ok(ApiResponse.ok("Digital signature applied successfully", DigitalSignatureDto.fromEntity(sig)));
    }

    @Data
    public static class SignRequest {
        private String declaration;
        private String signerRole;
        private String pin;
    }
}
