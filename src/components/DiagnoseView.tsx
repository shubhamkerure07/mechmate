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

const SYMPTOM_PRESETS = [
  {
    icon: '🛑',
    label: 'Grinding or squeaking brakes',
    symptom: 'My brakes make a loud metal grinding noise when I slow down, and stopping distance feels longer.'
  },
  {
    icon: '🔋',
    label: 'Car won\'t start in morning',
    symptom: 'The car refuses to crank in the morning. When I turn the key there is a rapid clicking sound.'
  },
  {
    icon: '🌡️',
    label: 'Engine overheating in traffic',
    symptom: 'Engine temperature gauge rises into the red zone after 15 minutes of driving in traffic.'
  },
  {
    icon: '💡',
    label: 'Check engine light & jerking',
    symptom: 'Check Engine light is illuminated and the car shudders and hesitates when accelerating.'
  },
  {
    icon: '💨',
    label: 'Thick smoke from exhaust',
    symptom: 'I see thick white smoke with a sweet smell coming from the exhaust tailpipe.'
  },
  {
    icon: '⚙️',
    label: 'Clutch slipping on slopes',
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

    // Check if user is reporting a new symptom or asking for clarification
    const isNewSymptom = text.toLowerCase().includes('also') ||
      text.toLowerCase().includes('now') ||
      text.toLowerCase().includes('started') ||
      text.toLowerCase().includes('smell') ||
      text.toLowerCase().includes('noise')

    if (isNewSymptom && currentAssessment) {
      // Re-evaluate assessment with new symptom
      const combined = `${currentAssessment.rawInput}. Additionally: ${text}`
      await executeDiagnosis(combined, followUpAnswers, currentAssessment)
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `I have updated your diagnostic assessment considering: "${text}". Check the revised findings and safety alerts above.`
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
          text: 'Unable to reach advisory engine. Refer to the structured report above for verified inspection steps.'
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
    <div className="view-container">
      {/* Diagnostic Hero / Intake Section */}
      <div className="view-header">
        <div className="view-title">
          <div className="view-badge">STRUCTURED DIAGNOSTIC WORKFLOW</div>
          <h2>Intelligent Vehicle Troubleshooting</h2>
          <p>
            Describe vehicle symptoms in plain language. MechMate analyzes physical evidence,
            identifies mechanical causes across automotive systems, evaluates safety urgency, and calculates realistic repair costs in ₹.
          </p>
        </div>

        {/* Vehicle Selection Header Banner */}
        <div className="active-vehicle-bar">
          <span className="bar-label">Target Vehicle:</span>
          {activeVehicle ? (
            <div className="vehicle-info-tag">
              <span className="car-emoji">🚗</span>
              <strong>{activeVehicle.year} {activeVehicle.make} {activeVehicle.model}</strong>
              <span className="specs-pill">{activeVehicle.fuelType} · {activeVehicle.transmission}</span>
              <span className="specs-pill">{activeVehicle.odometerKm.toLocaleString('en-IN')} km</span>
              <button className="change-car-btn" onClick={onOpenGarage}>Change</button>
            </div>
          ) : (
            <div className="vehicle-info-tag generic">
              <span>⚠️ Generic Vehicle Mode</span>
              <button className="change-car-btn" onClick={onOpenGarage}>+ Select Vehicle</button>
            </div>
          )}
        </div>
      </div>

      {/* Progressive Step 1: Symptom Input & Presets */}
      <div className="intake-card">
        <h3>1. Report Vehicle Symptoms</h3>
        <p className="section-subtext">Type what you observe, hear, feel, or smell, or select a common symptom scenario below:</p>

        <div className="presets-grid">
          {SYMPTOM_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              className="preset-btn"
              onClick={() => handleStartAnalysis(preset.symptom)}
            >
              <span className="preset-icon">{preset.icon}</span>
              <span className="preset-text">{preset.label}</span>
            </button>
          ))}
        </div>

        <div className="symptom-input-area">
          <textarea
            className="symptom-textarea"
            placeholder="e.g., 'My car makes a loud metallic grinding sound when braking at low speeds, and the brake pedal feels a bit soft...'"
            rows={3}
            value={symptomInput}
            onChange={e => setSymptomInput(e.target.value)}
          />
          <div className="intake-actions">
            <button
              className="primary-btn"
              onClick={() => handleStartAnalysis()}
              disabled={!symptomInput.trim() || loading}
            >
              {loading ? 'Evaluating...' : '⚡ Analyze Symptoms & Begin Check'}
            </button>
            {(currentAssessment || isConsultationActive) && (
              <button className="secondary-btn" onClick={handleResetConsultation}>
                🔄 Start Fresh
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progressive Step 2: Context-Aware Follow-Up Questions */}
      {isConsultationActive && followUps.length > 0 && (
        <div className="followup-card">
          <div className="followup-header">
            <span className="step-tag">STEP 2 OF 2</span>
            <h3>Clarifying Follow-Up Questions</h3>
            <p>Our diagnostic engine identified targeted discriminating checks to narrow down root causes:</p>
          </div>

          <div className="questions-list">
            {followUps.map(q => {
              const currentVal = followUpAnswers[q.id]
              return (
                <div key={q.id} className="question-block">
                  <div className="question-title">
                    <span className="q-system-badge">{q.targetSystem}</span>
                    <h4>{q.question}</h4>
                  </div>
                  <p className="q-context">{q.context}</p>

                  <div className="options-grid">
                    {q.options.map(opt => (
                      <button
                        key={opt.value}
                        className={`option-btn ${currentVal === opt.value ? 'selected' : ''}`}
                        onClick={() => handleAnswerFollowUp(q.id, opt.value)}
                      >
                        <span className="option-label">{opt.label}</span>
                        {opt.hint && <span className="option-hint">{opt.hint}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="followup-actions">
            <button
              className="primary-btn large"
              onClick={() => executeDiagnosis(symptomInput, followUpAnswers)}
              disabled={loading}
            >
              {loading ? 'Compiling Comprehensive Assessment...' : '✓ Generate Diagnostic Report'}
            </button>
          </div>
        </div>
      )}

      {/* Progressive Step 3: Diagnostic Assessment Report */}
      {currentAssessment && !isConsultationActive && (
        <div className="report-card">
          {/* Critical Safety Alert Banner */}
          {currentAssessment.safety.requiresImmediateStop && (
            <div className="safety-alert-banner critical">
              <div className="safety-alert-header">
                <span className="safety-alert-icon">🚨</span>
                <div>
                  <h3>CRITICAL SAFETY HAZARD DETECTED</h3>
                  <p className="safety-rule-name">
                    {currentAssessment.safety.matches.map(m => m.hazardName).join(' · ')}
                  </p>
                </div>
              </div>
              <p className="safety-immediate-action">{currentAssessment.safety.summaryWarning}</p>

              <div className="safety-checklist">
                <h4>Mandatory Emergency Precaution Checklist:</h4>
                <ul>
                  {currentAssessment.safety.emergencyChecklist.map((item, idx) => (
                    <li key={idx}>⚠️ {item}</li>
                  ))}
                  {currentAssessment.safety.matches.flatMap(m => m.prohibitedActions).map((prohibited, idx) => (
                    <li key={'p_' + idx} className="prohibited">🚫 {prohibited}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Report Top Header */}
          <div className="report-header">
            <div>
              <div className="report-meta">
                <span>Assessment ID: #{currentAssessment.id.slice(-6)}</span>
                <span>•</span>
                <span>{new Date(currentAssessment.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                <span>•</span>
                <span className="provider-tag">{currentAssessment.providerOrigin.replace('_', ' ')}</span>
              </div>
              <h3 className="report-title">Automotive Diagnostic Assessment</h3>
              <p className="reported-summary">"{currentAssessment.symptomSummary}"</p>
            </div>

            <div className={`urgency-badge ${currentAssessment.safety.overallSeverity.toLowerCase()}`}>
              <span className="badge-title">URGENCY RATING</span>
              <span className="badge-value">{currentAssessment.safety.overallSeverity.replace('_', ' ')}</span>
            </div>
          </div>

          {/* What Changed Banner (if re-assessed) */}
          {currentAssessment.whatChangedExplanation && (
            <div className="what-changed-banner">
              <span className="info-icon">ℹ️</span>
              <span><strong>Updated Assessment:</strong> {currentAssessment.whatChangedExplanation}</span>
            </div>
          )}

          {/* Potential Causes Section */}
          <div className="report-section">
            <div className="section-title-row">
              <h4>Probable Root Causes ({currentAssessment.potentialCauses.length})</h4>
              <button className="link-action-btn" onClick={onOpenEvidenceExplorer}>
                Open Diagnostic Evidence Explorer ↗
              </button>
            </div>

            <div className="causes-list">
              {currentAssessment.potentialCauses.map(cause => (
                <div key={cause.id} className="cause-item">
                  <div className="cause-item-top">
                    <div className="cause-item-title">
                      <span className="cause-system">{cause.systemCategory}</span>
                      <h5>{cause.name}</h5>
                    </div>
                    <span className={`cause-prob-tag ${cause.probability.toLowerCase()}`}>
                      {cause.probability} Cause
                    </span>
                  </div>

                  <p className="cause-reasoning">{cause.reasoning}</p>

                  <div className="cause-evidence-summary">
                    <div className="evidence-pill supporting">
                      <span>✓</span> {cause.evidence.supporting[0]}
                    </div>
                    <div className="evidence-pill test">
                      <span>⚖</span> <strong>Next Test:</strong> {cause.evidence.discriminatingTest}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Localized Indian Cost Estimator */}
          <div className="report-section cost-section">
            <h4>💰 Transparent Repair Cost Estimate (Indian Market)</h4>
            <div className="cost-breakdown-card">
              <div className="cost-columns">
                <div className="cost-col">
                  <span className="cost-label">Estimated Parts</span>
                  <span className="cost-amount">₹{currentAssessment.costEstimate.partsMinINR.toLocaleString('en-IN')} – ₹{currentAssessment.costEstimate.partsMaxINR.toLocaleString('en-IN')}</span>
                </div>
                <span className="math-operator">+</span>
                <div className="cost-col">
                  <span className="cost-label">Estimated Labor</span>
                  <span className="cost-amount">₹{currentAssessment.costEstimate.laborMinINR.toLocaleString('en-IN')} – ₹{currentAssessment.costEstimate.laborMaxINR.toLocaleString('en-IN')}</span>
                </div>
                <span className="math-operator">=</span>
                <div className="cost-col total">
                  <span className="cost-label">Total Estimated Range</span>
                  <span className="cost-amount total">₹{currentAssessment.costEstimate.totalMinINR.toLocaleString('en-IN')} – ₹{currentAssessment.costEstimate.totalMaxINR.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="cost-footer">
                <span className="confidence-pill">{currentAssessment.costEstimate.confidence.replace('_', ' ')}</span>
                <span className="assumptions-text">{currentAssessment.costEstimate.assumptions}</span>
              </div>
            </div>
          </div>

          {/* Safe DIY vs Professional Workshop Checkpoints */}
          <div className="inspection-split-grid">
            <div className="inspection-panel user">
              <h4>👁️ What You Can Safely Check Yourself</h4>
              <ul>
                {currentAssessment.potentialCauses.map((c, i) => (
                  <li key={i}>
                    <strong>{c.name}:</strong> {c.safeUserInspection}
                  </li>
                ))}
              </ul>
            </div>

            <div className="inspection-panel mechanic">
              <h4>🔧 What Requires Workshop Equipment</h4>
              <ul>
                {currentAssessment.potentialCauses.flatMap(c => c.professionalMechanicSteps).slice(0, 4).map((step, i) => (
                  <li key={i}>• {step}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Limitations & Uncertainty Disclaimers */}
          <div className="limitations-box">
            <h4>ℹ️ Assessment Limitations & Scientific Uncertainty</h4>
            <ul>
              {currentAssessment.limitations.map((lim, idx) => (
                <li key={idx}>• {lim}</li>
              ))}
            </ul>
          </div>

          {/* Interactive Clarification & Follow-Up Bar */}
          <div className="interactive-qa-box">
            <h4>💬 Have Questions About This Report?</h4>
            <p className="qa-subtext">
              Ask for simpler explanations, inquire about specific components, or report an additional symptom to update this assessment:
            </p>

            {chatMessages.length > 0 && (
              <div className="mini-chat-thread">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`mini-message ${msg.role}`}>
                    <span className="role-avatar">{msg.role === 'user' ? 'You' : '🔧 MechMate'}</span>
                    <p>{msg.text}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="qa-input-row">
              <input
                type="text"
                className="qa-input"
                placeholder="Ask a clarifying question or report another symptom (e.g., 'Also noticed a burning smell')..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSendChatMessage()
                }}
                disabled={chatLoading}
              />
              <button
                className="primary-btn"
                onClick={handleSendChatMessage}
                disabled={!chatInput.trim() || chatLoading}
              >
                {chatLoading ? 'Consulting...' : 'Ask'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
