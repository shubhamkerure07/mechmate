import { SafetyAssessment, SafetyRuleMatch, SafetySeverity } from '../types/automotive'

/**
 * Deterministic Safety Engine for MechMate
 * 
 * AUTOMOTIVE SAFETY PRINCIPLE:
 * Deterministic rules always take priority over probabilistic AI tokens.
 * Under no circumstance will an AI response downgrade or remove a safety warning
 * identified by this engine.
 */

interface InternalSafetyRule {
  id: string
  name: string
  severity: SafetySeverity
  keywords: string[]
  regexPatterns?: RegExp[]
  immediateAction: string
  hazards: string[]
  prohibitedActions: string[]
  safeCheckpoints: string[]
}

const DETERMINISTIC_SAFETY_RULES: InternalSafetyRule[] = [
  {
    id: 'SAFE_BRAKE_FAILURE',
    name: 'Critical Brake System Loss or Severe Degradation',
    severity: 'CRITICAL_STOP',
    keywords: [
      'brake fail', 'pedal to floor', 'sponge brake', 'no brakes',
      'brake fluid leak', 'stopping distance', 'cannot stop', 'grinding brake'
    ],
    regexPatterns: [
      /pedal\s+(went|sinks|soft|spongy|bottom)/i,
      /brakes?\s+(failed|failing|not working|lost)/i,
      /unable\s+to\s+stop/i
    ],
    immediateAction: 'Pull over safely using engine braking/handbrake in open space. DO NOT continue driving. Call roadside assistance/flatbed tow truck immediately.',
    hazards: [
      'Hydraulic brake line pressure collapse',
      'Catastrophic friction loss or rotor fracture',
      'Complete loss of stopping ability'
    ],
    prohibitedActions: [
      'DO NOT drive at highway speeds',
      'DO NOT pump brakes violently without selecting a safe runoff area'
    ],
    safeCheckpoints: [
      'Check brake fluid reservoir under hood only after coming to a full stop',
      'Check for fluid puddles on inside rim surfaces of wheels'
    ]
  },
  {
    id: 'SAFE_OVERHEATING_STEAM',
    name: 'Severe Thermal Runaway & Boiling Coolant',
    severity: 'CRITICAL_STOP',
    keywords: [
      'steam', 'boiling', 'red temperature', 'temp gauge max',
      'coolant spraying', 'smoking radiator', 'overheating'
    ],
    regexPatterns: [
      /steam\s+(coming|from|under|hood|bonnet)/i,
      /temperature\s+(gauge|needle)\s+(in red|max|pegged|high)/i,
      /coolant\s+(boiling|burst|spill|gushing)/i
    ],
    immediateAction: 'Turn on cabin heater to max immediately (to divert thermal load), pull over safely into shade, switch off engine. Allow 30–45 minutes cooling time before any visual inspection.',
    hazards: [
      'Warped aluminum cylinder head and blown head gasket',
      'Piston thermal seizure resulting in catastrophic engine block rupture',
      'Pressurized boiling steam thermal burn risk (120°C+)'
    ],
    prohibitedActions: [
      'CRITICAL: NEVER OPEN THE RADIATOR CAP ON A WARM ENGINE. Pressurized scalding coolant causes severe 3rd-degree burns.',
      'DO NOT pour cold tap water directly into a hot engine block (thermal shock cracks metal).'
    ],
    safeCheckpoints: [
      'Observe expansion tank level only from outside after engine cools down',
      'Check if radiator fan is spinning once safe'
    ]
  },
  {
    id: 'SAFE_OIL_PRESSURE_LOSS',
    name: 'Critical Oil Pressure Drop / Engine Lubrication Starvation',
    severity: 'CRITICAL_STOP',
    keywords: [
      'oil light', 'oil pressure', 'oil lamp', 'red oil',
      'knocking sound', 'ticking metal'
    ],
    regexPatterns: [
      /oil\s+(pressure|light|lamp|warning)\s+(on|flashing|red)/i,
      /engine\s+(knock|clattering|screeching)/i
    ],
    immediateAction: 'Switch off the engine IMMEDIATELY within 10 seconds of stopping safely. Continuing to run an engine with zero oil pressure destroys bearings in under 60 seconds.',
    hazards: [
      'Crankshaft journal and connecting rod bearing spinning/welding',
      'Camshaft seizure in cylinder head',
      'Total engine replacement requirement'
    ],
    prohibitedActions: [
      'DO NOT "limp" the car to a nearby garage',
      'DO NOT rev the engine to see if the light turns off'
    ],
    safeCheckpoints: [
      'Pull oil dipstick after 5 minutes on level ground to verify oil level',
      'Check under carriage for cracked sump or loose oil drain plug'
    ]
  },
  {
    id: 'SAFE_FIRE_SMOKE_FUEL',
    name: 'Under-Hood Fire, Electrical Burning or Raw Fuel Leak',
    severity: 'CRITICAL_STOP',
    keywords: [
      'burning smell', 'electrical smell', 'fire', 'smoke under hood',
      'petrol smell', 'diesel smell', 'fuel leak', 'gas leak', 'petrol odor'
    ],
    regexPatterns: [
      /(smell|odor|leak|dripping).*(petrol|gasoline|diesel|fuel)/i,
      /(petrol|gasoline|diesel|fuel).*(smell|odor|leak|dripping)/i,
      /(smoke|fumes)\s+from\s+(under|bonnet|hood|dashboard)/i,
      /burning\s+(plastic|wires|rubber)/i
    ],
    immediateAction: 'Evacuate all passengers away from the vehicle (at least 25 meters). Switch off the ignition to cut the electric fuel pump. Do not open the hood rapidly if flames are suspected (oxygen rush).',
    hazards: [
      'Flash fire ignited by exhaust manifold (600°C+)',
      'Toxic plastic smoke inhalation',
      'Short circuit thermal runaway'
    ],
    prohibitedActions: [
      'DO NOT use water on a fuel or electrical automotive fire',
      'DO NOT use mobile phones or smoke near suspected fuel puddles'
    ],
    safeCheckpoints: [
      'Use dry chemical powder (ABC) fire extinguisher directed at the base of the fire through grille gaps',
      'Call emergency fire services (112 / 101)'
    ]
  },
  {
    id: 'SAFE_EXHAUST_CABIN_INTRUSION',
    name: 'Exhaust Fumes Entering Passenger Compartment',
    severity: 'CRITICAL_STOP',
    keywords: [
      'fumes inside', 'exhaust smell inside', 'headache driving',
      'dizzy driving', 'carbon monoxide'
    ],
    regexPatterns: [
      /exhaust\s+(smell|fumes|odor)\s+(inside|cabin|car)/i,
      /dizzy|nausea|headache\s+while\s+driving/i
    ],
    immediateAction: 'Roll down all windows immediately, pull off the road, and step outside into fresh air. Carbon monoxide (CO) is tasteless, odorless, and induces unconsciousness without warning.',
    hazards: [
      'Acute Carbon Monoxide (CO) poisoning',
      'Loss of driver consciousness while driving',
      'Cracked exhaust manifold or ruptured catalytic converter pipe under floorpan'
    ],
    prohibitedActions: [
      'DO NOT continue driving with windows rolled up or AC on recirculate'
    ],
    safeCheckpoints: [
      'Verify fresh air ventilation',
      'Have vehicle towed for exhaust system smoke inspection'
    ]
  },
  {
    id: 'SAFE_STEERING_LOCKUP',
    name: 'Sudden Steering Loss or Severe Mechanical Binding',
    severity: 'CRITICAL_STOP',
    keywords: [
      'steering locked', 'cannot turn wheel', 'power steering fail',
      'steering seized', 'violent shake wheel', 'steering lock'
    ],
    regexPatterns: [
      /steering.*(lock|seiz|stiff|impossible\s+to\s+turn|fail|unresponsive)/i,
      /lost\s+steering/i
    ],
    immediateAction: 'Slow down steadily, activate hazard lamps, and guide the vehicle safely off the driving lane. Do not yank the steering violently.',
    hazards: [
      'Failure of tie rod ends, ball joints, or steering rack pinion',
      'Complete loss of directional control',
      'Sudden EPS (Electric Power Steering) motor controller shutdown'
    ],
    prohibitedActions: [
      'DO NOT attempt highway travel',
      'DO NOT ignore sudden severe steering play or popping sounds'
    ],
    safeCheckpoints: [
      'Check hydraulic power steering fluid reservoir if equipped',
      'Inspect front wheel alignment and suspension link integrity'
    ]
  }
]

/**
 * Evaluates raw symptom text or structured inputs against deterministic safety rules.
 * Runs in under 1ms with 0 network calls.
 */
export function evaluateSafetyRules(symptomText: string): SafetyAssessment {
  const normalized = symptomText.toLowerCase()
  const matchedRules: SafetyRuleMatch[] = []

  for (const rule of DETERMINISTIC_SAFETY_RULES) {
    let hasMatch = false

    // Check keyword triggers
    for (const kw of rule.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        hasMatch = true
        break
      }
    }

    // Check regex patterns
    if (!hasMatch && rule.regexPatterns) {
      for (const rx of rule.regexPatterns) {
        if (rx.test(normalized)) {
          hasMatch = true
          break
        }
      }
    }

    if (hasMatch) {
      matchedRules.push({
        ruleId: rule.id,
        hazardName: rule.name,
        severity: rule.severity,
        immediateAction: rule.immediateAction,
        hazards: rule.hazards,
        prohibitedActions: rule.prohibitedActions,
        safeCheckpoints: rule.safeCheckpoints
      })
    }
  }

  // Derive overall severity
  let overallSeverity: SafetySeverity = 'LOW_MAINTENANCE'
  let requiresImmediateStop = false

  if (matchedRules.some(r => r.severity === 'CRITICAL_STOP')) {
    overallSeverity = 'CRITICAL_STOP'
    requiresImmediateStop = true
  } else if (matchedRules.some(r => r.severity === 'URGENT_INSPECT')) {
    overallSeverity = 'URGENT_INSPECT'
  } else if (matchedRules.length > 0) {
    overallSeverity = 'MODERATE_MONITOR'
  }

  // Generate warning checklist
  const emergencyChecklist: string[] = []
  if (requiresImmediateStop) {
    emergencyChecklist.push('Park safely away from moving traffic and engage hazard lights')
    emergencyChecklist.push('Switch off the ignition to prevent fire or mechanical seizure')
    emergencyChecklist.push('Evacuate passengers if smoke, fumes, or boiling coolant are present')
    emergencyChecklist.push('Arrange for roadside assistance or flatbed towing')
  }

  const summaryWarning = matchedRules.length > 0
    ? matchedRules.map(m => m.immediateAction).join(' ')
    : 'No critical life-safety hazards detected based on provided symptoms. Standard automotive precautions apply.'

  return {
    overallSeverity,
    requiresImmediateStop,
    matches: matchedRules,
    summaryWarning,
    emergencyChecklist,
    isDeterministic: true
  }
}
