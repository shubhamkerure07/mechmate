import React, { useState, useEffect } from 'react'
import {
  ShieldAlert,
  Key,
  Sliders,
  Database,
  Cpu,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Lock,
  LogOut,
  Car,
  FileText
} from 'lucide-react'
import {
  AdminConfig,
  getAdminConfig,
  saveAdminConfig,
  isAdminAuthenticated,
  verifyAdminPasskey,
  logoutAdmin,
  getAdminStats,
  seedDemoFleet
} from '../services/adminService'
import { evaluateSafetyRules } from '../services/safetyEngine'
import { TokenState } from '../services/tokenService'

interface AdminViewProps {
  tokenState: TokenState
  onResetTokens: () => void
  onSeedComplete: () => void
}

export const AdminView: React.FC<AdminViewProps> = ({
  tokenState,
  onResetTokens,
  onSeedComplete
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(isAdminAuthenticated())
  const [passkeyInput, setPasskeyInput] = useState('')
  const [authError, setAuthError] = useState('')
  const [config, setConfig] = useState<AdminConfig>(getAdminConfig())
  const [stats, setStats] = useState(getAdminStats())
  const [feedback, setFeedback] = useState<string | null>(null)
  const [simulatedSafetyResult, setSimulatedSafetyResult] = useState<any | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      setStats(getAdminStats())
    }
  }, [isAuthenticated])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (verifyAdminPasskey(passkeyInput)) {
      setIsAuthenticated(true)
      setAuthError('')
      setPasskeyInput('')
    } else {
      setAuthError('Invalid Admin Passkey. Hint: mechmate-admin')
    }
  }

  const handleLogout = () => {
    logoutAdmin()
    setIsAuthenticated(false)
    setSimulatedSafetyResult(null)
  }

  const handleSaveTokenLimits = () => {
    saveAdminConfig(config)
    setFeedback('Token parameters synchronized across local runtime.')
    setTimeout(() => setFeedback(null), 3000)
  }

  const handleRunSafetySimulation = (symptomDescription: string) => {
    const start = performance.now()
    const result = evaluateSafetyRules(symptomDescription)
    const durationMs = (performance.now() - start).toFixed(2)
    setSimulatedSafetyResult({
      input: symptomDescription,
      result,
      durationMs
    })
  }

  const handleSeedFleet = () => {
    seedDemoFleet()
    setStats(getAdminStats())
    onSeedComplete()
    setFeedback('Demo vehicle fleet seeded successfully (Nexon EV, Thar 4x4, Creta Turbo).')
    setTimeout(() => setFeedback(null), 3500)
  }

  if (!isAuthenticated) {
    return (
      <div className="view-container">
        <div className="admin-auth-surface animate-fade-in">
          <div className="admin-lock-icon-wrap">
            <Lock size={32} />
          </div>

          <div className="admin-auth-header">
            <span className="mono-badge">RESTRICTED // ARCHITECT_CONSOLE</span>
            <h2>Administrator Authentication</h2>
            <p>
              Access runtime telemetry controls, token quota overrides, deterministic fault simulators,
              and fleet seeding utilities.
            </p>
          </div>

          <form onSubmit={handleLogin} className="admin-auth-form">
            {authError && (
              <div className="form-error-banner">
                <AlertTriangle size={15} />
                <span>{authError}</span>
              </div>
            )}

            <div className="form-group">
              <label>ADMINISTRATOR ACCESS KEY</label>
              <div className="input-with-icon">
                <Key size={16} className="input-icon" />
                <input
                  type="password"
                  placeholder="Enter passkey..."
                  value={passkeyInput}
                  onChange={e => setPasskeyInput(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <span className="form-hint">Default Access Key: <code>mechmate-admin</code></span>
            </div>

            <button type="submit" className="btn-primary full-width">
              <span>Authenticate & Enter Console</span>
              <span>➔</span>
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="view-container">
      {/* View Header */}
      <div className="view-header flex-between">
        <div>
          <div className="view-meta-pill">
            <Sliders className="meta-icon" size={13} />
            <span>Master Control & Runtime Diagnostics</span>
            <span className="meta-dot">•</span>
            <span>Architect Console</span>
          </div>

          <h1 className="view-title">Admin Command Console</h1>
          <p className="view-subtitle">
            Configure system runtime parameters, calibrate daily token quotas, simulate mechatronic safety faults,
            and inspect local client-vault telemetry.
          </p>
        </div>

        <button className="btn-secondary small" onClick={handleLogout}>
          <LogOut size={14} />
          <span>Exit Admin</span>
        </button>
      </div>

      {feedback && (
        <div className="feedback-alert success animate-fade-in">
          <CheckCircle2 size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Admin Instrumentation Stats */}
      <div className="telemetry-grid">
        <div className="telemetry-card">
          <div className="telemetry-header">
            <span className="telemetry-label">Enrolled Vehicles</span>
            <Car size={16} className="text-muted" />
          </div>
          <div className="telemetry-number">{stats.totalVehicles}</div>
        </div>

        <div className="telemetry-card">
          <div className="telemetry-header">
            <span className="telemetry-label">Diagnostic Records</span>
            <FileText size={16} className="text-muted" />
          </div>
          <div className="telemetry-number">{stats.totalDiagnostics}</div>
        </div>

        <div className="telemetry-card">
          <div className="telemetry-header">
            <span className="telemetry-label">Today's Remaining Tokens</span>
            <Zap size={16} className="text-amber" />
          </div>
          <div className="telemetry-number text-amber">
            {tokenState.remainingTokens} <span className="telemetry-unit">/ {tokenState.maxTokens}</span>
          </div>
        </div>

        <div className="telemetry-card">
          <div className="telemetry-header">
            <span className="telemetry-label">Client Vault Storage</span>
            <Database size={16} className="text-muted" />
          </div>
          <div className="telemetry-number">
            {(stats.storageBytesUsed / 1024).toFixed(1)} <span className="telemetry-unit">KB</span>
          </div>
        </div>
      </div>

      <div className="vault-grid">
        {/* Token Quota Engine */}
        <div className="vault-card">
          <div className="vault-card-header">
            <div className="vault-card-icon">
              <Zap size={18} className="text-amber" />
            </div>
            <div>
              <h3>Daily Token Quota Allocation</h3>
              <p className="vault-card-desc">Calibrate daily allowances across customer tiers</p>
            </div>
          </div>

          <div className="admin-form-group">
            <label>Anonymous Driver Daily Limit (Current: {config.anonymousTokenLimit})</label>
            <input
              type="number"
              min={1}
              max={50}
              value={config.anonymousTokenLimit}
              onChange={e => setConfig({ ...config, anonymousTokenLimit: parseInt(e.target.value, 10) || 5 })}
            />
          </div>

          <div className="admin-form-group">
            <label>Registered Customer Daily Limit (Current: {config.registeredTokenLimit})</label>
            <input
              type="number"
              min={5}
              max={200}
              value={config.registeredTokenLimit}
              onChange={e => setConfig({ ...config, registeredTokenLimit: parseInt(e.target.value, 10) || 25 })}
            />
          </div>

          <div className="admin-actions-row">
            <button className="btn-primary small" onClick={handleSaveTokenLimits}>
              Save Quota Config
            </button>
            <button className="btn-secondary small" onClick={onResetTokens}>
              <RefreshCw size={13} />
              <span>Reset Daily Usage (0 Used)</span>
            </button>
          </div>
        </div>

        {/* AI & Mechatronic Engine Dispatch */}
        <div className="vault-card">
          <div className="vault-card-header">
            <div className="vault-card-icon">
              <Cpu size={18} className="text-amber" />
            </div>
            <div>
              <h3>Diagnostic Engine Dispatch</h3>
              <p className="vault-card-desc">Toggle AI provider routing and offline fallback net</p>
            </div>
          </div>

          <p className="vault-text">
            Control how user diagnostic requests are routed between serverless AI inference and the local deterministic safety core:
          </p>

          <div className="engine-mode-selector">
            <label className={`engine-mode-tile ${config.engineMode === 'hybrid' ? 'active' : ''}`}>
              <input
                type="radio"
                name="engineMode"
                checked={config.engineMode === 'hybrid'}
                onChange={() => {
                  const updated = { ...config, engineMode: 'hybrid' as const }
                  setConfig(updated)
                  saveAdminConfig(updated)
                }}
              />
              <div>
                <strong>Hybrid Verified (Recommended)</strong>
                <span>Calls serverless AI with deterministic safety guards & zero-latency fallback.</span>
              </div>
            </label>

            <label className={`engine-mode-tile ${config.engineMode === 'force_offline' ? 'active' : ''}`}>
              <input
                type="radio"
                name="engineMode"
                checked={config.engineMode === 'force_offline'}
                onChange={() => {
                  const updated = { ...config, engineMode: 'force_offline' as const }
                  setConfig(updated)
                  saveAdminConfig(updated)
                }}
              />
              <div>
                <strong>Strict Offline Deterministic</strong>
                <span>Bypasses network completely ($0.00 compute). Instant mechatronic evaluations.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Deterministic Safety Fault Simulator */}
        <div className="vault-card full-width">
          <div className="vault-card-header">
            <div className="vault-card-icon">
              <ShieldAlert size={18} className="text-danger" />
            </div>
            <div>
              <h3>Deterministic Safety Hazard Simulator</h3>
              <p className="vault-card-desc">Execute goal-backward verification of critical roadside safety rules with zero AI latency</p>
            </div>
          </div>

          <p className="vault-text">
            Test how MechMate immediately triggers un-overridable emergency directives when dangerous symptoms are detected:
          </p>

          <div className="simulator-buttons-grid">
            <button
              className="btn-danger small"
              onClick={() => handleRunSafetySimulation('My brakes failed on the downhill slope, pedal went straight to the floor!')}
            >
              Test Brake Pressure Collapse
            </button>

            <button
              className="btn-danger small"
              onClick={() => handleRunSafetySimulation('Temperature needle is pegged deep in the red zone and thick steam is boiling out of the hood!')}
            >
              Test Severe Overheating & Boiling
            </button>

            <button
              className="btn-danger small"
              onClick={() => handleRunSafetySimulation('Oil pressure light is glowing red on dashboard with loud engine knocking noise!')}
            >
              Test Oil Pressure Starvation
            </button>

            <button
              className="btn-danger small"
              onClick={() => handleRunSafetySimulation('Power steering locked up suddenly while driving, impossible to turn wheel!')}
            >
              Test Sudden Steering Seizure
            </button>
          </div>

          {simulatedSafetyResult && (
            <div className="simulation-result-card animate-fade-in">
              <div className="simulation-meta-row">
                <span className="mono-badge">EXECUTION TIME: {simulatedSafetyResult.durationMs}ms</span>
                <span className={`badge-severity ${simulatedSafetyResult.result.overallSeverity.toLowerCase()}`}>
                  {simulatedSafetyResult.result.overallSeverity}
                </span>
                <span className="mono-text">IMMEDIATE_STOP: {simulatedSafetyResult.result.requiresImmediateStop ? 'TRUE' : 'FALSE'}</span>
              </div>

              <div className="sim-warning-box">
                <strong>Directive:</strong> {simulatedSafetyResult.result.summaryWarning}
              </div>

              <div className="sim-matches-list">
                {simulatedSafetyResult.result.matches.map((m: any, i: number) => (
                  <div key={i} className="sim-match-item">
                    <span className="match-name">{m.hazardName}</span>
                    <span className="match-action">{m.immediateAction}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Demo Fleet Seeding & Factory Reset */}
        <div className="vault-card full-width">
          <div className="vault-card-header">
            <div className="vault-card-icon">
              <Database size={18} className="text-amber" />
            </div>
            <div>
              <h3>Demo Fleet Seeding & Builder Utilities</h3>
              <p className="vault-card-desc">Quickly seed realistic vehicle profiles for presentation to evaluators</p>
            </div>
          </div>

          <div className="vault-actions-bar">
            <button className="btn-primary" onClick={handleSeedFleet}>
              <Car size={16} />
              <span>Seed Demo Fleet (Nexon EV, Thar 4x4, Creta Turbo)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
