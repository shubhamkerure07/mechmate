import { describe, it, expect } from 'vitest'
import { lookupOBDCode, searchOBDBySymptom, OBD_DATABASE } from '../services/obdDatabase'

describe('OBD-II Trouble Code Repository & Lookup', () => {
  it('accurately looks up standard trouble codes by exact string', () => {
    const code = lookupOBDCode('P0300')
    expect(code).toBeDefined()
    expect(code?.title).toContain('Misfire')
    expect(code?.category).toBe('Powertrain')
    expect(code?.possibleCauses.length).toBeGreaterThan(0)
    expect(code?.recommendedActions.length).toBeGreaterThan(0)
  })

  it('handles case-insensitivity and whitespace during code lookup', () => {
    const code = lookupOBDCode('  p0420  ')
    expect(code).toBeDefined()
    expect(code?.code).toBe('P0420')
    expect(code?.title).toContain('Catalyst')
  })

  it('returns null for unknown invalid codes without crashing', () => {
    const code = lookupOBDCode('P9999_NON_EXISTENT')
    expect(code).toBeNull()
  })

  it('searches OBD codes by symptom keyword', () => {
    const results = searchOBDBySymptom('transmission')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some(r => r.code === 'P0700')).toBe(true)
  })

  it('contains verified diagnostic recommendations for all cataloged codes', () => {
    for (const code of Object.values(OBD_DATABASE)) {
      expect(code.code).toMatch(/^P\d{4}$/)
      expect(code.meaning.length).toBeGreaterThan(20)
      expect(code.recommendedActions.length).toBeGreaterThan(0)
      expect(code.possibleCauses.length).toBeGreaterThan(0)
    }
  })
})
