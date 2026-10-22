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
    <div className="view-container">
      <div className="view-header">
        <div className="view-title">
          <div className="view-badge">DIFFERENTIATED FEATURE</div>
          <h2>Diagnostic Evidence Explorer</h2>
          <p>
            Transparent automotive reasoning: Inspect what evidence supports or contradicts each hypothesis,
            what data is missing, and which discriminating test proves the root cause before spending money on repairs.
          </p>
        </div>
      </div>

      {!activeCause ? (
        <div className="empty-card">
          <div className="empty-icon">🔍</div>
          <h3>No Active Diagnostic Assessment</h3>
          <p>
            Run a diagnostic consultation first to inspect evidence breakdowns for your vehicle's specific symptoms.
          </p>
          <button className="primary-btn" onClick={onOpenDiagnose}>
            ⚡ Start Diagnostic Intake
          </button>
        </div>
      ) : (
        <div className="evidence-layout">
          {/* Cause Selector Tabs */}
          <div className="cause-selector-bar">
            <span className="selector-label">Evaluated Hypotheses:</span>
            <div className="cause-chips">
              {causes.map(c => (
                <button
                  key={c.id}
                  className={`cause-chip ${c.id === (activeCause?.id) ? 'active' : ''}`}
                  onClick={() => setSelectedCauseId(c.id)}
                >
                  <span className={`prob-pill ${c.probability.toLowerCase()}`}>
                    {c.probability}
                  </span>
                  <span className="cause-chip-name">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Cause Detail Card */}
          <div className="active-cause-card">
            <div className="cause-card-header">
              <div>
                <div className="system-tag">{activeCause.systemCategory} SYSTEM</div>
                <h3>{activeCause.name}</h3>
              </div>
              <div className={`probability-badge ${activeCause.probability.toLowerCase()}`}>
                <span className="badge-dot" />
                {activeCause.probability} Cause
              </div>
            </div>

            <div className="reasoning-box">
              <span className="section-label">Automotive Engineering Rationale:</span>
              <p>{activeCause.reasoning}</p>
            </div>

            {/* Evidence 4-Quadrant Grid */}
            <div className="evidence-grid">
              {/* Supporting Evidence */}
              <div className="evidence-card supporting">
                <div className="evidence-card-title">
                  <span className="icon">✓</span>
                  <h4>Supporting Evidence</h4>
                </div>
                <ul>
                  {activeCause.evidence.supporting.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Contradicting Evidence */}
              <div className="evidence-card contradicting">
                <div className="evidence-card-title">
                  <span className="icon">✕</span>
                  <h4>Contradicting / Weakening Evidence</h4>
                </div>
                <ul>
                  {activeCause.evidence.contradicting.length > 0 ? (
                    activeCause.evidence.contradicting.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))
                  ) : (
                    <li className="dim">No contradictory evidence identified for this symptom profile.</li>
                  )}
                </ul>
              </div>

              {/* Missing Information */}
              <div className="evidence-card missing">
                <div className="evidence-card-title">
                  <span className="icon">?</span>
                  <h4>Missing Information</h4>
                </div>
                <ul>
                  {activeCause.evidence.missingInfo.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Next Discriminating Test */}
              <div className="evidence-card test">
                <div className="evidence-card-title">
                  <span className="icon">⚖</span>
                  <h4>Next Discriminating Test</h4>
                </div>
                <p className="test-desc">{activeCause.evidence.discriminatingTest}</p>
              </div>
            </div>

            {/* Inspection Protocols */}
            <div className="inspection-split">
              <div className="inspection-block user">
                <div className="inspection-header">
                  <span>👁️</span>
                  <h4>Safe DIY Visual Check (No Tools)</h4>
                </div>
                <p>{activeCause.safeUserInspection}</p>
              </div>

              <div className="inspection-block mechanic">
                <div className="inspection-header">
                  <span>🔧</span>
                  <h4>Professional Workshop Verification</h4>
                </div>
                <ul>
                  {activeCause.professionalMechanicSteps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
