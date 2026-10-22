# Architectural & Security Concerns

## 1. Critical Security Vulnerability: Client-Side API Key Exposure
- **Issue**: `VITE_GEMINI_API_KEY` is referenced directly in `src/services/gemini.ts`. In Vite applications, all `VITE_*` variables are statically injected into the public production client bundle (`dist/assets/index-*.js`).
- **Impact**: Any user or web scraper can inspect the deployed website, extract the Gemini API key, and incur costs or exhaust quotas.
- **Remediation**:
  - Implement a serverless API proxy (`api/diagnose.ts` for Vercel functions, or Vite dev middleware).
  - Use server-side `GEMINI_API_KEY` (without `VITE_` prefix) never exposed to the client.
  - Maintain the robust local offline diagnostic engine as a zero-cost, 100% private fallback.

## 2. Lack of Structured Diagnostic Separation
- **Issue**: The current app treats vehicle troubleshooting as an open-ended chatbot conversation.
- **Impact**: Users cannot systematically trace root causes, compare evidence, evaluate component urgency, or receive structured checklists.

## 3. Absence of Deterministic Safety Layer
- **Issue**: Safety warnings are generated as part of LLM prompt text or simple static fallback strings.
- **Impact**: An LLM hallucination could fail to warn a driver about catastrophic brake loss or high-pressure coolant explosion risks.
- **Remediation**: A standalone deterministic safety rule engine that executes prior to and independently of any LLM call.

## 4. In-Memory Ephemeral State
- **Issue**: Refreshing the browser clears all messages, vehicle inputs, and diagnostic results.
- **Remediation**: Offline-first LocalStorage persistence for vehicles, diagnostic history, and maintenance schedules.
