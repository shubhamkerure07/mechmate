import React, { useState } from 'react'
import { OBDCodeDetails } from '../types/automotive'
import { lookupOBDCode, searchOBDBySymptom, OBD_DATABASE } from '../services/obdDatabase'

export const OBDScannerView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCode, setSelectedCode] = useState<OBDCodeDetails | null>(
    OBD_DATABASE['P0300'] || null
  )

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const exact = lookupOBDCode(query)
    if (exact) {
      setSelectedCode(exact)
      return
    }
    const results = searchOBDBySymptom(query)
    if (results.length > 0) {
      setSelectedCode(results[0])
    }
  }

  const quickCodes = ['P0300', 'P0301', 'P0171', 'P0172', 'P0420', 'P0128', 'P0500', 'P0700']

  return (
    <div className="view-container">
      <div className="view-header">
        <div className="view-title">
          <div className="view-badge">DIAGNOSTIC TROUBLE CODES</div>
          <h2>OBD-II Fault Code Intelligence</h2>
          <p>
            Decode standard SAE J2012 / ISO 15031 diagnostic trouble codes retrieved from OBD-II scanners.
            Understand root causes, verify symptoms, and follow workshop diagnostic procedures.
          </p>
        </div>
      </div>

      {/* Search Bar & Quick Chips */}
      <div className="obd-search-box">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="obd-input"
            placeholder="Enter DTC code (e.g. P0300, P0171) or symptom (e.g. misfire, catalyst)..."
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => handleSearch('')}>✕</button>
          )}
        </div>

        <div className="quick-code-chips">
          <span className="chips-label">Popular Codes:</span>
          {quickCodes.map(code => (
            <button
              key={code}
              className={`code-chip ${selectedCode?.code === code ? 'active' : ''}`}
              onClick={() => {
                setSearchQuery(code)
                setSelectedCode(OBD_DATABASE[code] || null)
              }}
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* OBD Detail View */}
      {selectedCode ? (
        <div className="obd-detail-card">
          <div className="obd-card-header">
            <div className="obd-title-group">
              <span className="obd-code-badge">{selectedCode.code}</span>
              <div>
                <h3>{selectedCode.title}</h3>
                <span className="obd-category">{selectedCode.category} Subsystem</span>
              </div>
            </div>
            <div className={`severity-tag ${selectedCode.severity.toLowerCase()}`}>
              {selectedCode.severity.replace('_', ' ')}
            </div>
          </div>

          <div className="obd-meaning-box">
            <h4>Technical Description</h4>
            <p>{selectedCode.meaning}</p>
          </div>

          <div className="obd-grid">
            {/* Common Symptoms */}
            <div className="obd-column symptoms">
              <h4>⚠️ Observable Symptoms</h4>
              <ul>
                {selectedCode.commonSymptoms.map((sym, idx) => (
                  <li key={idx}>{sym}</li>
                ))}
              </ul>
            </div>

            {/* Possible Causes */}
            <div className="obd-column causes">
              <h4>⚙️ Probable Root Causes</h4>
              <ul>
                {selectedCode.possibleCauses.map((cause, idx) => (
                  <li key={idx}>{cause}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended Workshop Diagnostic Sequence */}
          <div className="obd-steps-box">
            <h4>🔧 Step-by-Step Diagnostic & Inspection Sequence</h4>
            <ol>
              {selectedCode.recommendedActions.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      ) : (
        <div className="empty-card">
          <div className="empty-icon">📟</div>
          <h3>No Code Selected</h3>
          <p>Search for an OBD-II code above or select one from the quick codes list.</p>
        </div>
      )}
    </div>
  )
}
