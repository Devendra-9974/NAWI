package com.metrologix.instrument;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InstrumentRepository extends JpaRepository<Instrument, Long> {
    Optional<Instrument> findByInstrumentId(String instrumentId);
    Optional<Instrument> findBySerialNumber(String serialNumber);
    boolean existsByInstrumentId(String instrumentId);
    boolean existsBySerialNumber(String serialNumber);

    @Query("SELECT i FROM Instrument i WHERE " +
           "LOWER(i.instrumentId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(i.modelName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(i.serialNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(i.manufacturer.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Instrument> searchInstruments(@Param("query") String query, Pageable pageable);

    @Query("SELECT COUNT(i) FROM Instrument i")
    long countTotalInstruments();
}
