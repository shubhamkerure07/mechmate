import {
  DiagnosticAssessment,
  MaintenanceItem,
  VehicleProfile
} from '../types/automotive'

/**
 * Local-First Persistence Service for MechMate
 * 
 * PRIVACY & COST ARCHITECTURE:
 * - 100% Client-side privacy-first storage using LocalStorage.
 * - In-memory fallback for Node/SSR/Testing environments.
 * - Zero database subscription cost.
 * - Zero user tracking or cross-user data leakage.
 * - Full export/import JSON capability for user data sovereignty.
 */

const KEYS = {
  VEHICLES: 'mechmate_vehicles_v1',
  ACTIVE_VEHICLE_ID: 'mechmate_active_vehicle_id_v1',
  DIAGNOSTICS: 'mechmate_diagnostics_v1',
  MAINTENANCE: 'mechmate_maintenance_v1'
}

const memoryStore: Record<string, string> = {}

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage
  }
  return {
    getItem: (key: string): string | null => memoryStore[key] ?? null,
    setItem: (key: string, val: string): void => { memoryStore[key] = val },
    removeItem: (key: string): void => { delete memoryStore[key] },
    clear: (): void => {
      for (const k of Object.keys(memoryStore)) {
        delete memoryStore[k]
      }
    }
  }
}

export function clearStorageForTesting(): void {
  getStorage().clear()
}

function safeGetItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = getStorage().getItem(key)
    if (!raw) return defaultValue
    return JSON.parse(raw) as T
  } catch (err) {
    console.warn(`Failed reading storage key "${key}":`, err)
    return defaultValue
  }
}

function safeSetItem<T>(key: string, value: T): boolean {
  try {
    getStorage().setItem(key, JSON.stringify(value))
    return true
  } catch (err) {
    console.error(`Failed writing storage key "${key}":`, err)
    return false
  }
}

// ==================== VEHICLES ====================

export function getStoredVehicles(): VehicleProfile[] {
  return safeGetItem<VehicleProfile[]>(KEYS.VEHICLES, [])
}

export function saveStoredVehicle(vehicle: VehicleProfile): VehicleProfile[] {
  const current = getStoredVehicles()
  const existingIdx = current.findIndex(v => v.id === vehicle.id)
  let updated: VehicleProfile[]

  if (existingIdx >= 0) {
    updated = [...current]
    updated[existingIdx] = vehicle
  } else {
    updated = [...current, vehicle]
  }

  safeSetItem(KEYS.VEHICLES, updated)

  // If no active vehicle set yet, make this one active
  if (!getActiveVehicleId() && updated.length > 0) {
    setActiveVehicleId(vehicle.id)
  }

  return updated
}

export function deleteStoredVehicle(id: string): VehicleProfile[] {
  const current = getStoredVehicles()
  const updated = current.filter(v => v.id !== id)
  safeSetItem(KEYS.VEHICLES, updated)

  if (getActiveVehicleId() === id) {
    setActiveVehicleId(updated.length > 0 ? updated[0].id : null)
  }

  return updated
}

export function getActiveVehicleId(): string | null {
  return safeGetItem<string | null>(KEYS.ACTIVE_VEHICLE_ID, null)
}

export function setActiveVehicleId(id: string | null): void {
  safeSetItem(KEYS.ACTIVE_VEHICLE_ID, id)
}

export function getActiveVehicle(): VehicleProfile | null {
  const id = getActiveVehicleId()
  if (!id) return null
  const vehicles = getStoredVehicles()
  return vehicles.find(v => v.id === id) || null
}

// ==================== DIAGNOSTICS HISTORY ====================

export function getDiagnosticHistory(vehicleId?: string): DiagnosticAssessment[] {
  const history = safeGetItem<DiagnosticAssessment[]>(KEYS.DIAGNOSTICS, [])
  if (vehicleId) {
    return history.filter(d => d.vehicle?.id === vehicleId)
  }
  return history
}

export function saveDiagnosticAssessment(assessment: DiagnosticAssessment): void {
  const current = safeGetItem<DiagnosticAssessment[]>(KEYS.DIAGNOSTICS, [])
  // Keep newest first, limit to 50 assessments
  const updated = [assessment, ...current.filter(d => d.id !== assessment.id)].slice(0, 50)
  safeSetItem(KEYS.DIAGNOSTICS, updated)
}

export function deleteDiagnosticAssessment(id: string): void {
  const current = safeGetItem<DiagnosticAssessment[]>(KEYS.DIAGNOSTICS, [])
  const updated = current.filter(d => d.id !== id)
  safeSetItem(KEYS.DIAGNOSTICS, updated)
}

// ==================== MAINTENANCE ====================

export function getStoredMaintenance(vehicleId?: string): MaintenanceItem[] {
  const items = safeGetItem<MaintenanceItem[]>(KEYS.MAINTENANCE, [])
  if (vehicleId) {
    return items.filter(m => m.vehicleId === vehicleId)
  }
  return items
}

export function saveStoredMaintenanceItem(item: MaintenanceItem): MaintenanceItem[] {
  const current = safeGetItem<MaintenanceItem[]>(KEYS.MAINTENANCE, [])
  const idx = current.findIndex(m => m.id === item.id)
  let updated: MaintenanceItem[]

  if (idx >= 0) {
    updated = [...current]
    updated[idx] = item
  } else {
    updated = [...current, item]
  }

  safeSetItem(KEYS.MAINTENANCE, updated)
  return updated
}

export function markMaintenanceCompleted(
  id: string,
  completedKm: number,
  completedDate: string
): void {
  const current = safeGetItem<MaintenanceItem[]>(KEYS.MAINTENANCE, [])
  const updated = current.map(item => {
    if (item.id === id) {
      return {
        ...item,
        lastCompletedKm: completedKm,
        lastCompletedDate: completedDate
      }
    }
    return item
  })
  safeSetItem(KEYS.MAINTENANCE, updated)
}

// ==================== EXPORT / IMPORT ====================

export function exportAllUserData(): string {
  const bundle = {
    exportDate: new Date().toISOString(),
    appVersion: '2.0.0',
    vehicles: getStoredVehicles(),
    activeVehicleId: getActiveVehicleId(),
    diagnostics: getDiagnosticHistory(),
    maintenance: getStoredMaintenance()
  }
  return JSON.stringify(bundle, null, 2)
}

export function importUserData(jsonString: string): { success: boolean; message: string } {
  try {
    const bundle = JSON.parse(jsonString)
    if (!bundle || typeof bundle !== 'object') {
      return { success: false, message: 'Invalid JSON payload structure.' }
    }

    if (Array.isArray(bundle.vehicles)) {
      safeSetItem(KEYS.VEHICLES, bundle.vehicles)
    }
    if (typeof bundle.activeVehicleId === 'string' || bundle.activeVehicleId === null) {
      safeSetItem(KEYS.ACTIVE_VEHICLE_ID, bundle.activeVehicleId)
    }
    if (Array.isArray(bundle.diagnostics)) {
      safeSetItem(KEYS.DIAGNOSTICS, bundle.diagnostics)
    }
    if (Array.isArray(bundle.maintenance)) {
      safeSetItem(KEYS.MAINTENANCE, bundle.maintenance)
    }

    return { success: true, message: 'User vehicle garage and history restored successfully.' }
  } catch (err: any) {
    return { success: false, message: `JSON parsing error: ${err?.message || err}` }
  }
}
