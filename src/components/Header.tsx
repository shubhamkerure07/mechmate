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
          <div className="logo-terminal-icon">
            <span className="terminal-prompt">$</span>
          </div>
          <div className="header-title">
            <div className="title-row">
              <span className="brand-name">mechmate</span>
              <span className="dot-sep">/</span>
              <span className="brand-sub">diag.notes</span>
              <span className="version-pill">v2.0.0</span>
            </div>
            <p className="brand-tagline">Automotive Intelligence Ledger</p>
          </div>
        </div>

        {/* Active Vehicle Note Pill */}
        <div
          className="vehicle-note-chip"
          onClick={() => setActiveTab('garage')}
          title="Click to switch active vehicle profile"
        >
          <span className="chip-key">CAR:</span>
          <span className="chip-value">
            {activeVehicle
              ? `${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`
              : 'generic_vehicle'}
          </span>
          <span className="chip-meta">
            {activeVehicle ? `${activeVehicle.odometerKm.toLocaleString('en-IN')}km` : 'uncalibrated'}
          </span>
        </div>
      </div>

      <div className="header-right">
        {/* Navigation Tabs - Coded Note Vibe */}
        <nav className="nav-tabs" aria-label="Main Navigation">
          <button
            className={`nav-tab ${activeTab === 'diagnose' ? 'active' : ''}`}
            onClick={() => setActiveTab('diagnose')}
          >
            <span className="tab-idx">01</span>
            <span className="tab-label">diagnose</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'evidence' ? 'active' : ''}`}
            onClick={() => setActiveTab('evidence')}
          >
            <span className="tab-idx">02</span>
            <span className="tab-label">evidence</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'garage' ? 'active' : ''}`}
            onClick={() => setActiveTab('garage')}
          >
            <span className="tab-idx">03</span>
            <span className="tab-label">garage</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'maintenance' ? 'active' : ''}`}
            onClick={() => setActiveTab('maintenance')}
          >
            <span className="tab-idx">04</span>
            <span className="tab-label">service</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'obd' ? 'active' : ''}`}
            onClick={() => setActiveTab('obd')}
          >
            <span className="tab-idx">05</span>
            <span className="tab-label">obd-ii</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            title="Settings, Vault & Architecture"
          >
            <span className="tab-idx">06</span>
            <span className="tab-label">vault</span>
          </button>
        </nav>

        {/* Engine Status Tag */}
        <div
          className={`status-chip ${isServerAiOnline ? 'online' : 'fallback'}`}
          title={isServerAiOnline ? 'Server AI Active with Local Fallback' : 'Local Deterministic Mechatronic Engine Active (100% Offline)'}
        >
          <span className="status-dot-pulse" />
          <span className="status-text">{isServerAiOnline ? 'HYBRID_AI' : 'OFFLINE_FIRST'}</span>
        </div>
      </div>
    </header>
  )
}
