import React, { useState } from 'react'
import { MaintenanceItem, VehicleProfile } from '../types/automotive'
import { evaluateMaintenanceStatus } from '../services/maintenanceService'

interface MaintenanceViewProps {
  activeVehicle: VehicleProfile | null
  maintenanceItems: MaintenanceItem[]
  onMarkCompleted: (id: string, km: number, date: string) => void
  onUpdateVehicleOdometer: (vehicleId: string, km: number) => void
  onOpenGarage: () => void
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  activeVehicle,
  maintenanceItems,
  onMarkCompleted,
  onUpdateVehicleOdometer,
  onOpenGarage
}) => {
  const [completeModalItemId, setCompleteModalItemId] = useState<string | null>(null)
  const [completeKm, setCompleteKm] = useState<number>(activeVehicle?.odometerKm || 35000)
  const [completeDate, setCompleteDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )

  if (!activeVehicle) {
    return (
      <div className="view-container note-page-layout">
        <div className="note-empty-card">
          <span className="empty-symbol">[!]</span>
          <h3>Vehicle Target Unassigned</h3>
          <p>
            Maintenance schedules calculate interval wear from vehicle fuel type, transmission, and odometer readings.
            Select an active car from your garage to access calibrated service timelines.
          </p>
          <button className="coded-primary-btn" onClick={onOpenGarage}>
            OPEN_GARAGE_REGISTRY ↵
          </button>
        </div>
      </div>
    )
  }

  const evaluatedItems = maintenanceItems.map(item =>
    evaluateMaintenanceStatus(item, activeVehicle.odometerKm)
  )

  const dueCount = evaluatedItems.filter(i => i.status === 'DUE').length
  const upcomingCount = evaluatedItems.filter(i => i.status === 'UPCOMING').length
  const healthyCount = evaluatedItems.filter(i => i.status === 'HEALTHY').length

  const handleConfirmCompletion = () => {
    if (completeModalItemId) {
      onMarkCompleted(completeModalItemId, completeKm, completeDate)
      if (completeKm > activeVehicle.odometerKm) {
        onUpdateVehicleOdometer(activeVehicle.id, completeKm)
      }
      setCompleteModalItemId(null)
    }
  }

  return (
    <div className="view-container note-page-layout">
      {/* Dossier Header */}
      <div className="note-dossier-header">
        <div className="dossier-meta-strip">
          <span className="mono-badge">LOG // SERVICE_PLANNER</span>
          <span className="meta-divider">/</span>
          <span className="mono-text">SPEC: INDIAN_TROPICAL_MAINTENANCE</span>
          <span className="meta-divider">/</span>
          <span className="mono-text">CYCLE: 10,000KM_STANDARD</span>
        </div>

        <div className="dossier-title-group">
          <h2 className="dossier-title">Preventative Service Ledger</h2>
          <p className="dossier-sub">
            Calibrated maintenance milestones for {activeVehicle.year} {activeVehicle.make} {activeVehicle.model} ({activeVehicle.odometerKm.toLocaleString('en-IN')} km).
            Adapted for Indian dust, urban stop-and-go traffic, and tropical humidity.
          </p>
        </div>
      </div>

      {/* Coded Telemetry Stats Ribbon */}
      <div className="coded-telemetry-ribbon">
        <div className="telemetry-cell">
          <span className="cell-label">CURRENT_ODOMETER</span>
          <span className="cell-value">{activeVehicle.odometerKm.toLocaleString('en-IN')} KM</span>
        </div>
        <div className={`telemetry-cell ${dueCount > 0 ? 'critical' : ''}`}>
          <span className="cell-label">OVERDUE_MILESTONES</span>
          <span className="cell-value">{dueCount}</span>
        </div>
        <div className="telemetry-cell">
          <span className="cell-label">UPCOMING_SOON</span>
          <span className="cell-value">{upcomingCount}</span>
        </div>
        <div className="telemetry-cell">
          <span className="cell-label">VERIFIED_HEALTHY</span>
          <span className="cell-value">{healthyCount}</span>
        </div>
      </div>

      {/* Maintenance Service Cards List */}
      <div className="service-ledger-list">
        {evaluatedItems.map((item, idx) => {
          return (
            <div key={item.id} className={`service-item-row ${item.status.toLowerCase()}`}>
              <div className="service-row-left">
                <div className="service-header-line">
                  <span className="service-idx">0{idx + 1}.</span>
                  <span className="service-sys-tag">[{item.systemCategory.toUpperCase()}]</span>
                  <h4 className="service-title">{item.title}</h4>
                  <span className={`service-status-pill ${item.status.toLowerCase()}`}>
                    {item.status === 'DUE' && 'OVERDUE // IMMEDIATE'}
                    {item.status === 'UPCOMING' && 'DUE_SOON // <2000KM'}
                    {item.status === 'HEALTHY' && 'HEALTHY // VERIFIED'}
                  </span>
                </div>

                <p className="service-note-text">{item.recommendationNote}</p>

                <div className="service-meta-line">
                  <span>INTERVAL: Every {item.intervalKm.toLocaleString('en-IN')} km / {item.intervalMonths} mo</span>
                  {item.lastCompletedKm !== undefined && (
                    <span>PREVIOUS: {item.lastCompletedKm.toLocaleString('en-IN')} km</span>
                  )}
                  {item.lastCompletedDate && (
                    <span>DATE: {item.lastCompletedDate}</span>
                  )}
                </div>
              </div>

              <div className="service-row-right">
                <div className="service-progress-container">
                  <div className="service-meter-bar">
                    <div
                      className={`service-meter-fill ${item.status.toLowerCase()}`}
                      style={{ width: `${item.progressPercent}%` }}
                    />
                  </div>
                  <span className="meter-label">{item.progressPercent}% INTERVAL ELAPSED</span>
                </div>

                <button
                  className="coded-log-btn"
                  onClick={() => {
                    setCompleteModalItemId(item.id)
                    setCompleteKm(activeVehicle.odometerKm)
                  }}
                >
                  [LOG_SERVICE ↵]
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Log Service Modal */}
      {completeModalItemId && (
        <div className="modal-overlay">
          <div className="coded-modal-card">
            <div className="modal-header-strip">
              <span className="modal-badge">SERVICE_LOG // CONFIRMATION</span>
              <button className="modal-x-btn" onClick={() => setCompleteModalItemId(null)}>[esc]</button>
            </div>

            <div className="modal-title-wrap">
              <h3>Log Maintenance Completion</h3>
              <p>Record service completion date and odometer to reset milestone interval:</p>
            </div>

            <div className="coded-modal-form">
              <div className="form-field">
                <label>ODOMETER AT SERVICE (KM) *</label>
                <input
                  type="number"
                  value={completeKm}
                  onChange={e => setCompleteKm(parseInt(e.target.value, 10) || 0)}
                />
              </div>

              <div className="form-field">
                <label>DATE OF COMPLETION *</label>
                <input
                  type="date"
                  value={completeDate}
                  onChange={e => setCompleteDate(e.target.value)}
                />
              </div>

              <div className="modal-footer-actions">
                <button
                  type="button"
                  className="coded-ghost-btn"
                  onClick={() => setCompleteModalItemId(null)}
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  className="coded-primary-btn"
                  onClick={handleConfirmCompletion}
                >
                  COMMIT_SERVICE_LOG ↵
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
