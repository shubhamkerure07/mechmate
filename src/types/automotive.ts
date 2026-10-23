/**
 * Automotive Domain Types for MechMate
 * Rigorous schemas for vehicle profiles, safety assessments,
 * diagnostics, evidence exploration, maintenance, and repair cost estimation.
 */

export type FuelType = 'Petrol' | 'Diesel' | 'CNG' | 'Electric' | 'Hybrid' | 'Unknown'
export type TransmissionType = 'Manual' | 'Automatic' | 'AMT' | 'CVT' | 'DCT' | 'Unknown'

export interface VehicleProfile {
  id: string
  make: string
  model: string
  year: number
  fuelType: FuelType
  transmission: TransmissionType
  odometerKm: number
  region: string
  vinOrRegistration?: string
  lastServiceDate?: string
  notes?: string
}

export type SafetySeverity = 'CRITICAL_STOP' | 'URGENT_INSPECT' | 'MODERATE_MONITOR' | 'LOW_MAINTENANCE'

export interface SafetyRuleMatch {
  ruleId: string
  hazardName: string
  severity: SafetySeverity
  immediateAction: string
  hazards: string[]
  prohibitedActions: string[]
  safeCheckpoints: string[]
}

export interface SafetyAssessment {
  overallSeverity: SafetySeverity
  requiresImmediateStop: boolean
  matches: SafetyRuleMatch[]
  summaryWarning: string
  emergencyChecklist: string[]
  isDeterministic: true
}

export type ProbabilityRating = 'Likely' | 'Possible' | 'Unlikely'

export interface EvidenceCard {
  supporting: string[]
  contradicting: string[]
  missingInfo: string[]
  discriminatingTest: string
}

export interface PotentialCause {
  id: string
  name: string
  systemCategory: 'Brakes' | 'Engine' | 'Cooling' | 'Electrical' | 'Transmission' | 'Suspension' | 'Fuel' | 'Exhaust' | 'Sensors' | 'General'
  probability: ProbabilityRating
  reasoning: string
  evidence: EvidenceCard
  safeUserInspection: string
  professionalInspectionRequired: boolean
  professionalMechanicSteps: string[]
}

export interface IndianCostRange {
  partsMinINR: number
  partsMaxINR: number
  laborMinINR: number
  laborMaxINR: number
  totalMinINR: number
  totalMaxINR: number
  confidence: 'verified_benchmark' | 'indicative_range' | 'uncalibrated_estimate'
  assumptions: string
  dataSource: string
  lastUpdated: string
}

export interface DiagnosticAssessment {
  id: string
  timestamp: string
  vehicle: VehicleProfile | null
  rawInput: string
  symptomSummary: string
  safety: SafetyAssessment
  potentialCauses: PotentialCause[]
  costEstimate: IndianCostRange
  limitations: string[]
  whatChangedExplanation?: string
  confidenceScoreText: string
  providerOrigin: 'deterministic_engine' | 'ai_service' | 'hybrid_verified'
}

export interface FollowUpQuestion {
  id: string
  question: string
  context: string
  options: { label: string; value: string; hint?: string }[]
  targetSystem: string
}

export interface OBDCodeDetails {
  code: string
  title: string
  category: 'Powertrain' | 'Chassis' | 'Body' | 'Network'
  severity: SafetySeverity
  meaning: string
  commonSymptoms: string[]
  possibleCauses: string[]
  recommendedActions: string[]
}

export interface MaintenanceItem {
  id: string
  vehicleId: string
  title: string
  systemCategory: string
  intervalKm: number
  intervalMonths: number
  lastCompletedKm?: number
  lastCompletedDate?: string
  notes?: string
  isCustom?: boolean
}
