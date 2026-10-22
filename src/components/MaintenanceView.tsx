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
      <div className="view-container">
        <div className="empty-card">
          <div className="empty-icon">🛠️</div>
          <h3>Select or Add a Vehicle First</h3>
          <p>
            Maintenance schedules require vehicle mileage, engine type, and transmission specifications.
            Add a car to your garage to access customized service tracking.
          </p>
          <button className="primary-btn" onClick={onOpenGarage}>
            🚗 Open Vehicle Garage
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
      // Update vehicle odometer if completed at higher mileage
      if (completeKm > activeVehicle.odometerKm) {
        onUpdateVehicleOdometer(activeVehicle.id, completeKm)
      }
      setCompleteModalItemId(null)
    }
  }

  return (
    <div className="view-container">
      <div className="view-header">
        <div className="view-title">
          <div className="view-badge">SERVICE & PREVENTATIVE MAINTENANCE</div>
          <h2>Maintenance Intelligence Planner</h2>
          <p>
            Mileage-calibrated service schedules for {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}.
            Tailored to Indian road and climate conditions.
          </p>
        </div>
      </div>

      {/* Maintenance Stats Bar */}
      <div className="maint-stats-bar">
        <div className="maint-stat-box total">
          <span className="stat-num">{activeVehicle.odometerKm.toLocaleString('en-IN')} km</span>
          <span className="stat-label">Current Odometer</span>
        </div>
        <div className={`maint-stat-box due ${dueCount > 0 ? 'highlight' : ''}`}>
          <span className="stat-num">{dueCount}</span>
          <span className="stat-label">Services Overdue</span>
        </div>
        <div className="maint-stat-box upcoming">
          <span className="stat-num">{upcomingCount}</span>
          <span className="stat-label">Upcoming Soon</span>
        </div>
        <div className="maint-stat-box healthy">
          <span className="stat-num">{healthyCount}</span>
          <span className="stat-label">Up to Date</span>
        </div>
      </div>

      {/* Schedule Items List */}
      <div className="maint-list">
        {evaluatedItems.map(item => {
          return (
            <div key={item.id} className={`maint-card ${item.status.toLowerCase()}`}>
              <div className="maint-card-left">
                <div className="maint-category-tag">{item.systemCategory}</div>
                <h4 className="maint-title">{item.title}</h4>
                <p className="maint-note">{item.recommendationNote}</p>
                <div className="maint-meta">
                  <span>Cycle: Every {item.intervalKm.toLocaleString('en-IN')} km / {item.intervalMonths} mo</span>
                  {item.lastCompletedKm !== undefined && (
                    <span>Last done at: {item.lastCompletedKm.toLocaleString('en-IN')} km</span>
                  )}
                </div>
              </div>

              <div className="maint-card-right">
                <div className="maint-progress-wrap">
                  <div className="maint-progress-bar">
                    <div
                      className={`maint-progress-fill ${item.status.toLowerCase()}`}
                      style={{ width: `${item.progressPercent}%` }}
                    />
                  </div>
                  <span className="progress-text">{item.progressPercent}% interval elapsed</span>
                </div>

                <div className="maint-action-group">
                  <span className={`status-pill ${item.status.toLowerCase()}`}>
                    {item.status === 'DUE' && '⚠️ OVERDUE'}
                    {item.status === 'UPCOMING' && '⏳ DUE SOON'}
                    {item.status === 'HEALTHY' && '✓ HEALTHY'}
                  </span>
                  <button
                    className="complete-service-btn"
                    onClick={() => {
                      setCompleteModalItemId(item.id)
                      setCompleteKm(activeVehicle.odometerKm)
                    }}
                  >
                    ✓ Log Service
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Log Service Modal */}
      {completeModalItemId && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Log Completed Maintenance</h3>
              <button className="modal-close-btn" onClick={() => setCompleteModalItemId(null)}>✕</button>
            </div>
            <div className="service-log-form">
              <div className="form-group">
                <label>Odometer at Service (km)</label>
                <input
                  type="number"
                  value={completeKm}
                  onChange={e => setCompleteKm(parseInt(e.target.value, 10) || 0)}
                />
              </div>
              <div className="form-group">
                <label>Date Completed</label>
                <input
                  type="date"
                  value={completeDate}
                  onChange={e => setCompleteDate(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setCompleteModalItemId(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={handleConfirmCompletion}
                >
                  Confirm & Save Service Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
