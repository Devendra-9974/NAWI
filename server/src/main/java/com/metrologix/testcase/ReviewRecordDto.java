package com.metrologix.testcase;

import com.metrologix.common.enums.ReviewAction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRecordDto {
    private Long id;
    private Long testCaseId;
    private Long reviewerId;
    private String reviewerName;
    private ReviewAction action;
    private String comments;
    private LocalDateTime reviewedAt;

    public static ReviewRecordDto fromEntity(ReviewRecord r) {
        if (r == null) return null;
        return ReviewRecordDto.builder()
                .id(r.getId())
                .testCaseId(r.getTestCase() != null ? r.getTestCase().getId() : null)
                .reviewerId(r.getReviewer() != null ? r.getReviewer().getId() : null)
                .reviewerName(r.getReviewer() != null ? r.getReviewer().getFullName() : null)
                .action(r.getAction())
                .comments(r.getComments())
                .reviewedAt(r.getReviewedAt())
                .build();
    }
}
