-- V2__seed_oiml_rules_and_demo.sql: Seed Official OIML R 76 Rules & Demo Laboratory

-- 1. Standards
INSERT INTO standards (id, standard_code, title, description) VALUES
(1, 'OIML_R76', 'OIML R 76: Non-automatic weighing instruments', 'International recommendation for type evaluation and verification of non-automatic weighing instruments.');

-- 2. Standard Versions
INSERT INTO standard_versions (id, standard_id, version_code, effective_date, active) VALUES
(1, 1, '2006_E', '2006-10-01', TRUE);

-- 3. OIML R 76-1:2006 Official MPE Rules (Table 6: Maximum permissible errors for net load)
-- Class III (Medium accuracy)
INSERT INTO rules (standard_version_id, test_code, accuracy_class, rule_name, min_load_e, max_load_e, mpe_factor_e, is_official, description) VALUES
(1, 'WEIGHING_PERFORMANCE', 'CLASS_III', 'Class III MPE Tier 1 (0 <= m <= 500e)', 0, 500, 0.5, TRUE, 'mpe = +/- 0.5 e for loads from 0 up to 500 e'),
(1, 'WEIGHING_PERFORMANCE', 'CLASS_III', 'Class III MPE Tier 2 (500e < m <= 2000e)', 500.0001, 2000, 1.0, TRUE, 'mpe = +/- 1.0 e for loads above 500 e up to 2000 e'),
(1, 'WEIGHING_PERFORMANCE', 'CLASS_III', 'Class III MPE Tier 3 (2000e < m <= 10000e)', 2000.0001, 10000, 1.5, TRUE, 'mpe = +/- 1.5 e for loads above 2000 e up to 10000 e');

-- Class II (High accuracy)
INSERT INTO rules (standard_version_id, test_code, accuracy_class, rule_name, min_load_e, max_load_e, mpe_factor_e, is_official, description) VALUES
(1, 'WEIGHING_PERFORMANCE', 'CLASS_II', 'Class II MPE Tier 1 (0 <= m <= 5000e)', 0, 5000, 0.5, TRUE, 'mpe = +/- 0.5 e for loads from 0 up to 5000 e'),
(1, 'WEIGHING_PERFORMANCE', 'CLASS_II', 'Class II MPE Tier 2 (5000e < m <= 20000e)', 5000.0001, 20000, 1.0, TRUE, 'mpe = +/- 1.0 e for loads above 5000 e up to 20000 e'),
(1, 'WEIGHING_PERFORMANCE', 'CLASS_II', 'Class II MPE Tier 3 (20000e < m <= 100000e)', 20000.0001, 100000, 1.5, TRUE, 'mpe = +/- 1.5 e for loads above 20000 e up to 100000 e');

-- Class I (Special accuracy)
INSERT INTO rules (standard_version_id, test_code, accuracy_class, rule_name, min_load_e, max_load_e, mpe_factor_e, is_official, description) VALUES
(1, 'WEIGHING_PERFORMANCE', 'CLASS_I', 'Class I MPE Tier 1 (0 <= m <= 50000e)', 0, 50000, 0.5, TRUE, 'mpe = +/- 0.5 e for loads from 0 up to 50000 e'),
(1, 'WEIGHING_PERFORMANCE', 'CLASS_I', 'Class I MPE Tier 2 (50000e < m <= 200000e)', 50000.0001, 200000, 1.0, TRUE, 'mpe = +/- 1.0 e for loads above 50000 e up to 200000 e'),
(1, 'WEIGHING_PERFORMANCE', 'CLASS_I', 'Class I MPE Tier 3 (m > 200000e)', 200000.0001, 10000000, 1.5, TRUE, 'mpe = +/- 1.5 e for loads above 200000 e');

-- Class IIII (Ordinary accuracy)
INSERT INTO rules (standard_version_id, test_code, accuracy_class, rule_name, min_load_e, max_load_e, mpe_factor_e, is_official, description) VALUES
(1, 'WEIGHING_PERFORMANCE', 'CLASS_IIII', 'Class IIII MPE Tier 1 (0 <= m <= 50e)', 0, 50, 0.5, TRUE, 'mpe = +/- 0.5 e for loads from 0 up to 50 e'),
(1, 'WEIGHING_PERFORMANCE', 'CLASS_IIII', 'Class IIII MPE Tier 2 (50e < m <= 200e)', 50.0001, 200, 1.0, TRUE, 'mpe = +/- 1.0 e for loads above 50 e up to 200 e'),
(1, 'WEIGHING_PERFORMANCE', 'CLASS_IIII', 'Class IIII MPE Tier 3 (200e < m <= 1000e)', 200.0001, 1000, 1.5, TRUE, 'mpe = +/- 1.5 e for loads above 200 e up to 1000 e');

-- 4. Test Definitions for OIML R 76-1:2006
INSERT INTO test_definitions (id, standard_version_id, test_code, test_name, category, sequence_order, active, configuration_json) VALUES
(1, 1, 'WEIGHING_PERFORMANCE', 'Weighing Performance Test (Clause A.4.4)', 'METROLOGICAL_PERFORMANCE', 1, TRUE, '{"requiresLoadDirections":["INCREASING","DECREASING"],"minPoints":5,"calculateChangeover":true}'),
(2, 1, 'REPEATABILITY', 'Repeatability Test (Clause A.4.10)', 'METROLOGICAL_PERFORMANCE', 2, TRUE, '{"series":[{"loadFraction":0.5,"cycles":3},{"loadFraction":1.0,"cycles":3}],"maxAllowableSpread":"mpe"}'),
(3, 1, 'ECCENTRICITY', 'Eccentric Loading Test (Clause A.4.7)', 'METROLOGICAL_PERFORMANCE', 3, TRUE, '{"positions":["CENTER","CORNER_1","CORNER_2","CORNER_3","CORNER_4"],"testLoadFraction":0.3333}'),
(4, 1, 'TARE_WEIGHING', 'Tare Balancing / Weighing Test (Clause A.4.6)', 'METROLOGICAL_PERFORMANCE', 4, TRUE, '{"tarePoints":[0.25,0.75]}');

-- 5. Demo Laboratory
INSERT INTO laboratories (id, lab_code, lab_name, accreditation_number, address, contact_email, contact_phone, active) VALUES
(1, 'LAB-NML-01', 'National Legal Metrology Evaluation Centre', 'NABL-MET-2026-0982', 'Metrology Complex, CSIR Road, New Delhi 110012, India', 'director.metrology@gov.in', '+91-11-25841234', TRUE);

-- 6. Demo Users (BCrypt hashes generated with 10 rounds: $2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG matches "password123")
INSERT INTO users (id, username, email, password_hash, full_name, role, laboratory_id, active) VALUES
(1, 'admin', 'admin@metrologix.org', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Dr. Rajesh Sharma (Lab Director)', 'ADMIN', 1, TRUE),
(2, 'technician', 'tech@metrologix.org', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Priya Verma (Metrology Engineer)', 'TECHNICIAN', 1, TRUE),
(3, 'reviewer', 'reviewer@metrologix.org', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Arun K. Patel (Senior Verification Officer)', 'REVIEWER', 1, TRUE);

-- 7. Demo Manufacturers
INSERT INTO manufacturers (id, name, code, country, contact_person, email, address, phone) VALUES
(1, 'Avery Weigh-Tronix India Ltd.', 'MFG-AWT-01', 'India', 'Vikram Malhotra', 'contact@averyweigh-tronix.in', 'Plot 45, Udyog Vihar Phase IV, Gurugram, Haryana', '+91-124-4321000'),
(2, 'Mettler Toledo Metrology Systems', 'MFG-MT-02', 'Switzerland', 'Hans Zaugg', 'info@mt.com', 'Im Langacher 44, 8606 Greifensee, Switzerland', '+41-44-944-2211');

-- 8. Demo Instruments
INSERT INTO instruments (id, instrument_id, manufacturer_id, model_name, model_number, serial_number, instrument_type, accuracy_class, max_capacity, min_capacity, scale_interval_e, scale_interval_d, unit, num_load_cells, indicator_info, firmware_version, technical_specifications, created_by) VALUES
(1, 'NAWI-2026-0001', 1, 'WeighMaster Bench Scale', 'WM-30K-III', 'SN-2026-WM-98101', 'Electronic Platform Scale', 'CLASS_III', 30.000000, 0.100000, 0.010000, 0.010000, 'kg', 1, 'Digital Indicator DI-700 with LED display', 'v2.4.1', 'Stainless steel weighing pan (300 x 300 mm), IP65 aluminum single-point load cell, RS-232 metrological interface.', 1),
(2, 'NAWI-2026-0002', 2, 'Analytical Precision Balance', 'XA-220-I', 'SN-2026-MT-44019', 'Precision Analytical Balance', 'CLASS_I', 220.000000, 0.010000, 0.001000, 0.000100, 'g', 1, 'Touchscreen Graphical Interface MT-Touch', 'v4.1.0', 'Draft shield enclosure with motorized glass doors, electromagnetic force restoration load cell.', 1);
