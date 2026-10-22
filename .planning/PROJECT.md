# MechMate — Automotive Intelligence Platform

## What This Is
MechMate is a production-oriented automotive intelligence platform that transforms everyday vehicle troubleshooting into a structured, safety-first diagnostic workflow. Designed for everyday car owners and automotive enthusiasts (particularly in the Indian market), it systematically connects symptom intake, deterministic safety checks, diagnostic evidence exploration, repair cost estimation in ₹, and vehicle maintenance garage tracking.

## Core Value
Transparent, deterministic, safety-first vehicle diagnostics: drivers understand what is wrong, the evidence supporting or refuting each hypothesis, the urgency of the problem, and what safe actions to take without relying on uncalibrated AI hallucinations or risking road safety.

## Requirements

### Validated
- ✓ Core React + Vite + TypeScript client foundation with mechatronic fallback diagnoses (`v1.0.0`)

### Active
- [ ] **Security & Architecture**: Secure API boundary with server-side endpoint, eliminate client-side key leakage, provider-agnostic AI layer with zero-cost fallback.
- [ ] **Deterministic Safety Engine**: Rule-based safety validator that intercepts critical hazards (brake loss, severe overheating, fuel leaks, steering loss) and cannot be overridden by AI responses.
- [ ] **Structured Diagnostic Workflow**: Multi-step progressive symptom intake, contextual follow-up questions, schema-validated diagnostic reports.
- [ ] **Diagnostic Evidence Explorer**: Differentiated feature detailing supporting evidence, contradicting evidence, missing information, and next test steps for each hypothesis.
- [ ] **Vehicle Garage & Health Dashboard**: Multi-vehicle garage management, service history, odometer tracking, offline-first LocalStorage persistence.
- [ ] **Maintenance Intelligence Planner**: Mileage and time-based maintenance intervals, customizable service alerts, service logging.
- [ ] **Localized Repair Cost Estimator**: Indian market parts and labor breakdowns (₹) with explicit confidence intervals and verified/estimated disclosures.
- [ ] **Manual OBD-II Code Diagnostic Lookup**: Trouble code repository and explanation engine for standard DTC codes (P0xxx).
- [ ] **Automated Testing Suite**: Vitest suite covering safety rules, schema validation, persistence, and all 10 user requirement scenarios.
- [ ] **Evaluation Documentation**: Production README, `docs/ANNA_READINESS.md`, and `docs/TECHNICAL_DEMO.md`.

### Out of Scope
- Direct hardware OBD-II Bluetooth/CAN-bus scanning (requires specialized ELM327 dongles/WebBluetooth - manual code lookup provided instead).
- Paid third-party database subscriptions (maintaining 100% free-tier zero-cost architecture).
- User authentication with complex server auth (privacy-preserving local-first browser storage used).
- Definite certified mechanical guarantees (MechMate acts as a diagnostic advisor, not a substitute for hands-on certified mechanics).

## Context
- Original brownfield app was a single-file chat interface (`src/App.tsx`, `gemini.ts`) using Google Gemini 1.5 Flash.
- Suffered from client-side API key leakage (`VITE_GEMINI_API_KEY`), unstructured text outputs, lack of persistence, and basic conversational UI.
- Built for presentation in prestigious builder programs (e.g. Anna Founding Builder Program) to showcase rigorous software engineering and automotive domain depth.

## Constraints
- **Budget**: Zero-cost / free-tier first. No paid databases, no paid APIs.
- **Security**: Zero exposed credentials or keys in client bundles.
- **Safety**: Deterministic rule override for critical automotive hazards.
- **Deployment**: Static & serverless deployable on Vercel (`mechmate-sigma.vercel.app`).

## Key Decisions
| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Local-First Storage (LocalStorage) | Eliminates backend server cost, preserves user privacy, delivers instant offline responsiveness | ✓ Good |
| Deterministic Safety Rule Layer | Automotive safety cannot depend on probabilistic LLM tokens | ✓ Good |
| Vercel Serverless Function Proxy (`/api/diagnose`) | Keeps API keys on server side, prevents client bundle leakage | ✓ Good |
| Schema-Validated Diagnostic Data Model | Guarantees structured rendering and evidence explorer compatibility | ✓ Good |
| Vitest Test Suite | Zero-config TypeScript testing integrated with Vite | ✓ Good |

---
*Last updated: 2026-10-22 after GSD project initialization*
