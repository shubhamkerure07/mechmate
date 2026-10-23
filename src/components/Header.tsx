import React from 'react'
import {
  Wrench,
  Car,
  Activity,
  FileSearch,
  CalendarCheck,
  Cpu,
  Database,
  ChevronDown,
  Sparkles
} from 'lucide-react'
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
      <div className="header-container">
        {/* Brand Logo & Name */}
        <div className="header-brand-group">
          <div
            className="brand-logo-btn"
            onClick={() => setActiveTab('diagnose')}
            style={{ cursor: 'pointer' }}
          >
            <div className="brand-icon-wrapper">
              <Wrench className="brand-wrench-icon" size={18} />
            </div>
            <div className="brand-text">
              <div className="brand-title-row">
                <span className="brand-name">MechMate</span>
                <span className="brand-badge">INTELLIGENCE</span>
              </div>
              <span className="brand-tagline">Automotive Diagnostic Platform</span>
            </div>
          </div>

          {/* Active Vehicle Quick Selector */}
          <button
            className={`vehicle-selector-pill ${activeVehicle ? 'has-car' : 'generic'}`}
            onClick={() => setActiveTab('garage')}
            title="Click to view garage or switch active vehicle"
          >
            <Car className="vehicle-pill-icon" size={15} />
            <div className="vehicle-pill-info">
              <span className="vehicle-pill-title">
                {activeVehicle
                  ? `${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`
                  : 'Generic Vehicle'}
              </span>
              <span className="vehicle-pill-meta">
                {activeVehicle
                  ? `${activeVehicle.odometerKm.toLocaleString('en-IN')} km · ${activeVehicle.fuelType}`
                  : 'Click to calibrate'}
              </span>
            </div>
            <ChevronDown size={14} className="vehicle-pill-chevron" />
          </button>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="header-nav" aria-label="Main Application Navigation">
          <button
            className={`nav-btn ${activeTab === 'diagnose' ? 'active' : ''}`}
            onClick={() => setActiveTab('diagnose')}
          >
            <Activity size={15} />
            <span>Diagnose</span>
          </button>
          <button
            className={`nav-btn ${activeTab === 'evidence' ? 'active' : ''}`}
            onClick={() => setActiveTab('evidence')}
          >
            <FileSearch size={15} />
            <span>Evidence</span>
          </button>
          <button
            className={`nav-btn ${activeTab === 'garage' ? 'active' : ''}`}
            onClick={() => setActiveTab('garage')}
          >
            <Car size={15} />
            <span>Garage</span>
          </button>
          <button
            className={`nav-btn ${activeTab === 'maintenance' ? 'active' : ''}`}
            onClick={() => setActiveTab('maintenance')}
          >
            <CalendarCheck size={15} />
            <span>Service</span>
          </button>
          <button
            className={`nav-btn ${activeTab === 'obd' ? 'active' : ''}`}
            onClick={() => setActiveTab('obd')}
          >
            <Cpu size={15} />
            <span>OBD-II</span>
          </button>
          <button
            className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            title="Data Vault & System Architecture"
          >
            <Database size={15} />
            <span>Vault</span>
          </button>
        </nav>

        {/* Right Engine Status */}
        <div className="header-right-actions">
          <div
            className={`engine-status-badge ${isServerAiOnline ? 'online' : 'fallback'}`}
            title={
              isServerAiOnline
                ? 'Server AI Active with Local Offline Fallback'
                : '100% Offline Mechatronic Engine Active (0 cost, instant evaluation)'
            }
          >
            <span className="status-ping-dot" />
            <Sparkles size={13} className="status-sparkle" />
            <span>{isServerAiOnline ? 'Hybrid AI Ready' : 'Mechatronic Engine'}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
