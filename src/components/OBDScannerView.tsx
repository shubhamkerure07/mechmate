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
    <div className="view-container note-page-layout">
      {/* Dossier Header */}
      <div className="note-dossier-header">
        <div className="dossier-meta-strip">
          <span className="mono-badge">DATASHEET // OBD_II_INSPECTOR</span>
          <span className="meta-divider">/</span>
          <span className="mono-text">STANDARD: SAE_J2012 / ISO_15031</span>
          <span className="meta-divider">/</span>
          <span className="mono-text">DTC_TAXONOMY</span>
        </div>

        <div className="dossier-title-group">
          <h2 className="dossier-title">OBD-II Fault Code Intelligence & Datasheet</h2>
          <p className="dossier-sub">
            Query standard Diagnostic Trouble Codes (DTCs) from ECU scan tools. Review technical fault criteria,
            verify driver-observed symptoms, and execute workshop repair sequences.
          </p>
        </div>
      </div>

      {/* Terminal Lookup Bar & Quick Chips */}
      <div className="terminal-search-box">
        <div className="terminal-input-wrap">
          <span className="terminal-prompt-sym">DTC_QUERY &gt;</span>
          <input
            type="text"
            className="terminal-text-input"
            placeholder="Type DTC code (e.g. P0300, P0171) or symptom keyword (e.g. misfire, catalyst, o2)..."
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
          />
          {searchQuery && (
            <button className="terminal-clear-btn" onClick={() => handleSearch('')}>[clear]</button>
          )}
        </div>

        <div className="quick-chips-strip">
          <span className="chips-label">// STANDARD_INDEX:</span>
          {quickCodes.map(code => (
            <button
              key={code}
              className={`coded-chip-btn ${selectedCode?.code === code ? 'active' : ''}`}
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

      {/* OBD Technical Datasheet Card */}
      {selectedCode ? (
        <div className="note-card obd-datasheet-card">
          <div className="datasheet-header-line">
            <div className="code-identity-group">
              <span className="code-big-badge">{selectedCode.code}</span>
              <div>
                <span className="code-system-tag">SUBSYSTEM: {selectedCode.category.toUpperCase()}</span>
                <h3 className="code-official-title">{selectedCode.title}</h3>
              </div>
            </div>
            <div className={`coded-severity-stamp ${selectedCode.severity.toLowerCase()}`}>
              {selectedCode.severity.replace('_', ' ')}
            </div>
          </div>

          <div className="datasheet-meaning-callout">
            <span className="callout-header">// TECHNICAL FAULT DEFINITION:</span>
            <p className="callout-body">{selectedCode.meaning}</p>
          </div>

          <div className="datasheet-columns-grid">
            {/* Common Symptoms */}
            <div className="datasheet-column symptoms">
              <span className="col-header">[!] PHYSICAL OBSERVABLE SYMPTOMS</span>
              <ul>
                {selectedCode.commonSymptoms.map((sym, idx) => (
                  <li key={idx}>
                    <span className="bullet">■</span> {sym}
                  </li>
                ))}
              </ul>
            </div>

            {/* Possible Causes */}
            <div className="datasheet-column causes">
              <span className="col-header">[?] COMMON ROOT CAUSES & DEFECTS</span>
              <ul>
                {selectedCode.possibleCauses.map((cause, idx) => (
                  <li key={idx}>
                    <span className="bullet">■</span> {cause}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Workshop Diagnostic Sequence */}
          <div className="workshop-protocol-box">
            <span className="box-header">// WORKSHOP DIAGNOSTIC & VERIFICATION SEQUENCE:</span>
            <ol className="protocol-ordered-list">
              {selectedCode.recommendedActions.map((step, idx) => (
                <li key={idx}>
                  <span className="step-num">0{idx + 1}.</span>
                  <span className="step-text">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : (
        <div className="note-empty-card">
          <span className="empty-symbol">[?]</span>
          <h3>No DTC Record Found</h3>
          <p>Search for a valid standard 5-character OBD-II code (e.g. P0300) or symptom keyword above.</p>
        </div>
      )}
    </div>
  )
}
