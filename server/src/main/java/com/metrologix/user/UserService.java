package com.metrologix.user;

import com.metrologix.audit.AuditService;
import com.metrologix.auth.dto.RegisterRequest;
import com.metrologix.auth.dto.UserDto;
import com.metrologix.common.enums.ApprovalStatus;
import com.metrologix.common.enums.Role;
import com.metrologix.common.exception.BadRequestException;
import com.metrologix.common.exception.ResourceNotFoundException;
import com.metrologix.laboratory.Laboratory;
import com.metrologix.laboratory.LaboratoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final LaboratoryRepository laboratoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public List<UserDto> getAllUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<UserDto> getPendingUsers() {
        return userRepository.findByApprovalStatus(ApprovalStatus.PENDING).stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return UserDto.fromEntity(user);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    /**
     * Self-registration flow: user is unverified, pending admin approval, inactive.
     */
    @Transactional
    public UserRegistrationResult selfRegister(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        Laboratory lab = null;
        if (request.getLaboratoryId() != null) {
            lab = laboratoryRepository.findById(request.getLaboratoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Laboratory", "id", request.getLaboratoryId()));
        } else {
            // Assign first available lab as default if not specified
            List<Laboratory> labs = laboratoryRepository.findAll();
            if (!labs.isEmpty()) {
                lab = labs.get(0);
            }
        }

        // Generate 6-digit numeric verification code
        String verificationCode = String.format("%06d", new Random().nextInt(900000) + 100000);

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(request.getRole() != null ? request.getRole() : Role.TECHNICIAN)
                .laboratory(lab)
                .active(false)
                .approvalStatus(ApprovalStatus.PENDING)
                .emailVerified(false)
                .emailVerificationToken(verificationCode)
                .emailVerificationExpiresAt(LocalDateTime.now().plusHours(24))
                .build();

        User saved = userRepository.save(user);

        auditService.log(saved.getId(), saved.getUsername(), "USER_REGISTERED", "User", saved.getId(),
                "User self-registered as " + saved.getRole() + " (Pending verification & approval)", null);

        return new UserRegistrationResult(UserDto.fromEntity(saved), verificationCode);
    }

    /**
     * Email verification: validates token, sets emailVerified = true.
     */
    @Transactional
    public UserDto verifyEmail(String token, String email) {
        User user;
        if (token != null && !token.trim().isEmpty()) {
            user = userRepository.findByEmailVerificationToken(token.trim())
                    .or(() -> email != null ? userRepository.findByEmail(email.trim()) : java.util.Optional.empty())
                    .orElseThrow(() -> new BadRequestException("Invalid or expired verification code"));
        } else if (email != null) {
            user = userRepository.findByEmail(email.trim())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        } else {
            throw new BadRequestException("Verification token is required");
        }

        if (user.getEmailVerificationExpiresAt() != null &&
                user.getEmailVerificationExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Verification token has expired. Please request a new one.");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationExpiresAt(null);
        User saved = userRepository.save(user);

        auditService.log(saved.getId(), saved.getUsername(), "EMAIL_VERIFIED", "User", saved.getId(),
                "Email address successfully verified for " + saved.getEmail(), null);

        return UserDto.fromEntity(saved);
    }

    /**
     * Request password reset: generates reset token.
     */
    @Transactional
    public String requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email.trim())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        String resetToken = String.format("%06d", new Random().nextInt(900000) + 100000);
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetExpiresAt(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        auditService.log(user.getId(), user.getUsername(), "PASSWORD_RESET_REQUESTED", "User", user.getId(),
                "Password reset requested for email " + email, null);

        return resetToken;
    }

    /**
     * Reset password using token.
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByPasswordResetToken(token.trim())
                .orElseThrow(() -> new BadRequestException("Invalid or expired password reset code"));

        if (user.getPasswordResetExpiresAt() != null &&
                user.getPasswordResetExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Password reset code has expired. Please request a new code.");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiresAt(null);
        userRepository.save(user);

        auditService.log(user.getId(), user.getUsername(), "PASSWORD_RESET", "User", user.getId(),
                "Password successfully reset", null);
    }

    /**
     * Admin direct user creation: immediately approved, verified, and active.
     */
    @Transactional
    public UserDto createUser(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        Laboratory lab = null;
        if (request.getLaboratoryId() != null) {
            lab = laboratoryRepository.findById(request.getLaboratoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Laboratory", "id", request.getLaboratoryId()));
        } else {
            List<Laboratory> labs = laboratoryRepository.findAll();
            if (!labs.isEmpty()) {
                lab = labs.get(0);
            }
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(request.getRole() != null ? request.getRole() : Role.TECHNICIAN)
                .laboratory(lab)
                .active(true)
                .approvalStatus(ApprovalStatus.APPROVED)
                .emailVerified(true)
                .build();

        User saved = userRepository.save(user);

        auditService.log(saved.getId(), saved.getUsername(), "USER_CREATED_BY_ADMIN", "User", saved.getId(),
                "Admin created user " + saved.getUsername() + " with role " + saved.getRole(), null);

        return UserDto.fromEntity(saved);
    }

    /**
     * Admin approves pending signup.
     */
    @Transactional
    public UserDto approveUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        user.setApprovalStatus(ApprovalStatus.APPROVED);
        user.setEmailVerified(true);
        user.setActive(true);
        user.setRejectionReason(null);
        User saved = userRepository.save(user);

        auditService.log(saved.getId(), saved.getUsername(), "USER_APPROVED", "User", saved.getId(),
                "Administrator approved user registration for " + saved.getUsername() + " (" + saved.getRole() + ")", null);

        return UserDto.fromEntity(saved);
    }

    /**
     * Admin rejects pending signup.
     */
    @Transactional
    public UserDto rejectUser(Long id, String reason) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        user.setApprovalStatus(ApprovalStatus.REJECTED);
        user.setActive(false);
        user.setRejectionReason(reason != null ? reason : "Registration application rejected by administrator.");
        User saved = userRepository.save(user);

        auditService.log(saved.getId(), saved.getUsername(), "USER_REJECTED", "User", saved.getId(),
                "Administrator rejected registration for " + saved.getUsername() + ". Reason: " + reason, null);

        return UserDto.fromEntity(saved);
    }

    /**
     * Admin updates user role.
     */
    @Transactional
    public UserDto updateUserRole(Long id, Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        Role oldRole = user.getRole();
        user.setRole(role);
        User saved = userRepository.save(user);

        auditService.log(saved.getId(), saved.getUsername(), "USER_ROLE_UPDATED", "User", saved.getId(),
                "Role changed from " + oldRole + " to " + role, null);

        return UserDto.fromEntity(saved);
    }

    /**
     * Admin toggles active / deactivated status.
     */
    @Transactional
    public UserDto toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        boolean newStatus = !user.isActive();
        user.setActive(newStatus);
        User saved = userRepository.save(user);

        auditService.log(saved.getId(), saved.getUsername(), "USER_STATUS_TOGGLED", "User", saved.getId(),
                "User account " + (newStatus ? "ACTIVATED" : "DEACTIVATED"), null);

        return UserDto.fromEntity(saved);
    }

    public record UserRegistrationResult(UserDto user, String verificationCode) {}
}
