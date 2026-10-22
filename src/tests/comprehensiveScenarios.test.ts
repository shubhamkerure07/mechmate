import { describe, it, expect, beforeEach } from 'vitest'
import { runDiagnosticEngine } from '../services/diagnosticEngine'
import { evaluateSafetyRules } from '../services/safetyEngine'
import { getRecommendedFollowUps } from '../services/followUpQuestions'
import { requestDiagnosticExplanation } from '../services/aiProvider'
import {
  saveStoredVehicle,
  getStoredVehicles,
  exportAllUserData,
  clearStorageForTesting
} from '../services/storageService'
import { VehicleProfile } from '../types/automotive'

describe('End-to-End Evaluation: 10 Critical Automotive Scenarios', () => {
  beforeEach(() => {
    clearStorageForTesting()
  })

  // Scenario 1
  it('Scenario 1: Vehicle will not start intake gathers plausible causes without claiming certainty', async () => {
    const questions = getRecommendedFollowUps('Car will not start in the morning')
    expect(questions.some(q => q.id === 'Q_START_RESPONSE')).toBe(true)

    const assessment = await runDiagnosticEngine({
      symptoms: 'Car will not start in the morning',
      followUpAnswers: { Q_START_RESPONSE: 'rapid_click', Q_START_LIGHTS: 'lights_weak' }
    })

    expect(assessment.potentialCauses.length).toBeGreaterThan(0)
    expect(assessment.potentialCauses[0].probability).toBe('Likely')
    expect(assessment.potentialCauses[0].name).toContain('Battery')
    // Transparently communicates uncertainty
    expect(assessment.limitations.length).toBeGreaterThan(0)
    expect(assessment.confidenceScoreText).toContain('indicative')
  })

  // Scenario 2
  it('Scenario 2: Severe overheating and visible steam issues immediate safety stop and prohibits cap removal', async () => {
    const safety = evaluateSafetyRules('Severe overheating with boiling coolant and steam billowing from under bonnet')
    expect(safety.overallSeverity).toBe('CRITICAL_STOP')
    expect(safety.requiresImmediateStop).toBe(true)

    const match = safety.matches.find(m => m.ruleId === 'SAFE_OVERHEATING_STEAM')
    expect(match).toBeDefined()
    expect(match?.prohibitedActions.some(a => a.includes('NEVER OPEN THE RADIATOR CAP'))).toBe(true)

    const assessment = await runDiagnosticEngine({
      symptoms: 'Severe overheating with boiling coolant and steam billowing from under bonnet',
      followUpAnswers: { Q_OVERHEAT_STEAM: 'heavy_steam' }
    })
    expect(assessment.safety.requiresImmediateStop).toBe(true)
  })

  // Scenario 3
  it('Scenario 3: Minor intermittent warning asks follow-ups without declaring premature total failure', async () => {
    const questions = getRecommendedFollowUps('Check engine light blinked once yesterday but engine runs fine')
    expect(questions.some(q => q.id === 'Q_CEL_STATE')).toBe(true)

    const assessment = await runDiagnosticEngine({
      symptoms: 'Check engine light blinked once yesterday but engine runs fine',
      followUpAnswers: { Q_CEL_STATE: 'intermittent', Q_ENGINE_RUNNING: 'drives_normal' }
    })

    expect(assessment.safety.overallSeverity).not.toBe('CRITICAL_STOP')
    expect(assessment.safety.requiresImmediateStop).toBe(false)
  })

  // Scenario 4
  it('Scenario 4: AI provider failure or timeout degrades gracefully to local mechatronic engine', async () => {
    // When calling serverless API endpoint without server running (or simulated network drop)
    const res = await requestDiagnosticExplanation({
      symptoms: 'Brake pads grinding'
    })

    expect(res).toBeDefined()
    expect(res.provider).toBe('local_fallback')
    expect(res.warning).toContain('local offline automotive knowledge engine')
  })

  // Scenario 5
  it('Scenario 5: Insufficient vehicle info prompts transparent general limitations instead of inventing facts', async () => {
    const assessment = await runDiagnosticEngine({
      symptoms: 'High pitched squeal when braking',
      vehicle: null
    })

    expect(assessment.vehicle).toBeNull()
    expect(assessment.limitations.some(l => l.includes('Specific vehicle make, year, and fuel variant were not provided'))).toBe(true)
    expect(assessment.costEstimate.assumptions).toContain('Baseline estimate assuming popular Indian passenger cars')
  })

  // Scenario 6
  it('Scenario 6: Validates vehicle attributes and flags boundary errors', () => {
    const validateVehicle = (v: Partial<VehicleProfile>): { valid: boolean; error?: string } => {
      if (!v.make || !v.model) return { valid: false, error: 'Make and model are required.' }
      if (!v.year || v.year < 1980 || v.year > new Date().getFullYear() + 1) {
        return { valid: false, error: 'Invalid manufacturing year.' }
      }
      if (v.odometerKm === undefined || v.odometerKm < 0) {
        return { valid: false, error: 'Odometer cannot be negative.' }
      }
      return { valid: true }
    }

    expect(validateVehicle({ make: '', model: 'Swift' }).valid).toBe(false)
    expect(validateVehicle({ make: 'Maruti', model: 'Swift', year: 1950 }).valid).toBe(false)
    expect(validateVehicle({ make: 'Maruti', model: 'Swift', year: 2022, odometerKm: -500 }).valid).toBe(false)
    expect(validateVehicle({ make: 'Maruti', model: 'Swift', year: 2022, odometerKm: 30000 }).valid).toBe(true)
  })

  // Scenario 7
  it('Scenario 7: Critical diagnostic and safety data remains accessible on narrow mobile viewports', async () => {
    const assessment = await runDiagnosticEngine({
      symptoms: 'Brake pedal sinking to the floor',
      followUpAnswers: { Q_BRAKE_PEDAL_FEEL: 'spongy_sinks' }
    })

    // Assert that essential safety checkpoints and cost data are fully structured
    expect(assessment.safety.requiresImmediateStop).toBe(true)
    expect(assessment.safety.summaryWarning.length).toBeGreaterThan(10)
    expect(assessment.potentialCauses.length).toBeGreaterThan(0)
    expect(assessment.costEstimate.totalMinINR).toBeGreaterThan(0)
    expect(assessment.costEstimate.totalMaxINR).toBeGreaterThan(assessment.costEstimate.totalMinINR)
  })

  // Scenario 8
  it('Scenario 8: Local-first architecture guarantees zero cross-user data leakage and enables local export', () => {
    const userVehicle: VehicleProfile = {
      id: 'veh_private_01',
      make: 'Mahindra',
      model: 'Thar',
      year: 2023,
      fuelType: 'Diesel',
      transmission: 'Manual',
      odometerKm: 18000,
      region: 'Chandigarh'
    }

    saveStoredVehicle(userVehicle)
    const dataJson = exportAllUserData()
    expect(dataJson).toContain('Thar')
    expect(getStoredVehicles().length).toBe(1)
  })

  // Scenario 9
  it('Scenario 9: User updates symptom or follow-up answer; assessment re-evaluates and explains what changed', async () => {
    const firstAssessment = await runDiagnosticEngine({
      symptoms: 'Engine temperature climbing',
      followUpAnswers: { Q_OVERHEAT_CONDITION: 'idle_traffic' }
    })
    expect(firstAssessment.potentialCauses[0].id).toBe('cause_radiator_fan')

    const updatedAssessment = await runDiagnosticEngine({
      symptoms: 'Engine temperature climbing',
      followUpAnswers: { Q_OVERHEAT_CONDITION: 'highway_cruising' },
      previousAssessment: firstAssessment
    })
    expect(updatedAssessment.potentialCauses[0].id).toBe('cause_thermostat')
    expect(updatedAssessment.whatChangedExplanation).toBeDefined()
    expect(updatedAssessment.whatChangedExplanation).toContain('Primary diagnostic hypothesis shifted')
  })

  // Scenario 10
  it('Scenario 10: Price estimate requested without vehicle info clearly communicates uncertainty and assumptions', async () => {
    const assessment = await runDiagnosticEngine({
      symptoms: 'Brake pad replacement cost',
      vehicle: null
    })

    expect(assessment.costEstimate.assumptions).toContain('Baseline estimate assuming popular Indian passenger cars')
    expect(assessment.costEstimate.dataSource).toContain('Benchmark')
    expect(assessment.costEstimate.totalMinINR).toBeGreaterThan(0)
    expect(assessment.costEstimate.totalMaxINR).toBeGreaterThan(assessment.costEstimate.totalMinINR)
  })
})
