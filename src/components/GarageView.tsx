import React, { useState } from 'react'
import { FuelType, TransmissionType, VehicleProfile } from '../types/automotive'

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
    // Reset form
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
      <div className="view-header flex-between">
        <div className="view-title">
          <div className="view-badge">LOCAL-FIRST GARAGE</div>
          <h2>My Vehicle Garage</h2>
          <p>
            Manage your vehicles and odometer logs. Diagnostic reports, maintenance intervals, and cost estimates
            are automatically calibrated to the active vehicle.
          </p>
        </div>
        <button
          className="primary-btn"
          onClick={() => setShowAddModal(true)}
        >
          + Add Vehicle
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="empty-card">
          <div className="empty-icon">🚗</div>
          <h3>Your Garage is Empty</h3>
          <p>
            Add your car to receive calibrated maintenance milestones, tailored repair cost estimates in ₹,
            and vehicle-specific diagnostic advice.
          </p>
          <div className="empty-actions">
            <button className="primary-btn" onClick={() => setShowAddModal(true)}>
              + Add Your First Vehicle
            </button>
            <button className="secondary-btn" onClick={onStartDiagnosis}>
              Continue with Generic Diagnosis
            </button>
          </div>
        </div>
      ) : (
        <div className="garage-grid">
          {vehicles.map(v => {
            const isActive = v.id === activeVehicleId
            const isEditingThisOdo = editingOdoId === v.id

            return (
              <div key={v.id} className={`vehicle-card ${isActive ? 'active' : ''}`}>
                <div className="vehicle-card-header">
                  <div className="vehicle-badge-row">
                    <span className="car-year">{v.year}</span>
                    <span className="car-fuel">{v.fuelType}</span>
                    <span className="car-gearbox">{v.transmission}</span>
                    {isActive && <span className="active-badge">✓ Active Vehicle</span>}
                  </div>
                  <h3 className="car-title">{v.make} {v.model}</h3>
                  <div className="car-location">📍 {v.region}</div>
                </div>

                <div className="odometer-row">
                  <span className="odo-label">Odometer:</span>
                  {isEditingThisOdo ? (
                    <div className="odo-edit-box">
                      <input
                        type="number"
                        className="odo-input"
                        value={tempOdo}
                        onChange={e => setTempOdo(e.target.value)}
                        autoFocus
                      />
                      <button className="small-save-btn" onClick={() => handleSaveOdometer(v)}>✓</button>
                      <button className="small-cancel-btn" onClick={() => setEditingOdoId(null)}>✕</button>
                    </div>
                  ) : (
                    <div className="odo-display">
                      <span className="odo-value">{v.odometerKm.toLocaleString('en-IN')} km</span>
                      <button
                        className="edit-odo-btn"
                        onClick={() => {
                          setEditingOdoId(v.id)
                          setTempOdo(v.odometerKm.toString())
                        }}
                        title="Update Odometer"
                      >
                        ✏️
                      </button>
                    </div>
                  )}
                </div>

                <div className="vehicle-card-actions">
                  {!isActive ? (
                    <button
                      className="select-active-btn"
                      onClick={() => onSetActiveVehicle(v.id)}
                    >
                      Set as Active
                    </button>
                  ) : (
                    <button
                      className="primary-btn small"
                      onClick={onStartDiagnosis}
                    >
                      ⚡ Diagnose This Car
                    </button>
                  )}
                  <button
                    className="delete-vehicle-btn"
                    onClick={() => {
                      if (confirm(`Remove ${v.year} ${v.make} ${v.model} from your garage?`)) {
                        onDeleteVehicle(v.id)
                      }
                    }}
                    title="Remove Vehicle"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Add Vehicle to Garage</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateVehicle} className="vehicle-form">
              {formError && <div className="form-error-banner">{formError}</div>}

              <div className="form-grid">
                <div className="form-group">
                  <label>Manufacturer / Make *</label>
                  <input
                    type="text"
                    placeholder="e.g. Maruti Suzuki, Tata, Hyundai"
                    value={make}
                    onChange={e => setMake(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Model *</label>
                  <input
                    type="text"
                    placeholder="e.g. Swift, Nexon, Creta, City"
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
                  <label>Region / City (India)</label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru, Karnataka or Mumbai, MH"
                    value={region}
                    onChange={e => setRegion(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
