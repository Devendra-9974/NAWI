package com.metrologix.testcase;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTestCaseRequest {
    @NotNull(message = "Instrument ID is required")
    private Long instrumentId;

    @NotNull(message = "Laboratory ID is required")
    private Long laboratoryId;

    @NotNull(message = "OIML Standard Version ID is required")
    private Long standardVersionId;

    private Long reviewerId;
    private LocalDate startDate;
    private String remarks;
}
