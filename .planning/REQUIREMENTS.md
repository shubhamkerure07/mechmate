# Requirements: MechMate Automotive Intelligence Platform

**Defined:** 2026-10-22  
**Core Value:** Transparent, deterministic, safety-first vehicle diagnostics with structured evidence, Indian market repair estimates, and local-first vehicle garage tracking.

## v1 Requirements

### 1. Security & Architecture (SEC)
- [ ] **SEC-01**: Secure serverless API proxy (`api/diagnose.ts`) preventing client bundle API key leakage (`VITE_GEMINI_API_KEY` removed).
- [ ] **SEC-02**: Provider abstraction supporting server-side AI with request timeouts, rate limits, schema validation, and zero-cost local offline fallback.
- [ ] **SEC-03**: No sensitive data or hardcoded credentials committed or exposed to browser logs.

### 2. Safety Engine (SAFE)
- [ ] **SAFE-01**: Standalone deterministic safety rule engine evaluating critical symptoms (braking loss, severe overheating, steering failure, fuel leak, electrical smoke, oil pressure warning).
- [ ] **SAFE-02**: Immediate emergency instructions (Stop Driving / Roadside Assistance / Towing) that cannot be downgraded or overridden by AI responses.
- [ ] **SAFE-03**: Proportionate risk classification: Critical / Urgent / Moderate / Minor with explicit precautions.

### 3. Structured Diagnostic Workflow (DIAG)
- [ ] **DIAG-01**: Multi-field vehicle identification (Make, Model, Year, Fuel Type, Transmission, Mileage, Region) with optional generic fallback when vehicle info is unknown.
- [ ] **DIAG-02**: Progressive symptom intake with categorized quick-pick symptoms and free-text symptom input.
- [ ] **DIAG-03**: Dynamic, context-aware follow-up questioning before final assessment generation.
- [ ] **DIAG-04**: Structured diagnostic report presenting summary, potential causes, user-inspectable items, professional inspection needs, and limitations.
- [ ] **DIAG-05**: Interactive diagnostic session permitting follow-up questions, clarifying explanations, and re-evaluation when new symptoms are added.

### 4. Differentiated Feature: Diagnostic Evidence Explorer (EVID)
- [ ] **EVID-01**: Evidence explorer showing supporting evidence, contradicting evidence, missing information, and next discriminating tests for each potential cause.
- [ ] **EVID-02**: Clear distinction between possible cause, likely cause, and confirmed diagnosis with explicit uncertainty disclaimers.

### 5. Vehicle Garage & Dashboard (GAR)
- [ ] **GAR-01**: Multi-vehicle garage allowing adding, editing, switching, and deleting vehicles with active vehicle selection.
- [ ] **GAR-02**: Vehicle health dashboard displaying active vehicle specs, latest diagnostic reports, open issues, and quick diagnostic launch.
- [ ] **GAR-03**: Offline-first LocalStorage persistence with full JSON export and import capabilities.

### 6. Maintenance Intelligence & Cost Estimator (MAINT)
- [ ] **MAINT-01**: Maintenance planner with mileage-based and time-based service schedules (engine oil, brake pads, coolant, spark plugs, timing belt).
- [ ] **MAINT-02**: Interactive service history log to mark items completed and update odometer.
- [ ] **MAINT-03**: Transparent Indian market repair cost estimator showing parts range (₹), labor range (₹), and total range with clear assumptions.
- [ ] **MAINT-04**: Manual OBD-II diagnostic trouble code (DTC) lookup engine (e.g. P0300, P0171, P0420) with definitions and recommended actions.

### 7. Product Design & Accessibility (UI)
- [ ] **UI-01**: Premium dark automotive cockpit aesthetic (graphite/charcoal foundations, restrained metallic/orange/amber accents, high-contrast typography).
- [ ] **UI-02**: Responsive, mobile-first design fully functional on Android smartphones, tablets, and desktop workstations.
- [ ] **UI-03**: Keyboard accessibility, visible focus states, semantic HTML, and zero decorative broken buttons.

### 8. Testing & Engineering Quality (TEST)
- [ ] **TEST-01**: Automated Vitest test suite executing unit and integration tests.
- [ ] **TEST-02**: 10 mandatory user scenarios tested (starting failure, overheating safety warning, intermittent warning follow-ups, AI timeout/offline fallback, unknown vehicle info, invalid input, mobile layout verification, local data isolation, symptom change re-evaluation, uncertain price estimate).

### 9. Documentation & Anna Program Readiness (DOCS)
- [ ] **DOCS-01**: Comprehensive README with architectural diagrams, setup guide, and honest capability status.
- [ ] **DOCS-02**: `docs/ANNA_READINESS.md` detailing technical maturity, engineering decisions, test results, and roadmap.
- [ ] **DOCS-03**: `docs/TECHNICAL_DEMO.md` containing a 5-minute reproducible evaluation script.

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SEC-01, SEC-02, SEC-03 | Phase 1: Security, Testing Foundation & Architecture | Pending |
| TEST-01 | Phase 1: Security, Testing Foundation & Architecture | Pending |
| SAFE-01, SAFE-02, SAFE-03 | Phase 2: Deterministic Safety Engine & Diagnostic Core | Pending |
| DIAG-01, DIAG-02, DIAG-03, DIAG-04, DIAG-05 | Phase 2: Deterministic Safety Engine & Diagnostic Core | Pending |
| EVID-01, EVID-02 | Phase 3: Diagnostic Evidence Explorer & OBD-II Engine | Pending |
| MAINT-04 | Phase 3: Diagnostic Evidence Explorer & OBD-II Engine | Pending |
| GAR-01, GAR-02, GAR-03 | Phase 4: Vehicle Garage, Health Dashboard & Local Persistence | Pending |
| MAINT-01, MAINT-02, MAINT-03 | Phase 4: Vehicle Garage, Health Dashboard & Local Persistence | Pending |
| UI-01, UI-02, UI-03 | Phase 5: Design Polish, Accessibility & Scenario Verification | Pending |
| TEST-02 | Phase 5: Design Polish, Accessibility & Scenario Verification | Pending |
| DOCS-01, DOCS-02, DOCS-03 | Phase 6: Production Verification, Anna Readiness & Documentation | Pending |

**Coverage:**
- v1 requirements: 26 total
- Mapped to phases: 26
- Unmapped: 0
