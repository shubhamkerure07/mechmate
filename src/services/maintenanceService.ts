import { MaintenanceItem, VehicleProfile } from '../types/automotive'

/**
 * Maintenance Intelligence Engine
 * Standard OEM interval modeling adapted for Indian driving conditions
 * (dust, heavy stop-and-go traffic, monsoon humidity).
 */

export interface MaintenanceStatusItem extends MaintenanceItem {
  status: 'DUE' | 'UPCOMING' | 'HEALTHY'
  dueInKm: number
  progressPercent: number
  recommendationNote: string
}

const DEFAULT_SCHEDULE_TEMPLATES = [
  {
    title: 'Engine Oil & Filter Change',
    systemCategory: 'Engine',
    intervalKm: 10000,
    intervalMonths: 12,
    recommendationNote: 'Essential for preventing sludge formation in tropical Indian climates.'
  },
  {
    title: 'Cabin AC Filter Replacement',
    systemCategory: 'Climate',
    intervalKm: 10000,
    intervalMonths: 12,
    recommendationNote: 'Crucial for air quality and defogger performance during monsoon seasons.'
  },
  {
    title: 'Engine Air Filter Replacement',
    systemCategory: 'Engine',
    intervalKm: 15000,
    intervalMonths: 12,
    recommendationNote: 'Dusty urban driving severely clogs air filters, degrading fuel economy.'
  },
  {
    title: 'Brake Fluid Flush (DOT 3 / DOT 4)',
    systemCategory: 'Brakes',
    intervalKm: 25000,
    intervalMonths: 24,
    recommendationNote: 'Brake fluid absorbs atmospheric moisture (hygroscopic), lowering its boiling point.'
  },
  {
    title: 'Coolant Fluid Flush & Matrix Clean',
    systemCategory: 'Cooling',
    intervalKm: 40000,
    intervalMonths: 36,
    recommendationNote: 'Prevents scaling and electrolytic corrosion inside aluminum radiator channels.'
  },
  {
    title: 'Manual Transmission Gear Oil Flush',
    systemCategory: 'Transmission',
    intervalKm: 40000,
    intervalMonths: 36,
    recommendationNote: 'Replaces metal particulate-contaminated gear oil to protect synchronizer rings.'
  },
  {
    title: 'Spark Plugs Replacement',
    systemCategory: 'Ignition',
    intervalKm: 30000,
    intervalMonths: 24,
    recommendationNote: 'Worn gap electrodes strain ignition coils and cause sluggish acceleration.'
  },
  {
    title: 'Serpentine Accessory Belt Inspection',
    systemCategory: 'Engine',
    intervalKm: 40000,
    intervalMonths: 36,
    recommendationNote: 'Inspect for micro-cracks and rib delamination to avoid roadside alternator/water pump failure.'
  }
]

export function generateDefaultScheduleForVehicle(vehicle: VehicleProfile): MaintenanceItem[] {
  return DEFAULT_SCHEDULE_TEMPLATES.map((tmpl, idx) => ({
    id: `maint_${vehicle.id}_${idx}`,
    vehicleId: vehicle.id,
    title: tmpl.title,
    systemCategory: tmpl.systemCategory,
    intervalKm: tmpl.intervalKm,
    intervalMonths: tmpl.intervalMonths,
    lastCompletedKm: Math.max(0, vehicle.odometerKm - Math.floor(tmpl.intervalKm * 0.7)),
    lastCompletedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString().split('T')[0],
    notes: tmpl.recommendationNote
  }))
}

export function evaluateMaintenanceStatus(
  item: MaintenanceItem,
  currentOdometerKm: number
): MaintenanceStatusItem {
  const lastKm = item.lastCompletedKm || 0
  const kmSinceService = Math.max(0, currentOdometerKm - lastKm)
  const remainingKm = item.intervalKm - kmSinceService
  const progressPercent = Math.min(100, Math.round((kmSinceService / item.intervalKm) * 100))

  let status: 'DUE' | 'UPCOMING' | 'HEALTHY' = 'HEALTHY'

  if (remainingKm <= 0) {
    status = 'DUE'
  } else if (remainingKm <= 2000) {
    status = 'UPCOMING'
  }

  let note = item.notes || ''
  if (status === 'DUE') {
    note = `Service is overdue by ${Math.abs(remainingKm).toLocaleString('en-IN')} km. Schedule maintenance promptly.`
  } else if (status === 'UPCOMING') {
    note = `Due soon in approximately ${remainingKm.toLocaleString('en-IN')} km.`
  }

  return {
    ...item,
    status,
    dueInKm: remainingKm,
    progressPercent,
    recommendationNote: note
  }
}
