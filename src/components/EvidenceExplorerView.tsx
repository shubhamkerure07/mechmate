import React, { useState } from 'react'
import { DiagnosticAssessment, PotentialCause } from '../types/automotive'

interface EvidenceExplorerProps {
  currentAssessment: DiagnosticAssessment | null
  onOpenDiagnose: () => void
}

export const EvidenceExplorerView: React.FC<EvidenceExplorerProps> = ({
  currentAssessment,
  onOpenDiagnose
}) => {
  const causes: PotentialCause[] = currentAssessment?.potentialCauses || []
  const [selectedCauseId, setSelectedCauseId] = useState<string>(
    causes.length > 0 ? causes[0].id : ''
  )

  const activeCause = causes.find(c => c.id === selectedCauseId) || causes[0] || null

  return (
    <div className="view-container note-page-layout">
      {/* Dossier Header */}
      <div className="note-dossier-header">
        <div className="dossier-meta-strip">
          <span className="mono-badge">MODULE // EVIDENCE_EXPLORER</span>
          <span className="meta-divider">/</span>
          <span className="mono-text">METHOD: GOAL_BACKWARD_REASONING</span>
          <span className="meta-divider">/</span>
          <span className="mono-text">ISO: MECHATRONIC_AUDIT</span>
        </div>

        <div className="dossier-title-group">
          <h2 className="dossier-title">Forensic Diagnostic Evidence Explorer</h2>
          <p className="dossier-sub">
            Investigate how MechMate constructs its diagnostic hypothesis ledger: inspect supporting vs. contradicting evidence,
            identify missing physical telemetry, and execute discriminating tests to confirm root cause without blind component swapping.
          </p>
        </div>
      </div>

      {!activeCause ? (
        <div className="note-empty-card">
          <span className="empty-symbol">[?]</span>
          <h3>No Active Case Loaded in Diagnostic Ledger</h3>
          <p>
            Run an intake consultation first to generate forensic evidence cards for your vehicle's observed symptoms.
          </p>
          <button className="coded-primary-btn" onClick={onOpenDiagnose}>
            START_DIAGNOSTIC_INTAKE ↵
          </button>
        </div>
      ) : (
        <div className="evidence-dossier-wrapper">
          {/* File Tab Selector */}
          <div className="evidence-tabs-bar">
            <span className="tabs-bar-label">// EVALUATED_HYPOTHESES:</span>
            <div className="evidence-tab-scroll">
              {causes.map((c, idx) => (
                <button
                  key={c.id}
                  className={`evidence-file-tab ${c.id === activeCause.id ? 'active' : ''}`}
                  onClick={() => setSelectedCauseId(c.id)}
                >
                  <span className="tab-file-icon">📄</span>
                  <span className="tab-idx-tag">0{idx + 1}.</span>
                  <span className="tab-cause-name">{c.name}</span>
                  <span className={`tab-prob-tag ${c.probability.toLowerCase()}`}>
                    [{c.probability.toUpperCase()}]
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Evidence Dossier Document */}
          <div className="evidence-document-card">
            <div className="doc-meta-strip">
              <span className="doc-tag">SYSTEM: {activeCause.systemCategory.toUpperCase()}</span>
              <span className="doc-tag">ID: {activeCause.id}</span>
              <span className={`doc-tag prob ${activeCause.probability.toLowerCase()}`}>
                CONFIDENCE: {activeCause.probability.toUpperCase()}
              </span>
            </div>

            <div className="doc-title-row">
              <h3 className="doc-main-heading">{activeCause.name}</h3>
            </div>

            <div className="doc-callout-note">
              <span className="callout-header">// MECHATRONIC ENGINEERING RATIONALE:</span>
              <p className="callout-body">{activeCause.reasoning}</p>
            </div>

            {/* 4-Quadrant Evidence Matrix */}
            <div className="evidence-matrix-grid">
              {/* [+] Supporting Evidence */}
              <div className="matrix-card supporting">
                <div className="matrix-card-header">
                  <span className="matrix-icon">[+]</span>
                  <h4>SUPPORTING EVIDENCE</h4>
                </div>
                <p className="matrix-desc">Observations directly validating this hypothesis:</p>
                <ul>
                  {activeCause.evidence.supporting.map((item, idx) => (
                    <li key={idx}>
                      <span className="list-marker">+</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* [-] Contradicting Evidence */}
              <div className="matrix-card contradicting">
                <div className="matrix-card-header">
                  <span className="matrix-icon">[-]</span>
                  <h4>CONTRADICTING / WEAKENING EVIDENCE</h4>
                </div>
                <p className="matrix-desc">Factors suggesting an alternate failure mode:</p>
                <ul>
                  {activeCause.evidence.contradicting.length > 0 ? (
                    activeCause.evidence.contradicting.map((item, idx) => (
                      <li key={idx}>
                        <span className="list-marker">-</span>
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="dim-row">
                      <span className="list-marker">•</span>
                      <span>No contradicting evidence identified for this symptom profile.</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* [?] Missing Telemetry */}
              <div className="matrix-card missing">
                <div className="matrix-card-header">
                  <span className="matrix-icon">[?]</span>
                  <h4>UNCONFIRMED / MISSING TELEMETRY</h4>
                </div>
                <p className="matrix-desc">Data points needed to convert hypothesis to confirmed diagnosis:</p>
                <ul>
                  {activeCause.evidence.missingInfo.map((item, idx) => (
                    <li key={idx}>
                      <span className="list-marker">?</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* [!] Discriminating Verification Test */}
              <div className="matrix-card test">
                <div className="matrix-card-header">
                  <span className="matrix-icon">[!]</span>
                  <h4>DISCRIMINATING VERIFICATION TEST</h4>
                </div>
                <p className="matrix-desc">Perform this test before replacing parts:</p>
                <div className="test-action-box">
                  <code>{activeCause.evidence.discriminatingTest}</code>
                </div>
              </div>
            </div>

            {/* Technical Verification Protocol */}
            <div className="inspection-protocol-split">
              <div className="protocol-block user">
                <div className="protocol-header">
                  <span className="protocol-tag">[USER_INSPECTION]</span>
                  <h4>Safe DIY Visual Check (No Tools Required)</h4>
                </div>
                <p className="protocol-body">{activeCause.safeUserInspection}</p>
              </div>

              <div className="protocol-block workshop">
                <div className="protocol-header">
                  <span className="protocol-tag">[WORKSHOP_SPEC]</span>
                  <h4>Certified Technician Procedure</h4>
                </div>
                <ol className="protocol-steps-list">
                  {activeCause.professionalMechanicSteps.map((step, idx) => (
                    <li key={idx}>
                      <span className="step-idx">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
