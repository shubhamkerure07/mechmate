<div align="center">

# 🔧 MechMate — Automotive Intelligence Platform

**A deterministic, safety-first automotive intelligence platform and diagnostic decision-support system.**

<br/>

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-mechmate--sigma.vercel.app-00DC82?style=for-the-badge&logo=vercel&logoColor=white)](https://mechmate-sigma.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Tests-32_Passing-10b981?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](LICENSE)

<br/>

👉 **[Launch MechMate Web App](https://mechmate-sigma.vercel.app)** 👈

</div>

---

## 🚗 1. Product Overview & The Problem

When a vehicle exhibits an unusual sound, vibration, warning light, or overheating issue, everyday car owners face significant challenges:
1. **Asymmetric Automotive Information**: Vehicle owners rarely possess mechatronics training to know whether a symptom is harmless or represents a life-threatening failure.
2. **Aggressive Workshop Upselling**: Without independent diagnostic evidence, drivers frequently pay for unneeded component replacements.
3. **Flaws in General AI Chatbots**: Generic conversational LLMs often fabricate certainty, fail to recognize critical roadside hazards (such as high-pressure boiling coolant or hydraulic brake collapse), and leak developer API keys in client-side code.

**MechMate** solves this by establishing a **structured, safety-first diagnostic intelligence platform**. It combines:
- A **Deterministic Safety Engine** that triggers mandatory emergency stop protocols for severe hazards.
- A **Diagnostic Evidence Explorer** presenting forensic supporting vs. contradicting evidence.
- A **Localized Indian Repair Cost Estimator** with transparent parts vs. labor ranges in Indian Rupees (₹).
- A **Local-First Vehicle Garage & Service Planner** operating at \$0.00/month recurring cost.

---

## ⚖️ How MechMate Differs from a Generic AI Chatbot

| Dimension | Generic Conversational AI Chatbot | MechMate Automotive Platform |
|---|---|---|
| **Safety Assurance** | Probabilistic token generation; can hallucinate or omit critical warnings | Hardcoded deterministic rules (`safetyEngine.ts`) with priority override over AI |
| **Diagnostic Flow** | Open-ended text ping-pong; asks random unstructured questions | Progressive 2-step diagnostic intake with targeted discriminating questions |
| **Evidence Transparency** | Black-box generated summary | **Diagnostic Evidence Explorer** detailing supporting evidence, refuting evidence, missing info, and next tests |
| **Repair Pricing** | Fabricated or generic global ranges | Localized Indian market benchmark ranges (₹) with explicit confidence and assumptions |
| **Security Architecture** | Often bundles `VITE_API_KEY` into public browser bundles | Serverless API proxy (`api/diagnose.ts`); zero secrets in client bundles |
| **Offline Reliability** | Complete outage when API rate-limits or network fails | Dual-layer architecture: full mechatronic expert engine works 100% offline at zero cost |

---

## 🏗️ 2. Architecture & Data Flow

```
                      [Browser Client / Mobile Android]
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
       [Deterministic Safety Engine]           [Local-First Garage & Storage]
       • Brake hydraulic loss checks           • Vehicle profiles (LocalStorage)
       • Pressurized steam burn rules          • Diagnostic history logs
       • Oil pressure loss triage              • Maintenance schedules
       • Raw fuel leak / fire rules            • Portable JSON backup & restore
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
 • GEMINI_API_KEY strictly in env     • Mechatronic domain models
 • Rate-limiting & timeout guards     • Zero API cost dependency
```

---

## ✨ 3. Implemented Features

### ⚡ 1. Structured Diagnostic Intake & Follow-Up Engine
- Multi-symptom quick presets (Brakes, Starting, Overheating, Check Engine, Exhaust Smoke, Transmission).
- Context-aware discriminating follow-up questions (e.g., distinguishing highway overheating from traffic idling).
- Diagnostic summary distinguishing possible causes, likely causes, and confirmed mechanical inspections.

### 🚨 2. Deterministic Safety Engine (`safetyEngine.ts`)
- Standalone rule engine evaluating critical symptoms:
  - Hydraulic brake collapse / pedal sinking to floor
  - Severe thermal runaway / visible steam / boiling coolant (enforces prohibition against opening hot radiator caps)
  - Oil pressure warning light (prevents engine starvation seizure)
  - Under-hood smoke, fire, or raw fuel leak
  - Carbon monoxide exhaust intrusion into the cabin
  - Sudden steering lock-up
- Evaluates in <1ms with zero network dependency.

### 🔍 3. Differentiated Feature: Diagnostic Evidence Explorer
- Forensic evidence breakdown for each potential cause:
  - **Supporting Evidence**: Physical observations validating the hypothesis.
  - **Contradicting Evidence**: Symptoms that weaken the hypothesis.
  - **Missing Information**: Critical data points needed to confirm.
  - **Next Discriminating Test**: Specific diagnostic test to perform before spending money.
- Clear separation between DIY visual inspections and certified workshop equipment checks.

### 🚗 4. Local-First Vehicle Garage
- Store multiple vehicles (Make, Model, Year, Fuel Type, Transmission, Odometer in km, Region).
- Switch active vehicle with one click.
- Diagnostic reports, maintenance schedules, and parts estimates automatically calibrate to the active vehicle.
- Inline odometer tracker.

### 🛠️ 5. Maintenance Intelligence Planner
- Calibrated service intervals for Indian driving conditions (engine oil, cabin filter, air filter, brake fluid flush, coolant matrix clean, transmission gear oil, spark plugs, accessory belts).
- Visual status progress bars: **OVERDUE**, **DUE SOON**, or **HEALTHY**.
- Interactive service completion logger with odometer sync.

### 💰 6. Indian Market Repair Cost Estimator
- Realistic parts and labor cost ranges in Indian Rupees (₹).
- Explicit confidence disclosures: `verified_benchmark`, `indicative_range`, or `uncalibrated_estimate`.
- Transparent assumptions and source methodology disclosure.

### 📟 7. OBD-II Fault Code Intelligence (`obdDatabase.ts`)
- Standard SAE J2012 / ISO 15031 trouble code lookup (P0300, P0301, P0171, P0172, P0420, P0128, P0500, P0700).
- Symptom keyword search.
- Step-by-step diagnostic inspection sequences for mechanics.

### 🛡️ 8. Privacy, Data Governance & Portability
- 100% local-first client storage.
- Portable JSON backup export and restore.
- Zero tracking, zero third-party data broker sharing.

---

## 🛠️ 4. Tech Stack

- **Frontend**: React 18.3, TypeScript 5.5, Vite 5.4
- **Styling**: Pure CSS3 automotive dark cockpit design system (`Plus Jakarta Sans` & `JetBrains Mono`)
- **Backend**: Vercel Serverless Function (`api/diagnose.ts`) + Vite dev middleware
- **AI Acceleration**: Google Gemini 1.5 Flash API (server-side only) + Mechatronic Fallback Engine
- **Testing**: Vitest 2.1 (32 automated unit and integration tests)

---

## 🔒 5. Security & Privacy Architecture

1. **Zero Client-Side Key Exposure**: The previous `VITE_GEMINI_API_KEY` vulnerability has been completely eliminated. `GEMINI_API_KEY` is read strictly on the server by `/api/diagnose.ts`.
2. **Payload Sanitization & Timeouts**: The serverless proxy validates input length (<2,500 chars), enforces an 8-second upstream timeout, and handles network degradation safely.
3. **Local-First Privacy**: User vehicle records, VINs, odometer logs, and diagnostic history are stored solely in the user's browser `LocalStorage`.

---

## 🧪 6. Automated Testing Suite

MechMate includes 32 automated tests covering core automotive domain logic and all 10 user requirement scenarios:

```bash
# Run test suite
npm test
```

### Test Coverage Highlights:
- `src/tests/safetyEngine.test.ts`: 7 tests verifying brake failure, boiling steam, oil pressure loss, fuel odor, steering lock, and minor symptom handling.
- `src/tests/diagnosticEngine.test.ts`: 6 tests verifying symptom intake, follow-up synthesis, hypothesis ranking, and limitation disclosures.
- `src/tests/obdDatabase.test.ts`: 5 tests verifying DTC code queries, symptom matching, and taxonomy integrity.
- `src/tests/storageAndMaintenance.test.ts`: 4 tests verifying garage persistence, odometer updates, service intervals, and JSON export/import.
- `src/tests/comprehensiveScenarios.test.ts`: 10 end-to-end tests validating each of the 10 required evaluation scenarios.

---

## 🚀 7. Local Setup Instructions

### Prerequisites
- Node.js 18+ and npm installed

### Quick Start
```bash
# 1. Clone the repository
git clone https://github.com/shubhamkerure07/mechmate.git
cd mechmate

# 2. Install dependencies
npm install

# 3. (Optional) Configure Server-side Gemini API key in .env
# If omitted, MechMate runs 100% offline on the built-in mechatronic engine at zero cost
cp .env.example .env

# 4. Run automated test suite
npm test

# 5. Start development server
npm run dev
```

Visit `http://localhost:5173` to test the application locally.

---

## 🚢 8. Production Deployment

### Deploying to Vercel
MechMate is pre-configured for instant zero-configuration deployment to Vercel:

1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. (Optional) In Vercel Project Settings > **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Google Gemini API key.
4. Click **Deploy**. Vercel will automatically build the static Vite frontend and deploy `api/diagnose.ts` as a serverless API function.

---

## ⚠️ 9. Limitations & Disclaimers

- **Decision-Support Tool**: MechMate is an automotive intelligence advisor, not a substitute for hands-on physical inspection by a licensed technician.
- **Manual DTC Entry**: Does not currently communicate with ELM327 Bluetooth/OBD dongles over WebBluetooth.
- **Regional Market Scope**: Repair cost benchmarks are calibrated for the Indian automotive market (₹).

---

## 📄 10. Documentation Links

- [ANNA_READINESS.md](docs/ANNA_READINESS.md) — Technical maturity dossier, architectural decisions, and builder evaluation checklist.
- [TECHNICAL_DEMO.md](docs/TECHNICAL_DEMO.md) — 5-minute reproducible walkthrough script for evaluators.

---

## 👤 Author

**Shubham Kerure**  
Engineering Student & Builder  
GitHub: [@shubhamkerure07](https://github.com/shubhamkerure07)
