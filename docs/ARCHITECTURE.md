# LegalMetrix: System Architecture & Design

## 1. Architectural Principles

* **Separation of Concerns**: Clean isolation between Presentation (React), Security (Spring Security JWT), Domain Processing (Calculation & Compliance Engines), Persistence (Spring Data JPA / MySQL), and Document Generation (OpenPDF & Apache POI).
* **Deterministic Backend Authority**: The browser performs real-time UI formatting, but the backend is the authoritative source for metrological calculations, MPE tolerance resolution, and compliance verdicts.
* **Versioned Regulatory Engine**: OIML standards evolve. LegalMetrix supports multiple concurrent standard versions (e.g. `2006_E`, future revisions) with rules stored in database tables, rather than hard-coded switch statements.
* **Tamper-Evident Traceability**: All state transitions, calculations, reviews, and document downloads produce immutable audit records with SHA-256 document checksums.

```
┌────────────────────────────────────────────────────────┐
│             Frontend (React 18 + Vite + TS)            │
│  - Laboratory Dashboard (Recharts analytics)           │
│  - Testing Workspace (Dynamic observation tables)      │
│  - Digital Repository (Faceted search & preview)       │
└───────────────────────────┬────────────────────────────┘
                            │ REST APIs / JWT Auth
                            ▼
┌────────────────────────────────────────────────────────┐
│             Backend (Spring Boot 3.3.3)                │
├────────────────────────────────────────────────────────┤
│ • Security Filter (Stateless JWT, RBAC)                │
│ • CalculationEngine (BigDecimal Precision)             │
│ • OimlRuleEngine (Dynamic Tolerance Resolution)        │
│ • ComplianceEngine (Structured Pass/Fail Rationale)    │
│ • PdfReportGenerator (OpenPDF Certificate Engine)      │
│ • DocxReportGenerator (Apache POI Word Engine)         │
│ • AuditService (Activity logging)                      │
└───────────────────────────┬────────────────────────────┘
                            │ JPA / Flyway
                            ▼
┌────────────────────────────────────────────────────────┐
│         MySQL 8 Relational Database / Flyway           │
│  - Users, Laboratories, Manufacturers, Instruments     │
│  - Standards, Rules, TestCases, Observations, Reports  │
└────────────────────────────────────────────────────────┘
```

## 2. Security Model & RBAC

* **Authentication**: Stateless JSON Web Token (HMAC-SHA256).
* **Roles**:
  * `ADMIN`: Lab management, user administration, system configuration, full audit log access.
  * `TECHNICIAN`: Instrument creation, observation data entry, triggering calculation engine, submitting tests for review.
  * `REVIEWER`: Inspecting test observations and calculations, approving or rejecting evaluations, issuing finalized reports.
* **Cross-Origin Resource Sharing (CORS)**: Configured for modern web development environments.
