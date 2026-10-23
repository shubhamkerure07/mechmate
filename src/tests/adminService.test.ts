import { describe, it, expect, beforeEach } from 'vitest'
import {
  getAdminConfig,
  saveAdminConfig,
  verifyAdminPasskey,
  isAdminAuthenticated,
  logoutAdmin,
  getAdminStats,
  seedDemoFleet
} from '../services/adminService'

describe('Admin Service & Control Architecture', () => {
  beforeEach(() => {
    logoutAdmin()
  })

  it('verifies passkey and authenticates admin session', () => {
    expect(isAdminAuthenticated()).toBe(false)
    expect(verifyAdminPasskey('wrong-key')).toBe(false)
    expect(isAdminAuthenticated()).toBe(false)

    expect(verifyAdminPasskey('mechmate-admin')).toBe(true)
    expect(isAdminAuthenticated()).toBe(true)

    logoutAdmin()
    expect(isAdminAuthenticated()).toBe(false)
  })

  it('manages configurable admin parameters', () => {
    const config = getAdminConfig()
    expect(config.anonymousTokenLimit).toBe(5)
    expect(config.registeredTokenLimit).toBe(25)

    saveAdminConfig({
      ...config,
      anonymousTokenLimit: 10,
      registeredTokenLimit: 50
    })

    const updated = getAdminConfig()
    expect(updated.anonymousTokenLimit).toBe(10)
    expect(updated.registeredTokenLimit).toBe(50)
  })

  it('seeds demo fleet and retrieves admin statistics', () => {
    seedDemoFleet()
    const stats = getAdminStats()
    expect(stats.totalVehicles).toBeGreaterThanOrEqual(3)
  })
})
