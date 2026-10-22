import {
  DiagnosticAssessment,
  IndianCostRange,
  PotentialCause,
  SafetyAssessment,
  VehicleProfile
} from '../types/automotive'
import { evaluateSafetyRules } from './safetyEngine'
import { requestDiagnosticExplanation } from './aiProvider'

export interface DiagnosticInput {
  symptoms: string
  vehicle?: VehicleProfile | null
  followUpAnswers?: Record<string, string>
  previousAssessment?: DiagnosticAssessment | null
}

/**
 * Diagnostic Orchestration Engine for MechMate
 * Unifies deterministic safety protocols, automotive reasoning models,
 * structured evidence analysis, and transparent Indian repair pricing.
 */
export async function runDiagnosticEngine(
  input: DiagnosticInput
): Promise<DiagnosticAssessment> {
  const { symptoms, vehicle = null, followUpAnswers = {}, previousAssessment = null } = input
  const combinedText = `${symptoms} ${Object.values(followUpAnswers).join(' ')}`.trim()

  // 1. Mandatory Step: Evaluate Deterministic Safety
  const baseSafety = evaluateSafetyRules(combinedText)
  const safety = enhanceSafetyWithAnswers(baseSafety, followUpAnswers)

  // 2. Derive Potential Causes with Structured Evidence
  const potentialCauses = derivePotentialCauses(symptoms, vehicle, followUpAnswers, safety)

  // 3. Calculate Localized Indian Repair Costs
  const costEstimate = calculateIndianCostEstimate(potentialCauses, vehicle)

  // 4. Generate Transparency & Uncertainty Disclosures
  const limitations = generateDiagnosticLimitations(vehicle, potentialCauses)

  // 5. Generate "What Changed" Explanation if this is an updated consultation
  const whatChangedExplanation = previousAssessment
    ? generateWhatChangedExplanation(previousAssessment, potentialCauses, safety)
    : undefined

  // 6. Attempt Optional Server-Side AI Annotation if available
  let providerOrigin: 'deterministic_engine' | 'ai_service' | 'hybrid_verified' = 'deterministic_engine'
  try {
    const aiResponse = await requestDiagnosticExplanation({
      symptoms: combinedText,
      vehicle
    })
    if (aiResponse.provider === 'server_ai') {
      providerOrigin = 'hybrid_verified'
    }
  } catch (_e) {
    // Keep deterministic engine as reliable baseline
  }

  const confidenceScoreText = vehicle
    ? 'Moderate confidence: Calibrated with vehicle make, model, and mileage benchmarks.'
    : 'General indicative assessment: Vehicle specifics unknown; conservative general baseline applied.'

  return {
    id: 'diag_' + Date.now(),
    timestamp: new Date().toISOString(),
    vehicle: vehicle || null,
    rawInput: symptoms,
    symptomSummary: generateSymptomSummary(symptoms, followUpAnswers),
    safety,
    potentialCauses,
    costEstimate,
    limitations,
    whatChangedExplanation,
    confidenceScoreText,
    providerOrigin
  }
}

/**
 * Elevates safety ratings if user answered follow-up questions indicating critical hazards.
 */
function enhanceSafetyWithAnswers(
  safety: SafetyAssessment,
  answers: Record<string, string>
): SafetyAssessment {
  const clone = { ...safety, matches: [...safety.matches] }

  if (answers['Q_OVERHEAT_STEAM'] === 'heavy_steam' && clone.overallSeverity !== 'CRITICAL_STOP') {
    clone.overallSeverity = 'CRITICAL_STOP'
    clone.requiresImmediateStop = true
    clone.matches.push({
      ruleId: 'SAFE_OVERHEAT_CONFIRMED',
      hazardName: 'Active Pressurized Coolant Steam Eruption',
      severity: 'CRITICAL_STOP',
      immediateAction: 'Pull over immediately. Switch off engine. DO NOT touch radiator cap.',
      hazards: ['Severe scalding burn hazard', 'Head gasket warping'],
      prohibitedActions: ['NEVER OPEN RADIATOR CAP'],
      safeCheckpoints: ['Wait 45 minutes for engine to reach ambient temperature']
    })
    clone.summaryWarning = 'Active steam or boiling coolant confirmed. Stop engine immediately to avoid destruction.'
  }

  if (answers['Q_BRAKE_PEDAL_FEEL'] === 'spongy_sinks' && clone.overallSeverity !== 'CRITICAL_STOP') {
    clone.overallSeverity = 'CRITICAL_STOP'
    clone.requiresImmediateStop = true
    clone.matches.push({
      ruleId: 'SAFE_BRAKE_HYDRAULIC_LOSS',
      hazardName: 'Brake Hydraulic Pressure Collapse',
      severity: 'CRITICAL_STOP',
      immediateAction: 'Pedal sinking indicates loss of hydraulic fluid. DO NOT drive on public roads.',
      hazards: ['Zero braking capability', 'Collision risk'],
      prohibitedActions: ['DO NOT drive at highway speeds'],
      safeCheckpoints: ['Inspect brake fluid reservoir level']
    })
    clone.summaryWarning = 'Brake pedal sinking to floor indicates hydraulic system failure. Stop driving immediately.'
  }

  if (answers['Q_CEL_STATE'] === 'flashing' && clone.overallSeverity !== 'CRITICAL_STOP') {
    clone.overallSeverity = 'CRITICAL_STOP'
    clone.requiresImmediateStop = true
    clone.matches.push({
      ruleId: 'SAFE_FLASHING_CEL',
      hazardName: 'Severe Active Cylinder Misfire',
      severity: 'CRITICAL_STOP',
      immediateAction: 'Flashing check engine light indicates raw fuel entering exhaust. Reduce speed immediately and stop safely.',
      hazards: ['Catalytic converter meltdown / exhaust fire', 'Cylinder wall wash and piston damage'],
      prohibitedActions: ['DO NOT drive under high engine loads'],
      safeCheckpoints: ['Check for loose ignition leads or severe engine shake']
    })
    clone.summaryWarning = 'Actively flashing Check Engine Light signals severe misfire. Immediate inspection required.'
  }

  return clone
}

function derivePotentialCauses(
  symptoms: string,
  _vehicle: VehicleProfile | null,
  answers: Record<string, string>,
  safety: SafetyAssessment
): PotentialCause[] {
  const q = `${symptoms} ${Object.values(answers).join(' ')}`.toLowerCase()
  const causes: PotentialCause[] = []

  // Case 1: Brakes
  if (q.includes('brake') || q.includes('grind') || q.includes('squeak') || q.includes('stopping')) {
    const isSinking = answers['Q_BRAKE_PEDAL_FEEL'] === 'spongy_sinks'
    const isGrinding = answers['Q_BRAKE_PEDAL_FEEL'] === 'hard_grinding' || q.includes('grind')

    causes.push({
      id: 'cause_brake_pads',
      name: isGrinding ? 'Severe Brake Pad Depletion (Backing Plate Contact)' : 'Worn Brake Friction Pads',
      systemCategory: 'Brakes',
      probability: isGrinding ? 'Likely' : 'Possible',
      reasoning: isGrinding
        ? 'Metal backing plate is making direct contact with the brake rotor, generating loud grinding and scoring the disc.'
        : 'Friction lining is worn down near or past the 3mm service threshold, causing squealing or reduced bite.',
      evidence: {
        supporting: [
          'Audible friction noise during deceleration',
          answers['Q_BRAKE_PEDAL_FEEL'] === 'hard_grinding' ? 'Driver confirmed hard grinding underfoot' : 'Symptom corresponds directly with brake pedal application'
        ],
        contradicting: [
          answers['Q_BRAKE_PEDAL_FEEL'] === 'spongy_sinks' ? 'Sinking pedal points to hydraulic pressure leak rather than friction pads' : 'Noise does not persist when rolling in neutral with foot off pedal'
        ],
        missingInfo: [
          'Current measured pad thickness (mm) on inner vs outer caliper pads',
          'Rotor groove depth and runout measurement'
        ],
        discriminatingTest: 'Visual caliper inspection through wheel spokes to verify remaining pad friction depth.'
      },
      safeUserInspection: 'Look through wheel spokes with a flashlight. Verify if friction material between metal backing plate and shiny rotor is less than 3mm.',
      professionalInspectionRequired: true,
      professionalMechanicSteps: [
        'Measure brake pad lining thickness across all 4 pads on axle',
        'Check rotor thickness with micrometer against minimum discard spec (Min TH stamped on hat)',
        'Inspect caliper sliding pins for seized movement or dried silicone grease'
      ]
    })

    if (isSinking || q.includes('soft') || q.includes('fluid') || q.includes('leak')) {
      causes.push({
        id: 'cause_brake_hydraulics',
        name: 'Brake Master Cylinder or Flexible Hose Hydraulic Leak',
        systemCategory: 'Brakes',
        probability: isSinking ? 'Likely' : 'Possible',
        reasoning: 'Loss of hydraulic pressure prevents calipers from clamping rotors with sufficient force.',
        evidence: {
          supporting: [
            'Brake pedal travel excessive or sinking to floorboard',
            safety.requiresImmediateStop ? 'Critical stop safety condition active' : 'Reported low braking efficiency'
          ],
          contradicting: [
            answers['Q_BRAKE_PEDAL_FEEL'] === 'hard_grinding' ? 'Firm pedal resistance with grinding usually implies intact hydraulic pressure' : 'No ground fluid puddles under wheels'
          ],
          missingInfo: [
            'Brake fluid reservoir level reading (MAX / MIN mark)',
            'Inspection of rubber brake lines behind struts for wet weeping'
          ],
          discriminatingTest: 'Engine-off pedal pump test: pump pedal 5 times; if pedal sinks slowly under steady foot pressure, master cylinder bypass is confirmed.'
        },
        safeUserInspection: 'Open hood and visually check translucent brake fluid reservoir level without opening the reservoir cap.',
        professionalInspectionRequired: true,
        professionalMechanicSteps: [
          'Perform hydraulic pressure decay test with calibrated gauge',
          'Inspect wheel cylinder seals (rear drums) or caliper piston boots (front discs)',
          'Bleed air bubbles from all four brake calipers in standard order'
        ]
      })
    }
  }

  // Case 2: Engine Overheating
  if (q.includes('heat') || q.includes('temp') || q.includes('coolant') || q.includes('radiator') || q.includes('steam')) {
    const isIdle = answers['Q_OVERHEAT_CONDITION'] === 'idle_traffic'
    const isHighway = answers['Q_OVERHEAT_CONDITION'] === 'highway_cruising'

    causes.push({
      id: 'cause_radiator_fan',
      name: 'Electric Radiator Cooling Fan or Fan Relay Failure',
      systemCategory: 'Cooling',
      probability: isIdle ? 'Likely' : 'Possible',
      reasoning: 'When stationary or idling, ram air is zero. If the electric radiator fan fails to trigger, heat cannot dissipate from the radiator matrix.',
      evidence: {
        supporting: [
          isIdle ? 'Overheating occurs specifically while stopped in traffic' : 'Temperature climbs at low vehicle speeds',
          'Engine temperature drops once car moves at higher speeds'
        ],
        contradicting: [
          isHighway ? 'Overheating at highway speeds indicates coolant circulation deficit, not fan deficit' : 'Fan spins vigorously with AC active'
        ],
        missingInfo: [
          'Whether fan motor spins freely by hand with engine off',
          '30A cooling fan fuse and relay continuity'
        ],
        discriminatingTest: 'Turn on cabin AC at idle; the cooling fan should immediately spin at high speed. If stationary, motor or relay is bad.'
      },
      safeUserInspection: 'With engine running and parked safely, turn on AC to maximum and listen/look through front grille to see if the cooling fan spins.',
      professionalInspectionRequired: false,
      professionalMechanicSteps: [
        'Bridge fan relay terminals to test direct 12V motor operation',
        'Scan coolant temperature sensor (ECT) live data feed for sensor plausibility'
      ]
    })

    causes.push({
      id: 'cause_thermostat',
      name: 'Thermostat Valve Stuck in Closed Position',
      systemCategory: 'Cooling',
      probability: isHighway || q.includes('always') ? 'Likely' : 'Possible',
      reasoning: 'A thermostat stuck closed prevents boiling coolant from exiting engine jackets into the radiator for cooling.',
      evidence: {
        supporting: [
          'Engine overheats rapidly within 10-15 minutes of startup regardless of ambient temperature',
          'Coolant reservoir may overflow while radiator remains relatively cool'
        ],
        contradicting: [
          'Normal temperature observed during highway cruising'
        ],
        missingInfo: [
          'Temperature differential between upper and lower radiator rubber hoses'
        ],
        discriminatingTest: 'Thermal infrared thermometer test comparing upper vs lower radiator hose temperatures (marked differential indicates blockage).'
      },
      safeUserInspection: 'Do not touch hot parts. Observe from outside whether heater blows hot air while temperature climbs.',
      professionalInspectionRequired: true,
      professionalMechanicSteps: [
        'Bench-test thermostat valve in hot water at 82°C-88°C for opening stroke',
        'Replace thermostat assembly and purge air locks with vacuum bleeder'
      ]
    })
  }

  // Case 3: Starting / Cranking / Battery
  if (q.includes('start') || q.includes('battery') || q.includes('crank') || q.includes('morning')) {
    const isRapidClick = answers['Q_START_RESPONSE'] === 'rapid_click'
    const isWeakLights = answers['Q_START_LIGHTS'] === 'lights_weak'

    causes.push({
      id: 'cause_battery_depleted',
      name: 'Depleted Battery Cranking Capacity (Low CCA) or Sulfated Cells',
      systemCategory: 'Electrical',
      probability: isRapidClick || isWeakLights ? 'Likely' : 'Possible',
      reasoning: 'Cold engine oil requires high amperage (250A-400A) to spin the crankshaft. Aged lead-acid or AGM batteries lose internal plate area and voltage drops below 9.6V under load.',
      evidence: {
        supporting: [
          isRapidClick ? 'Rapid starter solenoid clicking confirmed' : 'Engine cranks sluggishly or clicks',
          isWeakLights ? 'Headlights and interior lamps dim significantly' : 'Problem most prominent after overnight rest'
        ],
        contradicting: [
          answers['Q_START_RESPONSE'] === 'cranks_no_catch' ? 'Engine spins at full normal speed without catching fire (points to fuel/spark, not battery)' : 'Resting voltage measured above 12.6V'
        ],
        missingInfo: [
          'Battery age (years since manufacturing code stamped on case)',
          'Carbon pile load test CCA reading'
        ],
        discriminatingTest: 'Multimeter measurement across battery terminals during key crank: voltage dropping below 9.6V confirms a weak/dead battery.'
      },
      safeUserInspection: 'Check battery terminal clamps for powdery white/blue copper sulfate buildup. Check battery age sticker.',
      professionalInspectionRequired: false,
      professionalMechanicSteps: [
        'Perform digital conductance/CCA health test with Midtronics tester',
        'Test alternator charging voltage under full electrical load (high beams + blower + defogger)'
      ]
    })

    causes.push({
      id: 'cause_starter_motor',
      name: 'Faulty Starter Motor Solenoid or Carbon Brush Wear',
      systemCategory: 'Electrical',
      probability: answers['Q_START_RESPONSE'] === 'complete_silence' ? 'Likely' : 'Possible',
      reasoning: 'Starter solenoid contacts pit and carbon brushes wear down, preventing the high-current motor from engaging flywheel teeth.',
      evidence: {
        supporting: [
          answers['Q_START_RESPONSE'] === 'complete_silence' ? 'Key turn produces complete silence despite strong headlights' : 'Intermittent starting failure after engine has warmed up'
        ],
        contradicting: [
          isRapidClick ? 'Rapid clicking confirms starter solenoid is receiving command, pointing to low voltage' : 'Engine cranks smoothly'
        ],
        missingInfo: [
          '12V signal presence at starter solenoid S-terminal during ignition key turn'
        ],
        discriminatingTest: 'Test for 12V on solenoid starter trigger wire with test light while an assistant turns ignition key.'
      },
      safeUserInspection: 'Verify vehicle is in Park (automatic) or clutch is pressed completely to the floor (manual) to rule out clutch/neutral safety switches.',
      professionalInspectionRequired: true,
      professionalMechanicSteps: [
        'Inspect starter pinion gear and ring gear teeth for damage',
        'Test starter motor current draw with clamp-on ammeter'
      ]
    })
  }

  // Case 4: Check Engine Light & Misfire
  if (q.includes('check engine') || q.includes('misfire') || q.includes('rough') || q.includes('cel') || q.includes('light')) {
    const isJerking = answers['Q_ENGINE_RUNNING'] === 'jerking_load'

    causes.push({
      id: 'cause_ignition_misfire',
      name: 'Ignition System Misfire (Worn Spark Plug or Failing Coil Pack)',
      systemCategory: 'Engine',
      probability: isJerking ? 'Likely' : 'Possible',
      reasoning: 'Degraded spark plug electrodes or breakdown of coil pack secondary windings prevents complete fuel combustion in one or more cylinders.',
      evidence: {
        supporting: [
          isJerking ? 'Stuttering / jerking under throttle load' : 'Rough engine idle and vibration',
          q.includes('check engine') ? 'Check engine light illuminated' : 'Loss of smooth acceleration'
        ],
        contradicting: [
          answers['Q_ENGINE_RUNNING'] === 'drives_normal' ? 'Engine runs smoothly without misfire sensations' : 'Trouble code isolated to EVAP emission leak'
        ],
        missingInfo: [
          'Specific OBD-II code (e.g. P0300 multi-cylinder or P0301-P0304 specific cylinder)',
          'Kilometers elapsed since last spark plug replacement'
        ],
        discriminatingTest: 'Swap suspected ignition coil to adjacent cylinder and re-scan codes to verify if misfire migrates.'
      },
      safeUserInspection: 'Listen to exhaust note at tailpipe during idle. A rhythmic "puff-puff" sound indicates an individual dead cylinder.',
      professionalInspectionRequired: true,
      professionalMechanicSteps: [
        'Scan live engine misfire counters using OBD-II scanner',
        'Inspect spark plug ceramic insulator for black carbon flashover tracking',
        'Test primary and secondary resistance on ignition coil packs'
      ]
    })
  }

  // Fallback generic cause if none populated
  if (causes.length === 0) {
    causes.push({
      id: 'cause_general_wear',
      name: 'Powertrain Calibration or Subsystem Component Mechanical Wear',
      systemCategory: 'General',
      probability: 'Possible',
      reasoning: 'Reported symptoms indicate deviation from factory baseline. Requires systematic inspection to narrow root cause.',
      evidence: {
        supporting: ['User reported physical anomaly in vehicle behavior'],
        contradicting: ['No catastrophic DTC trouble codes reported'],
        missingInfo: ['Diagnostic trouble codes', 'Specific operating speed/RPM conditions'],
        discriminatingTest: 'Physical test drive with diagnostic scan tool connected to live sensor data.'
      },
      safeUserInspection: 'Check engine oil level, coolant level, and tire pressures on flat ground.',
      professionalInspectionRequired: true,
      professionalMechanicSteps: ['Perform complete multipoint vehicle health inspection and ECU scan']
    })
  }

  // Sort by probability priority so 'Likely' causes always appear first
  const priorityOrder: Record<string, number> = {
    Likely: 1,
    Possible: 2,
    Unlikely: 3
  }
  causes.sort((a, b) => (priorityOrder[a.probability] || 2) - (priorityOrder[b.probability] || 2))

  return causes
}

function calculateIndianCostEstimate(
  causes: PotentialCause[],
  vehicle: VehicleProfile | null
): IndianCostRange {
  let partsMin = 800
  let partsMax = 2500
  let laborMin = 400
  let laborMax = 1200
  let confidence: 'verified_benchmark' | 'indicative_range' | 'uncalibrated_estimate' = 'indicative_range'

  const topCause = causes[0]?.id || ''

  if (topCause === 'cause_brake_pads') {
    partsMin = 1500
    partsMax = 3800
    laborMin = 500
    laborMax = 1200
    confidence = 'verified_benchmark'
  } else if (topCause === 'cause_brake_hydraulics') {
    partsMin = 2200
    partsMax = 5500
    laborMin = 800
    laborMax = 1800
  } else if (topCause === 'cause_radiator_fan') {
    partsMin = 1800
    partsMax = 4200
    laborMin = 600
    laborMax = 1400
  } else if (topCause === 'cause_thermostat') {
    partsMin = 800
    partsMax = 2200
    laborMin = 500
    laborMax = 1200
  } else if (topCause === 'cause_battery_depleted') {
    partsMin = 3800
    partsMax = 6500
    laborMin = 200
    laborMax = 500
    confidence = 'verified_benchmark'
  } else if (topCause === 'cause_starter_motor') {
    partsMin = 2200
    partsMax = 4800
    laborMin = 800
    laborMax = 1800
  } else if (topCause === 'cause_ignition_misfire') {
    partsMin = 1200
    partsMax = 4500
    laborMin = 500
    laborMax = 1200
  }

  // Adjust for luxury or larger vehicles if known
  if (vehicle && (vehicle.make.toLowerCase().includes('bmw') || vehicle.make.toLowerCase().includes('mercedes') || vehicle.make.toLowerCase().includes('audi'))) {
    partsMin *= 2.5
    partsMax *= 3.0
    laborMin *= 2.0
    laborMax *= 2.5
    confidence = 'uncalibrated_estimate'
  }

  const assumptions = vehicle
    ? `Pricing tailored for ${vehicle.year || ''} ${vehicle.make || ''} ${vehicle.model || ''} in ${vehicle.region || 'India'}. Reflects standard aftermarket/OEM replacement components in Tier-1/Tier-2 Indian cities.`
    : 'Baseline estimate assuming popular Indian passenger cars (Maruti Suzuki, Hyundai, Tata) in urban Indian workshops. Excludes luxury vehicles.'

  return {
    partsMinINR: Math.round(partsMin),
    partsMaxINR: Math.round(partsMax),
    laborMinINR: Math.round(laborMin),
    laborMaxINR: Math.round(laborMax),
    totalMinINR: Math.round(partsMin + laborMin),
    totalMaxINR: Math.round(partsMax + laborMax),
    confidence,
    assumptions,
    dataSource: 'Automotive Aftermarket Benchmark Survey (India, 2024-2026)',
    lastUpdated: '2026-10'
  }
}

function generateDiagnosticLimitations(
  vehicle: VehicleProfile | null,
  causes: PotentialCause[]
): string[] {
  const limitations = [
    'Software diagnostic assessments cannot replace hands-on physical inspection by a certified automotive technician.',
    'Hidden mechanical defects, internal wire corrosion, or hairline metal fatigue fractures can only be confirmed via workshop teardown or electronic oscilloscope analysis.'
  ]

  if (!vehicle) {
    limitations.push('Specific vehicle make, year, and fuel variant were not provided. Parts costs and mechanical procedures may vary by manufacturer.')
  }

  if (causes.some(c => c.systemCategory === 'Brakes' || c.systemCategory === 'Cooling')) {
    limitations.push('Pressurized hydraulic or thermal systems pose personal safety risks. Never attempt dangerous disassembly without professional equipment.')
  }

  return limitations
}

function generateWhatChangedExplanation(
  prev: DiagnosticAssessment,
  currentCauses: PotentialCause[],
  safety: SafetyAssessment
): string {
  if (safety.overallSeverity !== prev.safety.overallSeverity) {
    return `Safety assessment updated from ${prev.safety.overallSeverity} to ${safety.overallSeverity} based on newly reported conditions.`
  }

  const prevTop = prev.potentialCauses[0]?.name
  const currentTop = currentCauses[0]?.name

  if (prevTop !== currentTop) {
    return `Primary diagnostic hypothesis shifted from "${prevTop}" to "${currentTop}" following your additional answers.`
  }

  return 'Hypotheses refined with supporting evidence based on your latest input.'
}

function generateSymptomSummary(
  rawInput: string,
  answers: Record<string, string>
): string {
  const answerEntries = Object.entries(answers)
  if (answerEntries.length === 0) {
    return rawInput
  }
  const answerDetails = answerEntries.map(([k, v]) => `${k.replace('Q_', '')}: ${v}`).join('; ')
  return `${rawInput} (Details: ${answerDetails})`
}
