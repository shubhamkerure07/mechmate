import React, { useState } from 'react'
import { OBDCodeDetails } from '../types/automotive'
import { lookupOBDCode, searchOBDBySymptom, OBD_DATABASE } from '../services/obdDatabase'
import {
  Cpu,
  Search,
  X,
  AlertTriangle,
  Wrench,
  Activity,
  Layers,
  FileCode
} from 'lucide-react'

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
      {/* View Header */}
      <div className="view-header">
        <div className="view-meta-pill">
          <Cpu className="meta-icon" size={13} />
          <span>OBD-II Fault Intelligence</span>
          <span className="meta-dot">•</span>
          <span>SAE J2012 / ISO 15031 Standard DTCs</span>
        </div>

        <h1 className="view-title">ECU Diagnostic Trouble Codes</h1>
        <p className="view-subtitle">
          Query standard OBD-II Diagnostic Trouble Codes (DTCs) retrieved via scanner tools.
          Verify physical symptom correlations, assess system severity, and follow manufacturer-grade workshop sequences.
        </p>
      </div>

      {/* Modern Search & Quick Code Filter */}
      <div className="obd-search-section">
        <div className="search-bar-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search DTC code (e.g. P0300, P0171) or symptom (e.g. misfire, catalyst, o2)..."
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={() => handleSearch('')}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="quick-codes-strip">
          <span className="quick-label">Standard Codes:</span>
          <div className="quick-code-chips">
            {quickCodes.map(code => (
              <button
                key={code}
                className={`quick-code-btn ${selectedCode?.code === code ? 'active' : ''}`}
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
      </div>

      {/* OBD Technical Datasheet Card */}
      {selectedCode ? (
        <div className="obd-detail-card">
          <div className="obd-header-row">
            <div className="obd-code-identity">
              <div className="obd-code-pill">
                <FileCode size={20} />
                <span>{selectedCode.code}</span>
              </div>
              <div>
                <span className="obd-category-badge">{selectedCode.category} Subsystem</span>
                <h2 className="obd-code-title">{selectedCode.title}</h2>
              </div>
            </div>

            <div className={`badge-severity ${selectedCode.severity.toLowerCase()}`}>
              <AlertTriangle size={14} />
              <span>{selectedCode.severity.replace('_', ' ')}</span>
            </div>
          </div>

          {/* Fault Definition Callout */}
          <div className="obd-definition-callout">
            <div className="definition-header">
              <Activity size={15} className="text-amber" />
              <span>Technical Fault Criteria & ECU Detection Logic</span>
            </div>
            <p className="definition-body">{selectedCode.meaning}</p>
          </div>

          {/* 2-Column Grid: Symptoms vs Causes */}
          <div className="obd-columns-grid">
            <div className="obd-info-col">
              <div className="col-header">
                <AlertTriangle size={15} className="text-warning" />
                <h4>Observable Symptoms</h4>
              </div>
              <ul className="obd-bullet-list">
                {selectedCode.commonSymptoms.map((sym, idx) => (
                  <li key={idx}>
                    <span className="bullet-dot" />
                    <span>{sym}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="obd-info-col">
              <div className="col-header">
                <Layers size={15} className="text-cyan" />
                <h4>Probable Root Causes</h4>
              </div>
              <ul className="obd-bullet-list">
                {selectedCode.possibleCauses.map((cause, idx) => (
                  <li key={idx}>
                    <span className="bullet-dot cyan" />
                    <span>{cause}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Workshop Diagnostic Sequence */}
          <div className="workshop-protocol-box">
            <div className="protocol-box-header">
              <Wrench size={16} className="text-amber" />
              <h4>Recommended Workshop Diagnostic & Verification Sequence</h4>
            </div>
            <ol className="protocol-steps-list">
              {selectedCode.recommendedActions.map((step, idx) => (
                <li key={idx}>
                  <span className="step-counter">{idx + 1}</span>
                  <span className="step-text">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : (
        <div className="empty-state-card">
          <div className="empty-icon-wrap">
            <Search size={32} />
          </div>
          <h3>No Trouble Code Found</h3>
          <p>
            Please search for a standard 5-character OBD-II DTC (e.g. P0300) or symptom keyword in the query box above.
          </p>
        </div>
      )}
    </div>
  )
}
