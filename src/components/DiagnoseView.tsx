import React, { useState } from 'react'
import {
  DiagnosticAssessment,
  FollowUpQuestion,
  VehicleProfile
} from '../types/automotive'
import { getRecommendedFollowUps } from '../services/followUpQuestions'
import { runDiagnosticEngine } from '../services/diagnosticEngine'
import { sendMessage } from '../services/gemini'

interface DiagnoseViewProps {
  activeVehicle: VehicleProfile | null
  currentAssessment: DiagnosticAssessment | null
  onAssessmentCompleted: (assessment: DiagnosticAssessment) => void
  onOpenEvidenceExplorer: () => void
  onOpenGarage: () => void
}

const SYMPTOM_TAGS = [
  {
    tag: '#brakes.metal_grinding',
    icon: '🛑',
    label: 'Brakes grinding',
    symptom: 'My brakes make a loud metal grinding noise when I slow down, and stopping distance feels longer.'
  },
  {
    tag: '#electrical.no_crank',
    icon: '🔋',
    label: 'Morning no-start',
    symptom: 'The car refuses to crank in the morning. When I turn the key there is a rapid clicking sound.'
  },
  {
    tag: '#cooling.thermal_spike',
    icon: '🌡️',
    label: 'Overheating in traffic',
    symptom: 'Engine temperature gauge rises into the red zone after 15 minutes of driving in traffic.'
  },
  {
    tag: '#engine.cel_misfire',
    icon: '💡',
    label: 'Check engine & jerking',
    symptom: 'Check Engine light is illuminated and the car shudders and hesitates when accelerating.'
  },
  {
    tag: '#exhaust.sweet_white_smoke',
    icon: '💨',
    label: 'White exhaust smoke',
    symptom: 'I see thick white smoke with a sweet smell coming from the exhaust tailpipe.'
  },
  {
    tag: '#transmission.clutch_slip',
    icon: '⚙️',
    label: 'Clutch slipping',
    symptom: 'Engine revs climb high when climbing inclines but the car barely speeds up.'
  }
]

export const DiagnoseView: React.FC<DiagnoseViewProps> = ({
  activeVehicle,
  currentAssessment,
  onAssessmentCompleted,
  onOpenEvidenceExplorer,
  onOpenGarage
}) => {
  const [symptomInput, setSymptomInput] = useState('')
  const [followUps, setFollowUps] = useState<FollowUpQuestion[]>([])
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [isConsultationActive, setIsConsultationActive] = useState(false)

  // Interactive follow-up Q&A chat inside assessment
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  const handleStartAnalysis = (symptomText?: string) => {
    const text = (symptomText || symptomInput).trim()
    if (!text) return

    setSymptomInput(text)
    const questions = getRecommendedFollowUps(text)
    setFollowUps(questions)
    setFollowUpAnswers({})
    setIsConsultationActive(true)

    // If no follow-up questions needed, directly execute
    if (questions.length === 0) {
      executeDiagnosis(text, {})
    }
  }

  const handleAnswerFollowUp = (questionId: string, value: string) => {
    setFollowUpAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const executeDiagnosis = async (
    textToAnalyze: string,
    answers: Record<string, string>,
    prevAssessment?: DiagnosticAssessment | null
  ) => {
    setLoading(true)
    try {
      const assessment = await runDiagnosticEngine({
        symptoms: textToAnalyze,
        vehicle: activeVehicle,
        followUpAnswers: answers,
        previousAssessment: prevAssessment || currentAssessment
      })

      onAssessmentCompleted(assessment)
      setIsConsultationActive(false)
      setChatMessages([])
    } catch (err) {
      console.error('Diagnosis execution error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSendChatMessage = async () => {
    const text = chatInput.trim()
    if (!text || chatLoading) return

    const newMessages = [...chatMessages, { role: 'user' as const, text }]
    setChatMessages(newMessages)
    setChatInput('')
    setChatLoading(true)

    const isNewSymptom = text.toLowerCase().includes('also') ||
      text.toLowerCase().includes('now') ||
      text.toLowerCase().includes('started') ||
      text.toLowerCase().includes('smell') ||
      text.toLowerCase().includes('noise')

    if (isNewSymptom && currentAssessment) {
      const combined = `${currentAssessment.rawInput}. Additionally: ${text}`
      await executeDiagnosis(combined, followUpAnswers, currentAssessment)
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `[RE-EVALUATED] Diagnostic model updated with entry: "${text}". See adjusted causes and safety directives above.`
        }
      ])
      setChatLoading(false)
      return
    }

    try {
      const reply = await sendMessage(text)
      setChatMessages(prev => [...prev, { role: 'assistant', text: reply }])
    } catch (_e) {
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'Advisory fallback active. Reference the verified inspection checklist above for next diagnostic steps.'
        }
      ])
    } finally {
      setChatLoading(false)
    }
  }

  const handleResetConsultation = () => {
    setSymptomInput('')
    setFollowUps([])
    setFollowUpAnswers({})
    setIsConsultationActive(false)
    setChatMessages([])
  }

  return (
    <div className="view-container note-page-layout">
      {/* Editorial Note Header */}
      <div className="note-dossier-header">
        <div className="dossier-meta-strip">
          <span className="mono-badge">DOC // FIELD_DIAGNOSTICS</span>
          <span className="meta-divider">/</span>
          <span className="mono-text">SEC_LEVEL: DETERMINISTIC_SAFE</span>
          <span className="meta-divider">/</span>
          <span className="mono-text">REV: 2026.10</span>
        </div>

        <div className="dossier-title-group">
          <h2 className="dossier-title">Automotive Diagnostic Notebook</h2>
          <p className="dossier-sub">
            Structured mechatronic intake: logs physical observations, assesses roadside hazard urgency,
            and isolates root mechanical causes before workshop teardown.
          </p>
        </div>

        {/* Frontmatter Metadata Block */}
        <div className="frontmatter-card">
          <div className="frontmatter-row">
            <span className="fm-key">target_vehicle:</span>
            {activeVehicle ? (
              <span className="fm-val active">
                {activeVehicle.year} {activeVehicle.make} {activeVehicle.model} ({activeVehicle.fuelType}, {activeVehicle.transmission})
                <button className="fm-action" onClick={onOpenGarage}>[switch_profile]</button>
              </span>
            ) : (
              <span className="fm-val generic">
                generic_unspecified_vehicle
                <button className="fm-action" onClick={onOpenGarage}>[assign_car]</button>
              </span>
            )}
          </div>
          <div className="frontmatter-row">
            <span className="fm-key">odometer_reading:</span>
            <span className="fm-val mono">
              {activeVehicle ? `${activeVehicle.odometerKm.toLocaleString('en-IN')} km` : 'none'}
            </span>
            <span className="fm-key ml-auto">region_spec:</span>
            <span className="fm-val mono">{activeVehicle?.region || 'India (Standard Aftermarket)'}</span>
          </div>
        </div>
      </div>

      {/* Step 1: Technical Symptom Scratchpad */}
      <div className="note-card intake-section">
        <div className="card-section-header">
          <span className="section-index">01</span>
          <div>
            <h3>Symptom Intake & Field Notes</h3>
            <p className="section-desc">Record anomalous noises, vibrations, smells, leaks, or instrument warnings:</p>
          </div>
        </div>

        {/* Quick Tag Pills */}
        <div className="tag-chips-bar">
          <span className="chips-hint">Preset scenarios:</span>
          {SYMPTOM_TAGS.map((tagItem, idx) => (
            <button
              key={idx}
              className="coded-tag-btn"
              onClick={() => handleStartAnalysis(tagItem.symptom)}
            >
              <span className="tag-hash">{tagItem.tag}</span>
            </button>
          ))}
        </div>

        {/* Scratchpad Textarea */}
        <div className="scratchpad-wrapper">
          <div className="line-numbers-col" aria-hidden="true">
            <span>01</span>
            <span>02</span>
            <span>03</span>
            <span>04</span>
          </div>
          <textarea
            className="scratchpad-input"
            placeholder="Type symptoms in natural language... (e.g., 'grinding sound from front wheels when braking from 40 km/h, pedal sinks slightly')"
            rows={4}
            value={symptomInput}
            onChange={e => setSymptomInput(e.target.value)}
          />
        </div>

        <div className="card-footer-actions">
          <button
            className="coded-primary-btn"
            onClick={() => handleStartAnalysis()}
            disabled={!symptomInput.trim() || loading}
          >
            {loading ? 'RUNNING_DIAGNOSTIC_PIPELINE...' : 'RUN_ANALYSIS ↵'}
          </button>
          {(currentAssessment || isConsultationActive) && (
            <button className="coded-ghost-btn" onClick={handleResetConsultation}>
              RESET_SESSION [esc]
            </button>
          )}
        </div>
      </div>

      {/* Step 2: Context-Aware Discriminating Follow-Ups */}
      {isConsultationActive && followUps.length > 0 && (
        <div className="note-card followup-section">
          <div className="card-section-header">
            <span className="section-index alert">02</span>
            <div>
              <h3>Discriminating Test Questionnaire</h3>
              <p className="section-desc">Answer key questions to eliminate confounding failure modes:</p>
            </div>
          </div>

          <div className="followup-questions-container">
            {followUps.map((q, qIdx) => {
              const currentVal = followUpAnswers[q.id]
              return (
                <div key={q.id} className="coded-question-block">
                  <div className="q-header-row">
                    <span className="q-badge">TEST #{qIdx + 1} // {q.targetSystem}</span>
                    <h4 className="q-title">{q.question}</h4>
                  </div>
                  <p className="q-context-callout">
                    <span className="callout-icon">ℹ</span>
                    {q.context}
                  </p>

                  <div className="coded-options-grid">
                    {q.options.map((opt, optIdx) => (
                      <button
                        key={opt.value}
                        className={`coded-option-chip ${currentVal === opt.value ? 'selected' : ''}`}
                        onClick={() => handleAnswerFollowUp(q.id, opt.value)}
                      >
                        <div className="opt-key-badge">[{optIdx + 1}]</div>
                        <div className="opt-text-wrap">
                          <span className="opt-label">{opt.label}</span>
                          {opt.hint && <span className="opt-sub">{opt.hint}</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="card-footer-actions right">
            <button
              className="coded-primary-btn large"
              onClick={() => executeDiagnosis(symptomInput, followUpAnswers)}
              disabled={loading}
            >
              {loading ? 'COMPILING_LEDGER...' : 'GENERATE_DIAGNOSTIC_REPORT ↵'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Completed Technical Assessment Ledger */}
      {currentAssessment && !isConsultationActive && (
        <div className="note-card report-dossier-section">
          {/* Critical Hazard Alert Callout */}
          {currentAssessment.safety.requiresImmediateStop && (
            <div className="hazard-callout-block">
              <div className="hazard-callout-header">
                <span className="hazard-symbol">⚡</span>
                <div className="hazard-title-wrap">
                  <span className="hazard-code-label">HAZARD_DIRECTIVE // CRITICAL_STOP_MANDATE</span>
                  <h4>{currentAssessment.safety.matches.map(m => m.hazardName).join(' + ')}</h4>
                </div>
              </div>

              <div className="hazard-instruction-box">
                <p className="hazard-instruction-text">{currentAssessment.safety.summaryWarning}</p>
              </div>

              <div className="hazard-checklist-grid">
                <div className="checklist-col">
                  <span className="col-title">[!] MANDATORY ACTION CHECKLIST:</span>
                  <ul>
                    {currentAssessment.safety.emergencyChecklist.map((item, idx) => (
                      <li key={idx}><span className="bullet">■</span> {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="checklist-col danger">
                  <span className="col-title">[✕] STRICTLY PROHIBITED ACTIONS:</span>
                  <ul>
                    {currentAssessment.safety.matches.flatMap(m => m.prohibitedActions).map((prohibited, idx) => (
                      <li key={'p_' + idx}><span className="bullet">✕</span> {prohibited}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Assessment Report Header */}
          <div className="report-entry-header">
            <div className="entry-identity">
              <span className="entry-tag">LEDGER_ID #{currentAssessment.id}</span>
              <h3 className="entry-heading">Automotive Technical Finding</h3>
              <blockquote className="entry-quote">
                "{currentAssessment.symptomSummary}"
              </blockquote>
            </div>

            <div className={`coded-urgency-stamp ${currentAssessment.safety.overallSeverity.toLowerCase()}`}>
              <span className="stamp-label">RISK_RATING</span>
              <span className="stamp-value">{currentAssessment.safety.overallSeverity.replace('_', ' ')}</span>
            </div>
          </div>

          {/* Diff explanation banner if updated */}
          {currentAssessment.whatChangedExplanation && (
            <div className="diff-callout-block">
              <span className="diff-pill">DIFF_APPLIED</span>
              <span className="diff-text">{currentAssessment.whatChangedExplanation}</span>
            </div>
          )}

          {/* Potential Causes Table / Cards */}
          <div className="ledger-section">
            <div className="section-row-between">
              <h4 className="section-title">
                <span className="section-sym">§</span> Ranked Mechanical Hypotheses ({currentAssessment.potentialCauses.length})
              </h4>
              <button className="coded-link-btn" onClick={onOpenEvidenceExplorer}>
                [↗ OPEN_EVIDENCE_EXPLORER]
              </button>
            </div>

            <div className="causes-ledger-list">
              {currentAssessment.potentialCauses.map((cause, idx) => (
                <div key={cause.id} className="cause-ledger-entry">
                  <div className="cause-entry-top">
                    <div className="cause-num-title">
                      <span className="cause-index">0{idx + 1}</span>
                      <span className="cause-system-tag">[{cause.systemCategory.toUpperCase()}]</span>
                      <h5 className="cause-name">{cause.name}</h5>
                    </div>
                    <span className={`cause-confidence-pill ${cause.probability.toLowerCase()}`}>
                      {cause.probability.toUpperCase()} // PROBABILITY
                    </span>
                  </div>

                  <p className="cause-body">{cause.reasoning}</p>

                  <div className="cause-quick-evidence">
                    <span className="ev-badge plus">
                      <span className="ev-sign">+</span> {cause.evidence.supporting[0]}
                    </span>
                    <span className="ev-badge test">
                      <span className="ev-sign">?</span> NEXT_TEST: {cause.evidence.discriminatingTest}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Indian Aftermarket Cost Ledger */}
          <div className="ledger-section">
            <h4 className="section-title">
              <span className="section-sym">₹</span> Financial Repair Estimate // Indian Aftermarket
            </h4>

            <div className="cost-ledger-table">
              <div className="cost-ledger-row header">
                <span>LINE_ITEM</span>
                <span>ESTIMATED_MIN (₹)</span>
                <span>ESTIMATED_MAX (₹)</span>
              </div>
              <div className="cost-ledger-row">
                <span className="row-item">01. Replacement Hardware & OEM Components</span>
                <span className="mono">₹{currentAssessment.costEstimate.partsMinINR.toLocaleString('en-IN')}</span>
                <span className="mono">₹{currentAssessment.costEstimate.partsMaxINR.toLocaleString('en-IN')}</span>
              </div>
              <div className="cost-ledger-row">
                <span className="row-item">02. Workshop Diagnostic & Mechanical Labor</span>
                <span className="mono">₹{currentAssessment.costEstimate.laborMinINR.toLocaleString('en-IN')}</span>
                <span className="mono">₹{currentAssessment.costEstimate.laborMaxINR.toLocaleString('en-IN')}</span>
              </div>
              <div className="cost-ledger-row total">
                <span className="row-item">TOTAL ESTIMATED EXPENDITURE</span>
                <span className="mono total">₹{currentAssessment.costEstimate.totalMinINR.toLocaleString('en-IN')}</span>
                <span className="mono total">₹{currentAssessment.costEstimate.totalMaxINR.toLocaleString('en-IN')}</span>
              </div>

              <div className="cost-ledger-footer">
                <span className="bench-tag">CONFIDENCE: {currentAssessment.costEstimate.confidence.toUpperCase()}</span>
                <span className="bench-notes">{currentAssessment.costEstimate.assumptions}</span>
              </div>
            </div>
          </div>

          {/* Inspection Protocols */}
          <div className="inspection-ledger-grid">
            <div className="inspection-card user">
              <span className="card-sub-header">[USER_INSPECTION_CHECKLIST // NO TOOLS]</span>
              <ul>
                {currentAssessment.potentialCauses.map((c, i) => (
                  <li key={i}>
                    <span className="check-box">[✓]</span>
                    <span className="check-text"><strong>{c.name}:</strong> {c.safeUserInspection}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="inspection-card mechanic">
              <span className="card-sub-header">[WORKSHOP_VERIFICATION_SPEC // TECH ONLY]</span>
              <ul>
                {currentAssessment.potentialCauses.flatMap(c => c.professionalMechanicSteps).slice(0, 4).map((step, i) => (
                  <li key={i}>
                    <span className="check-box">[⚙]</span>
                    <span className="check-text">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Limitations */}
          <div className="limitations-callout">
            <span className="lim-header">// MODEL_LIMITATIONS & SCIENTIFIC_UNCERTAINTY:</span>
            <ul>
              {currentAssessment.limitations.map((lim, idx) => (
                <li key={idx}>• {lim}</li>
              ))}
            </ul>
          </div>

          {/* Interactive Note Scratchpad / Consultation Thread */}
          <div className="interactive-scratchpad-block">
            <div className="scratchpad-header">
              <span className="terminal-prompt">$</span>
              <h4>Interactive Consultation Scratchpad</h4>
            </div>
            <p className="scratchpad-sub">
              Ask clarifying questions, request simplified explanations, or type newly observed symptoms to update this case:
            </p>

            {chatMessages.length > 0 && (
              <div className="chat-thread-container">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`chat-line ${msg.role}`}>
                    <span className="line-prefix">{msg.role === 'user' ? 'USER >' : 'MECH >'}</span>
                    <span className="line-content">{msg.text}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="scratchpad-input-row">
              <input
                type="text"
                className="coded-text-input"
                placeholder="Type query or newly emerged symptom... (e.g. 'Also noticed burning smell from front left')"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSendChatMessage()
                }}
                disabled={chatLoading}
              />
              <button
                className="coded-send-btn"
                onClick={handleSendChatMessage}
                disabled={!chatInput.trim() || chatLoading}
              >
                {chatLoading ? 'QUERYING...' : 'SEND ↵'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
