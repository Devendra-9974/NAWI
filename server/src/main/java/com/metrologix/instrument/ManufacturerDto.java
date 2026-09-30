package com.metrologix.instrument;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManufacturerDto {
    private Long id;
    private String name;
    private String code;
    private String country;
    private String contactPerson;
    private String email;
    private String address;
    private String phone;
    private LocalDateTime createdAt;

    public static ManufacturerDto fromEntity(Manufacturer m) {
        if (m == null) return null;
        return ManufacturerDto.builder()
                .id(m.getId())
                .name(m.getName())
                .code(m.getCode())
                .country(m.getCountry())
                .contactPerson(m.getContactPerson())
                .email(m.getEmail())
                .address(m.getAddress())
                .phone(m.getPhone())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
