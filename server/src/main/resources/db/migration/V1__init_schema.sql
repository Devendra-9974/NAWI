-- V1__init_schema.sql: Initial Schema for LegalMetrix

CREATE TABLE laboratories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lab_code VARCHAR(50) NOT NULL UNIQUE,
    lab_name VARCHAR(255) NOT NULL,
    accreditation_number VARCHAR(100),
    address VARCHAR(500),
    contact_email VARCHAR(100),
    contact_phone VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL, -- ADMIN, TECHNICIAN, REVIEWER
    laboratory_id BIGINT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_lab FOREIGN KEY (laboratory_id) REFERENCES laboratories(id) ON DELETE SET NULL
);

CREATE TABLE manufacturers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    country VARCHAR(100),
    contact_person VARCHAR(150),
    email VARCHAR(150),
    address VARCHAR(500),
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE instruments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    instrument_id VARCHAR(50) NOT NULL UNIQUE, -- e.g. NAWI-2026-0001
    manufacturer_id BIGINT NOT NULL,
    model_name VARCHAR(150) NOT NULL,
    model_number VARCHAR(100),
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    instrument_type VARCHAR(100) NOT NULL, -- Electronic balance, Platform scale, Crane scale
    accuracy_class VARCHAR(50) NOT NULL,   -- CLASS_I, CLASS_II, CLASS_III, CLASS_IIII
    max_capacity DECIMAL(18, 6) NOT NULL,
    min_capacity DECIMAL(18, 6) NOT NULL,
    scale_interval_e DECIMAL(18, 6) NOT NULL,
    scale_interval_d DECIMAL(18, 6) NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'kg', -- g, kg, t
    num_load_cells INT DEFAULT 1,
    indicator_info VARCHAR(255),
    firmware_version VARCHAR(100),
    technical_specifications TEXT,
    photo_path VARCHAR(500),
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_instr_manufacturer FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id),
    CONSTRAINT fk_instr_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE standards (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    standard_code VARCHAR(50) NOT NULL UNIQUE, -- OIML_R76
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE standard_versions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    standard_id BIGINT NOT NULL,
    version_code VARCHAR(50) NOT NULL, -- e.g. 2006_E
    effective_date DATE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_std_version UNIQUE (standard_id, version_code),
    CONSTRAINT fk_std_version FOREIGN KEY (standard_id) REFERENCES standards(id)
);

CREATE TABLE rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    standard_version_id BIGINT NOT NULL,
    test_code VARCHAR(100) NOT NULL, -- WEIGHING_PERFORMANCE, REPEATABILITY, ECCENTRICITY
    accuracy_class VARCHAR(50) NOT NULL,
    rule_name VARCHAR(255) NOT NULL,
    min_load_e DECIMAL(18, 4) NOT NULL,
    max_load_e DECIMAL(18, 4) NOT NULL,
    mpe_factor_e DECIMAL(18, 4) NOT NULL, -- e.g. 0.5, 1.0, 1.5
    is_official BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rule_version FOREIGN KEY (standard_version_id) REFERENCES standard_versions(id)
);

CREATE TABLE test_definitions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    standard_version_id BIGINT NOT NULL,
    test_code VARCHAR(100) NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    sequence_order INT NOT NULL DEFAULT 1,
    active BOOLEAN DEFAULT TRUE,
    configuration_json TEXT,
    CONSTRAINT uq_test_def UNIQUE (standard_version_id, test_code),
    CONSTRAINT fk_testdef_stdver FOREIGN KEY (standard_version_id) REFERENCES standard_versions(id)
);

CREATE TABLE test_cases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    test_id VARCHAR(50) NOT NULL UNIQUE, -- e.g. TEST-2026-0001
    instrument_id BIGINT NOT NULL,
    laboratory_id BIGINT NOT NULL,
    standard_version_id BIGINT NOT NULL,
    technician_id BIGINT NOT NULL,
    reviewer_id BIGINT,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- DRAFT, TESTING, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, REPORT_GENERATED, ARCHIVED
    overall_result VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, PASS, FAIL, INCOMPLETE
    start_date DATE,
    completion_date DATE,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_test_instr FOREIGN KEY (instrument_id) REFERENCES instruments(id),
    CONSTRAINT fk_test_lab FOREIGN KEY (laboratory_id) REFERENCES laboratories(id),
    CONSTRAINT fk_test_stdver FOREIGN KEY (standard_version_id) REFERENCES standard_versions(id),
    CONSTRAINT fk_test_tech FOREIGN KEY (technician_id) REFERENCES users(id),
    CONSTRAINT fk_test_rev FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE laboratory_conditions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    test_case_id BIGINT NOT NULL UNIQUE,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    temperature_celsius DECIMAL(6, 2) NOT NULL,
    relative_humidity_pct DECIMAL(6, 2) NOT NULL,
    atmospheric_pressure_hpa DECIMAL(8, 2),
    reference_standards_used VARCHAR(255),
    calibration_cert_no VARCHAR(100),
    operator_name VARCHAR(150),
    remarks TEXT,
    CONSTRAINT fk_labcond_test FOREIGN KEY (test_case_id) REFERENCES test_cases(id) ON DELETE CASCADE
);

CREATE TABLE test_executions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    test_case_id BIGINT NOT NULL,
    test_definition_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    test_result VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PASS, FAIL, NOT_APPLICABLE
    evaluated_rule_version VARCHAR(100),
    summary_notes TEXT,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_test_exec UNIQUE (test_case_id, test_definition_id),
    CONSTRAINT fk_testexec_test FOREIGN KEY (test_case_id) REFERENCES test_cases(id) ON DELETE CASCADE,
    CONSTRAINT fk_testexec_def FOREIGN KEY (test_definition_id) REFERENCES test_definitions(id)
);

CREATE TABLE test_observations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    test_execution_id BIGINT NOT NULL,
    point_index INT NOT NULL,
    load_direction VARCHAR(20) DEFAULT 'INCREASING', -- INCREASING, DECREASING
    applied_load DECIMAL(18, 6) NOT NULL,
    nominal_value DECIMAL(18, 6),
    indicated_value DECIMAL(18, 6) NOT NULL,
    changeover_load DECIMAL(18, 6), -- delta L
    position_location VARCHAR(50),   -- CENTER, CORNER_1, CORNER_2, CORNER_3, CORNER_4
    error_value DECIMAL(18, 6),      -- E = I + 0.5e - deltaL - L
    corrected_error DECIMAL(18, 6),  -- Ec = E - E0
    mpe_value DECIMAL(18, 6),        -- maximum permissible error (+/-)
    point_compliance VARCHAR(20),    -- PASS, FAIL
    raw_data_json TEXT,
    CONSTRAINT fk_obs_exec FOREIGN KEY (test_execution_id) REFERENCES test_executions(id) ON DELETE CASCADE
);

CREATE TABLE review_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    test_case_id BIGINT NOT NULL,
    reviewer_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL, -- SUBMIT, REQUEST_CHANGES, APPROVE, REJECT
    comments TEXT,
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rev_test FOREIGN KEY (test_case_id) REFERENCES test_cases(id) ON DELETE CASCADE,
    CONSTRAINT fk_rev_user FOREIGN KEY (reviewer_id) REFERENCES users(id)
);

CREATE TABLE reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_number VARCHAR(100) NOT NULL UNIQUE, -- e.g. LM/2026/00001
    test_case_id BIGINT NOT NULL,
    report_version INT DEFAULT 1,
    file_format VARCHAR(20) NOT NULL, -- PDF, DOCX
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    checksum_sha256 VARCHAR(64),
    generated_by BIGINT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rep_test FOREIGN KEY (test_case_id) REFERENCES test_cases(id),
    CONSTRAINT fk_rep_genby FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL, -- INSTRUMENT, TEST_CASE, REPORT
    entity_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    file_path VARCHAR(500) NOT NULL,
    uploaded_by BIGINT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_att_user FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    username VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100),
    entity_id BIGINT,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Essential Performance Indexes
CREATE INDEX idx_instr_id ON instruments(instrument_id);
CREATE INDEX idx_instr_serial ON instruments(serial_number);
CREATE INDEX idx_testcase_id ON test_cases(test_id);
CREATE INDEX idx_testcase_status ON test_cases(status);
CREATE INDEX idx_report_num ON reports(report_number);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
