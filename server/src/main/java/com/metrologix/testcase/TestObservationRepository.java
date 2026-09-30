package com.metrologix.testcase;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestObservationRepository extends JpaRepository<TestObservation, Long> {
    List<TestObservation> findByTestExecutionIdOrderByPointIndexAsc(Long testExecutionId);
    void deleteByTestExecutionId(Long testExecutionId);
}
