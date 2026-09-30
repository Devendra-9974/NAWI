package com.metrologix.audit;

import com.metrologix.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Logs", description = "System audit trail endpoints")
public class AuditLogController {

    private final AuditService auditService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get recent audit logs (ADMIN only)")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getRecentLogs() {
        return ResponseEntity.ok(ApiResponse.ok(auditService.getRecentLogs()));
    }

    @GetMapping("/paged")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get paged audit logs")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getPagedLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(auditService.getLogs(PageRequest.of(page, size))));
    }
}
