import { OBDCodeDetails } from '../types/automotive'

/**
 * Standard OBD-II Diagnostic Trouble Code (DTC) Knowledge Repository
 * Verified SAE J2012 / ISO 15031 standard trouble code taxonomy.
 */

export const OBD_DATABASE: Record<string, OBDCodeDetails> = {
  P0300: {
    code: 'P0300',
    title: 'Random / Multiple Cylinder Misfire Detected',
    category: 'Powertrain',
    severity: 'URGENT_INSPECT',
    meaning: 'The engine control module (ECU) has detected that multiple cylinders are not firing fuel-air charges properly, causing crankshaft deceleration anomalies.',
    commonSymptoms: [
      'Engine shaking or jerking during acceleration',
      'Loss of power during overtakes',
      'Rough or unstable idle speed',
      'Flashing or steady Check Engine Light'
    ],
    possibleCauses: [
      'Worn or fouled spark plugs across multiple cylinders',
      'Weak or failing ignition coil packs',
      'Low fuel rail pressure or clogged fuel filter',
      'Intake manifold vacuum leak or unmetered air leak',
      'EGR valve stuck open'
    ],
    recommendedActions: [
      'Inspect spark plug gaps and porcelain insulator condition',
      'Check fuel pressure at the test Schrader valve on fuel rail',
      'Smoke-test intake tract for vacuum leaks downstream of throttle body',
      'Inspect ignition coil primary and secondary resistance'
    ]
  },
  P0301: {
    code: 'P0301',
    title: 'Cylinder 1 Misfire Detected',
    category: 'Powertrain',
    severity: 'URGENT_INSPECT',
    meaning: 'The ECU crankshaft position sensor registered consistent rotational deceleration during Cylinder 1 power strokes.',
    commonSymptoms: [
      'Rhythmic exhaust popping or puffing at idle',
      'Check engine light illuminated (blinking if severe)',
      'Engine hesitation under load'
    ],
    possibleCauses: [
      'Faulty Cylinder 1 ignition coil pack',
      'Fouled or damaged Cylinder 1 spark plug',
      'Clogged or leaking Cylinder 1 fuel injector',
      'Low cylinder compression (leaking valve or ring wear)'
    ],
    recommendedActions: [
      'Swap Cylinder 1 coil pack with Cylinder 2; re-scan to see if misfire moves to P0302',
      'Inspect spark plug electrode for oil or fuel wetting',
      'Perform cylinder compression and leakdown test'
    ]
  },
  P0171: {
    code: 'P0171',
    title: 'System Too Lean (Bank 1)',
    category: 'Powertrain',
    severity: 'MODERATE_MONITOR',
    meaning: 'The upstream oxygen sensor detected too much oxygen in exhaust gases. The ECU added maximum compensatory fuel trim (+20% or more) without correcting the air-fuel ratio.',
    commonSymptoms: [
      'Engine hesitation or flat spot upon pressing throttle',
      'Rough idle that improves as engine warms up',
      'Decreased fuel efficiency',
      'Check Engine Light illuminated'
    ],
    possibleCauses: [
      'Vacuum leak (split PCV hose, intake gasket leak, loose dipstick)',
      'Contaminated Mass Airflow (MAF) sensor wire reading low',
      'Weak fuel pump or clogged in-tank fuel strainer',
      'Exhaust manifold crack upstream of O2 sensor'
    ],
    recommendedActions: [
      'Inspect PCV valve and all vacuum lines with soapy water or smoke generator',
      'Clean MAF sensor with dedicated solvent cleaner (never touch wire directly)',
      'Check long-term fuel trim (LTFT) on live OBD scanner (should be near 0%, >+15% confirms lean)'
    ]
  },
  P0172: {
    code: 'P0172',
    title: 'System Too Rich (Bank 1)',
    category: 'Powertrain',
    severity: 'MODERATE_MONITOR',
    meaning: 'The engine is burning too much fuel relative to air. The ECU has subtracted maximum compensatory fuel trim (-20% or more).',
    commonSymptoms: [
      'Black exhaust smoke on acceleration',
      'Strong gasoline odor from tailpipe',
      'Fouled black spark plugs',
      'Engine stumbling or sluggish throttle response'
    ],
    possibleCauses: [
      'Severely clogged engine air filter element',
      'Leaking or stuck-open fuel injector',
      'Defective fuel pressure regulator (high fuel rail pressure)',
      'Faulty engine coolant temperature (ECT) sensor reading permanently cold'
    ],
    recommendedActions: [
      'Replace dirty engine air filter element',
      'Perform fuel injector pressure drop balance test',
      'Verify ECT sensor live temperature data matches infrared thermometer reading'
    ]
  },
  P0420: {
    code: 'P0420',
    title: 'Catalyst System Efficiency Below Threshold (Bank 1)',
    category: 'Powertrain',
    severity: 'MODERATE_MONITOR',
    meaning: 'The downstream oxygen sensor voltage waveform is mirroring the upstream sensor waveform, indicating the catalytic converter is no longer storing oxygen or treating hydrocarbons effectively.',
    commonSymptoms: [
      'Check Engine Light illuminated with no noticeable drivability symptoms',
      'Sulfur / rotten egg odor from exhaust pipe',
      'Failure of vehicle pollution / emissions test (PUC in India)'
    ],
    possibleCauses: [
      'Degraded catalytic converter internal ceramic honeycomb',
      'Downstream O2 sensor sensor aging / slow response',
      'Exhaust leak near catalytic converter flanges',
      'Contamination from burning engine oil or coolant'
    ],
    recommendedActions: [
      'Inspect exhaust piping for pinholes or rusted joint gaskets',
      'Compare upstream vs downstream O2 sensor voltages on oscilloscope or scan tool',
      'Check engine for underlying oil or coolant consumption that destroyed the catalyst'
    ]
  },
  P0128: {
    code: 'P0128',
    title: 'Coolant Thermostat (Coolant Temp Below Regulating Temperature)',
    category: 'Powertrain',
    severity: 'MODERATE_MONITOR',
    meaning: 'Engine coolant temperature failed to reach nominal operating temperature (82°C-90°C) within the calibrated time period after cold start.',
    commonSymptoms: [
      'Cabin heater blows only lukewarm or cool air in cold weather',
      'Temperature gauge needle rests low even after 20 minutes of driving',
      'Excessive fuel consumption (engine stays in open-loop enrichment)'
    ],
    possibleCauses: [
      'Thermostat stuck open or opening prematurely',
      'Low engine coolant level preventing sensor immersion',
      'Defective Engine Coolant Temperature (ECT) sensor'
    ],
    recommendedActions: [
      'Inspect coolant level in radiator and expansion tank',
      'Replace the engine thermostat valve with a fresh OEM unit',
      'Flush and bleed cooling system'
    ]
  },
  P0500: {
    code: 'P0500',
    title: 'Vehicle Speed Sensor (VSS) Malfunction',
    category: 'Powertrain',
    severity: 'URGENT_INSPECT',
    meaning: 'The ECU stopped receiving valid rolling speed pulses from the vehicle speed sensor or ABS hub tone ring.',
    commonSymptoms: [
      'Speedometer needle dead, jumping wildly, or showing 0 km/h while moving',
      'Harsh or erratic automatic transmission shifts',
      'ABS or traction control warning lights triggered simultaneously',
      'Cruise control inoperative'
    ],
    possibleCauses: [
      'Defective VSS sensor or magnetic pickup head',
      'Broken or chewed wiring harness near wheel hubs or gearbox casing',
      'Corroded or broken wheel hub reluctor ring teeth'
    ],
    recommendedActions: [
      'Inspect VSS wiring connector on transmission casing for oil ingress or wire chafing',
      'Check live wheel speed data on scan tool during slow rolling test',
      'Clean magnetic sensor tip from metallic clutch/gear debris'
    ]
  },
  P0700: {
    code: 'P0700',
    title: 'Transmission Control System (MIL Request)',
    category: 'Powertrain',
    severity: 'URGENT_INSPECT',
    meaning: 'The Transmission Control Module (TCM) detected an internal gearbox fault and requested the main ECU to illuminate the Check Engine Light.',
    commonSymptoms: [
      'Transmission goes into "Limp-Home Mode" (locked in 3rd gear)',
      'Harsh gear engagement from Park to Drive',
      'Transmission slipping during gear upshifts',
      'Check Engine Light illuminated'
    ],
    possibleCauses: [
      'Low or degraded transmission fluid (ATF / CVT fluid)',
      'Faulty transmission shift solenoid valve',
      'Transmission oil temperature overheating',
      'Internal clutch band or torque converter lockup clutch wear'
    ],
    recommendedActions: [
      'Scan TCM module directly with full-system OBD scanner for specific sub-codes (e.g. P0730, P0750)',
      'Check transmission fluid level and color (burnt brown indicates internal friction wear; healthy is pink/amber)',
      'Inspect transmission wiring harness plug for fluid seepage'
    ]
  }
}

/**
 * Searches the OBD knowledge base for a code or matching symptoms.
 */
export function lookupOBDCode(codeQuery: string): OBDCodeDetails | null {
  const normalized = codeQuery.trim().toUpperCase()
  if (OBD_DATABASE[normalized]) {
    return OBD_DATABASE[normalized]
  }
  // Try partial prefix match
  const match = Object.keys(OBD_DATABASE).find(k => k.startsWith(normalized))
  return match ? OBD_DATABASE[match] : null
}

export function searchOBDBySymptom(query: string): OBDCodeDetails[] {
  const q = query.toLowerCase()
  return Object.values(OBD_DATABASE).filter(entry =>
    entry.code.toLowerCase().includes(q) ||
    entry.title.toLowerCase().includes(q) ||
    entry.meaning.toLowerCase().includes(q) ||
    entry.commonSymptoms.some(s => s.toLowerCase().includes(q)) ||
    entry.possibleCauses.some(c => c.toLowerCase().includes(q))
  )
}
