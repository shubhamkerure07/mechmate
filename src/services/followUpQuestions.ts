import { FollowUpQuestion } from '../types/automotive'

/**
 * Diagnostic Follow-up Question Engine
 * Selects targeted, high-value discriminating questions based on reported symptoms
 * to isolate root causes without overwhelming the driver.
 */

export function getRecommendedFollowUps(symptomText: string): FollowUpQuestion[] {
  const q = symptomText.toLowerCase()
  const questions: FollowUpQuestion[] = []

  // 1. Overheating / Thermal Symptoms
  if (q.includes('heat') || q.includes('temp') || q.includes('coolant') || q.includes('radiator') || q.includes('steam')) {
    questions.push({
      id: 'Q_OVERHEAT_STEAM',
      question: 'Is visible steam, coolant spraying, or boiling liquid escaping from under the bonnet?',
      context: 'Distinguishes between a minor thermostat sensor reading vs. active pressurized cooling jacket rupture.',
      targetSystem: 'Cooling',
      options: [
        { label: 'Heavy steam / boiling coolant', value: 'heavy_steam', hint: 'Immediate safety hazard' },
        { label: 'Coolant dripping / sweet smell', value: 'leak_no_steam', hint: 'Active system leak' },
        { label: 'Gauge is high, but no steam', value: 'gauge_only', hint: 'Sensor or initial thermal rise' },
        { label: 'Not checked / Not sure', value: 'unknown', hint: 'Requires visual inspection' }
      ]
    })

    questions.push({
      id: 'Q_OVERHEAT_CONDITION',
      question: 'When does the temperature climb fastest?',
      context: 'Idling indicates radiator fan/airflow deficit; highway overheating points to thermostat, water pump, or clogged core.',
      targetSystem: 'Cooling',
      options: [
        { label: 'Idling in traffic / stopped at signals', value: 'idle_traffic', hint: 'Points to radiator fan or relay' },
        { label: 'Cruising at highway speeds (60+ km/h)', value: 'highway_cruising', hint: 'Points to water pump or radiator matrix' },
        { label: 'Consistently high all the time', value: 'always_high', hint: 'Thermostat or severe coolant loss' },
        { label: 'Only with AC turned ON', value: 'with_ac', hint: 'Auxiliary condenser fan failure' }
      ]
    })
  }

  // 2. Braking Issues
  if (q.includes('brake') || q.includes('grind') || q.includes('squeak') || q.includes('stopping')) {
    questions.push({
      id: 'Q_BRAKE_PEDAL_FEEL',
      question: 'How does the brake pedal feel under your foot?',
      context: 'A sinking spongy pedal indicates hydraulic fluid leak/master cylinder failure; hard vibration indicates warped rotors.',
      targetSystem: 'Brakes',
      options: [
        { label: 'Soft / sinks down toward the floor', value: 'spongy_sinks', hint: 'Hydraulic loss - Emergency' },
        { label: 'Firm, but loud metal grinding', value: 'hard_grinding', hint: 'Pads depleted to metal backing' },
        { label: 'High-pitched squeal when braking', value: 'squealing', hint: 'Wear indicator acoustic warning' },
        { label: 'Vibrating / pulsating pedal', value: 'pulsating', hint: 'Rotor runout or ABS intervention' }
      ]
    })

    questions.push({
      id: 'Q_BRAKE_PULL',
      question: 'Does the car pull to the left or right when braking firmly?',
      context: 'Identifies uneven caliper binding, stuck slider pins, or contaminated brake pads on one axle.',
      targetSystem: 'Brakes',
      options: [
        { label: 'Yes, pulls strongly to one side', value: 'pulls_side', hint: 'Stuck caliper or uneven wear' },
        { label: 'No, stops straight', value: 'straight', hint: 'Symmetric axle wear' },
        { label: 'Only at high speeds', value: 'high_speed_only', hint: 'Suspension bushing or rotor issue' }
      ]
    })
  }

  // 3. Starting / Battery Issues
  if (q.includes('start') || q.includes('crank') || q.includes('battery') || q.includes('morning') || q.includes('turn over')) {
    questions.push({
      id: 'Q_START_RESPONSE',
      question: 'What happens when you turn the key or press the Engine Start button?',
      context: 'Differentiates electrical cranking deficit (battery/starter) from combustion failure (fuel/spark/compression).',
      targetSystem: 'Electrical',
      options: [
        { label: 'Rapid clicking sound, dashboard flickers', value: 'rapid_click', hint: 'Low battery voltage / starter solenoid' },
        { label: 'Slow, labored cranking that dies', value: 'slow_crank', hint: 'Depleted battery capacity (CCA)' },
        { label: 'Complete silence, nothing happens', value: 'complete_silence', hint: 'Blown main fuse, immobilizer, or dead battery' },
        { label: 'Spins fast and normally, but engine won’t catch', value: 'cranks_no_catch', hint: 'Fuel pump, spark plugs, or sensor failure' }
      ]
    })

    questions.push({
      id: 'Q_START_LIGHTS',
      question: 'Do the headlights or horn work at full strength?',
      context: 'Tests state of charge under nominal load without a dedicated multimeter.',
      targetSystem: 'Electrical',
      options: [
        { label: 'Yes, headlights and horn are bright and loud', value: 'lights_strong', hint: 'Battery has surface charge' },
        { label: 'Very dim headlights / weak horn', value: 'lights_weak', hint: 'Battery deeply discharged' },
        { label: 'Haven’t tested', value: 'not_tested', hint: 'Quick test recommended' }
      ]
    })
  }

  // 4. Check Engine Light / Misfire
  if (q.includes('check engine') || q.includes('light') || q.includes('misfire') || q.includes('rough') || q.includes('shaking') || q.includes('cel')) {
    questions.push({
      id: 'Q_CEL_STATE',
      question: 'Is the Check Engine light solid, or is it actively blinking/flashing?',
      context: 'A blinking CEL is a critical emergency signaling raw fuel entering the catalytic converter.',
      targetSystem: 'Engine',
      options: [
        { label: 'Solid steady light', value: 'solid', hint: 'Standard emission or sensor trouble code' },
        { label: 'Actively flashing / blinking', value: 'flashing', hint: 'Severe active misfire - Stop driving' },
        { label: 'Intermittent (turns on and off)', value: 'intermittent', hint: 'Loose wiring, gas cap, or pending code' }
      ]
    })

    questions.push({
      id: 'Q_ENGINE_RUNNING',
      question: 'Does the engine shudder, shake, or lose power when accelerating?',
      context: 'Identifies cylinder misfire under load vs. benign sensor emissions fault.',
      targetSystem: 'Engine',
      options: [
        { label: 'Strong shudder / jerking when accelerating', value: 'jerking_load', hint: 'Ignition coil, spark plug, or injector' },
        { label: 'Rough idle, but smooths out while driving', value: 'rough_idle_only', hint: 'Throttle body, vacuum leak, or IAC' },
        { label: 'Drives completely normally', value: 'drives_normal', hint: 'EVAP purge, O2 sensor, or catalytic efficiency' }
      ]
    })
  }

  // 5. Smoke / Exhaust
  if (q.includes('smoke') || q.includes('exhaust') || q.includes('tailpipe')) {
    questions.push({
      id: 'Q_SMOKE_COLOR',
      question: 'What color is the exhaust smoke?',
      context: 'Exhaust color is the most conclusive visual diagnostic signature for internal engine chemistry.',
      targetSystem: 'Exhaust',
      options: [
        { label: 'Thick white smoke with sweet odor', value: 'white_sweet', hint: 'Coolant leak into cylinder (Head gasket)' },
        { label: 'Blue or bluish-grey smoke', value: 'blue_grey', hint: 'Engine oil burning (Piston rings/valve seals)' },
        { label: 'Black soot smoke', value: 'black', hint: 'Rich fuel mixture (Air filter/injector/MAF)' },
        { label: 'Thin steam that vanishes quickly', value: 'thin_condensation', hint: 'Harmless morning exhaust condensation' }
      ]
    })
  }

  // Fallback default question if none of above matched
  if (questions.length === 0) {
    questions.push({
      id: 'Q_GENERAL_FREQUENCY',
      question: 'Does this issue happen continuously, or only under specific driving conditions?',
      context: 'Distinguishes structural/mechanical wear from thermal expansion or electrical intermittent faults.',
      targetSystem: 'General',
      options: [
        { label: 'Continuously all the time', value: 'continuous', hint: 'Constant mechanical condition' },
        { label: 'Only when cold in the morning', value: 'cold_start', hint: 'Thermal shrinkage / battery / oil viscosity' },
        { label: 'Only after driving 20+ minutes', value: 'warm_engine', hint: 'Thermal expansion or fluid thinning' },
        { label: 'Only over bumps or rough roads', value: 'rough_roads', hint: 'Suspension bushings or linkages' }
      ]
    })
  }

  return questions
}
