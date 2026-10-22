# Roadmap: MechMate Automotive Intelligence Platform

## Overview
MechMate transforms from a basic conversational chatbot into an industrial-grade, safety-first automotive intelligence platform. We address security by eliminating client-side API key leakage, build a deterministic safety layer, provide a structured diagnostic intake and evidence explorer, implement a local-first garage and Indian repair cost estimator, and establish rigorous automated tests and evaluation documentation for competitive review (such as the Anna Founding Builder Program).

## Phases

- [ ] **Phase 1: Security, Testing Foundation & Architecture** - Isolate API keys via serverless proxy, build Vitest test setup, and establish provider abstraction.
- [ ] **Phase 2: Deterministic Safety Engine & Diagnostic Core** - Implement non-negotiable safety rules and structured multi-step diagnostic workflow.
- [ ] **Phase 3: Diagnostic Evidence Explorer & OBD-II Engine** - Implement transparent evidence breakdown and DTC trouble code lookup.
- [ ] **Phase 4: Vehicle Garage, Health Dashboard & Local Persistence** - Build multi-vehicle garage, maintenance planner, localized cost estimator, and offline storage.
- [ ] **Phase 5: Design Polish, Accessibility & Scenario Verification** - Automotive dark cockpit UI, mobile responsiveness, and 10 scenario integration tests.
- [ ] **Phase 6: Production Verification, Anna Readiness & Documentation** - Comprehensive README, `ANNA_READINESS.md`, and `TECHNICAL_DEMO.md`.

## Phase Details

### Phase 1: Security, Testing Foundation & Architecture
**Goal**: Secure the architecture against key leakage, establish Vitest automated testing, and build a provider-agnostic diagnostic service with zero-cost offline resilience.
**Depends on**: Nothing
**Requirements**: SEC-01, SEC-02, SEC-03, TEST-01
**Success Criteria**:
  1. `VITE_GEMINI_API_KEY` is completely removed from client-side bundle; serverless function `/api/diagnose.ts` proxies requests securely.
  2. Vitest runs cleanly via `npm test` with 0 errors.
  3. Offline mechatronic fallback diagnoses operate seamlessly when API is missing, rate-limited, or offline.
**Plans**: 2 plans

Plans:
- [ ] 01-01: Install Vitest, configure test environment, and write tests for core contracts.
- [ ] 01-02: Create secure serverless proxy endpoint `/api/diagnose.ts` and refactor AI service abstraction.

### Phase 2: Deterministic Safety Engine & Diagnostic Core
**Goal**: Deliver a non-negotiable automotive safety rule engine and a structured, progressive diagnostic intake workflow.
**Depends on**: Phase 1
**Requirements**: SAFE-01, SAFE-02, SAFE-03, DIAG-01, DIAG-02, DIAG-03, DIAG-04, DIAG-05
**Success Criteria**:
  1. Critical symptoms (brakes, overheating, fuel, steering) instantly trigger prominent safety alerts and emergency advice without waiting for or depending on AI.
  2. Diagnostic intake guides user progressively through vehicle info, symptom categorization, and targeted follow-up questions.
  3. Diagnostic assessment produces structured output distinguishing possible causes, likely causes, user-inspectable items, and mechanic checks.
**Plans**: 2 plans

Plans:
- [ ] 02-01: Build deterministic automotive safety engine with testable emergency rules and risk ratings.
- [ ] 02-02: Implement progressive diagnostic workflow, follow-up question orchestrator, and structured schema validator.

### Phase 3: Diagnostic Evidence Explorer & OBD-II Engine
**Goal**: Build the key product differentiator (evidence explorer) and manual OBD-II code lookup engine.
**Depends on**: Phase 2
**Requirements**: EVID-01, EVID-02, MAINT-04
**Success Criteria**:
  1. Diagnostic Evidence Explorer visualizes supporting evidence, contradicting evidence, and next discriminating tests for every potential cause.
  2. Manual OBD-II diagnostic trouble code lookup (e.g. P0300, P0171, P0420) returns verified technical explanations, causes, and recommended fixes.
**Plans**: 2 plans

Plans:
- [ ] 03-01: Implement Diagnostic Evidence Explorer UI and reasoning data models.
- [ ] 03-02: Implement manual OBD-II DTC database and lookup interface with standard code taxonomy.

### Phase 4: Vehicle Garage, Health Dashboard & Local Persistence
**Goal**: Implement local-first vehicle garage, health dashboard, maintenance scheduler, and localized Indian repair cost estimator.
**Depends on**: Phase 3
**Requirements**: GAR-01, GAR-02, GAR-03, MAINT-01, MAINT-02, MAINT-03
**Success Criteria**:
  1. Users can add, edit, switch, and delete vehicles; active vehicle persists in LocalStorage and links to diagnostic reports.
  2. Maintenance planner calculates upcoming service milestones by mileage and time with completion logging.
  3. Localized Indian market cost calculator displays parts and labor breakdown in ₹ with clear confidence indicators.
**Plans**: 2 plans

Plans:
- [ ] 04-01: Implement local-first Garage store, vehicle switcher, and Vehicle Health Dashboard.
- [ ] 04-02: Implement Maintenance Intelligence planner and transparent Indian market repair cost estimator.

### Phase 5: Design Polish, Accessibility & Scenario Verification
**Goal**: Elevate UI to a dark cockpit automotive engineering aesthetic, ensure mobile accessibility on Android/desktops, and execute all 10 scenario verification tests.
**Depends on**: Phase 4
**Requirements**: UI-01, UI-02, UI-03, TEST-02
**Success Criteria**:
  1. Clean, dark graphite/charcoal styling with high contrast, accessible buttons, and zero broken controls.
  2. Seamless responsive layout on narrow screens, tablets, and desktops.
  3. Automated test suite executes and passes all 10 mandatory user scenarios.
**Plans**: 2 plans

Plans:
- [ ] 05-01: Refactor UI into modular component architecture with dark cockpit design system and responsive navigation.
- [ ] 05-02: Write and execute comprehensive end-to-end integration tests for all 10 user scenarios.

### Phase 6: Production Verification, Anna Readiness & Documentation
**Goal**: Complete production build verification, documentation, and technical demonstration script for builder program evaluation.
**Depends on**: Phase 5
**Requirements**: DOCS-01, DOCS-02, DOCS-03
**Success Criteria**:
  1. Production build succeeds with 0 errors and optimal bundle size.
  2. Complete `README.md`, `docs/ANNA_READINESS.md`, and `docs/TECHNICAL_DEMO.md` created with accurate, evidence-backed details.
**Plans**: 1 plan

Plans:
- [ ] 06-01: Generate Anna Readiness dossier, 5-minute technical demo script, and update README.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Security, Testing Foundation & Architecture | 0/2 | Not started | - |
| 2. Deterministic Safety Engine & Diagnostic Core | 0/2 | Not started | - |
| 3. Diagnostic Evidence Explorer & OBD-II Engine | 0/2 | Not started | - |
| 4. Vehicle Garage, Health Dashboard & Local Persistence | 0/2 | Not started | - |
| 5. Design Polish, Accessibility & Scenario Verification | 0/2 | Not started | - |
| 6. Production Verification, Anna Readiness & Documentation | 0/1 | Not started | - |
