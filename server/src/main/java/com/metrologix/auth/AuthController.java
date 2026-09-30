package com.metrologix.auth;

import com.metrologix.auth.dto.*;
import com.metrologix.common.dto.ApiResponse;
import com.metrologix.common.enums.ApprovalStatus;
import com.metrologix.common.exception.BadRequestException;
import com.metrologix.security.CustomUserDetailsService;
import com.metrologix.security.JwtTokenProvider;
import com.metrologix.user.User;
import com.metrologix.user.UserRepository;
import com.metrologix.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User authentication, signup, email verification, and password reset")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final UserService userService;

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and get JWT token with full lifecycle validation")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        // Pre-authentication checks for clear user feedback
        Optional<User> userOpt = userRepository.findByUsername(loginRequest.getUsername())
                .or(() -> userRepository.findByEmail(loginRequest.getUsername()));

        if (userOpt.isPresent()) {
            User u = userOpt.get();
            if (!u.isEmailVerified()) {
                throw new BadRequestException("Email address is not yet verified. Please verify your email before logging in.");
            }
            if (u.getApprovalStatus() == ApprovalStatus.PENDING) {
                throw new BadRequestException("Your account is pending administrator approval. Please wait for an administrator to approve your account.");
            }
            if (u.getApprovalStatus() == ApprovalStatus.REJECTED) {
                String reason = u.getRejectionReason() != null ? " Reason: " + u.getRejectionReason() : "";
                throw new BadRequestException("Your registration request was rejected by the administrator." + reason);
            }
            if (!u.isActive()) {
                throw new BadRequestException("Your account is currently deactivated. Please contact your system administrator.");
            }
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        CustomUserDetailsService.CustomUserDetails userDetails =
                (CustomUserDetailsService.CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        String token = tokenProvider.generateToken(authentication, user);

        AuthResponse authResponse = AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresInMs(tokenProvider.getExpirationMs())
                .user(UserDto.fromEntity(user))
                .build();

        return ResponseEntity.ok(ApiResponse.ok("Login successful", authResponse));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(UserDto.fromEntity(user)));
    }

    @PostMapping("/register")
    @Operation(summary = "Self-registration endpoint (requires email verification + admin approval)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> register(@Valid @RequestBody RegisterRequest request) {
        UserService.UserRegistrationResult result = userService.selfRegister(request);
        Map<String, Object> data = Map.of(
                "user", result.user(),
                "verificationCode", result.verificationCode(),
                "instructions", "Please verify your email address using this verification code. After verification, an administrator must approve your account."
        );
        return ResponseEntity.ok(ApiResponse.ok("Registration successful. Verification code generated.", data));
    }

    @PostMapping("/verify-email")
    @Operation(summary = "Verify user email with verification code/token")
    public ResponseEntity<ApiResponse<UserDto>> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        UserDto verified = userService.verifyEmail(request.getToken(), request.getEmail());
        return ResponseEntity.ok(ApiResponse.ok("Email successfully verified! Your account is now pending administrator approval.", verified));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Initiate password reset flow")
    public ResponseEntity<ApiResponse<Map<String, String>>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String resetToken = userService.requestPasswordReset(request.getEmail());
        Map<String, String> data = Map.of(
                "message", "Password reset instructions and code generated.",
                "resetCode", resetToken
        );
        return ResponseEntity.ok(ApiResponse.ok("Password reset code sent", data));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Complete password reset with code")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.ok("Password reset successfully. You can now log in once your account is approved."));
    }

    @GetMapping("/pending-status")
    @Operation(summary = "Check registration and approval status by email or username")
    public ResponseEntity<ApiResponse<UserDto>> checkStatus(@RequestParam String identifier) {
        User user = userRepository.findByEmail(identifier)
                .or(() -> userRepository.findByUsername(identifier))
                .orElseThrow(() -> new BadRequestException("User not found with provided email or username"));
        return ResponseEntity.ok(ApiResponse.ok(UserDto.fromEntity(user)));
    }
}
