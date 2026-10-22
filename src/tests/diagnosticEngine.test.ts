import { describe, it, expect } from 'vitest'
import { getRecommendedFollowUps } from '../services/followUpQuestions'
import { runDiagnosticEngine } from '../services/diagnosticEngine'
import { VehicleProfile } from '../types/automotive'

describe('Diagnostic Engine & Follow-up Workflows', () => {
  it('Scenario 1: Vehicle will not start intake gathers plausible causes without claiming certainty', async () => {
    const questions = getRecommendedFollowUps('Car won\'t start in the morning')
    expect(questions.length).toBeGreaterThan(0)
    expect(questions.some(q => q.id === 'Q_START_RESPONSE')).toBe(true)

    const assessment = await runDiagnosticEngine({
      symptoms: 'Car won\'t start in the morning',
      followUpAnswers: { Q_START_RESPONSE: 'rapid_click' }
    })

    expect(assessment.potentialCauses.length).toBeGreaterThan(0)
    expect(assessment.potentialCauses[0].probability).toBe('Likely')
    expect(assessment.potentialCauses[0].systemCategory).toBe('Electrical')
    expect(assessment.limitations.length).toBeGreaterThan(0)
    // Does not claim certainty
    expect(assessment.confidenceScoreText).toContain('indicative')
  })

  it('Scenario 2: Severe overheating and visible steam triggers critical safety warnings', async () => {
    const assessment = await runDiagnosticEngine({
      symptoms: 'Temperature gauge is in red zone and white steam is coming out',
      followUpAnswers: { Q_OVERHEAT_STEAM: 'heavy_steam' }
    })

    expect(assessment.safety.overallSeverity).toBe('CRITICAL_STOP')
    expect(assessment.safety.requiresImmediateStop).toBe(true)
    expect(assessment.safety.summaryWarning.toLowerCase()).toContain('pull over')
    // Prohibits opening radiator cap
    const hasCapWarning = assessment.safety.matches.some(m =>
      m.prohibitedActions.some(a => a.includes('NEVER OPEN RADIATOR CAP') || a.includes('NEVER OPEN THE RADIATOR CAP'))
    )
    expect(hasCapWarning).toBe(true)
  })

  it('Scenario 3: Intermittent dashboard warning asks relevant follow-up questions without declaring total failure', async () => {
    const questions = getRecommendedFollowUps('Check engine light came on intermittently')
    expect(questions.length).toBeGreaterThan(0)
    expect(questions.some(q => q.id === 'Q_CEL_STATE')).toBe(true)

    const assessment = await runDiagnosticEngine({
      symptoms: 'Check engine light came on intermittently',
      followUpAnswers: { Q_CEL_STATE: 'solid', Q_ENGINE_RUNNING: 'drives_normal' }
    })

    expect(assessment.safety.overallSeverity).not.toBe('CRITICAL_STOP')
    expect(assessment.potentialCauses.some(c => c.name.includes('Ignition'))).toBe(true)
  })

  it('Scenario 5: Insufficient vehicle info prompts transparent limitation disclosures', async () => {
    const assessment = await runDiagnosticEngine({
      symptoms: 'Metallic grinding noise when I slow down',
      vehicle: null
    })

    expect(assessment.vehicle).toBeNull()
    expect(assessment.limitations.some(l => l.includes('Specific vehicle make, year, and fuel variant were not provided'))).toBe(true)
    expect(assessment.costEstimate.assumptions).toContain('Baseline estimate assuming popular Indian passenger cars')
  })

  it('Scenario 9: Changing follow-up answer updates assessment and provides whatChangedExplanation', async () => {
    const initialAssessment = await runDiagnosticEngine({
      symptoms: 'Engine overheating after 20 minutes',
      followUpAnswers: { Q_OVERHEAT_CONDITION: 'idle_traffic' }
    })

    expect(initialAssessment.potentialCauses[0].id).toBe('cause_radiator_fan')

    const updatedAssessment = await runDiagnosticEngine({
      symptoms: 'Engine overheating after 20 minutes',
      followUpAnswers: { Q_OVERHEAT_CONDITION: 'highway_cruising' },
      previousAssessment: initialAssessment
    })

    expect(updatedAssessment.potentialCauses[0].id).toBe('cause_thermostat')
    expect(updatedAssessment.whatChangedExplanation).toBeDefined()
    expect(updatedAssessment.whatChangedExplanation).toContain('Primary diagnostic hypothesis shifted')
  })

  it('Scenario 10: Cost estimate communicates uncertainty when vehicle specifics are absent', async () => {
    const testVehicle: VehicleProfile = {
      id: 'v1',
      make: 'Maruti Suzuki',
      model: 'Swift',
      year: 2021,
      fuelType: 'Petrol',
      transmission: 'Manual',
      odometerKm: 35000,
      region: 'Bengaluru, India'
    }

    const vehicleAssessment = await runDiagnosticEngine({
      symptoms: 'Brake pads worn out grinding',
      vehicle: testVehicle
    })

    expect(vehicleAssessment.costEstimate.confidence).toBe('verified_benchmark')
    expect(vehicleAssessment.costEstimate.assumptions).toContain('Swift')

    const genericAssessment = await runDiagnosticEngine({
      symptoms: 'Brake pads worn out grinding',
      vehicle: null
    })

    expect(genericAssessment.costEstimate.totalMinINR).toBeGreaterThan(0)
    expect(genericAssessment.costEstimate.assumptions).toContain('Baseline estimate')
  })
})
