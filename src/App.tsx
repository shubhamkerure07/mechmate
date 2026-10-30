import { useState, useEffect } from 'react'
import { Header, ActiveTab } from './components/Header'
import { DiagnoseView } from './components/DiagnoseView'
import { EvidenceExplorerView } from './components/EvidenceExplorerView'
import { GarageView } from './components/GarageView'
import { MaintenanceView } from './components/MaintenanceView'
import { OBDScannerView } from './components/OBDScannerView'
import { SettingsView } from './components/SettingsView'
import { AdminView } from './components/AdminView'
import { Footer } from './components/Footer'
import { AuthModal } from './components/AuthModal'
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal'
import {
  DiagnosticAssessment,
  MaintenanceItem,
  VehicleProfile
} from './types/automotive'
import {
  getStoredVehicles,
  saveStoredVehicle,
  deleteStoredVehicle,
  getActiveVehicle,
  setActiveVehicleId,
  getDiagnosticHistory,
  saveDiagnosticAssessment,
  getStoredMaintenance,
  saveStoredMaintenanceItem,
  markMaintenanceCompleted
} from './services/storageService'
import { generateDefaultScheduleForVehicle } from './services/maintenanceService'
import { getTokenUsage, consumeToken, TokenState } from './services/tokenService'

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('diagnose')
  const [vehicles, setVehicles] = useState<VehicleProfile[]>([])
  const [activeVehicle, setActiveVehicle] = useState<VehicleProfile | null>(null)
  const [currentAssessment, setCurrentAssessment] = useState<DiagnosticAssessment | null>(null)
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([])
  const [isServerAiOnline, setIsServerAiOnline] = useState<boolean>(false)

  // Customer Token & Auth State
  const [tokenState, setTokenState] = useState<TokenState>(getTokenUsage())
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false)
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false)

  // Visual Theme (Default Start: Light / White)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mechmate_theme')
      if (saved === 'dark' || saved === 'light') return saved
    }
    return 'light' // Always first start with white
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('mechmate_theme', theme)
    } catch {}
  }, [theme])

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
  }

  // Initialize data from local storage
  const loadStateFromStorage = () => {
    const loadedVehicles = getStoredVehicles()
    setVehicles(loadedVehicles)

    const active = getActiveVehicle()
    setActiveVehicle(active)

    const history = getDiagnosticHistory()
    if (history.length > 0) {
      setCurrentAssessment(history[0])
    }

    if (active) {
      let maint = getStoredMaintenance(active.id)
      if (maint.length === 0) {
        // Auto-generate initial maintenance schedule for active vehicle
        maint = generateDefaultScheduleForVehicle(active)
        maint.forEach(item => saveStoredMaintenanceItem(item))
      }
      setMaintenanceItems(maint)
    } else {
      setMaintenanceItems([])
    }

    // Refresh token state
    setTokenState(getTokenUsage())
  }

  useEffect(() => {
    loadStateFromStorage()

    // Ping /api/diagnose safely to detect server readiness
    fetch('/api/diagnose', { method: 'OPTIONS' })
      .then(res => setIsServerAiOnline(res.status < 500))
      .catch(() => setIsServerAiOnline(false))
  }, [])

  // Vehicle Management
  const handleSaveVehicle = (vehicle: VehicleProfile) => {
    const updated = saveStoredVehicle(vehicle)
    setVehicles(updated)
    const active = getActiveVehicle()
    setActiveVehicle(active)

    // Generate maintenance schedule if new vehicle
    const existingMaint = getStoredMaintenance(vehicle.id)
    if (existingMaint.length === 0) {
      const defaultSchedules = generateDefaultScheduleForVehicle(vehicle)
      defaultSchedules.forEach(item => saveStoredMaintenanceItem(item))
      if (active?.id === vehicle.id) {
        setMaintenanceItems(defaultSchedules)
      }
    }
  }

  const handleDeleteVehicle = (id: string) => {
    const updated = deleteStoredVehicle(id)
    setVehicles(updated)
    const active = getActiveVehicle()
    setActiveVehicle(active)
    if (active) {
      setMaintenanceItems(getStoredMaintenance(active.id))
    } else {
      setMaintenanceItems([])
    }
  }

  const handleSetActiveVehicle = (id: string) => {
    setActiveVehicleId(id)
    const active = getActiveVehicle()
    setActiveVehicle(active)
    if (active) {
      let maint = getStoredMaintenance(active.id)
      if (maint.length === 0) {
        maint = generateDefaultScheduleForVehicle(active)
        maint.forEach(item => saveStoredMaintenanceItem(item))
      }
      setMaintenanceItems(maint)
    }
  }

  const handleAssessmentCompleted = (assessment: DiagnosticAssessment) => {
    saveDiagnosticAssessment(assessment)
    setCurrentAssessment(assessment)
  }

  const handleMarkCompleted = (id: string, km: number, date: string) => {
    markMaintenanceCompleted(id, km, date)
    if (activeVehicle) {
      setMaintenanceItems(getStoredMaintenance(activeVehicle.id))
    }
  }

  const handleUpdateVehicleOdometer = (vehicleId: string, km: number) => {
    const veh = vehicles.find(v => v.id === vehicleId)
    if (veh) {
      const updated: VehicleProfile = { ...veh, odometerKm: km }
      handleSaveVehicle(updated)
    }
  }

  // Token deduction handler
  const handleConsumeToken = (): boolean => {
    const res = consumeToken(1)
    if (res.success) {
      setTokenState(res.state)
      return true
    }
    return false
  }

  return (
    <div className="app-shell">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeVehicle={activeVehicle}
        isServerAiOnline={isServerAiOnline}
        tokenState={tokenState}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="main-content" role="main">
        {activeTab === 'diagnose' && (
          <DiagnoseView
            activeVehicle={activeVehicle}
            currentAssessment={currentAssessment}
            tokenState={tokenState}
            onConsumeToken={handleConsumeToken}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenPrivacyPolicy={() => setIsPrivacyModalOpen(true)}
            onAssessmentCompleted={handleAssessmentCompleted}
            onOpenEvidenceExplorer={() => setActiveTab('evidence')}
            onOpenGarage={() => setActiveTab('garage')}
          />
        )}

        {activeTab === 'evidence' && (
          <EvidenceExplorerView
            currentAssessment={currentAssessment}
            onOpenDiagnose={() => setActiveTab('diagnose')}
          />
        )}

        {activeTab === 'garage' && (
          <GarageView
            vehicles={vehicles}
            activeVehicleId={activeVehicle?.id || null}
            onSaveVehicle={handleSaveVehicle}
            onDeleteVehicle={handleDeleteVehicle}
            onSetActiveVehicle={handleSetActiveVehicle}
            onStartDiagnosis={() => setActiveTab('diagnose')}
          />
        )}

        {activeTab === 'maintenance' && (
          <MaintenanceView
            activeVehicle={activeVehicle}
            maintenanceItems={maintenanceItems}
            onMarkCompleted={handleMarkCompleted}
            onUpdateVehicleOdometer={handleUpdateVehicleOdometer}
            onOpenGarage={() => setActiveTab('garage')}
          />
        )}

        {activeTab === 'obd' && <OBDScannerView />}

        {activeTab === 'settings' && (
          <SettingsView
            onDataReset={loadStateFromStorage}
            onOpenPrivacyPolicy={() => setIsPrivacyModalOpen(true)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminView
            tokenState={tokenState}
            onResetTokens={loadStateFromStorage}
            onSeedComplete={loadStateFromStorage}
          />
        )}
      </main>

      <Footer
        tokenState={tokenState}
        onOpenPrivacyPolicy={() => setIsPrivacyModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAdmin={() => setActiveTab('admin')}
      />

      {/* Customer Sign-In / Token Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        tokenState={tokenState}
        onTokenStateChange={setTokenState}
        onOpenPrivacyPolicy={() => {
          setIsAuthModalOpen(false)
          setIsPrivacyModalOpen(true)
        }}
      />

      {/* Comprehensive Privacy Policy & Token Terms Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onOpenAuth={() => {
          setIsPrivacyModalOpen(false)
          setIsAuthModalOpen(true)
        }}
      />
    </div>
  )
}
