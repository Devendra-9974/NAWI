package com.metrologix.user;

import com.metrologix.auth.dto.RegisterRequest;
import com.metrologix.auth.dto.RejectUserRequest;
import com.metrologix.auth.dto.UpdateRoleRequest;
import com.metrologix.auth.dto.UserDto;
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
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management and admin approval endpoints (ADMIN only)")
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getAllUsers()));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all pending user approval requests")
    public ResponseEntity<ApiResponse<List<UserDto>>> getPendingUsers() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getPendingUsers()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getUserById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin directly adds user (pre-approved)")
    public ResponseEntity<ApiResponse<UserDto>> createUser(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("User created successfully with immediate approval", userService.createUser(request)));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin approves pending signup")
    public ResponseEntity<ApiResponse<UserDto>> approveUser(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("User successfully approved and activated", userService.approveUser(id)));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin rejects pending signup")
    public ResponseEntity<ApiResponse<UserDto>> rejectUser(@PathVariable Long id, @RequestBody(required = false) RejectUserRequest request) {
        String reason = request != null ? request.getReason() : "Application rejected by administrator";
        return ResponseEntity.ok(ApiResponse.ok("User registration rejected", userService.rejectUser(id, reason)));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin updates user role")
    public ResponseEntity<ApiResponse<UserDto>> updateUserRole(@PathVariable Long id, @Valid @RequestBody UpdateRoleRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("User role updated successfully", userService.updateUserRole(id, request.getRole())));
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Toggle user active status")
    public ResponseEntity<ApiResponse<UserDto>> toggleUserStatus(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("User status updated", userService.toggleUserStatus(id)));
    }
}
