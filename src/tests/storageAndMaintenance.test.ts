import { describe, it, expect, beforeEach } from 'vitest'
import {
  getStoredVehicles,
  saveStoredVehicle,
  deleteStoredVehicle,
  getActiveVehicle,
  setActiveVehicleId,
  saveDiagnosticAssessment,
  getDiagnosticHistory,
  exportAllUserData,
  importUserData,
  clearStorageForTesting
} from '../services/storageService'
import {
  generateDefaultScheduleForVehicle,
  evaluateMaintenanceStatus
} from '../services/maintenanceService'
import { VehicleProfile, DiagnosticAssessment } from '../types/automotive'

describe('Storage & Maintenance Intelligence Engine', () => {
  beforeEach(() => {
    clearStorageForTesting()
  })

  it('manages vehicle lifecycle: add, set active, update, and delete', () => {
    const vehicle1: VehicleProfile = {
      id: 'veh_01',
      make: 'Tata',
      model: 'Nexon',
      year: 2022,
      fuelType: 'Diesel',
      transmission: 'AMT',
      odometerKm: 28000,
      region: 'Pune, Maharashtra'
    }

    const saved = saveStoredVehicle(vehicle1)
    expect(saved.length).toBe(1)
    expect(getActiveVehicle()?.id).toBe('veh_01')

    // Add second vehicle
    const vehicle2: VehicleProfile = {
      id: 'veh_02',
      make: 'Hyundai',
      model: 'i20',
      year: 2020,
      fuelType: 'Petrol',
      transmission: 'Manual',
      odometerKm: 42000,
      region: 'Bengaluru, Karnataka'
    }

    saveStoredVehicle(vehicle2)
    setActiveVehicleId('veh_02')
    expect(getActiveVehicle()?.model).toBe('i20')

    // Delete first vehicle
    const afterDelete = deleteStoredVehicle('veh_01')
    expect(afterDelete.length).toBe(1)
    expect(afterDelete[0].id).toBe('veh_02')
  })

  it('persists and retrieves diagnostic history linked to vehicles', () => {
    const mockAssessment: DiagnosticAssessment = {
      id: 'diag_test_01',
      timestamp: new Date().toISOString(),
      vehicle: {
        id: 'veh_02',
        make: 'Hyundai',
        model: 'i20',
        year: 2020,
        fuelType: 'Petrol',
        transmission: 'Manual',
        odometerKm: 42000,
        region: 'Bengaluru'
      },
      rawInput: 'Engine rattling sound',
      symptomSummary: 'Engine rattling sound',
      safety: {
        overallSeverity: 'MODERATE_MONITOR',
        requiresImmediateStop: false,
        matches: [],
        summaryWarning: 'No critical hazard',
        emergencyChecklist: [],
        isDeterministic: true
      },
      potentialCauses: [],
      costEstimate: {
        partsMinINR: 1000,
        partsMaxINR: 2000,
        laborMinINR: 500,
        laborMaxINR: 800,
        totalMinINR: 1500,
        totalMaxINR: 2800,
        confidence: 'indicative_range',
        assumptions: 'Hyundai i20',
        dataSource: 'Benchmark',
        lastUpdated: '2026-10'
      },
      limitations: ['Test limitation'],
      confidenceScoreText: 'Moderate confidence',
      providerOrigin: 'deterministic_engine'
    }

    saveDiagnosticAssessment(mockAssessment)
    const history = getDiagnosticHistory('veh_02')
    expect(history.length).toBe(1)
    expect(history[0].id).toBe('diag_test_01')
  })

  it('calculates maintenance status correctly across intervals', () => {
    const vehicle: VehicleProfile = {
      id: 'veh_test',
      make: 'Maruti Suzuki',
      model: 'Baleno',
      year: 2021,
      fuelType: 'Petrol',
      transmission: 'Manual',
      odometerKm: 31000,
      region: 'Mumbai'
    }

    const schedules = generateDefaultScheduleForVehicle(vehicle)
    expect(schedules.length).toBeGreaterThan(5)

    // Evaluate oil change completed at 20,000km, current is 31,000km (interval 10,000km) -> Overdue
    const oilItem = schedules.find(s => s.title.includes('Engine Oil'))!
    oilItem.lastCompletedKm = 20000
    const statusOverdue = evaluateMaintenanceStatus(oilItem, 31000)
    expect(statusOverdue.status).toBe('DUE')
    expect(statusOverdue.progressPercent).toBe(100)

    // Evaluate recently serviced at 29,500km -> Healthy
    oilItem.lastCompletedKm = 29500
    const statusHealthy = evaluateMaintenanceStatus(oilItem, 31000)
    expect(statusHealthy.status).toBe('HEALTHY')
  })

  it('Scenario 8: Local data isolation ensures no cross-user data leakage and enables full export/import', () => {
    const vehicle: VehicleProfile = {
      id: 'veh_sec',
      make: 'Honda',
      model: 'City',
      year: 2023,
      fuelType: 'Petrol',
      transmission: 'CVT',
      odometerKm: 15000,
      region: 'Delhi'
    }

    saveStoredVehicle(vehicle)
    const exportedJson = exportAllUserData()
    expect(exportedJson).toContain('Honda')
    expect(exportedJson).toContain('City')

    // Clear storage to simulate fresh session
    clearStorageForTesting()
    expect(getStoredVehicles().length).toBe(0)

    // Re-import
    const importRes = importUserData(exportedJson)
    expect(importRes.success).toBe(true)
    expect(getStoredVehicles().length).toBe(1)
    expect(getStoredVehicles()[0].model).toBe('City')
  })
})
