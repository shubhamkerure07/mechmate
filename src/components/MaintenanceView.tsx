import React, { useState } from 'react'
import { MaintenanceItem, VehicleProfile } from '../types/automotive'
import { evaluateMaintenanceStatus } from '../services/maintenanceService'
import {
  CalendarCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Gauge,
  Wrench,
  Car,
  ArrowRight,
  X,
  ShieldCheck
} from 'lucide-react'

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
        <div className="empty-state-card">
          <div className="empty-icon-wrap">
            <Car size={32} />
          </div>
          <h3>No Active Vehicle Selected</h3>
          <p>
            Maintenance schedules calculate wear cycles based on your vehicle's engine, transmission,
            and current odometer reading. Select or add a vehicle in your garage to view calibrated service milestones.
          </p>
          <button className="btn-primary" onClick={onOpenGarage}>
            <span>Open Garage</span>
            <ArrowRight size={16} />
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

  const selectedItemForModal = evaluatedItems.find(i => i.id === completeModalItemId)

  return (
    <div className="view-container">
      {/* View Header */}
      <div className="view-header">
        <div className="view-meta-pill">
          <CalendarCheck className="meta-icon" size={13} />
          <span>Preventative Maintenance</span>
          <span className="meta-dot">•</span>
          <span>Indian Tropical & Urban Wear Profile</span>
        </div>

        <h1 className="view-title">Service Schedule Ledger</h1>
        <p className="view-subtitle">
          Calibrated service milestones for your <strong>{activeVehicle.year} {activeVehicle.make} {activeVehicle.model}</strong> ({activeVehicle.odometerKm.toLocaleString('en-IN')} km).
          Adapted for Indian dust conditions, frequent stop-and-go commuting, and monsoon humidity.
        </p>
      </div>

      {/* Telemetry Stat Cards Grid */}
      <div className="telemetry-grid">
        <div className="telemetry-card">
          <div className="telemetry-header">
            <span className="telemetry-label">Current Odometer</span>
            <Gauge size={16} className="text-muted" />
          </div>
          <div className="telemetry-number">
            {activeVehicle.odometerKm.toLocaleString('en-IN')} <span className="telemetry-unit">km</span>
          </div>
        </div>

        <div className={`telemetry-card ${dueCount > 0 ? 'critical-border' : ''}`}>
          <div className="telemetry-header">
            <span className="telemetry-label">Overdue Milestones</span>
            <AlertTriangle size={16} className={dueCount > 0 ? 'text-danger' : 'text-muted'} />
          </div>
          <div className={`telemetry-number ${dueCount > 0 ? 'text-danger' : ''}`}>
            {dueCount}
          </div>
        </div>

        <div className="telemetry-card">
          <div className="telemetry-header">
            <span className="telemetry-label">Due Soon (&lt;2,000 km)</span>
            <Clock size={16} className="text-warning" />
          </div>
          <div className="telemetry-number text-warning">
            {upcomingCount}
          </div>
        </div>

        <div className="telemetry-card">
          <div className="telemetry-header">
            <span className="telemetry-label">Verified Healthy</span>
            <CheckCircle2 size={16} className="text-success" />
          </div>
          <div className="telemetry-number text-success">
            {healthyCount}
          </div>
        </div>
      </div>

      {/* Service Schedule List */}
      <div className="service-list">
        {evaluatedItems.map((item, idx) => {
          return (
            <div key={item.id} className={`service-card ${item.status.toLowerCase()}`}>
              <div className="service-card-main">
                <div className="service-card-header">
                  <div className="service-badge-group">
                    <span className="service-idx">#{idx + 1}</span>
                    <span className="service-subsystem-tag">{item.systemCategory}</span>
                    <span className={`badge-status ${item.status.toLowerCase()}`}>
                      {item.status === 'DUE' && 'Overdue // Immediate'}
                      {item.status === 'UPCOMING' && 'Due Soon // Next 2,000 km'}
                      {item.status === 'HEALTHY' && 'Optimal // Within Interval'}
                    </span>
                  </div>
                  <h3 className="service-title">{item.title}</h3>
                </div>

                <p className="service-description">{item.recommendationNote}</p>

                <div className="service-meta-badges">
                  <span className="meta-badge">
                    <Clock size={12} />
                    <span>Interval: Every {item.intervalKm.toLocaleString('en-IN')} km / {item.intervalMonths} mo</span>
                  </span>
                  {item.lastCompletedKm !== undefined && (
                    <span className="meta-badge">
                      <CheckCircle2 size={12} />
                      <span>Last done at: {item.lastCompletedKm.toLocaleString('en-IN')} km</span>
                    </span>
                  )}
                  {item.lastCompletedDate && (
                    <span className="meta-badge">
                      <CalendarCheck size={12} />
                      <span>Date: {item.lastCompletedDate}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="service-card-side">
                <div className="service-progress-box">
                  <div className="progress-label-row">
                    <span>Interval Elapsed</span>
                    <span className="progress-val">{item.progressPercent}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className={`progress-bar-fill ${item.status.toLowerCase()}`}
                      style={{ width: `${item.progressPercent}%` }}
                    />
                  </div>
                </div>

                <button
                  className="btn-secondary small"
                  onClick={() => {
                    setCompleteModalItemId(item.id)
                    setCompleteKm(activeVehicle.odometerKm)
                  }}
                >
                  <Wrench size={13} />
                  <span>Log Service</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Log Service Modal */}
      {completeModalItemId && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-title-group">
                <Wrench className="text-amber" size={20} />
                <h3>Log Service Completion</h3>
              </div>
              <button className="btn-icon" onClick={() => setCompleteModalItemId(null)}>
                <X size={18} />
              </button>
            </div>

            <p className="modal-description">
              Recording service resets the wear interval counter for:
              <br />
              <strong className="text-amber">{selectedItemForModal?.title}</strong>
            </p>

            <div className="modal-form">
              <div className="form-group">
                <label>Odometer at Service (km) *</label>
                <input
                  type="number"
                  value={completeKm}
                  onChange={e => setCompleteKm(parseInt(e.target.value, 10) || 0)}
                  min={0}
                  required
                />
              </div>

              <div className="form-group">
                <label>Service Date *</label>
                <input
                  type="date"
                  value={completeDate}
                  onChange={e => setCompleteDate(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setCompleteModalItemId(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleConfirmCompletion}
                >
                  <ShieldCheck size={16} />
                  <span>Record & Reset Interval</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
