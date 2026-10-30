import React from 'react'
import { Activity, Gauge, Thermometer, Cpu, Radio } from 'lucide-react'

interface CockpitHUDProps {
  rpm?: number
  coolantTemp?: number
  batteryVoltage?: number
  activeDtc?: string | null
  vehicleName?: string
}

export const CockpitHUD: React.FC<CockpitHUDProps> = ({
  rpm = 850,
  coolantTemp = 92,
  batteryVoltage = 14.1,
  activeDtc = null,
  vehicleName = 'Live Telemetry'
}) => {
  return (
    <aside className="cockpit-hud-card" aria-label="Live Vehicle Vitals HUD">
      <div className="cockpit-hud-header">
        <div className="cockpit-live-indicator">
          <span className="live-dot" />
          <Radio size={14} className="text-blue" />
          <span>OBD-II LIVE VITALS</span>
        </div>
        <span className="cockpit-vehicle-tag">{vehicleName}</span>
      </div>

      <div className="cockpit-telemetry-grid">
        {/* RPM Gauge */}
        <div className="hud-metric-tile">
          <div className="hud-metric-label">
            <Gauge size={14} className="hud-icon" />
            <span>Engine RPM</span>
          </div>
          <div className="hud-metric-value">
            <strong>{rpm}</strong> <span className="hud-unit">RPM</span>
          </div>
          <div className="hud-bar-wrap">
            <div
              className="hud-bar-fill"
              style={{ width: `${Math.min(100, (rpm / 6500) * 100)}%` }}
            />
          </div>
        </div>

        {/* Coolant Temp */}
        <div className="hud-metric-tile">
          <div className="hud-metric-label">
            <Thermometer size={14} className="hud-icon" />
            <span>Coolant Temp</span>
          </div>
          <div className="hud-metric-value">
            <strong>{coolantTemp}</strong> <span className="hud-unit">°C</span>
          </div>
          <div className="hud-bar-wrap">
            <div
              className={`hud-bar-fill ${coolantTemp > 105 ? 'danger' : coolantTemp > 98 ? 'warning' : 'optimal'}`}
              style={{ width: `${Math.min(100, (coolantTemp / 130) * 100)}%` }}
            />
          </div>
        </div>

        {/* Alternator / Battery */}
        <div className="hud-metric-tile">
          <div className="hud-metric-label">
            <Activity size={14} className="hud-icon" />
            <span>Alternator V</span>
          </div>
          <div className="hud-metric-value">
            <strong>{batteryVoltage.toFixed(1)}</strong> <span className="hud-unit">V</span>
          </div>
          <span className="hud-status-badge optimal">Charging Normal</span>
        </div>

        {/* Active Stored DTCs */}
        <div className="hud-metric-tile dtc-tile">
          <div className="hud-metric-label">
            <Cpu size={14} className="hud-icon" />
            <span>Stored DTCs</span>
          </div>
          {activeDtc ? (
            <div className="hud-dtc-badge active">
              <span className="dtc-code">{activeDtc}</span>
              <span className="dtc-status">Pending Confirmation</span>
            </div>
          ) : (
            <div className="hud-dtc-badge clear">
              <span>Mode $03: MIL Off</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
