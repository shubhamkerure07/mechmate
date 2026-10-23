import React, { useState } from 'react'
import { DiagnosticAssessment, PotentialCause } from '../types/automotive'
import {
  FileSearch,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Zap,
  Wrench,
  ShieldCheck,
  FileText,
  Sparkles,
  ArrowRight,
  Layers
} from 'lucide-react'

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
    <div className="view-container">
      {/* Dossier Header */}
      <div className="view-header">
        <div className="view-meta-pill">
          <Layers className="meta-icon" size={13} />
          <span>Diagnostic Evidence Explorer</span>
          <span className="meta-dot">•</span>
          <span>Goal-Backward Forensic Analysis</span>
        </div>

        <h1 className="view-title">Forensic Hypothesis Ledger</h1>
        <p className="view-subtitle">
          Inspect how MechMate evaluates potential vehicle faults: review supporting vs. contradicting evidence,
          identify missing physical telemetry, and execute discriminating tests to confirm root cause without blind component swapping.
        </p>
      </div>

      {!activeCause ? (
        <div className="empty-state-card">
          <div className="empty-icon-wrap">
            <FileSearch size={32} />
          </div>
          <h3>No Active Diagnostic Case Loaded</h3>
          <p>
            Run an intake consultation first to generate forensic evidence cards and hypothesis evaluations for your vehicle's observed symptoms.
          </p>
          <button className="btn-primary" onClick={onOpenDiagnose}>
            <Sparkles size={16} />
            <span>Start Diagnostic Intake</span>
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="evidence-layout">
          {/* Hypotheses Selector Bar */}
          <div className="evidence-selector-bar">
            <div className="selector-label">
              <FileText size={14} />
              <span>Evaluated Hypotheses ({causes.length})</span>
            </div>
            <div className="hypothesis-tabs-scroll">
              {causes.map((c, idx) => {
                const isSelected = c.id === activeCause.id
                return (
                  <button
                    key={c.id}
                    className={`hypothesis-tab-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedCauseId(c.id)}
                  >
                    <span className="hypothesis-tab-idx">#{idx + 1}</span>
                    <span className="hypothesis-tab-name">{c.name}</span>
                    <span className={`badge-confidence ${c.probability.toLowerCase()}`}>
                      {c.probability}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Active Evidence Dossier Document */}
          <div className="evidence-dossier-card">
            {/* Top metadata row */}
            <div className="dossier-meta-row">
              <div className="dossier-tags">
                <span className="badge-system">{activeCause.systemCategory} Subsystem</span>
                <span className={`badge-confidence ${activeCause.probability.toLowerCase()}`}>
                  Confidence: {activeCause.probability}
                </span>
              </div>
              <span className="dossier-id-tag">ID: {activeCause.id}</span>
            </div>

            <h2 className="dossier-cause-title">{activeCause.name}</h2>

            {/* Engineering Rationale Callout */}
            <div className="rationale-callout">
              <div className="rationale-header">
                <Sparkles size={16} className="text-amber" />
                <span>Mechatronic Engineering Rationale</span>
              </div>
              <p className="rationale-body">{activeCause.reasoning}</p>
            </div>

            {/* 4-Quadrant Evidence Matrix */}
            <div className="evidence-matrix-grid">
              {/* Supporting Evidence */}
              <div className="matrix-quadrant supporting">
                <div className="quadrant-header">
                  <div className="quadrant-icon supporting">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4>Supporting Observations</h4>
                    <span className="quadrant-desc">Evidence validating this hypothesis</span>
                  </div>
                </div>
                <ul className="quadrant-list">
                  {activeCause.evidence.supporting.map((item, idx) => (
                    <li key={idx}>
                      <CheckCircle2 size={14} className="list-icon supporting" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contradicting Evidence */}
              <div className="matrix-quadrant contradicting">
                <div className="quadrant-header">
                  <div className="quadrant-icon contradicting">
                    <XCircle size={16} />
                  </div>
                  <div>
                    <h4>Contradicting / Weakening</h4>
                    <span className="quadrant-desc">Factors suggesting an alternate fault</span>
                  </div>
                </div>
                <ul className="quadrant-list">
                  {activeCause.evidence.contradicting.length > 0 ? (
                    activeCause.evidence.contradicting.map((item, idx) => (
                      <li key={idx}>
                        <XCircle size={14} className="list-icon contradicting" />
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="dim-row">
                      <span className="dim-bullet">•</span>
                      <span>No contradicting evidence identified for this symptom profile.</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Missing Telemetry */}
              <div className="matrix-quadrant missing">
                <div className="quadrant-header">
                  <div className="quadrant-icon missing">
                    <HelpCircle size={16} />
                  </div>
                  <div>
                    <h4>Unconfirmed Telemetry</h4>
                    <span className="quadrant-desc">Missing data to confirm diagnosis</span>
                  </div>
                </div>
                <ul className="quadrant-list">
                  {activeCause.evidence.missingInfo.map((item, idx) => (
                    <li key={idx}>
                      <HelpCircle size={14} className="list-icon missing" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Discriminating Test */}
              <div className="matrix-quadrant test">
                <div className="quadrant-header">
                  <div className="quadrant-icon test">
                    <Zap size={16} />
                  </div>
                  <div>
                    <h4>Discriminating Test</h4>
                    <span className="quadrant-desc">Crucial test before parts replacement</span>
                  </div>
                </div>
                <div className="discriminating-test-box">
                  <code>{activeCause.evidence.discriminatingTest}</code>
                </div>
              </div>
            </div>

            {/* Inspection Protocols */}
            <div className="protocol-split-grid">
              <div className="protocol-card diy">
                <div className="protocol-badge">
                  <ShieldCheck size={14} />
                  <span>Safe DIY Visual Inspection (No Tools)</span>
                </div>
                <p className="protocol-content">{activeCause.safeUserInspection}</p>
              </div>

              <div className="protocol-card workshop">
                <div className="protocol-badge workshop">
                  <Wrench size={14} />
                  <span>Certified Technician Procedure</span>
                </div>
                <ol className="protocol-steps">
                  {activeCause.professionalMechanicSteps.map((step, idx) => (
                    <li key={idx}>
                      <span className="step-counter">{idx + 1}</span>
                      <span className="step-text">{step}</span>
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
