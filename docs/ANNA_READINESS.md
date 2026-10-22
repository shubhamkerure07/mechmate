# MechMate — Technical Maturity Dossier & Evaluation Readiness

**Product**: MechMate — Automotive Intelligence Platform  
**Developer**: Shubham Kerure  
**Repository**: https://github.com/shubhamkerure07/mechmate  
**Live Application**: https://mechmate-sigma.vercel.app  
**Date**: October 2026  
**Audience**: Technical Evaluators, Grant Committees (e.g. Anna Founding Builder Program), and Engineering Leadership

---

## 1. Executive Product Summary

MechMate is a production-oriented automotive intelligence platform engineered for everyday motorists and vehicle enthusiasts in India. It bridges the critical information gap between experiencing an anomalous vehicle symptom and stepping into a commercial repair garage.

Rather than acting as another generic AI chatbot, MechMate implements a **deterministic, safety-first diagnostic pipeline**:
1. **Intake**: Progressive symptom intake with context-aware follow-up questioning.
2. **Safety Enforcement**: Hardcoded, un-downgradable deterministic safety rules for life-threatening automotive hazards (hydraulic brake collapse, boiling coolant explosion, cabin exhaust gas intrusion).
3. **Transparent Reasoning**: A **Diagnostic Evidence Explorer** presenting supporting vs. contradicting evidence, missing data points, and next discriminating tests.
4. **Localization**: Parts and labor repair cost estimation calibrated for the Indian automotive aftermarket in Indian Rupees (₹).
5. **Vehicle Garage & Maintenance**: Local-first vehicle garage and preventative service scheduling with zero backend subscription overhead.

---

## 2. Target User & Problem Statement

### The Problem
- **Asymmetric Information**: Everyday drivers lack domain mechatronics knowledge to decipher whether a symptom requires an immediate emergency stop or is safe to drive for two weeks.
- **Repair Inflation**: Vehicle owners frequently overpay for unnecessary replacement parts because workshops exploit diagnostic ambiguity.
- **AI Hallucinations in Automotive Domains**: Generic LLM chatbots frequently emit confident yet mechanically uncalibrated assertions, or fail to issue life-critical emergency stop warnings when boiling steam or brake line rupture is present.

### Target Users
- Indian passenger car owners (hatchbacks, sedans, compact SUVs) navigating urban stop-and-go driving and varying road conditions.
- Automotive DIY enthusiasts wanting structured troubleshooting steps before ordering parts or tools.
- Motorists needing roadside urgency triage when unexpected dash warning lamps or sounds appear.

---

## 3. Architecture & Data Flow

```
                      [Browser Client / Mobile Android]
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
       [Deterministic Safety Engine]           [Local-First Garage & Storage]
       • Brake hydraulic loss checks           • Vehicle profiles (LocalStorage)
       • Pressurized steam burn rules          • Diagnostic history logs
       • Oil pressure loss triage              • Maintenance schedules
       • Raw fuel leak / fire rules            • JSON export / import
                 │
                 ▼
       [Diagnostic Orchestrator]
       • Progressive follow-up questions
       • Evidence synthesis & hypothesis ranking
       • Indian parts/labor cost estimation
                 │
        ┌────────┴──────────────────────────┐
        ▼                                   ▼
 [Serverless Proxy: /api/diagnose]    [Offline Mechatronic Knowledge Base]
 • Secure Node.js serverless route    • 100% offline fallback
 • GEMINI_API_KEY strictly in env     • Mechatronic domain rules
 • Rate-limiting & timeout guards     • Zero API cost dependency
```

---

## 4. Feature Audit: Original vs. New Capabilities

| Capability | Original Baseline (`v1.0.0`) | Upgraded Architecture (`v2.0.0`) |
|---|---|---|
| **User Interface** | Single chat window (`src/App.tsx`, 211 lines) with 4 static suggestion buttons | Modular cockpit architecture with 6 functional views: Diagnose, Evidence Explorer, My Garage, Service Planner, OBD-II Scanner, and Settings |
| **API Key Security** | `VITE_GEMINI_API_KEY` bundled into public client JavaScript | Server-side serverless proxy `/api/diagnose.ts`; zero credentials exposed in client bundles |
| **Safety Protocol** | Advice embedded in markdown prompt; subject to model drift | Independent deterministic safety rules (`src/services/safetyEngine.ts`) with un-overridable emergency stop directives |
| **Diagnostic Intake** | Free text only; no follow-up questions | Progressive 2-step intake with targeted context-aware follow-up question selector |
| **Diagnostic Reasoning** | Raw unstructured markdown text | Structured schema: supporting evidence, contradicting evidence, missing information, discriminating tests, and DIY vs. workshop steps |
| **DTC Fault Codes** | None | Manual OBD-II lookup engine (`src/services/obdDatabase.ts`) covering standard SAE trouble codes (P0300, P0171, P0420, etc.) |
| **Vehicle Garage** | None; all queries were vehicle-agnostic | Multi-vehicle garage supporting make, model, year, fuel, transmission, odometer, and region |
| **Service Planner** | None | Mileage and time-based maintenance planner with interactive completion logging |
| **Repair Pricing** | Hardcoded rough ranges in fallback text | Calibrated Indian market repair estimator (₹) with parts, labor, and confidence metrics |
| **Data Persistence** | None; memory cleared on page reload | Local-first browser storage with complete JSON export and restore capabilities |
| **Automated Tests** | 0 tests; no testing tools installed | 32 automated Vitest tests covering safety, diagnostics, storage, OBD-II, and all 10 user scenarios |

---

## 5. Key Engineering Decisions & Trade-Offs

### Decision 1: Local-First Browser Persistence Over a Hosted Database
- **Rationale**: Keeps recurring server costs at exactly \$0.00/month, provides instant offline responsiveness, and eliminates user data privacy compliance risks (no remote storage of user vehicle data or travel logs).
- **Trade-Off**: No native cross-device synchronization without manual JSON backup export/import.
- **Evaluation**: For an early-stage builder portfolio, zero-cost operation and zero privacy liability far outweigh cloud database hosting costs.

### Decision 2: Deterministic Safety Engine Running Prior to AI
- **Rationale**: Automotive safety cannot be delegated to probabilistic neural network tokens. When a user reports a brake pedal sinking to the floor, the system must immediately issue a critical stop warning, regardless of upstream AI status.
- **Trade-Off**: Requires maintaining deterministic rule patterns.
- **Evaluation**: Non-negotiable for automotive domain credibility.

### Decision 3: Serverless API Proxy for Cloud AI
- **Rationale**: Prevents malicious actors from extracting API keys from the public web bundle (`dist/assets/*.js`).
- **Trade-Off**: Requires a serverless environment (Vercel Functions or local Node dev middleware).
- **Evaluation**: Solves the critical security flaw of the original baseline.

---

## 6. Automated Test Suite & Actual Verification Results

Tests are executed with `vitest` directly against TypeScript source modules:

```
 RUN  v2.1.9 C:/Users/Shubham/mechmate

 ✓ src/tests/obdDatabase.test.ts (5 tests)
 ✓ src/tests/safetyEngine.test.ts (7 tests)
 ✓ src/tests/storageAndMaintenance.test.ts (4 tests)
 ✓ src/tests/comprehensiveScenarios.test.ts (10 tests)
 ✓ src/tests/diagnosticEngine.test.ts (6 tests)

 Test Files  5 passed (5)
      Tests  32 passed (32)
   Duration  628ms
```

### Mandatory Scenario Test Matrix
- **Scenario 1 (Starting Failure Intake)**: Verified in `comprehensiveScenarios.test.ts` (Line 22). Plausible electrical causes isolated without claiming scientific certainty.
- **Scenario 2 (Severe Overheating & Steam)**: Verified in `safetyEngine.test.ts` & `comprehensiveScenarios.test.ts` (Line 38). Emergency stop triggered; opening hot radiator cap prohibited.
- **Scenario 3 (Intermittent Warning Follow-Up)**: Verified in `comprehensiveScenarios.test.ts` (Line 54). Follow-up questions asked without premature total failure alarm.
- **Scenario 4 (AI Timeout & Fallback)**: Verified in `comprehensiveScenarios.test.ts` (Line 67). Local mechatronic fallback operates seamlessly with zero unhandled exceptions.
- **Scenario 5 (Insufficient Vehicle Info)**: Verified in `comprehensiveScenarios.test.ts` (Line 78). Limitations communicated honestly; generic baseline applied.
- **Scenario 6 (Input Validation)**: Verified in `comprehensiveScenarios.test.ts` (Line 90). Negative mileage, blank models, and unrealistic years rejected.
- **Scenario 7 (Mobile Viewport Verification)**: Verified in `comprehensiveScenarios.test.ts` (Line 107). Critical data structured for narrow displays.
- **Scenario 8 (Local Data Isolation)**: Verified in `comprehensiveScenarios.test.ts` (Line 121). Zero cross-user data leakage.
- **Scenario 9 (Symptom Change Diffing)**: Verified in `comprehensiveScenarios.test.ts` (Line 137). Generates explicit `whatChangedExplanation` when follow-ups change the primary hypothesis.
- **Scenario 10 (Repair Cost Uncertainty)**: Verified in `comprehensiveScenarios.test.ts` (Line 153). Assumptions and confidence disclosed when vehicle context is absent.

---

## 7. Operating Cost Assumptions & Dependencies

| Service / Dependency | Tier | Cost | Purpose |
|---|---|---|---|
| **Vercel** | Hobby / Free | \$0.00 / mo | Static site hosting & Serverless API functions |
| **Google Gemini API** | Free Quota | \$0.00 / mo | Optional AI cloud acceleration (15 RPM free tier) |
| **Local Mechatronic Engine** | Offline / Native | \$0.00 / mo | Primary offline fallback; 0 network calls |
| **Client Storage** | LocalStorage | \$0.00 / mo | Garage & diagnostic history persistence |
| **Total Monthly Operating Cost** | | **\$0.00 / month** | |

---

## 8. Honest Limitations & Product Disclaimers

1. **Not a Substitute for a Certified Mechanic**: MechMate is a diagnostic decision-support system. It cannot disassemble engines or perform physical metallurgical testing.
2. **Manual DTC Code Entry**: MechMate does not currently connect directly to vehicle CAN-buses or OBD-II Bluetooth hardware (e.g., ELM327). Users manually enter trouble codes read from standard scan tools.
3. **Regional Pricing Scope**: Part cost estimates are calibrated specifically for Indian metro and Tier-2 automotive aftermarkets. Vehicle models outside India may experience variance.
4. **Local Device Storage**: Clearing browser cache or switching devices will not automatically sync records unless the user exports and restores their JSON backup.

---

## 9. Next Steps for Independent Development

1. **WebBluetooth OBD-II Integration**: Implement direct ELM327 BLE protocol communication to stream live PID sensor data (engine RPM, coolant temp, fuel trims) directly into the browser.
2. **Audio Acoustic Analysis**: Train a lightweight audio classification model to distinguish between brake squeal, rod knock, and belt chirps from smartphone microphone recordings.
3. **Community Verified Pricing Index**: Allow verified independent mechanics in India to submit anonymized invoice benchmark data to continuously refine cost estimation accuracy.

---

## 10. Checklist for Program Verification (Anna Founding Builder Program)

- [x] Tested independent software engineering rigor (clean TypeScript, modular architecture, comprehensive automated tests).
- [x] Demonstrates real user utility and automotive safety consciousness.
- [x] Zero-cost operational feasibility with sustainable economics.
- [x] Clear articulation of technical trade-offs and domain challenges.
- [ ] Final administrative eligibility criteria must be checked against official published guidelines of the targeted funding program.
