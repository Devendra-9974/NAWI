package com.metrologix.standard;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "standard_versions", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"standard_id", "version_code"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StandardVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "standard_id", nullable = false)
    private Standard standard;

    @Column(name = "version_code", nullable = false, length = 50)
    private String versionCode;

    @Column(name = "effective_date")
    private LocalDate effectiveDate;

    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
