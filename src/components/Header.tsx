import React from 'react'
import { VehicleProfile } from '../types/automotive'

export type ActiveTab = 'diagnose' | 'evidence' | 'garage' | 'maintenance' | 'obd' | 'settings'

interface HeaderProps {
  activeTab: ActiveTab
  setActiveTab: (tab: ActiveTab) => void
  activeVehicle: VehicleProfile | null
  isServerAiOnline: boolean
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeVehicle,
  isServerAiOnline
}) => {
  return (
    <header className="header">
      <div className="header-left">
        <div className="brand" onClick={() => setActiveTab('diagnose')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">🔧</div>
          <div className="header-title">
            <div className="title-row">
              <h1>MechMate</h1>
              <span className="platform-tag">INTELLIGENCE</span>
            </div>
            <p>Automotive Diagnostic Platform</p>
          </div>
        </div>

        {/* Active Vehicle Pill */}
        <div
          className="vehicle-pill"
          onClick={() => setActiveTab('garage')}
          title="Click to switch vehicle"
        >
          <span className="vehicle-pill-icon">🚗</span>
          <span className="vehicle-pill-text">
            {activeVehicle
              ? `${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`
              : 'Generic Vehicle Mode'}
          </span>
          <span className="vehicle-pill-badge">
            {activeVehicle ? `${activeVehicle.odometerKm.toLocaleString('en-IN')} km` : 'No Car'}
          </span>
        </div>
      </div>

      <div className="header-right">
        {/* Navigation Tabs */}
        <nav className="nav-tabs" aria-label="Main Navigation">
          <button
            className={`nav-tab ${activeTab === 'diagnose' ? 'active' : ''}`}
            onClick={() => setActiveTab('diagnose')}
          >
            ⚡ Diagnose
          </button>
          <button
            className={`nav-tab ${activeTab === 'evidence' ? 'active' : ''}`}
            onClick={() => setActiveTab('evidence')}
          >
            🔍 Evidence
          </button>
          <button
            className={`nav-tab ${activeTab === 'garage' ? 'active' : ''}`}
            onClick={() => setActiveTab('garage')}
          >
            🚗 Garage
          </button>
          <button
            className={`nav-tab ${activeTab === 'maintenance' ? 'active' : ''}`}
            onClick={() => setActiveTab('maintenance')}
          >
            🛠️ Service
          </button>
          <button
            className={`nav-tab ${activeTab === 'obd' ? 'active' : ''}`}
            onClick={() => setActiveTab('obd')}
          >
            📟 OBD-II
          </button>
          <button
            className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            title="Settings & Privacy"
          >
            ⚙️
          </button>
        </nav>

        {/* Provider Status Indicator */}
        <div
          className={`status-indicator ${isServerAiOnline ? 'online' : 'fallback'}`}
          title={isServerAiOnline ? 'Server AI Active with Offline Fallback' : 'Zero-Cost Local Mechatronic Engine Active (100% Offline)'}
        >
          <div className="status-ping" />
          <span>{isServerAiOnline ? 'Hybrid AI' : 'Mechatronic Engine'}</span>
        </div>
      </div>
    </header>
  )
}
