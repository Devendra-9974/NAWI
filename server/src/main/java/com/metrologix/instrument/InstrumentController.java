package com.metrologix.instrument;

import com.metrologix.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/instruments")
@RequiredArgsConstructor
@Tag(name = "Instruments", description = "NAWI Instrument management endpoints")
public class InstrumentController {

    private final InstrumentService instrumentService;

    @GetMapping
    @Operation(summary = "Get all registered instruments")
    public ResponseEntity<ApiResponse<List<InstrumentDto>>> getAllInstruments() {
        return ResponseEntity.ok(ApiResponse.ok(instrumentService.getAllInstruments()));
    }

    @GetMapping("/search")
    @Operation(summary = "Search instruments with pagination")
    public ResponseEntity<ApiResponse<Page<InstrumentDto>>> searchInstruments(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(instrumentService.searchInstruments(query, PageRequest.of(page, size))));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get instrument details by ID")
    public ResponseEntity<ApiResponse<InstrumentDto>> getInstrumentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(instrumentService.getInstrumentById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    @Operation(summary = "Register a new NAWI instrument")
    public ResponseEntity<ApiResponse<InstrumentDto>> createInstrument(
            @Valid @RequestBody CreateInstrumentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        InstrumentDto created = instrumentService.createInstrument(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Instrument registered successfully", created));
    }
}
