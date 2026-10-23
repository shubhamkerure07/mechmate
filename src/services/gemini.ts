// MechMate Diagnostic Bridge & Service Adapter
// Provides backward compatibility with original sendMessage interface
// Powered by server-side /api/diagnose and mechatronic offline engine

import { requestDiagnosticExplanation } from './aiProvider'
import { evaluateSafetyRules } from './safetyEngine'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

let conversationHistory: { role: 'user' | 'assistant'; content: string }[] = []

/**
 * Intelligent Automotive Diagnostic Fallback Engine
 * Mechatronics domain models providing accurate automotive diagnostics
 * offline at zero cost.
 */
export function getExpertAutomotiveDiagnosis(query: string): string {
  const q = query.toLowerCase()

  // Run deterministic safety check first
  const safety = evaluateSafetyRules(query)
  let safetyPreamble = ''
  if (safety.requiresImmediateStop) {
    safetyPreamble = `🚨 **SAFETY EMERGENCY**: ${safety.summaryWarning}\n\n`
  }

  // 1. Brakes
  if (q.includes('brake') || q.includes('grind') || q.includes('squeak') || q.includes('stopping')) {
    return `${safetyPreamble}🔍 **Diagnose**: 
The most common cause of grinding while braking is **worn-out brake pads** where friction lining has depleted, causing the metal backing plate to score the brake rotor (disc). A high-pitched squeal indicates the built-in wear indicator shim alerting that pads are thin (< 3mm).

⚠️ **Severity**: **Urgent (High Safety Risk)**
Metal-to-metal contact scores rotors, increases stopping distance by up to 40%, and risks hydraulic caliper piston overextension.

⚙️ **Evidence Breakdown**:
- *Supporting*: Grinding sound synchronous with wheel rotation during deceleration.
- *Contradicting*: Noise persisting even when coasting without touching brake pedal.
- *Next Test*: Visual inspection through wheel spokes of outer/inner pad friction thickness.

🔧 **Recommended Action**:
1. Inspect pad thickness and rotor surface on both sides of the axle.
2. Replace brake pad set (front/rear).
3. Resurface (skim) or replace brake rotors if grooved.
4. Bleed brake lines and replenish DOT 3 / DOT 4 brake fluid.

💰 **Estimated Cost (India)**:
- Brake Pads replacement: ₹1,500 – ₹3,500
- Rotor replacement / skimming: ₹1,200 – ₹4,500 per axle
- Labor: ₹500 – ₹1,200

🛡️ **Safety Tip**: Avoid high-speed driving or highway trips until inspected. Sudden brake fade can lead to loss of control.`
  }

  // 2. Battery / Starting
  if (q.includes('start') || q.includes('battery') || q.includes('crank') || q.includes('morning') || q.includes('dead')) {
    return `${safetyPreamble}🔍 **Diagnose**: 
If the engine refuses to crank in the morning but dashboard lights illuminate, the primary culprits are **low battery cranking capacity (insufficient Cold Cranking Amps / CCA)**, **corroded terminal clamps**, or a **sticking starter motor solenoid**. Parasitic overnight discharge (faulty cabin light or aftermarket accessories) can also drop resting voltage below the 12.2V threshold.

⚠️ **Severity**: **Moderate to Urgent (Stranding Risk)**
Risk of total vehicle stranding in traffic or remote locations.

⚙️ **Evidence Breakdown**:
- *Supporting*: Rapid clicking sound or slow labored crank during initial key turn.
- *Contradicting*: Engine spins fast but fails to catch fire (points to fuel pump or immobilizer, not battery).
- *Next Test*: Multimeter reading across battery terminals under static (resting) and cranking conditions.

🔧 **Recommended Action**:
1. Check battery voltage using a multimeter (Healthy: 12.6V resting, >10V during cranking).
2. Clean battery terminal posts with a wire brush to eliminate lead sulfate oxidation.
3. Test alternator output (should show 13.8V – 14.4V with engine idling).
4. Inspect starter relay and ignition switch fuses.

💰 **Estimated Cost (India)**:
- Battery replacement (Amaron / Exide): ₹3,800 – ₹6,500 (with old battery exchange)
- Starter motor overhaul: ₹1,800 – ₹3,500
- Terminal cleaning / minor electrical: ₹200 – ₹500

🛡️ **Safety Tip**: Do not crank continuously for more than 10 seconds to avoid overheating starter motor windings.`
  }

  // 3. Overheating / Radiator
  if (q.includes('heat') || q.includes('overheat') || q.includes('coolant') || q.includes('radiator') || q.includes('temperature') || q.includes('steam')) {
    return `${safetyPreamble}🔍 **Diagnose**: 
Engine overheating indicates a thermal regulation failure. Primary suspects:
1. **Stuck closed thermostat valve** blocking coolant circulation into the radiator matrix.
2. **Cooling fan failure** (burnt motor, blown 30A fuse, or faulty thermal sensor switch).
3. **Coolant loss / leak** (split radiator hose, leaking water pump gasket, or punctured core).
4. **Air lock** inside cooling jacket preventing heat exchange.

⚠️ **Severity**: **Critical (Immediate Attention Required)**
Driving an overheating engine causes aluminum cylinder head warping, blown head gaskets, or total piston seizure.

⚙️ **Evidence Breakdown**:
- *Supporting*: Temperature gauge in red zone, boiling reservoir coolant, sweet coolant odor.
- *Contradicting*: Temperature normalizes when turning cabin heater on full blast (points to radiator/fan airflow deficit).
- *Next Test*: Verify if electric radiator fan engages when AC is switched ON.

🔧 **Recommended Action**:
1. Inspect coolant expansion tank level when engine is COMPLETELY cold.
2. Verify radiator cooling fan spins when temperature climbs past 90°C.
3. Pressure test cooling system to locate hose pinholes or matrix seepage.
4. Flush radiator and replace thermostat valve.

💰 **Estimated Cost (India)**:
- Coolant flush & refill (Ethylene Glycol): ₹600 – ₹1,500
- Thermostat valve replacement: ₹800 – ₹2,000
- Radiator fan motor replacement: ₹2,000 – ₹4,500
- Water pump replacement: ₹2,500 – ₹6,000

🛡️ **Safety Tip**: **NEVER open the radiator cap when the engine is warm.** Pressurized boiling coolant causes catastrophic thermal burns.`
  }

  // 4. Check Engine Light / Misfire
  if (q.includes('check engine') || q.includes('light') || q.includes('misfire') || q.includes('rough') || q.includes('sensor')) {
    return `${safetyPreamble}🔍 **Diagnose**: 
A solid Check Engine Light (CEL) with uneven engine vibrations typically signifies an **ignition misfire (bad spark plug or coil pack)**, a **vacuum leak (split PCV hose)**, or a **dirty Mass Airflow (MAF) / Oxygen (O2) sensor**. If the light is actively FLASHING, it indicates a severe misfire dumping unburned fuel directly into the catalytic converter.

⚠️ **Severity**: **Moderate if steady; CRITICAL if flashing!**
A blinking CEL demands pulling over immediately to prevent catalytic converter fire and thermal destruction.

⚙️ **Evidence Breakdown**:
- *Supporting*: Noticeable jerking during acceleration under load (3rd gear low RPM).
- *Contradicting*: Smooth engine idle and normal fuel consumption (suggests minor emissions purge valve code).
- *Next Test*: Scan OBD-II port for specific Diagnostic Trouble Codes (e.g., P0300, P0301, P0171).

🔧 **Recommended Action**:
1. Read diagnostic trouble codes via an OBD-II scanner.
2. Inspect spark plugs for carbon fouling, fuel wetting, or electrode wear.
3. Clean throttle body butterfly valve and MAF sensor with specialized aerosol cleaner.
4. Test ignition coil secondary resistance with a multimeter.

💰 **Estimated Cost (India)**:
- OBD-II computer diagnostic scan: ₹300 – ₹800
- Spark plug set (4x NGK/Bosch): ₹600 – ₹2,400
- Ignition coil pack: ₹1,500 – ₹3,800
- Throttle body / sensor cleaning: ₹500 – ₹1,200

🛡️ **Safety Tip**: If experiencing acceleration lag during overtaking maneuvers, stay in the slow lane until scanned.`
  }

  // 5. Smoke / Exhaust
  if (q.includes('smoke') || q.includes('exhaust') || q.includes('black') || q.includes('white') || q.includes('blue')) {
    return `${safetyPreamble}🔍 **Diagnose**: 
Exhaust smoke color directly identifies the internal combustion anomaly:
- **Blue/Grey Smoke**: Engine is consuming motor oil (worn valve stem seals or stuck piston rings).
- **Thick Sweet White Smoke**: Coolant entering combustion chamber (ruptured cylinder head gasket or cracked block).
- **Black Smoke**: Excessive fuel rich mixture (clogged engine air filter, leaking injector, or faulty fuel pressure regulator).

⚠️ **Severity**: **Urgent**
Unresolved smoke causes catalytic converter poisoning, spark plug fouling, and rapid oil starvation.

⚙️ **Evidence Breakdown**:
- *Supporting*: Drop in engine oil or coolant level without visible exterior ground puddles.
- *Contradicting*: Thin white condensation steam that disappears once the exhaust pipe warms up (normal in cold weather).
- *Next Test*: Check oil dipstick for frothy "milky coffee" emulsion; perform cylinder compression test.

🔧 **Recommended Action**:
1. Inspect dipstick and radiator neck for fluid cross-contamination.
2. Carry out wet and dry engine cylinder compression test.
3. Replace engine air filter and service fuel injectors.
4. Replace cylinder head gasket if compression leaks into cooling jackets.

💰 **Estimated Cost (India)**:
- Air filter & injector ultrasonic cleaning: ₹1,200 – ₹2,800
- Head gasket replacement job: ₹7,000 – ₹18,000
- Engine overhaul (piston rings & bearings): ₹25,000+

🛡️ **Safety Tip**: Check engine oil and coolant levels before every trip.`
  }

  // 6. Clutch / Transmission
  if (q.includes('gear') || q.includes('clutch') || q.includes('slip') || q.includes('transmission') || q.includes('shifting')) {
    return `${safetyPreamble}🔍 **Diagnose**: 
Engine revs climbing without proportional forward road speed indicates a **slipping clutch friction plate**. Difficulty slotting into 1st or Reverse gear with grinding sounds indicates a **worn clutch release bearing**, **hydraulic clutch master/slave cylinder leak**, or **low transmission gear oil**.

⚠️ **Severity**: **Moderate to Urgent**
A worn clutch plate will eventually lose all friction transfer, leaving the vehicle immobilized on inclines or in heavy traffic.

⚙️ **Evidence Breakdown**:
- *Supporting*: Burning friction smell (similar to burnt brake lining) when pulling away on slopes.
- *Contradicting*: Noise disappears completely when clutch pedal is fully depressed.
- *Next Test*: Handbrake stall test (3rd gear clutch engagement test by a mechanic).

🔧 **Recommended Action**:
1. Check clutch hydraulic fluid level and inspect pedal linkage free-play.
2. Inspect transmission gear oil viscosity and level.
3. Replace complete 3-piece clutch kit (pressure plate, friction disc, release bearing).

💰 **Estimated Cost (India)**:
- Clutch kit replacement (Hatchback/Sedan): ₹4,500 – ₹9,500
- Transmission gear oil flush: ₹900 – ₹1,800
- Labor charges: ₹2,000 – ₹3,500

🛡️ **Safety Tip**: Avoid riding the clutch pedal at red lights or in slow-moving traffic.`
  }

  // 7. General Fallback
  return `${safetyPreamble}🔍 **Diagnose**: 
Based on automotive mechatronics and powertrain systems, your reported symptoms point to mechanical wear, electrical contact oxidation, or sensor calibration drift in the associated vehicle subsystem. Modern vehicles use closed-loop feedback; abnormal vibrations, delays, or noises are early indicators before complete component failure.

⚠️ **Severity**: **Moderate**
Addressing the symptom early prevents collateral stress on secondary suspension and drivetrain components.

⚙️ **Evidence Breakdown**:
- *Supporting*: Noticeable physical deviation from baseline operating characteristics.
- *Contradicting*: Intermittent appearance with zero pending ECU diagnostic trouble codes.
- *Next Test*: Low-speed test drive correlating noise/vibration with engine RPM vs vehicle rolling speed.

🔧 **Recommended Action**:
1. Perform visual inspection under hood and around wheel wells for loose brackets, chafed wiring, or fluid seepage.
2. Connect an OBD-II scanner to inspect pending freeze-frame error logs.
3. Have a qualified technician perform a physical mechanical inspection.

💰 **Estimated Cost (India)**:
- Inspection & Comprehensive Diagnostics: ₹300 – ₹800
- Standard Subsystem Servicing: ₹1,500 – ₹4,500

🛡️ **Safety Tip**: If vehicle dynamics or handling feel unpredictable, avoid expressway speeds until inspected.`
}

export async function sendMessage(userMessage: string): Promise<string> {
  conversationHistory.push({
    role: 'user',
    content: userMessage
  })

  // Attempt server-side proxy request
  try {
    const response = await requestDiagnosticExplanation({
      symptoms: userMessage,
      conversationHistory
    })

    if (response.provider === 'server_ai' && response.rawText) {
      conversationHistory.push({
        role: 'assistant',
        content: response.rawText
      })
      return response.rawText
    }
  } catch (err) {
    console.warn('Server diagnostic call returned error. Falling back to local expert engine:', err)
  }

  // Fallback to mechatronic expert engine
  const fallbackDiagnosis = getExpertAutomotiveDiagnosis(userMessage)
  conversationHistory.push({
    role: 'assistant',
    content: fallbackDiagnosis
  })
  return fallbackDiagnosis
}

export function resetChat(): void {
  conversationHistory = []
}
