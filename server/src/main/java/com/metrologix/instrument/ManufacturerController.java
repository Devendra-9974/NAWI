package com.metrologix.instrument;

import com.metrologix.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manufacturers")
@RequiredArgsConstructor
@Tag(name = "Manufacturers", description = "Instrument manufacturer endpoints")
public class ManufacturerController {

    private final InstrumentService instrumentService;

    @GetMapping
    @Operation(summary = "Get all manufacturers")
    public ResponseEntity<ApiResponse<List<ManufacturerDto>>> getAllManufacturers() {
        return ResponseEntity.ok(ApiResponse.ok(instrumentService.getAllManufacturers()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    @Operation(summary = "Create manufacturer")
    public ResponseEntity<ApiResponse<ManufacturerDto>> createManufacturer(@Valid @RequestBody Manufacturer m) {
        return ResponseEntity.ok(ApiResponse.ok("Manufacturer created successfully", instrumentService.createManufacturer(m)));
    }
}
