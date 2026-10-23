import { describe, it, expect } from 'vitest'
import { evaluateSafetyRules } from '../services/safetyEngine'

describe('Deterministic Safety Engine', () => {
  it('detects critical brake failure and mandates immediate stop', () => {
    const result = evaluateSafetyRules('My brake pedal went completely soft and sunk to the floor!')
    expect(result.overallSeverity).toBe('CRITICAL_STOP')
    expect(result.requiresImmediateStop).toBe(true)
    expect(result.matches.some(m => m.ruleId === 'SAFE_BRAKE_FAILURE')).toBe(true)
    expect(result.summaryWarning).toContain('Pull over safely')
    expect(result.emergencyChecklist.length).toBeGreaterThan(0)
  })

  it('detects severe overheating with visible steam and prohibits opening radiator cap', () => {
    const result = evaluateSafetyRules('There is white steam billowing from under the hood and coolant spraying')
    expect(result.overallSeverity).toBe('CRITICAL_STOP')
    expect(result.requiresImmediateStop).toBe(true)
    const overheatingMatch = result.matches.find(m => m.ruleId === 'SAFE_OVERHEATING_STEAM')
    expect(overheatingMatch).toBeDefined()
    expect(overheatingMatch?.prohibitedActions.some(a => a.includes('NEVER OPEN THE RADIATOR CAP'))).toBe(true)
  })

  it('detects oil pressure warning light and warns against running engine', () => {
    const result = evaluateSafetyRules('The red oil pressure light turned on and there is a metallic knocking sound')
    expect(result.overallSeverity).toBe('CRITICAL_STOP')
    expect(result.requiresImmediateStop).toBe(true)
    const oilMatch = result.matches.find(m => m.ruleId === 'SAFE_OIL_PRESSURE_LOSS')
    expect(oilMatch).toBeDefined()
    expect(oilMatch?.prohibitedActions).toContain('DO NOT "limp" the car to a nearby garage')
  })

  it('detects raw fuel smell and fire hazard', () => {
    const result = evaluateSafetyRules('I smell strong petrol odor after parking and there is liquid dripping')
    expect(result.overallSeverity).toBe('CRITICAL_STOP')
    expect(result.requiresImmediateStop).toBe(true)
    expect(result.matches.some(m => m.ruleId === 'SAFE_FIRE_SMOKE_FUEL')).toBe(true)
  })

  it('detects exhaust fumes in the cabin with carbon monoxide hazard', () => {
    const result = evaluateSafetyRules('I get a headache driving and smell exhaust fumes inside the cabin')
    expect(result.overallSeverity).toBe('CRITICAL_STOP')
    expect(result.requiresImmediateStop).toBe(true)
    expect(result.matches.some(m => m.ruleId === 'SAFE_EXHAUST_CABIN_INTRUSION')).toBe(true)
  })

  it('detects sudden steering loss', () => {
    const result = evaluateSafetyRules('The steering wheel locked up and became impossible to turn')
    expect(result.overallSeverity).toBe('CRITICAL_STOP')
    expect(result.requiresImmediateStop).toBe(true)
    expect(result.matches.some(m => m.ruleId === 'SAFE_STEERING_LOCKUP')).toBe(true)
  })

  it('does not trigger false positive emergency stop for minor cosmetic issues', () => {
    const result = evaluateSafetyRules('My windshield wipers leave a small streak when it rains')
    expect(result.overallSeverity).toBe('LOW_MAINTENANCE')
    expect(result.requiresImmediateStop).toBe(false)
    expect(result.matches.length).toBe(0)
  })
})
