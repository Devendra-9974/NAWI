package com.metrologix.common;

import com.metrologix.common.enums.AccuracyClass;
import com.metrologix.common.enums.Role;
import com.metrologix.instrument.Instrument;
import com.metrologix.instrument.InstrumentRepository;
import com.metrologix.instrument.Manufacturer;
import com.metrologix.instrument.ManufacturerRepository;
import com.metrologix.laboratory.Laboratory;
import com.metrologix.laboratory.LaboratoryRepository;
import com.metrologix.standard.*;
import com.metrologix.user.User;
import com.metrologix.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final LaboratoryRepository laboratoryRepository;
    private final ManufacturerRepository manufacturerRepository;
    private final InstrumentRepository instrumentRepository;
    private final StandardRepository standardRepository;
    private final StandardVersionRepository standardVersionRepository;
    private final RuleRepository ruleRepository;
    private final TestDefinitionRepository testDefinitionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Populating initial laboratory data and official OIML R 76 rules...");
            seedData();
            log.info("Initial data seeding completed successfully.");
        } else {
            // Backfill existing pre-seeded users
            userRepository.findAll().forEach(u -> {
                boolean modified = false;
                if (u.getEmailVerified() == null) {
                    u.setEmailVerified(true);
                    modified = true;
                }
                if (u.getApprovalStatus() == null) {
                    u.setApprovalStatus(com.metrologix.common.enums.ApprovalStatus.APPROVED);
                    modified = true;
                }
                if (modified) {
                    userRepository.save(u);
                }
            });
        }
    }

    private void seedData() {
        // 1. Standards
        Standard standard = standardRepository.save(Standard.builder()
                .standardCode("OIML_R76")
                .title("OIML R 76: Non-automatic weighing instruments")
                .description("International recommendation for type evaluation and verification of non-automatic weighing instruments.")
                .build());

        StandardVersion standardVersion = standardVersionRepository.save(StandardVersion.builder()
                .standard(standard)
                .versionCode("2006_E")
                .effectiveDate(LocalDate.of(2006, 10, 1))
                .active(true)
                .build());

        // 2. Official OIML R 76-1:2006 Rules (Table 6)
        // Class III (Medium accuracy)
        createRule(standardVersion, "WEIGHING_PERFORMANCE", AccuracyClass.CLASS_III, "Class III MPE Tier 1 (0 <= m <= 500e)",
                new BigDecimal("0"), new BigDecimal("500"), new BigDecimal("0.5"));
        createRule(standardVersion, "WEIGHING_PERFORMANCE", AccuracyClass.CLASS_III, "Class III MPE Tier 2 (500e < m <= 2000e)",
                new BigDecimal("500.0001"), new BigDecimal("2000"), new BigDecimal("1.0"));
        createRule(standardVersion, "WEIGHING_PERFORMANCE", AccuracyClass.CLASS_III, "Class III MPE Tier 3 (2000e < m <= 10000e)",
                new BigDecimal("2000.0001"), new BigDecimal("10000"), new BigDecimal("1.5"));

        // Class II (High accuracy)
        createRule(standardVersion, "WEIGHING_PERFORMANCE", AccuracyClass.CLASS_II, "Class II MPE Tier 1 (0 <= m <= 5000e)",
                new BigDecimal("0"), new BigDecimal("5000"), new BigDecimal("0.5"));
        createRule(standardVersion, "WEIGHING_PERFORMANCE", AccuracyClass.CLASS_II, "Class II MPE Tier 2 (5000e < m <= 20000e)",
                new BigDecimal("5000.0001"), new BigDecimal("20000"), new BigDecimal("1.0"));
        createRule(standardVersion, "WEIGHING_PERFORMANCE", AccuracyClass.CLASS_II, "Class II MPE Tier 3 (20000e < m <= 100000e)",
                new BigDecimal("20000.0001"), new BigDecimal("100000"), new BigDecimal("1.5"));

        // Class I (Special accuracy)
        createRule(standardVersion, "WEIGHING_PERFORMANCE", AccuracyClass.CLASS_I, "Class I MPE Tier 1 (0 <= m <= 50000e)",
                new BigDecimal("0"), new BigDecimal("50000"), new BigDecimal("0.5"));
        createRule(standardVersion, "WEIGHING_PERFORMANCE", AccuracyClass.CLASS_I, "Class I MPE Tier 2 (50000e < m <= 200000e)",
                new BigDecimal("50000.0001"), new BigDecimal("200000"), new BigDecimal("1.0"));
        createRule(standardVersion, "WEIGHING_PERFORMANCE", AccuracyClass.CLASS_I, "Class I MPE Tier 3 (m > 200000e)",
                new BigDecimal("200000.0001"), new BigDecimal("10000000"), new BigDecimal("1.5"));

        // Class IIII (Ordinary accuracy)
        createRule(standardVersion, "WEIGHING_PERFORMANCE", AccuracyClass.CLASS_IIII, "Class IIII MPE Tier 1 (0 <= m <= 50e)",
                new BigDecimal("0"), new BigDecimal("50"), new BigDecimal("0.5"));
        createRule(standardVersion, "WEIGHING_PERFORMANCE", AccuracyClass.CLASS_IIII, "Class IIII MPE Tier 2 (50e < m <= 200e)",
                new BigDecimal("50.0001"), new BigDecimal("200"), new BigDecimal("1.0"));
        createRule(standardVersion, "WEIGHING_PERFORMANCE", AccuracyClass.CLASS_IIII, "Class IIII MPE Tier 3 (200e < m <= 1000e)",
                new BigDecimal("200.0001"), new BigDecimal("1000"), new BigDecimal("1.5"));

        // Repeatability rules (matches weighing performance mpe for applied load)
        createRule(standardVersion, "REPEATABILITY", AccuracyClass.CLASS_III, "Repeatability Class III Tier 1",
                new BigDecimal("0"), new BigDecimal("500"), new BigDecimal("0.5"));
        createRule(standardVersion, "REPEATABILITY", AccuracyClass.CLASS_III, "Repeatability Class III Tier 2",
                new BigDecimal("500.0001"), new BigDecimal("2000"), new BigDecimal("1.0"));
        createRule(standardVersion, "REPEATABILITY", AccuracyClass.CLASS_III, "Repeatability Class III Tier 3",
                new BigDecimal("2000.0001"), new BigDecimal("10000"), new BigDecimal("1.5"));

        // Eccentricity rules
        createRule(standardVersion, "ECCENTRICITY", AccuracyClass.CLASS_III, "Eccentricity Class III Tier 1",
                new BigDecimal("0"), new BigDecimal("500"), new BigDecimal("0.5"));
        createRule(standardVersion, "ECCENTRICITY", AccuracyClass.CLASS_III, "Eccentricity Class III Tier 2",
                new BigDecimal("500.0001"), new BigDecimal("2000"), new BigDecimal("1.0"));
        createRule(standardVersion, "ECCENTRICITY", AccuracyClass.CLASS_III, "Eccentricity Class III Tier 3",
                new BigDecimal("2000.0001"), new BigDecimal("10000"), new BigDecimal("1.5"));

        // 3. Test Definitions
        testDefinitionRepository.save(TestDefinition.builder()
                .standardVersion(standardVersion)
                .testCode("WEIGHING_PERFORMANCE")
                .testName("Weighing Performance Test (Clause A.4.4)")
                .category("METROLOGICAL_PERFORMANCE")
                .sequenceOrder(1)
                .active(true)
                .configurationJson("{\"requiresLoadDirections\":[\"INCREASING\",\"DECREASING\"],\"minPoints\":5,\"calculateChangeover\":true}")
                .build());

        testDefinitionRepository.save(TestDefinition.builder()
                .standardVersion(standardVersion)
                .testCode("REPEATABILITY")
                .testName("Repeatability Test (Clause A.4.10)")
                .category("METROLOGICAL_PERFORMANCE")
                .sequenceOrder(2)
                .active(true)
                .configurationJson("{\"series\":[{\"loadFraction\":0.5,\"cycles\":3},{\"loadFraction\":1.0,\"cycles\":3}],\"maxAllowableSpread\":\"mpe\"}")
                .build());

        testDefinitionRepository.save(TestDefinition.builder()
                .standardVersion(standardVersion)
                .testCode("ECCENTRICITY")
                .testName("Eccentric Loading Test (Clause A.4.7)")
                .category("METROLOGICAL_PERFORMANCE")
                .sequenceOrder(3)
                .active(true)
                .configurationJson("{\"positions\":[\"CENTER\",\"CORNER_1\",\"CORNER_2\",\"CORNER_3\",\"CORNER_4\"],\"testLoadFraction\":0.3333}")
                .build());

        // 4. Demo Laboratory
        Laboratory lab = laboratoryRepository.save(Laboratory.builder()
                .labCode("LAB-NML-01")
                .labName("National Legal Metrology Evaluation Centre")
                .accreditationNumber("NABL-MET-2026-0982")
                .address("Metrology Complex, CSIR Road, New Delhi 110012, India")
                .contactEmail("director.metrology@gov.in")
                .contactPhone("+91-11-25841234")
                .active(true)
                .build());

        // 5. Users
        String encodedPass = passwordEncoder.encode("password123");

        User admin = userRepository.save(User.builder()
                .username("admin")
                .email("admin@metrologix.org")
                .passwordHash(encodedPass)
                .fullName("Dr. Rajesh Sharma (Lab Director)")
                .role(Role.ADMIN)
                .laboratory(lab)
                .active(true)
                .build());

        userRepository.save(User.builder()
                .username("technician")
                .email("tech@metrologix.org")
                .passwordHash(encodedPass)
                .fullName("Priya Verma (Metrology Engineer)")
                .role(Role.TECHNICIAN)
                .laboratory(lab)
                .active(true)
                .build());

        userRepository.save(User.builder()
                .username("reviewer")
                .email("reviewer@metrologix.org")
                .passwordHash(encodedPass)
                .fullName("Arun K. Patel (Senior Verification Officer)")
                .role(Role.REVIEWER)
                .laboratory(lab)
                .active(true)
                .build());

        // 6. Manufacturers
        Manufacturer mfg1 = manufacturerRepository.save(Manufacturer.builder()
                .name("Avery Weigh-Tronix India Ltd.")
                .code("MFG-AWT-01")
                .country("India")
                .contactPerson("Vikram Malhotra")
                .email("contact@averyweigh-tronix.in")
                .address("Plot 45, Udyog Vihar Phase IV, Gurugram, Haryana")
                .phone("+91-124-4321000")
                .build());

        Manufacturer mfg2 = manufacturerRepository.save(Manufacturer.builder()
                .name("Mettler Toledo Metrology Systems")
                .code("MFG-MT-02")
                .country("Switzerland")
                .contactPerson("Hans Zaugg")
                .email("info@mt.com")
                .address("Im Langacher 44, 8606 Greifensee, Switzerland")
                .phone("+41-44-944-2211")
                .build());

        // 7. Demo Instruments
        instrumentRepository.save(Instrument.builder()
                .instrumentId("NAWI-2026-0001")
                .manufacturer(mfg1)
                .modelName("WeighMaster Bench Scale")
                .modelNumber("WM-30K-III")
                .serialNumber("SN-2026-WM-98101")
                .instrumentType("Electronic Platform Scale")
                .accuracyClass(AccuracyClass.CLASS_III)
                .maxCapacity(new BigDecimal("30.000000"))
                .minCapacity(new BigDecimal("0.100000"))
                .scaleIntervalE(new BigDecimal("0.010000"))
                .scaleIntervalD(new BigDecimal("0.010000"))
                .unit("kg")
                .numLoadCells(1)
                .indicatorInfo("Digital Indicator DI-700 with LED display")
                .firmwareVersion("v2.4.1")
                .technicalSpecifications("Stainless steel weighing pan (300 x 300 mm), IP65 aluminum single-point load cell, RS-232 metrological interface.")
                .createdBy(admin)
                .build());

        instrumentRepository.save(Instrument.builder()
                .instrumentId("NAWI-2026-0002")
                .manufacturer(mfg2)
                .modelName("Analytical Precision Balance")
                .modelNumber("XA-220-I")
                .serialNumber("SN-2026-MT-44019")
                .instrumentType("Precision Analytical Balance")
                .accuracyClass(AccuracyClass.CLASS_I)
                .maxCapacity(new BigDecimal("220.000000"))
                .minCapacity(new BigDecimal("0.010000"))
                .scaleIntervalE(new BigDecimal("0.001000"))
                .scaleIntervalD(new BigDecimal("0.000100"))
                .unit("g")
                .numLoadCells(1)
                .indicatorInfo("Touchscreen Graphical Interface MT-Touch")
                .firmwareVersion("v4.1.0")
                .technicalSpecifications("Draft shield enclosure with motorized glass doors, electromagnetic force restoration load cell.")
                .createdBy(admin)
                .build());
    }

    private void createRule(StandardVersion sv, String testCode, AccuracyClass ac, String name,
                            BigDecimal minE, BigDecimal maxE, BigDecimal factor) {
        ruleRepository.save(Rule.builder()
                .standardVersion(sv)
                .testCode(testCode)
                .accuracyClass(ac)
                .ruleName(name)
                .minLoadE(minE)
                .maxLoadE(maxE)
                .mpeFactorE(factor)
                .isOfficial(true)
                .description("Official OIML R 76-1:2006 Table 6 tolerance tier: mpe = +/- " + factor + " e")
                .build());
    }
}
