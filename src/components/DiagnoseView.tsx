import React, { useState } from 'react'
import {
  DiagnosticAssessment,
  FollowUpQuestion,
  VehicleProfile
} from '../types/automotive'
import { getRecommendedFollowUps } from '../services/followUpQuestions'
import { runDiagnosticEngine } from '../services/diagnosticEngine'
import { sendMessage } from '../services/gemini'
import { evaluateSafetyRules } from '../services/safetyEngine'
import { TokenState } from '../services/tokenService'
import {
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  HelpCircle,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  Send,
  Car,
  Disc,
  BatteryCharging,
  Thermometer,
  Zap,
  Wind,
  Gauge,
  Wrench,
  ShieldCheck,
  UserCheck
} from 'lucide-react'

interface DiagnoseViewProps {
  activeVehicle: VehicleProfile | null
  currentAssessment: DiagnosticAssessment | null
  tokenState: TokenState
  onConsumeToken: () => boolean
  onOpenAuth: () => void
  onOpenPrivacyPolicy: () => void
  onAssessmentCompleted: (assessment: DiagnosticAssessment) => void
  onOpenEvidenceExplorer: () => void
  onOpenGarage: () => void
}

const SYMPTOM_PRESETS = [
  {
    icon: Disc,
    label: 'Brakes grinding',
    symptom: 'My brakes make a loud metal grinding noise when I slow down, and stopping distance feels longer.'
  },
  {
    icon: BatteryCharging,
    label: 'Morning no-start',
    symptom: 'The car refuses to crank in the morning. When I turn the key there is a rapid clicking sound.'
  },
  {
    icon: Thermometer,
    label: 'Engine overheating',
    symptom: 'Engine temperature gauge rises into the red zone after 15 minutes of driving in traffic.'
  },
  {
    icon: Zap,
    label: 'Check engine & misfire',
    symptom: 'Check Engine light is illuminated and the car shudders and hesitates when accelerating.'
  },
  {
    icon: Wind,
    label: 'White exhaust smoke',
    symptom: 'I see thick white smoke with a sweet smell coming from the exhaust tailpipe.'
  },
  {
    icon: Gauge,
    label: 'Clutch slipping',
    symptom: 'Engine revs climb high when climbing inclines but the car barely speeds up.'
  }
]

export const DiagnoseView: React.FC<DiagnoseViewProps> = ({
  activeVehicle,
  currentAssessment,
  tokenState,
  onConsumeToken,
  onOpenAuth,
  onOpenPrivacyPolicy,
  onAssessmentCompleted,
  onOpenEvidenceExplorer,
  onOpenGarage
}) => {
  const [symptomInput, setSymptomInput] = useState('')
  const [followUps, setFollowUps] = useState<FollowUpQuestion[]>([])
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [isConsultationActive, setIsConsultationActive] = useState(false)
  const [tokenExhaustedWarning, setTokenExhaustedWarning] = useState(false)

  // Interactive follow-up Q&A chat
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  const handleStartAnalysis = (symptomText?: string) => {
    const text = (symptomText || symptomInput).trim()
    if (!text) return

    setSymptomInput(text)
    setTokenExhaustedWarning(false)

    // Token Quota Verification
    if (tokenState.remainingTokens <= 0) {
      // Deterministic Roadside Safety Triage Exemption:
      // Critical hazards like brakes, overheating, oil pressure are ALWAYS FREE!
      const safety = evaluateSafetyRules(text)
      if (safety.requiresImmediateStop) {
        executeFreeSafetyDirective(text, safety)
        return
      }

      // Non-critical: prompt customer to sign in to unlock 25 tokens
      setTokenExhaustedWarning(true)
      onOpenAuth()
      return
    }

    const questions = getRecommendedFollowUps(text)
    setFollowUps(questions)
    setFollowUpAnswers({})
    setIsConsultationActive(true)

    // Direct execution if no follow-ups needed
    if (questions.length === 0) {
      executeDiagnosis(text, {})
    }
  }

  const executeFreeSafetyDirective = (text: string, safety: ReturnType<typeof evaluateSafetyRules>) => {
    const safetyAssessment: DiagnosticAssessment = {
      id: 'diag_safety_exempt_' + Date.now(),
      vehicle: activeVehicle,
      timestamp: new Date().toISOString(),
      rawInput: text,
      symptomSummary: 'EMERGENCY SAFETY DIRECTIVE: ' + text,
      safety,
      potentialCauses: [
        {
          id: 'safety_override_exempt',
          name: safety.matches[0]?.hazardName || 'Imminent Mechanical Hazard',
          systemCategory: 'Brakes',
          probability: 'Likely',
          reasoning: safety.summaryWarning,
          evidence: {
            supporting: ['Roadside hazard criteria confirmed by deterministic mechatronic safety triage.'],
            contradicting: [],
            missingInfo: ['Requires on-site certified mechanic inspection.'],
            discriminatingTest: 'Immediate vehicle shutdown and roadside assistance.'
          },
          safeUserInspection: 'Stop immediately in a safe location, switch off the engine, and exit the traffic lane.',
          professionalMechanicSteps: ['Inspect hydraulic brake lines, calipers, or coolant loops before restarting.'],
          professionalInspectionRequired: true
        }
      ],
      costEstimate: {
        partsMinINR: 1500,
        partsMaxINR: 15000,
        laborMinINR: 800,
        laborMaxINR: 4000,
        totalMinINR: 2300,
        totalMaxINR: 19000,
        confidence: 'indicative_range',
        assumptions: 'Critical safety triage is 100% free under MechMate Customer Safety Policy.',
        dataSource: 'Deterministic Safety Engine',
        lastUpdated: 'October 2026'
      },
      limitations: [
        'Safety exemption applied: This emergency directive was generated without consuming daily tokens because critical roadside safety is never paywalled.'
      ],
      confidenceScoreText: 'Deterministic High Severity Rule Match (100% Deterministic Safety Engine)',
      providerOrigin: 'deterministic_engine'
    }

    onAssessmentCompleted(safetyAssessment)
    setIsConsultationActive(false)
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
    // If not a re-evaluation and tokens are empty, verify token quota
    if (!prevAssessment) {
      if (tokenState.remainingTokens <= 0) {
        const safety = evaluateSafetyRules(textToAnalyze)
        if (safety.requiresImmediateStop) {
          executeFreeSafetyDirective(textToAnalyze, safety)
          return
        }
        setTokenExhaustedWarning(true)
        onOpenAuth()
        return
      }

      // Deduct token
      const consumed = onConsumeToken()
      if (!consumed) {
        setTokenExhaustedWarning(true)
        onOpenAuth()
        return
      }
    }

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

    const isNewSymptom =
      text.toLowerCase().includes('also') ||
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
          text: `Diagnostic model updated with: "${text}". See adjusted causes and safety directives above.`
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
          text: 'Advisory offline engine active. Refer to the structured report above for verified inspection steps.'
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
    setTokenExhaustedWarning(false)
  }

  return (
    <div className="view-layout">
      {/* Hero Welcome & Vehicle Target Bar */}
      <div className="diagnose-hero-header">
        <div className="hero-text-block">
          <div className="hero-badge">
            <Sparkles size={13} className="hero-badge-icon" />
            <span>AI Automotive Intelligence</span>
          </div>
          <h1 className="hero-title">What is your vehicle experiencing?</h1>
          <p className="hero-subtitle">
            Describe symptoms in your own words. MechMate investigates probable causes, evaluates roadside safety urgency,
            and calculates realistic repair costs in ₹.
          </p>
        </div>

        {/* Target Vehicle Banner */}
        <div className="active-vehicle-card-banner">
          <div className="av-left">
            <div className="av-icon-wrap">
              <Car size={18} />
            </div>
            <div>
              <span className="av-label">Calibrated Target Vehicle</span>
              <div className="av-name">
                {activeVehicle ? (
                  <strong>{activeVehicle.year} {activeVehicle.make} {activeVehicle.model}</strong>
                ) : (
                  <span className="generic-title">Generic Unspecified Vehicle</span>
                )}
              </div>
            </div>
          </div>
          <div className="av-right">
            {activeVehicle ? (
              <>
                <span className="av-chip">{activeVehicle.fuelType}</span>
                <span className="av-chip">{activeVehicle.transmission}</span>
                <span className="av-chip">{activeVehicle.odometerKm.toLocaleString('en-IN')} km</span>
                <button className="av-change-btn" onClick={onOpenGarage}>Change</button>
              </>
            ) : (
              <button className="av-add-btn" onClick={onOpenGarage}>+ Select Car in Garage</button>
            )}
          </div>
        </div>

        {/* Customer Daily Token Allowance Banner */}
        <div className="token-status-strip">
          <div className="token-strip-left">
            <Zap size={15} className="token-bolt" />
            <span>
              Daily Diagnostic Allowance:{' '}
              <strong>{tokenState.remainingTokens}</strong> / {tokenState.maxTokens} Tokens Remaining
            </span>
            <span className="token-tier-pill">{tokenState.tier}</span>
          </div>
          <div className="token-strip-right">
            {tokenState.tier === 'ANONYMOUS' ? (
              <button className="token-upgrade-link" onClick={onOpenAuth}>
                <UserCheck size={13} />
                <span>Sign in for 25 tokens/day</span>
              </button>
            ) : (
              <span className="token-reset-text">Resets at 00:00 local time</span>
            )}
            <button className="token-policy-link" onClick={onOpenPrivacyPolicy}>
              Policy
            </button>
          </div>
        </div>
      </div>

      {/* Token Limit Exceeded Notification Banner */}
      {tokenExhaustedWarning && (
        <div className="token-exhausted-card animate-fade-in">
          <div className="exhausted-header">
            <AlertTriangle size={20} className="text-warning" />
            <div>
              <h4>Daily Free Diagnostic Allowance Reached ({tokenState.maxTokens}/{tokenState.maxTokens} Used)</h4>
              <p>
                Anonymous drivers receive 5 free comprehensive consultations every 24 hours.
                Sign in with your email to unlock <strong>25 daily diagnostic consultations</strong> immediately at zero cost.
              </p>
            </div>
          </div>
          <div className="exhausted-actions">
            <button className="btn-primary" onClick={onOpenAuth}>
              <Zap size={15} />
              <span>Sign In to Unlock 25 Tokens</span>
            </button>
            <button className="btn-secondary" onClick={onOpenPrivacyPolicy}>
              <ShieldCheck size={15} />
              <span>Review Privacy & Token Policy</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Intake Card */}
      <div className="intake-surface-card">
        <div className="intake-card-top">
          <span className="intake-step-indicator">STEP 1</span>
          <h2 className="intake-card-title">Describe Problem or Report Symptoms</h2>
        </div>

        {/* Quick Symptom Chips */}
        <div className="presets-scroll-row">
          {SYMPTOM_PRESETS.map((preset, idx) => {
            const Icon = preset.icon
            return (
              <button
                key={idx}
                className="preset-chip-btn"
                onClick={() => handleStartAnalysis(preset.symptom)}
              >
                <Icon size={14} className="preset-chip-icon" />
                <span>{preset.label}</span>
              </button>
            )
          })}
        </div>

        {/* Textarea Input Box */}
        <div className="prompt-input-wrapper">
          <textarea
            className="prompt-textarea"
            placeholder="e.g. My car makes a metallic grinding noise when braking at low speeds, and the brake pedal feels a bit soft..."
            rows={3}
            value={symptomInput}
            onChange={e => setSymptomInput(e.target.value)}
          />

          <div className="prompt-bottom-bar">
            <span className="prompt-hint">
              Natural language symptom processing · 1 token per full diagnosis · Roadside safety triage is always free
            </span>
            <div className="prompt-actions">
              {(currentAssessment || isConsultationActive) && (
                <button className="btn-secondary" onClick={handleResetConsultation}>
                  <RotateCcw size={14} />
                  <span>Start Fresh</span>
                </button>
              )}
              <button
                className="btn-primary"
                onClick={() => handleStartAnalysis()}
                disabled={!symptomInput.trim() || loading}
              >
                <span>{loading ? 'Analyzing...' : 'Diagnose Symptoms'}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Context-Aware Follow-Up Questions */}
      {isConsultationActive && followUps.length > 0 && (
        <div className="followup-surface-card animate-fade-in">
          <div className="followup-card-header">
            <div className="step-badge">STEP 2 OF 2</div>
            <h3>Targeted Discriminating Checks</h3>
            <p>Our diagnostic engine identified key follow-up questions to isolate the root mechanical cause:</p>
          </div>

          <div className="questions-grid">
            {followUps.map((q, idx) => {
              const currentVal = followUpAnswers[q.id]
              return (
                <div key={q.id} className="question-card">
                  <div className="question-header">
                    <span className="q-tag">{q.targetSystem} System</span>
                    <h4 className="q-title">Q{idx + 1}. {q.question}</h4>
                  </div>
                  <p className="q-desc">{q.context}</p>

                  <div className="options-stack">
                    {q.options.map(opt => (
                      <button
                        key={opt.value}
                        className={`option-tile ${currentVal === opt.value ? 'selected' : ''}`}
                        onClick={() => handleAnswerFollowUp(q.id, opt.value)}
                      >
                        <div className="option-tile-check">
                          <CheckCircle2 size={16} />
                        </div>
                        <div className="option-tile-body">
                          <span className="option-tile-label">{opt.label}</span>
                          {opt.hint && <span className="option-tile-hint">{opt.hint}</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="followup-footer">
            <button
              className="btn-primary large"
              onClick={() => executeDiagnosis(symptomInput, followUpAnswers)}
              disabled={loading}
            >
              <span>{loading ? 'Compiling Comprehensive Assessment...' : 'Generate Diagnostic Report'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Diagnostic Report View */}
      {currentAssessment && !isConsultationActive && (
        <div className="report-container animate-fade-in">
          {/* Critical Safety Hazard Banner */}
          {currentAssessment.safety.requiresImmediateStop && (
            <div className="safety-hazard-banner">
              <div className="hazard-top">
                <div className="hazard-icon-circle">
                  <ShieldAlert size={26} />
                </div>
                <div>
                  <div className="hazard-kicker">CRITICAL ROADSIDE SAFETY HAZARD</div>
                  <h3 className="hazard-headline">
                    {currentAssessment.safety.matches.map(m => m.hazardName).join(' · ')}
                  </h3>
                </div>
              </div>

              <div className="hazard-action-card">
                <span className="action-tag">MANDATORY IMMEDIATE DIRECTIVE</span>
                <p className="action-text">{currentAssessment.safety.summaryWarning}</p>
              </div>

              <div className="hazard-split-checklist">
                <div className="hazard-list-col">
                  <span className="list-col-header">EMERGENCY CHECKLIST:</span>
                  <ul>
                    {currentAssessment.safety.emergencyChecklist.map((item, idx) => (
                      <li key={idx}>
                        <AlertTriangle size={14} className="icon-warn" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="hazard-list-col danger">
                  <span className="list-col-header">STRICTLY PROHIBITED ACTIONS:</span>
                  <ul>
                    {currentAssessment.safety.matches.flatMap(m => m.prohibitedActions).map((prohibited, idx) => (
                      <li key={'p_' + idx}>
                        <span className="prohibited-x">✕</span>
                        <span>{prohibited}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Report Top Meta Card */}
          <div className="report-summary-card">
            <div className="report-summary-left">
              <div className="report-id-row">
                <span className="id-badge">Report #{currentAssessment.id.slice(-6)}</span>
                <span className="date-badge">
                  {new Date(currentAssessment.timestamp).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <span className="origin-badge">{currentAssessment.providerOrigin.replace('_', ' ')}</span>
              </div>
              <h2 className="report-heading">Automotive Diagnostic Assessment</h2>
              <p className="reported-symptom-quote">"{currentAssessment.symptomSummary}"</p>
            </div>

            <div className={`urgency-pill ${currentAssessment.safety.overallSeverity.toLowerCase()}`}>
              <span className="urgency-label">SAFETY URGENCY</span>
              <span className="urgency-val">{currentAssessment.safety.overallSeverity.replace('_', ' ')}</span>
            </div>
          </div>

          {/* What Changed Banner */}
          {currentAssessment.whatChangedExplanation && (
            <div className="what-changed-pill-banner">
              <Sparkles size={16} className="sparkle-accent" />
              <span>
                <strong>Updated Assessment:</strong> {currentAssessment.whatChangedExplanation}
              </span>
            </div>
          )}

          {/* Probable Root Causes */}
          <div className="report-block">
            <div className="block-header-between">
              <div>
                <h3 className="block-title">Probable Root Causes ({currentAssessment.potentialCauses.length})</h3>
                <p className="block-desc">Ranked hypotheses derived from mechatronic fault models and reported symptoms:</p>
              </div>
              <button className="btn-secondary small" onClick={onOpenEvidenceExplorer}>
                <span>Inspect Evidence Explorer</span>
                <ExternalLink size={13} />
              </button>
            </div>

            <div className="causes-cards-stack">
              {currentAssessment.potentialCauses.map((cause, idx) => (
                <div key={cause.id} className="cause-card">
                  <div className="cause-card-top">
                    <div className="cause-ident">
                      <span className="cause-num">0{idx + 1}</span>
                      <span className="cause-cat-badge">{cause.systemCategory}</span>
                      <h4 className="cause-title">{cause.name}</h4>
                    </div>
                    <span className={`cause-prob-badge ${cause.probability.toLowerCase()}`}>
                      <span className="prob-dot" />
                      {cause.probability} Cause
                    </span>
                  </div>

                  <p className="cause-reasoning-text">{cause.reasoning}</p>

                  <div className="cause-evidence-chips">
                    <div className="ev-chip supporting">
                      <CheckCircle2 size={13} />
                      <span>{cause.evidence.supporting[0]}</span>
                    </div>
                    <div className="ev-chip test">
                      <HelpCircle size={13} />
                      <span><strong>Next Test:</strong> {cause.evidence.discriminatingTest}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Localized Indian Cost Estimator */}
          <div className="report-block">
            <div className="block-header-between">
              <div>
                <h3 className="block-title">Transparent Repair Cost Breakdown (Indian Market)</h3>
                <p className="block-desc">Calculated for standard aftermarket and OEM replacement parts in Indian cities:</p>
              </div>
              <span className="confidence-tag">{currentAssessment.costEstimate.confidence.replace('_', ' ')}</span>
            </div>

            <div className="cost-metrics-grid">
              <div className="cost-metric-card">
                <span className="cm-label">Estimated Parts</span>
                <div className="cm-val">
                  ₹{currentAssessment.costEstimate.partsMinINR.toLocaleString('en-IN')} – ₹{currentAssessment.costEstimate.partsMaxINR.toLocaleString('en-IN')}
                </div>
                <span className="cm-sub">OEM / Aftermarket Replacement</span>
              </div>

              <div className="cost-metric-card">
                <span className="cm-label">Estimated Labor</span>
                <div className="cm-val">
                  ₹{currentAssessment.costEstimate.laborMinINR.toLocaleString('en-IN')} – ₹{currentAssessment.costEstimate.laborMaxINR.toLocaleString('en-IN')}
                </div>
                <span className="cm-sub">Workshop Diagnostic & Fitting</span>
              </div>

              <div className="cost-metric-card total">
                <span className="cm-label">Total Estimated Range</span>
                <div className="cm-val total">
                  ₹{currentAssessment.costEstimate.totalMinINR.toLocaleString('en-IN')} – ₹{currentAssessment.costEstimate.totalMaxINR.toLocaleString('en-IN')}
                </div>
                <span className="cm-sub">Taxes & Consumables Included</span>
              </div>
            </div>

            <div className="cost-assumptions-strip">
              <span>{currentAssessment.costEstimate.assumptions}</span>
              <span className="source-label">Source: {currentAssessment.costEstimate.dataSource}</span>
            </div>
          </div>

          {/* Safe DIY vs Workshop Split */}
          <div className="inspection-double-grid">
            <div className="inspection-panel user-diy">
              <div className="ip-header">
                <CheckCircle2 size={16} className="ip-icon user" />
                <h4>Safe DIY Checkpoints (No Tools)</h4>
              </div>
              <ul className="ip-list">
                {currentAssessment.potentialCauses.map((c, i) => (
                  <li key={i}>
                    <strong>{c.name}:</strong> {c.safeUserInspection}
                  </li>
                ))}
              </ul>
            </div>

            <div className="inspection-panel workshop-tech">
              <div className="ip-header">
                <Wrench size={16} className="ip-icon tech" />
                <h4>Certified Workshop Procedures</h4>
              </div>
              <ul className="ip-list">
                {currentAssessment.potentialCauses.flatMap(c => c.professionalMechanicSteps).slice(0, 4).map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Scientific Limitations & Uncertainty */}
          <div className="limitations-surface">
            <h4>Assessment Limitations & Scientific Uncertainty</h4>
            <ul>
              {currentAssessment.limitations.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>

          {/* Interactive Clarification Scratchpad */}
          <div className="interactive-qa-surface">
            <div className="qa-header">
              <Sparkles size={16} className="qa-sparkle-icon" />
              <div>
                <h4>Have questions about this assessment?</h4>
                <p>Ask for simpler explanations, inquire about specific components, or report another symptom:</p>
              </div>
            </div>

            {chatMessages.length > 0 && (
              <div className="chat-thread-box">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`chat-bubble ${msg.role}`}>
                    <span className="chat-sender">{msg.role === 'user' ? 'You' : 'MechMate'}</span>
                    <p>{msg.text}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="qa-input-wrapper">
              <input
                type="text"
                className="qa-text-input"
                placeholder="Ask a clarifying question or report a newly observed symptom..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSendChatMessage()
                }}
                disabled={chatLoading}
              />
              <button
                className="qa-send-btn"
                onClick={handleSendChatMessage}
                disabled={!chatInput.trim() || chatLoading}
              >
                <Send size={15} />
                <span>{chatLoading ? 'Consulting...' : 'Ask'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
