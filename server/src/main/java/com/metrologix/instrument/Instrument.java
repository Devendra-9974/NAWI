package com.metrologix.instrument;

import com.metrologix.common.enums.AccuracyClass;
import com.metrologix.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "instruments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Instrument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "instrument_id", nullable = false, unique = true, length = 50)
    private String instrumentId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "manufacturer_id", nullable = false)
    private Manufacturer manufacturer;

    @Column(name = "model_name", nullable = false, length = 150)
    private String modelName;

    @Column(name = "model_number", length = 100)
    private String modelNumber;

    @Column(name = "serial_number", nullable = false, unique = true, length = 100)
    private String serialNumber;

    @Column(name = "instrument_type", nullable = false, length = 100)
    private String instrumentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "accuracy_class", nullable = false, length = 50)
    private AccuracyClass accuracyClass;

    @Column(name = "max_capacity", nullable = false, precision = 18, scale = 6)
    private BigDecimal maxCapacity;

    @Column(name = "min_capacity", nullable = false, precision = 18, scale = 6)
    private BigDecimal minCapacity;

    @Column(name = "scale_interval_e", nullable = false, precision = 18, scale = 6)
    private BigDecimal scaleIntervalE;

    @Column(name = "scale_interval_d", nullable = false, precision = 18, scale = 6)
    private BigDecimal scaleIntervalD;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String unit = "kg";

    @Builder.Default
    @Column(name = "num_load_cells")
    private Integer numLoadCells = 1;

    @Column(name = "indicator_info")
    private String indicatorInfo;

    @Column(name = "firmware_version", length = 100)
    private String firmwareVersion;

    @Column(name = "technical_specifications", columnDefinition = "TEXT")
    private String technicalSpecifications;

    @Column(name = "photo_path", length = 500)
    private String photoPath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
