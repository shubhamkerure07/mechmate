import React, { useState } from 'react'
import { FuelType, TransmissionType, VehicleProfile } from '../types/automotive'
import { ZarionButton } from './common/ZarionButton'
import {
  Car,
  Plus,
  Edit3,
  Check,
  X,
  Trash2,
  MapPin,
  Gauge,
  Zap,
  ShieldCheck
} from 'lucide-react'

interface GarageViewProps {
  vehicles: VehicleProfile[]
  activeVehicleId: string | null
  onSaveVehicle: (vehicle: VehicleProfile) => void
  onDeleteVehicle: (id: string) => void
  onSetActiveVehicle: (id: string) => void
  onStartDiagnosis: () => void
}

export const GarageView: React.FC<GarageViewProps> = ({
  vehicles,
  activeVehicleId,
  onSaveVehicle,
  onDeleteVehicle,
  onSetActiveVehicle,
  onStartDiagnosis
}) => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingOdoId, setEditingOdoId] = useState<string | null>(null)
  const [tempOdo, setTempOdo] = useState<string>('')

  // Form states
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState<number>(new Date().getFullYear() - 3)
  const [fuelType, setFuelType] = useState<FuelType>('Petrol')
  const [transmission, setTransmission] = useState<TransmissionType>('Manual')
  const [odometerKm, setOdometerKm] = useState<number>(35000)
  const [region, setRegion] = useState('Bengaluru, Karnataka')
  const [formError, setFormError] = useState('')

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault()
    if (!make.trim() || !model.trim()) {
      setFormError('Manufacturer and Model are required.')
      return
    }
    if (year < 1980 || year > new Date().getFullYear() + 1) {
      setFormError('Please enter a valid vehicle manufacturing year.')
      return
    }
    if (odometerKm < 0) {
      setFormError('Odometer cannot be negative.')
      return
    }

    const newVehicle: VehicleProfile = {
      id: 'veh_' + Date.now(),
      make: make.trim(),
      model: model.trim(),
      year,
      fuelType,
      transmission,
      odometerKm,
      region: region.trim() || 'India'
    }

    onSaveVehicle(newVehicle)
    setShowAddModal(false)
    setFormError('')
    setMake('')
    setModel('')
  }

  const handleSaveOdometer = (vehicle: VehicleProfile) => {
    const parsed = parseInt(tempOdo, 10)
    if (!isNaN(parsed) && parsed >= 0) {
      onSaveVehicle({
        ...vehicle,
        odometerKm: parsed
      })
    }
    setEditingOdoId(null)
    setTempOdo('')
  }

  return (
    <div className="view-container">
      {/* View Header */}
      <div className="view-header flex-between">
        <div>
          <div className="view-meta-pill">
            <Car className="meta-icon" size={13} />
            <span>Vehicle Fleet Registry</span>
            <span className="meta-dot">•</span>
            <span>{vehicles.length} {vehicles.length === 1 ? 'Vehicle' : 'Vehicles'} Registered</span>
          </div>

          <h1 className="view-title">My Garage</h1>
          <p className="view-subtitle">
            Manage your vehicles and odometer readings. Diagnostic assessments, maintenance schedules,
            and repair expense estimates calibrate dynamically to your active car.
          </p>
        </div>

        <ZarionButton variant="blue" onClick={() => setShowAddModal(true)} icon={<Plus size={16} />}>
          Add Vehicle
        </ZarionButton>
      </div>

      {vehicles.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-icon-wrap">
            <Car size={32} />
          </div>
          <h3>Your Garage is Empty</h3>
          <p>
            Enroll your vehicle profile to calibrate maintenance milestones, estimate realistic repair costs in ₹,
            and personalize diagnostic workflows.
          </p>
          <div className="empty-actions-row">
            <ZarionButton variant="blue" onClick={() => setShowAddModal(true)} icon={<Plus size={16} />}>
              Enroll First Vehicle
            </ZarionButton>
            <ZarionButton variant="secondary" onClick={onStartDiagnosis} showArrow={false}>
              Run Generic Diagnosis
            </ZarionButton>
          </div>
        </div>
      ) : (
        <div className="fleet-grid">
          {vehicles.map(v => {
            const isActive = v.id === activeVehicleId
            const isEditingThisOdo = editingOdoId === v.id

            return (
              <div key={v.id} className={`vehicle-card ${isActive ? 'active' : ''}`}>
                <div className="vehicle-card-top">
                  <div className="vehicle-specs-pills">
                    <span className="spec-pill">{v.year}</span>
                    <span className="spec-pill">{v.fuelType}</span>
                    <span className="spec-pill">{v.transmission}</span>
                  </div>
                  {isActive ? (
                    <span className="active-badge">
                      <span className="active-dot" />
                      Active Target
                    </span>
                  ) : null}
                </div>

                <div className="vehicle-main-info">
                  <div className="vehicle-avatar">
                    <Car size={24} />
                  </div>
                  <div>
                    <h3 className="vehicle-title">{v.make} {v.model}</h3>
                    <div className="vehicle-meta-line">
                      <MapPin size={13} />
                      <span>{v.region}</span>
                    </div>
                  </div>
                </div>

                {/* Odometer Tracker */}
                <div className="vehicle-odometer-box">
                  <div className="odo-label">
                    <Gauge size={14} />
                    <span>Current Odometer</span>
                  </div>

                  {isEditingThisOdo ? (
                    <div className="odo-edit-form">
                      <input
                        type="number"
                        className="input-odometer"
                        value={tempOdo}
                        onChange={e => setTempOdo(e.target.value)}
                        autoFocus
                      />
                      <button
                        className="btn-icon check"
                        onClick={() => handleSaveOdometer(v)}
                        title="Save Odometer"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        className="btn-icon cancel"
                        onClick={() => setEditingOdoId(null)}
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="odo-display-row">
                      <span className="odo-value">{v.odometerKm.toLocaleString('en-IN')} km</span>
                      <button
                        className="btn-icon edit"
                        onClick={() => {
                          setEditingOdoId(v.id)
                          setTempOdo(v.odometerKm.toString())
                        }}
                        title="Edit Odometer"
                      >
                        <Edit3 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="vehicle-card-actions">
                  {!isActive ? (
                    <button
                      className="btn-secondary small"
                      onClick={() => onSetActiveVehicle(v.id)}
                    >
                      <Check size={14} />
                      <span>Set as Active</span>
                    </button>
                  ) : (
                    <button
                      className="btn-primary small"
                      onClick={onStartDiagnosis}
                    >
                      <Zap size={14} />
                      <span>Diagnose Vehicle</span>
                    </button>
                  )}

                  <button
                    className="btn-icon delete"
                    onClick={() => {
                      if (confirm(`Remove ${v.year} ${v.make} ${v.model} from your garage?`)) {
                        onDeleteVehicle(v.id)
                      }
                    }}
                    title="Remove Vehicle"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-title-group">
                <Car className="text-amber" size={20} />
                <h3>Enroll Vehicle in Garage</h3>
              </div>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <p className="modal-description">
              Provide vehicle specifications to calibrate diagnostic algorithms and maintenance schedules.
            </p>

            <form onSubmit={handleCreateVehicle} className="modal-form">
              {formError && (
                <div className="form-error-banner">
                  <span>{formError}</span>
                </div>
              )}

              <div className="form-grid">
                <div className="form-group">
                  <label>Make / Manufacturer *</label>
                  <input
                    type="text"
                    placeholder="e.g. Maruti Suzuki, Tata, Hyundai, Honda"
                    value={make}
                    onChange={e => setMake(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Model Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Swift, Nexon, Creta, City, Thar"
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Manufacturing Year *</label>
                  <input
                    type="number"
                    min={1980}
                    max={new Date().getFullYear() + 1}
                    value={year}
                    onChange={e => setYear(parseInt(e.target.value, 10))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Fuel Type *</label>
                  <select
                    value={fuelType}
                    onChange={e => setFuelType(e.target.value as FuelType)}
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="CNG">CNG</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Transmission *</label>
                  <select
                    value={transmission}
                    onChange={e => setTransmission(e.target.value as TransmissionType)}
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic (Torque Converter)</option>
                    <option value="AMT">AMT (Automated Manual)</option>
                    <option value="CVT">CVT</option>
                    <option value="DCT">DCT / DSG</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Current Odometer (km) *</label>
                  <input
                    type="number"
                    min={0}
                    value={odometerKm}
                    onChange={e => setOdometerKm(parseInt(e.target.value, 10) || 0)}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Operating Region / City</label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru, Karnataka or Mumbai, Maharashtra"
                    value={region}
                    onChange={e => setRegion(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <ZarionButton
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddModal(false)}
                  showArrow={false}
                >
                  Cancel
                </ZarionButton>
                <ZarionButton type="submit" variant="blue" icon={<ShieldCheck size={16} />}>
                  Save Vehicle
                </ZarionButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
