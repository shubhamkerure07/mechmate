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
    <div className="view-container note-page-layout">
      {/* Dossier Header */}
      <div className="note-dossier-header flex-between">
        <div>
          <div className="dossier-meta-strip">
            <span className="mono-badge">REGISTRY // VEHICLE_GARAGE</span>
            <span className="meta-divider">/</span>
            <span className="mono-text">LOCAL_VAULT: ENCRYPTED_AT_REST</span>
            <span className="meta-divider">/</span>
            <span className="mono-text">ENTRIES: {vehicles.length}</span>
          </div>

          <div className="dossier-title-group">
            <h2 className="dossier-title">Fleet Manifest & Vehicle Registry</h2>
            <p className="dossier-sub">
              Manage your vehicles, specs, and odometer logs. All diagnostic assessments, maintenance intervals,
              and parts replacement estimates calibrate to the selected active vehicle.
            </p>
          </div>
        </div>

        <button
          className="coded-primary-btn"
          onClick={() => setShowAddModal(true)}
        >
          + ADD_VEHICLE [N]
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="note-empty-card">
          <span className="empty-symbol">[∅]</span>
          <h3>Vehicle Registry Empty</h3>
          <p>
            Add your car profile to calibrate maintenance intervals, estimate localized repair costs in ₹,
            and associate diagnostic consultation notes.
          </p>
          <div className="empty-actions-row">
            <button className="coded-primary-btn" onClick={() => setShowAddModal(true)}>
              + ENROLL_FIRST_VEHICLE
            </button>
            <button className="coded-ghost-btn" onClick={onStartDiagnosis}>
              RUN_GENERIC_DIAGNOSIS ↵
            </button>
          </div>
        </div>
      ) : (
        <div className="garage-manifest-grid">
          {vehicles.map(v => {
            const isActive = v.id === activeVehicleId
            const isEditingThisOdo = editingOdoId === v.id

            return (
              <div key={v.id} className={`vehicle-manifest-card ${isActive ? 'active' : ''}`}>
                <div className="manifest-top-bar">
                  <div className="manifest-tags-row">
                    <span className="car-spec-tag year">{v.year}</span>
                    <span className="car-spec-tag fuel">{v.fuelType.toUpperCase()}</span>
                    <span className="car-spec-tag trans">{v.transmission.toUpperCase()}</span>
                  </div>
                  {isActive && <span className="active-car-stamp">ACTIVE // TARGET_SPEC</span>}
                </div>

                <div className="manifest-identity">
                  <h3 className="manifest-title">{v.make} {v.model}</h3>
                  <span className="manifest-region">LOC: {v.region}</span>
                </div>

                {/* Odometer Terminal Editor */}
                <div className="manifest-odometer-box">
                  <span className="odo-meta-key">ODOMETER_LOG:</span>
                  {isEditingThisOdo ? (
                    <div className="odo-inline-editor">
                      <input
                        type="number"
                        className="odo-code-input"
                        value={tempOdo}
                        onChange={e => setTempOdo(e.target.value)}
                        autoFocus
                      />
                      <button className="odo-save-btn" onClick={() => handleSaveOdometer(v)}>✓</button>
                      <button className="odo-cancel-btn" onClick={() => setEditingOdoId(null)}>✕</button>
                    </div>
                  ) : (
                    <div className="odo-value-display">
                      <span className="odo-number">{v.odometerKm.toLocaleString('en-IN')} KM</span>
                      <button
                        className="odo-pencil-btn"
                        onClick={() => {
                          setEditingOdoId(v.id)
                          setTempOdo(v.odometerKm.toString())
                        }}
                        title="Update Odometer"
                      >
                        [edit]
                      </button>
                    </div>
                  )}
                </div>

                {/* Manifest Actions */}
                <div className="manifest-card-actions">
                  {!isActive ? (
                    <button
                      className="coded-secondary-btn small"
                      onClick={() => onSetActiveVehicle(v.id)}
                    >
                      SET_ACTIVE
                    </button>
                  ) : (
                    <button
                      className="coded-primary-btn small"
                      onClick={onStartDiagnosis}
                    >
                      ⚡ DIAGNOSE_VEHICLE
                    </button>
                  )}
                  <button
                    className="coded-delete-btn"
                    onClick={() => {
                      if (confirm(`Remove ${v.year} ${v.make} ${v.model} from your registry?`)) {
                        onDeleteVehicle(v.id)
                      }
                    }}
                    title="Delete Vehicle"
                  >
                    [delete]
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Vehicle Modal / Config Editor */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="coded-modal-card">
            <div className="modal-header-strip">
              <span className="modal-badge">SCHEMA // VEHICLE_CONFIG</span>
              <button className="modal-x-btn" onClick={() => setShowAddModal(false)}>[esc]</button>
            </div>

            <div className="modal-title-wrap">
              <h3>Enroll Vehicle in Local Garage</h3>
              <p>Configure make, powertrain, and initial odometer reading for calibrated diagnostics:</p>
            </div>

            <form onSubmit={handleCreateVehicle} className="coded-modal-form">
              {formError && <div className="form-error-callout">⚠️ {formError}</div>}

              <div className="coded-form-grid">
                <div className="form-field">
                  <label>MANUFACTURER / MAKE *</label>
                  <input
                    type="text"
                    placeholder="e.g. Maruti Suzuki, Tata, Hyundai"
                    value={make}
                    onChange={e => setMake(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>MODEL NAME *</label>
                  <input
                    type="text"
                    placeholder="e.g. Swift, Nexon, Creta, City"
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>MANUFACTURING YEAR *</label>
                  <input
                    type="number"
                    min={1980}
                    max={new Date().getFullYear() + 1}
                    value={year}
                    onChange={e => setYear(parseInt(e.target.value, 10))}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>FUEL VARIANT *</label>
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

                <div className="form-field">
                  <label>TRANSMISSION *</label>
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

                <div className="form-field">
                  <label>INITIAL ODOMETER (KM) *</label>
                  <input
                    type="number"
                    min={0}
                    value={odometerKm}
                    onChange={e => setOdometerKm(parseInt(e.target.value, 10) || 0)}
                    required
                  />
                </div>

                <div className="form-field full-width">
                  <label>REGION / CITY (INDIA)</label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru, Karnataka or Mumbai, MH"
                    value={region}
                    onChange={e => setRegion(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer-actions">
                <button
                  type="button"
                  className="coded-ghost-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  CANCEL
                </button>
                <button type="submit" className="coded-primary-btn">
                  SAVE_VEHICLE_RECORD ↵
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
