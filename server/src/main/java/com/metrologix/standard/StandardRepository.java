package com.metrologix.standard;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StandardRepository extends JpaRepository<Standard, Long> {
    Optional<Standard> findByStandardCode(String standardCode);
}
