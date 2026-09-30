package com.metrologix.standard;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "test_definitions", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"standard_version_id", "test_code"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestDefinition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "standard_version_id", nullable = false)
    private StandardVersion standardVersion;

    @Column(name = "test_code", nullable = false, length = 100)
    private String testCode;

    @Column(name = "test_name", nullable = false)
    private String testName;

    @Column(nullable = false, length = 100)
    private String category;

    @Builder.Default
    @Column(name = "sequence_order", nullable = false)
    private Integer sequenceOrder = 1;

    @Builder.Default
    private boolean active = true;

    @Column(name = "configuration_json", columnDefinition = "TEXT")
    private String configurationJson;
}
