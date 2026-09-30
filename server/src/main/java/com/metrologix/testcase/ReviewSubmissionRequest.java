package com.metrologix.testcase;

import com.metrologix.common.enums.ReviewAction;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewSubmissionRequest {
    @NotNull(message = "Review action is required")
    private ReviewAction action; // APPROVE, REQUEST_CHANGES, REJECT

    private String comments;

    private Boolean signImmediately;
    private String signatureDeclaration;
    private String signerRole;
}
