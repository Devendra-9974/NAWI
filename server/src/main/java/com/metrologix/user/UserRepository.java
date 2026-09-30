package com.metrologix.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    java.util.List<User> findByApprovalStatus(com.metrologix.common.enums.ApprovalStatus approvalStatus);
    java.util.Optional<User> findByEmailVerificationToken(String token);
    java.util.Optional<User> findByPasswordResetToken(String token);
    java.util.List<User> findAllByOrderByCreatedAtDesc();
}
