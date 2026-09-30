package com.metrologix.standard;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StandardVersionRepository extends JpaRepository<StandardVersion, Long> {
    Optional<StandardVersion> findByVersionCode(String versionCode);
    List<StandardVersion> findByActiveTrue();
}
