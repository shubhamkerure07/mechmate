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
  Sparkles,
  Zap,
  User,
  Sun,
  Moon
} from 'lucide-react'
import { VehicleProfile } from '../types/automotive'
import { TokenState } from '../services/tokenService'

export type ActiveTab = 'diagnose' | 'evidence' | 'garage' | 'maintenance' | 'obd' | 'settings' | 'admin'

interface HeaderProps {
  activeTab: ActiveTab
  setActiveTab: (tab: ActiveTab) => void
  activeVehicle: VehicleProfile | null
  isServerAiOnline: boolean
  tokenState: TokenState
  onOpenAuth: () => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeVehicle,
  isServerAiOnline,
  tokenState,
  onOpenAuth,
  theme,
  onToggleTheme
}) => {
  return (
    <>
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
                  <span className="brand-name">MECHMATE</span>
                </div>
                <span className="brand-tagline">Personal Automotive AI Manager</span>
              </div>
            </div>

            {/* Active Vehicle Quick Selector */}
            <button
              className={`vehicle-selector-pill ${activeVehicle ? 'has-car' : 'generic'} desktop-only`}
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

          {/* Desktop Center Navigation Tabs */}
          <nav className="header-nav desktop-nav" aria-label="Main Application Navigation">
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

          {/* Right Actions: Token Quota & Account */}
          <div className="header-right-actions">
            {/* Theme Toggle Button (Light/Dark Mode) */}
            <button
              className="header-theme-toggle"
              onClick={onToggleTheme}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              aria-label="Toggle visual theme"
            >
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </button>

            {/* Daily Token Quota Pill */}
            <button
              className="header-token-badge"
              onClick={onOpenAuth}
              title={`Daily Diagnostic Token Quota: ${tokenState.remainingTokens} of ${tokenState.maxTokens} remaining.`}
            >
              <Zap size={13} className="token-bolt-icon" />
              <span className="token-counter-text">
                <strong>{tokenState.remainingTokens}</strong>/{tokenState.maxTokens}
              </span>
              <span className="token-label-tag">TOKENS</span>
            </button>

            {/* Customer Account Button */}
            <button
              className={`header-user-btn ${tokenState.tier === 'REGISTERED' ? 'signed-in' : ''}`}
              onClick={onOpenAuth}
              title={
                tokenState.tier === 'REGISTERED'
                  ? `Signed in as ${tokenState.user?.name} (${tokenState.user?.email})`
                  : 'Sign in to unlock 25 tokens/day'
              }
            >
              <User size={14} />
              <span className="user-btn-text">
                {tokenState.tier === 'REGISTERED'
                  ? tokenState.user?.name || 'Account'
                  : 'Sign In'}
              </span>
            </button>

            {/* Engine Status Badge */}
            <div
              className={`engine-status-badge desktop-only ${isServerAiOnline ? 'online' : 'fallback'}`}
              title={
                isServerAiOnline
                  ? 'Server AI Active with Local Offline Fallback'
                  : '100% Offline Mechatronic Engine Active (0 cost, instant evaluation)'
              }
            >
              <span className="status-ping-dot" />
              <Sparkles size={12} className="status-sparkle" />
              <span>{isServerAiOnline ? 'Hybrid AI' : 'Offline Core'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
        <button
          className={`mobile-nav-item ${activeTab === 'diagnose' ? 'active' : ''}`}
          onClick={() => setActiveTab('diagnose')}
        >
          <Activity size={17} />
          <span>Diagnose</span>
        </button>
        <button
          className={`mobile-nav-item ${activeTab === 'evidence' ? 'active' : ''}`}
          onClick={() => setActiveTab('evidence')}
        >
          <FileSearch size={17} />
          <span>Evidence</span>
        </button>
        <button
          className={`mobile-nav-item ${activeTab === 'garage' ? 'active' : ''}`}
          onClick={() => setActiveTab('garage')}
        >
          <Car size={17} />
          <span>Garage</span>
        </button>
        <button
          className={`mobile-nav-item ${activeTab === 'maintenance' ? 'active' : ''}`}
          onClick={() => setActiveTab('maintenance')}
        >
          <CalendarCheck size={17} />
          <span>Service</span>
        </button>
        <button
          className={`mobile-nav-item ${activeTab === 'obd' ? 'active' : ''}`}
          onClick={() => setActiveTab('obd')}
        >
          <Cpu size={17} />
          <span>OBD-II</span>
        </button>
      </nav>
    </>
  )
}
