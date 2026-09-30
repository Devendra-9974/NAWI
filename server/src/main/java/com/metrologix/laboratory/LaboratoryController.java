package com.metrologix.laboratory;

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
@RequestMapping("/api/laboratories")
@RequiredArgsConstructor
@Tag(name = "Laboratories", description = "Laboratory management endpoints")
public class LaboratoryController {

    private final LaboratoryService laboratoryService;

    @GetMapping
    @Operation(summary = "Get all laboratories")
    public ResponseEntity<ApiResponse<List<Laboratory>>> getAllLaboratories() {
        return ResponseEntity.ok(ApiResponse.ok(laboratoryService.getAllLaboratories()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get laboratory by ID")
    public ResponseEntity<ApiResponse<Laboratory>> getLaboratoryById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(laboratoryService.getLaboratoryById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new laboratory (ADMIN only)")
    public ResponseEntity<ApiResponse<Laboratory>> createLaboratory(@Valid @RequestBody Laboratory lab) {
        return ResponseEntity.ok(ApiResponse.ok("Laboratory created successfully", laboratoryService.createLaboratory(lab)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update laboratory (ADMIN only)")
    public ResponseEntity<ApiResponse<Laboratory>> updateLaboratory(@PathVariable Long id, @Valid @RequestBody Laboratory lab) {
        return ResponseEntity.ok(ApiResponse.ok("Laboratory updated successfully", laboratoryService.updateLaboratory(id, lab)));
    }
}
