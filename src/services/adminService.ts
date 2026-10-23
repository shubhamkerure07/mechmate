export interface AdminConfig {
  anonymousTokenLimit: number
  registeredTokenLimit: number
  engineMode: 'hybrid' | 'force_offline' | 'mock_stress'
  debugTelemetry: boolean
}

export interface AdminStats {
  totalVehicles: number
  totalDiagnostics: number
  totalMaintenanceItems: number
  activeSessionTokensUsed: number
  activeSessionRemaining: number
  storageBytesUsed: number
}

const STORAGE_KEY_ADMIN_CONFIG = 'mechmate_admin_config_v1'
const STORAGE_KEY_ADMIN_AUTH = 'mechmate_admin_auth_v1'
const DEFAULT_PASSKEY = 'mechmate-admin'

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

export function getAdminConfig(): AdminConfig {
  try {
    const raw = getStorage().getItem(STORAGE_KEY_ADMIN_CONFIG)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch {}

  return {
    anonymousTokenLimit: 5,
    registeredTokenLimit: 25,
    engineMode: 'hybrid',
    debugTelemetry: true
  }
}

export function saveAdminConfig(config: AdminConfig): void {
  try {
    getStorage().setItem(STORAGE_KEY_ADMIN_CONFIG, JSON.stringify(config))
  } catch (err) {
    console.warn('Could not save admin config:', err)
  }
}

export function isAdminAuthenticated(): boolean {
  try {
    return getStorage().getItem(STORAGE_KEY_ADMIN_AUTH) === 'true'
  } catch {
    return false
  }
}

export function verifyAdminPasskey(passkey: string): boolean {
  if (passkey.trim() === DEFAULT_PASSKEY) {
    try {
      getStorage().setItem(STORAGE_KEY_ADMIN_AUTH, 'true')
    } catch {}
    return true
  }
  return false
}

export function logoutAdmin(): void {
  try {
    getStorage().removeItem(STORAGE_KEY_ADMIN_AUTH)
  } catch {}
}

export function getAdminStats(): AdminStats {
  const store = getStorage()
  let vehiclesCount = 0
  let diagCount = 0
  let maintCount = 0
  let bytes = 0

  try {
    const v = store.getItem('mechmate_vehicles_v1')
    if (v) {
      vehiclesCount = JSON.parse(v).length
      bytes += v.length
    }
    const d = store.getItem('mechmate_diagnostics_v1')
    if (d) {
      diagCount = JSON.parse(d).length
      bytes += d.length
    }
    const m = store.getItem('mechmate_maintenance_v1')
    if (m) {
      maintCount = JSON.parse(m).length
      bytes += m.length
    }
    const t = store.getItem('mechmate_token_state_v1')
    if (t) {
      bytes += t.length
    }
  } catch {}

  return {
    totalVehicles: vehiclesCount,
    totalDiagnostics: diagCount,
    totalMaintenanceItems: maintCount,
    activeSessionTokensUsed: 0,
    activeSessionRemaining: 0,
    storageBytesUsed: bytes
  }
}

export function seedDemoFleet(): void {
  const store = getStorage()
  const sampleVehicles = [
    {
      id: 'veh_demo_1',
      make: 'Tata',
      model: 'Nexon EV Empowered',
      year: 2024,
      fuelType: 'Electric',
      transmission: 'Automatic',
      odometerKm: 18450,
      region: 'Bengaluru, Karnataka'
    },
    {
      id: 'veh_demo_2',
      make: 'Mahindra',
      model: 'Thar 4x4 LX Hardtop',
      year: 2023,
      fuelType: 'Diesel',
      transmission: 'Manual',
      odometerKm: 34200,
      region: 'Pune, Maharashtra'
    },
    {
      id: 'veh_demo_3',
      make: 'Hyundai',
      model: 'Creta 1.5 Turbo DCT',
      year: 2024,
      fuelType: 'Petrol',
      transmission: 'DCT',
      odometerKm: 12800,
      region: 'New Delhi, NCR'
    }
  ]

  store.setItem('mechmate_vehicles_v1', JSON.stringify(sampleVehicles))
  store.setItem('mechmate_active_vehicle_id_v1', 'veh_demo_1')
}
