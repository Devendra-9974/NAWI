package com.metrologix.auth.dto;

import com.metrologix.common.enums.Role;
import com.metrologix.user.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private Role role;
    private Long laboratoryId;
    private String laboratoryName;
    private boolean active;
    private com.metrologix.common.enums.ApprovalStatus approvalStatus;
    private boolean emailVerified;
    private String rejectionReason;
    private String createdAt;

    public static UserDto fromEntity(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .laboratoryId(user.getLaboratory() != null ? user.getLaboratory().getId() : null)
                .laboratoryName(user.getLaboratory() != null ? user.getLaboratory().getLabName() : null)
                .active(user.isActive())
                .approvalStatus(user.getApprovalStatus())
                .emailVerified(user.isEmailVerified())
                .rejectionReason(user.getRejectionReason())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .build();
    }
}
