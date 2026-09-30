package com.metrologix.standard;

import com.metrologix.common.enums.AccuracyClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface RuleRepository extends JpaRepository<Rule, Long> {
    List<Rule> findByStandardVersionId(Long standardVersionId);

    List<Rule> findByStandardVersionIdAndAccuracyClass(Long standardVersionId, AccuracyClass accuracyClass);

    @Query("SELECT r FROM Rule r WHERE " +
           "r.standardVersion.id = :standardVersionId AND " +
           "r.testCode = :testCode AND " +
           "r.accuracyClass = :accuracyClass AND " +
           ":loadE >= r.minLoadE AND :loadE <= r.maxLoadE")
    Optional<Rule> findMatchingRule(
            @Param("standardVersionId") Long standardVersionId,
            @Param("testCode") String testCode,
            @Param("accuracyClass") AccuracyClass accuracyClass,
            @Param("loadE") BigDecimal loadE);
}
