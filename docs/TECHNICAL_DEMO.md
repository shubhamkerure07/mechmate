# MechMate — 5-Minute Technical Demonstration Script

This script provides an honest, step-by-step reproducible walkthrough for technical evaluators, judges, and engineering peers.

**Target Duration**: 5 minutes  
**Local Setup**: Run `npm run dev` in the project root, open `http://localhost:5173` (or visit `https://mechmate-sigma.vercel.app`).

---

### Minute 1: The Problem & Garage Setup
- **Action**: Navigate to the **Garage** tab (`🚗 Garage`).
- **Narrative**:
  > "Most car owners feel helpless when an unfamiliar noise or dashboard warning light appears. They walk into repair shops vulnerable to aggressive upsells. Meanwhile, general AI chatbots give vague, uncalibrated answers and fail to issue urgent safety warnings. MechMate is built to solve this."
- **Action**: Click **+ Add Vehicle**. Enter:
  - Make: `Tata`
  - Model: `Nexon`
  - Year: `2022`
  - Fuel: `Diesel`
  - Transmission: `Manual`
  - Odometer: `32,000 km`
  - Region: `Bengaluru, Karnataka`
- **Result**: Show that the vehicle is saved locally, set as active, and reflected in the persistent header pill.

---

### Minute 2: Progressive Diagnostic Intake & Follow-Up Questions
- **Action**: Switch to the **Diagnose** tab (`⚡ Diagnose`).
- **Narrative**:
  > "Instead of a generic chatbot prompt, MechMate implements a structured diagnostic intake flow."
- **Action**: In the symptom textarea, type:  
  `"My car overheats after 15 minutes of driving and the temperature gauge is in the red zone."`
- **Action**: Click **Analyze Symptoms & Begin Check**.
- **Demonstration**:
  - Point out that **Step 2 (Clarifying Follow-Up Questions)** immediately appears.
  - Show the 2 discriminating questions generated dynamically:
    1. *"Is visible steam or boiling coolant escaping from under the bonnet?"*
    2. *"When does the temperature climb fastest?"*
  - Select:
    - `Heavy steam / boiling coolant` (Hazard trigger)
    - `Idling in traffic / stopped at signals`

---

### Minute 3: Deterministic Safety Alert & Comprehensive Diagnostic Report
- **Action**: Click **✓ Generate Diagnostic Report**.
- **Demonstration**:
  1. **Deterministic Safety Banner**:
     - Point out the prominent red emergency banner: **🚨 CRITICAL SAFETY HAZARD DETECTED**.
     - Emphasize: *"This warning was triggered deterministically by our automotive safety engine, completely independent of upstream AI, and cannot be downgraded by model output. Notice the mandatory precaution: NEVER OPEN THE RADIATOR CAP ON A HOT ENGINE."*
  2. **Hypotheses & Urgency**:
     - Urgency badge: `CRITICAL STOP`.
     - Probable causes: `Electric Radiator Cooling Fan or Fan Relay Failure` (ranked Likely).
  3. **Indian Market Repair Cost Breakdown**:
     - Parts: `₹1,800 – ₹4,200`
     - Labor: `₹600 – ₹1,400`
     - Total: `₹2,400 – ₹5,600`
     - Point out the transparent disclosure: benchmark data source and assumptions.
  4. **Inspection Split**:
     - Show the distinct split between what the driver can safely check without tools (observe if fan spins with AC ON) vs. what the mechanic must test (bridge relay, live ECU scan).

---

### Minute 4: The Differentiated Feature — Diagnostic Evidence Explorer
- **Action**: Click **Open Diagnostic Evidence Explorer ↗** (or switch to the `🔍 Evidence` tab).
- **Narrative**:
  > "This is MechMate's core architectural differentiator: the Diagnostic Evidence Explorer. Instead of a black box prediction, we lay out the mechanical case like a forensic investigator."
- **Demonstration**:
  - Show the 4 evidence quadrants:
    1. **Supporting Evidence**: Explains why idling in traffic points to radiator airflow deficit rather than highway water pump failure.
    2. **Contradicting Evidence**: Explains what would weaken this hypothesis (e.g., if fan spins with AC active).
    3. **Missing Information**: Details unverified facts (fan fuse continuity, fan motor free-spinning check).
    4. **Next Discriminating Test**: Specific diagnostic test to perform before purchasing a replacement motor.

---

### Minute 5: Maintenance Intelligence, OBD-II Code Lookup & Testing Rigor
- **Action**:
  1. Click the **Service** tab (`🛠️ Service`):
     - Show the calibrated service milestone cards (oil change, coolant flush, serpentine belt).
     - Click **✓ Log Service** on an overdue item, enter updated odometer, and show the progress bar update to Healthy.
  2. Click the **OBD-II** tab (`📟 OBD-II`):
     - Type `P0300` or select from quick chips.
     - Show the verified technical definition, root causes, and diagnostic steps.
  3. Open the terminal and execute:
     ```bash
     npm test
     ```
     - Show all **32 automated tests** passing in ~600ms, including all 10 scenario benchmarks and deterministic safety constraints.
- **Concluding Statement**:
  > "MechMate proves that generative AI is most powerful when combined with deterministic safety rules, structured domain reasoning, local-first privacy, and transparent pricing economics."
