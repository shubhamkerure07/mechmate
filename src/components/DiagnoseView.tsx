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
import { ZarionButton } from './common/ZarionButton'
import { RedFlagModal } from './RedFlagModal'
import { CockpitHUD } from './CockpitHUD'
import { MechanicSummaryModal } from './MechanicSummaryModal'
import {
  AlertTriangle,
  AlertOctagon,
  Sparkles,
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
  UserCheck,
  ChevronDown,
  ChevronUp,
  Share2,
  Mic,
  Camera,
  Check
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

// Track 1: Sensory Symptoms (What you see, hear, or feel)
const SENSORY_PRESETS = [
  {
    icon: Wind,
    label: 'I see smoke or steam',
    symptom: 'I see thick smoke or steam coming from under the hood and tailpipe with a pungent smell.'
  },
  {
    icon: Disc,
    label: 'I hear loud grinding',
    symptom: 'My vehicle makes a severe metal-on-metal grinding noise when slowing down or turning.'
  },
  {
    icon: BatteryCharging,
    label: 'Car will not start',
    symptom: 'The starter clicks rapidly or engine turns over very slowly, refusing to fire up.'
  },
  {
    icon: Zap,
    label: 'Vehicle shudders / shakes',
    symptom: 'The car violently hesitates and shudders under acceleration, check engine light is flashing.'
  }
]

// Track 2: Component Systems (Targeted subsystem hunch)
const COMPONENT_PRESETS = [
  {
    icon: Disc,
    label: 'Braking Subsystem',
    symptom: 'Investigating brake pedal sponginess, increased stopping distance, and brake vibration.'
  },
  {
    icon: Thermometer,
    label: 'Cooling / Radiator',
    symptom: 'Engine temperature gauge spikes near redline in traffic; potential coolant loss.'
  },
  {
    icon: Gauge,
    label: 'Transmission & Clutch',
    symptom: 'Gear slippage, high RPM without acceleration, or harsh clunking between gear shifts.'
  },
  {
    icon: BatteryCharging,
    label: 'Battery & Alternator',
    symptom: 'Battery warning indicator on dashboard, dim headlights, and low electrical voltage.'
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
  const [entryTrack, setEntryTrack] = useState<'sensory' | 'component'>('sensory')
  const [symptomInput, setSymptomInput] = useState('')
  const [followUps, setFollowUps] = useState<FollowUpQuestion[]>([])
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [isConsultationActive, setIsConsultationActive] = useState(false)
  const [tokenExhaustedWarning, setTokenExhaustedWarning] = useState(false)

  // Red Flag Modal State
  const [isRedFlagOpen, setIsRedFlagOpen] = useState(false)
  const [redFlagData, setRedFlagData] = useState<{
    matches: any[]
    summaryWarning: string
    emergencyChecklist: string[]
  } | null>(null)

  // Progressive Disclosure State
  const [showFullDetails, setShowFullDetails] = useState(false)

  // Plain Language Mode Toggle
  const [plainLanguage, setPlainLanguage] = useState(true)

  // Mechanic Summary Sheet Modal
  const [isMechanicModalOpen, setIsMechanicModalOpen] = useState(false)

  // Simulated Voice / Multi-modal attachments
  const [attachedEvidence, setAttachedEvidence] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState(false)

  // Interactive follow-up Q&A chat
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  const handleStartAnalysis = (symptomText?: string) => {
    const text = (symptomText || symptomInput).trim()
    if (!text) return

    setSymptomInput(text)
    setTokenExhaustedWarning(false)

    // Requirement 5: Immediate Red Flag Override Interruption
    const safety = evaluateSafetyRules(text)
    if (safety.requiresImmediateStop) {
      setRedFlagData({
        matches: safety.matches,
        summaryWarning: safety.summaryWarning,
        emergencyChecklist: safety.emergencyChecklist
      })
      setIsRedFlagOpen(true)
      executeFreeSafetyDirective(text, safety)
      return
    }

    // Token Quota Verification
    if (tokenState.remainingTokens <= 0) {
      setTokenExhaustedWarning(true)
      onOpenAuth()
      return
    }

    const questions = getRecommendedFollowUps(text)
    setFollowUps(questions)
    setFollowUpAnswers({})
    setIsConsultationActive(true)

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
    if (!prevAssessment) {
      if (tokenState.remainingTokens <= 0) {
        const safety = evaluateSafetyRules(textToAnalyze)
        if (!safety.requiresImmediateStop) {
          setTokenExhaustedWarning(true)
          onOpenAuth()
          return
        }
      } else {
        onConsumeToken()
      }
    }

    setLoading(true)
    try {
      const assessment = await runDiagnosticEngine({
        symptoms: textToAnalyze,
        vehicle: activeVehicle,
        followUpAnswers: answers,
        previousAssessment: prevAssessment
      })
      onAssessmentCompleted(assessment)
      setIsConsultationActive(false)
      setShowFullDetails(false)
      setChatMessages([])
    } catch (err) {
      console.error('Diagnosis execution error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSimulateVoice = () => {
    setIsRecording(true)
    setTimeout(() => {
      setIsRecording(false)
      setSymptomInput('Engine makes a loud pinging sound and feels sluggish when climbing hills')
      setAttachedEvidence(prev => [...prev, 'Audio clip attached (3.4s sound profile)'])
    }, 1500)
  }

  const handleSimulateCamera = () => {
    setAttachedEvidence(prev => [...prev, 'Dashboard indicator photo attached'])
  }

  const handleSendChatMessage = async () => {
    const text = chatInput.trim()
    if (!text || chatLoading) return

    const newMessages = [...chatMessages, { role: 'user' as const, text }]
    setChatMessages(newMessages)
    setChatInput('')
    setChatLoading(true)

    try {
      const reply = await sendMessage(text)
      setChatMessages(prev => [...prev, { role: 'assistant', text: reply }])
    } catch {
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
    setShowFullDetails(false)
    setAttachedEvidence([])
  }

  const primaryCause = currentAssessment?.potentialCauses[0]

  return (
    <div className="view-layout">
      {/* Red Flag Interruption Modal */}
      {redFlagData && (
        <RedFlagModal
          isOpen={isRedFlagOpen}
          matches={redFlagData.matches}
          summaryWarning={redFlagData.summaryWarning}
          emergencyChecklist={redFlagData.emergencyChecklist}
          onAcknowledgeSafetyDirective={() => setIsRedFlagOpen(false)}
        />
      )}

      {/* Mechanic Hand-off Printable Summary Modal */}
      {currentAssessment && (
        <MechanicSummaryModal
          isOpen={isMechanicModalOpen}
          onClose={() => setIsMechanicModalOpen(false)}
          assessment={currentAssessment}
        />
      )}

      {/* Hero Header */}
      <div className="diagnose-hero-header">
        <div className="hero-text-block">
          <div className="hero-badge">
            <Sparkles size={13} className="hero-badge-icon" />
            <span>AI Automotive Intelligence</span>
          </div>
          <h1 className="hero-title">Automotive Diagnostic & Triage</h1>
          <p className="hero-subtitle">
            Describe symptoms or choose a vehicle subsystem. MechMate isolates root mechanical faults,
            enforces roadside safety directives, and benchmarks repair fair costs in ₹.
          </p>
        </div>

        {/* Target Vehicle Banner */}
        <div className="active-vehicle-card-banner">
          <div className="av-left">
            <div className="av-icon-wrap">
              <Car size={18} />
            </div>
            <div>
              <span className="av-label">Target Vehicle</span>
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

        {/* Token Allowance Strip */}
        <div className="token-status-strip">
          <div className="token-strip-left">
            <Zap size={15} className="token-bolt" />
            <span>
              Diagnostic Allowance:{' '}
              <strong>{tokenState.remainingTokens}</strong> / {tokenState.maxTokens} Tokens
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
              <span className="token-reset-text">Resets 00:00 local time</span>
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
                Anonymous drivers receive 5 free consultations every 24 hours.
                Sign in with your email to unlock <strong>25 daily diagnostic consultations</strong> immediately at zero cost.
              </p>
            </div>
          </div>
          <div className="exhausted-actions">
            <ZarionButton variant="blue" onClick={onOpenAuth} icon={<Zap size={15} />}>
              Sign In to Unlock 25 Tokens
            </ZarionButton>
            <ZarionButton variant="secondary" onClick={onOpenPrivacyPolicy} showArrow={false}>
              Review Privacy & Token Policy
            </ZarionButton>
          </div>
        </div>
      )}

      {/* Cockpit Two-Column Split View (Intake + Live Vitals HUD) */}
      <div className="cockpit-split-layout">
        <div className="cockpit-main-column">
          {/* Main Intake Card */}
          <div className="intake-surface-card">
            <div className="intake-card-top flex-between">
              <div>
                <span className="intake-step-indicator">STEP 1</span>
                <h2 className="intake-card-title">How would you like to start?</h2>
              </div>

              {/* Requirement 1: Dual-Track Onboarding Toggle */}
              <div className="dual-track-toggle" role="tablist">
                <button
                  type="button"
                  className={`track-tab-btn ${entryTrack === 'sensory' ? 'active' : ''}`}
                  onClick={() => setEntryTrack('sensory')}
                >
                  Sensory Symptoms ("I hear/see")
                </button>
                <button
                  type="button"
                  className={`track-tab-btn ${entryTrack === 'component' ? 'active' : ''}`}
                  onClick={() => setEntryTrack('component')}
                >
                  Component System ("Brakes/Engine")
                </button>
              </div>
            </div>

            {/* Flat Standardized Vector Icon Chips */}
            <div className="presets-scroll-row">
              {(entryTrack === 'sensory' ? SENSORY_PRESETS : COMPONENT_PRESETS).map((preset, idx) => {
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

            {/* Input Textarea & Voice/Camera Controls */}
            <div className="prompt-input-wrapper">
              <textarea
                className="prompt-textarea"
                placeholder={
                  entryTrack === 'sensory'
                    ? "Describe what you hear, see, or smell (e.g., 'A loud metallic grinding noise when I tap the brake pedal at low speeds')..."
                    : "Describe the component behavior (e.g., 'Clutch slips during third gear acceleration uphill')..."
                }
                rows={3}
                value={symptomInput}
                onChange={e => setSymptomInput(e.target.value)}
              />

              {/* Evidence Attachments Badges */}
              {attachedEvidence.length > 0 && (
                <div className="evidence-tags-row">
                  {attachedEvidence.map((ev, i) => (
                    <span key={i} className="evidence-pill-tag">
                      <Check size={12} /> {ev}
                    </span>
                  ))}
                </div>
              )}

              <div className="prompt-bottom-bar">
                <div className="prompt-media-actions">
                  <button
                    type="button"
                    className={`media-input-btn ${isRecording ? 'recording' : ''}`}
                    onClick={handleSimulateVoice}
                    title="Voice input (hands-free roadside mode)"
                  >
                    <Mic size={15} />
                    <span>{isRecording ? 'Listening...' : 'Voice Input'}</span>
                  </button>
                  <button
                    type="button"
                    className="media-input-btn"
                    onClick={handleSimulateCamera}
                    title="Attach dashboard warning light photo"
                  >
                    <Camera size={15} />
                    <span>Attach Photo</span>
                  </button>
                </div>

                <div className="prompt-actions">
                  {(currentAssessment || isConsultationActive) && (
                    <ZarionButton
                      variant="secondary"
                      onClick={handleResetConsultation}
                      icon={<RotateCcw size={14} />}
                      showArrow={false}
                    >
                      Start Fresh
                    </ZarionButton>
                  )}
                  <ZarionButton
                    variant="blue"
                    onClick={() => handleStartAnalysis()}
                    disabled={!symptomInput.trim() || loading}
                  >
                    {loading ? 'Analyzing...' : 'Diagnose Symptoms'}
                  </ZarionButton>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Discriminating Follow-Up Questions with Quick-Reply Chips */}
          {isConsultationActive && followUps.length > 0 && (
            <div className="followup-surface-card animate-fade-in">
              <div className="followup-card-header">
                <div className="step-badge">STEP 2 OF 2</div>
                <h3>Targeted Discriminating Checks</h3>
                <p>Tap a quick-reply chip to narrow down the mechanical cause:</p>
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

                      <div className="quick-chips-stack">
                        {q.options.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            className={`quick-reply-chip ${currentVal === opt.value ? 'selected' : ''}`}
                            onClick={() => handleAnswerFollowUp(q.id, opt.value)}
                          >
                            <span className="chip-label">{opt.label}</span>
                            {opt.hint && <span className="chip-hint">{opt.hint}</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="followup-footer">
                <ZarionButton
                  variant="blue"
                  size="lg"
                  onClick={() => executeDiagnosis(symptomInput, followUpAnswers)}
                  disabled={loading}
                >
                  {loading ? 'Compiling Assessment...' : 'Generate Diagnostic Report'}
                </ZarionButton>
              </div>
            </div>
          )}
        </div>

        {/* Live Cockpit Vitals HUD */}
        <CockpitHUD
          rpm={850}
          coolantTemp={92}
          batteryVoltage={14.1}
          activeDtc={currentAssessment ? 'P0300' : null}
          vehicleName={activeVehicle ? `${activeVehicle.make} ${activeVehicle.model}` : 'Generic Vehicle'}
        />
      </div>

      {/* Result Screen with Progressive Disclosure & F-Pattern Reading */}
      {currentAssessment && !isConsultationActive && (
        <div className="report-container animate-fade-in">
          {/* Top-Level Controls: Plain Language Toggle & Mechanic Summary */}
          <div className="result-controls-bar flex-between">
            <div className="plain-lang-toggle-wrap">
              <span className="toggle-label">Mode:</span>
              <button
                type="button"
                className={`plain-btn ${plainLanguage ? 'active' : ''}`}
                onClick={() => setPlainLanguage(true)}
              >
                Plain Language (Driver)
              </button>
              <button
                type="button"
                className={`plain-btn ${!plainLanguage ? 'active' : ''}`}
                onClick={() => setPlainLanguage(false)}
              >
                Technical / OBD
              </button>
            </div>

            <ZarionButton
              variant="secondary"
              size="sm"
              onClick={onOpenEvidenceExplorer}
              icon={<RotateCcw size={14} />}
              showArrow={false}
            >
              Inspect Evidence Explorer
            </ZarionButton>

            <ZarionButton
              variant="secondary"
              size="sm"
              onClick={() => setIsMechanicModalOpen(true)}
              icon={<Share2 size={14} />}
              showArrow={false}
            >
              Mechanic-Ready Summary
            </ZarionButton>
          </div>

          {/* Primary Result Card (F-Pattern: Urgency Top-Left, Primary Issue First) */}
          <div className="primary-result-fcard">
            <div className="fcard-header-row">
              {/* Top-Left Quadrant: Three-tier Redundant Urgency Encoding */}
              <div className={`urgency-badge-triad ${currentAssessment.safety.overallSeverity.toLowerCase()}`}>
                {currentAssessment.safety.requiresImmediateStop ? (
                  <AlertOctagon size={20} className="urgency-icon" />
                ) : currentAssessment.safety.overallSeverity === 'URGENT_INSPECT' ? (
                  <AlertTriangle size={20} className="urgency-icon" />
                ) : (
                  <CheckCircle2 size={20} className="urgency-icon" />
                )}
                <div>
                  <span className="triad-kicker">SAFETY URGENCY</span>
                  <span className="triad-label">
                    {currentAssessment.safety.requiresImmediateStop
                      ? 'STOP DRIVING'
                      : currentAssessment.safety.overallSeverity === 'URGENT_INSPECT'
                      ? 'DRIVE CAREFULLY TO SHOP'
                      : 'MONITOR'}
                  </span>
                </div>
              </div>

              {/* Meta timestamp & ref */}
              <div className="report-ref-badge">
                <span>Ref #{currentAssessment.id.slice(-6)}</span>
                <span className="meta-sep">•</span>
                <span>{new Date(currentAssessment.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Primary Most Likely Issue */}
            <div className="fcard-main-finding">
              <span className="finding-eyebrow">MOST LIKELY CAUSE:</span>
              <h2 className="finding-title">
                {plainLanguage
                  ? primaryCause?.name === 'Worn Brake Pads / Rotor Scoring'
                    ? 'Worn brake pads grinding on the metal rotors'
                    : primaryCause?.name
                  : primaryCause?.name}
              </h2>
              <p className="finding-reasoning">
                {plainLanguage
                  ? primaryCause?.safeUserInspection
                  : primaryCause?.reasoning}
              </p>
            </div>

            {/* Immediate Recommended Fix */}
            <div className="fcard-immediate-fix">
              <div className="fix-header">
                <Wrench size={16} className="text-blue" />
                <strong>Immediate Action Required:</strong>
              </div>
              <p>{primaryCause?.safeUserInspection || 'Have the subsystem professionally inspected.'}</p>
            </div>

            {/* Requirement 7: Visible Evidence Trail Directly on Card */}
            <div className="evidence-trail-strip">
              <span className="trail-title">EVIDENCE TRAIL USED:</span>
              <div className="trail-chips-row">
                <span className="trail-chip">
                  <strong>Input:</strong> "{currentAssessment.symptomSummary.slice(0, 45)}..."
                </span>
                {primaryCause?.evidence.supporting.map((sup, idx) => (
                  <span key={idx} className="trail-chip supporting">
                    <CheckCircle2 size={12} /> {sup}
                  </span>
                ))}
                {attachedEvidence.map((att, idx) => (
                  <span key={'att_' + idx} className="trail-chip attachment">
                    📎 {att}
                  </span>
                ))}
              </div>
            </div>

            {/* Progressive Disclosure Toggle */}
            <div className="progressive-disclosure-footer">
              <button
                type="button"
                className="disclosure-toggle-btn"
                onClick={() => setShowFullDetails(prev => !prev)}
              >
                <span>
                  {showFullDetails
                    ? 'Hide Alternative Causes & Cost Breakdown'
                    : `Show More (${currentAssessment.potentialCauses.length - 1} alternative causes, fair price in ₹, diagnostic tests)`}
                </span>
                {showFullDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>

          {/* Expandable Section: Progressive Disclosure */}
          {showFullDetails && (
            <div className="extended-report-section animate-fade-in">
              {/* Alternative Causes */}
              {currentAssessment.potentialCauses.length > 1 && (
                <div className="report-block">
                  <h3 className="block-title">Alternative Differential Causes</h3>
                  <div className="causes-cards-stack">
                    {currentAssessment.potentialCauses.slice(1).map((cause, idx) => (
                      <div key={cause.id} className="cause-card">
                        <div className="cause-card-top">
                          <div className="cause-ident">
                            <span className="cause-num">0{idx + 2}</span>
                            <span className="cause-cat-badge">{cause.systemCategory}</span>
                            <h4 className="cause-title">{cause.name}</h4>
                          </div>
                          <span className={`cause-prob-badge ${cause.probability.toLowerCase()}`}>
                            {cause.probability} Probability
                          </span>
                        </div>
                        <p className="cause-reasoning-text">{cause.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Localized Indian Cost Estimator */}
              <div className="report-block">
                <div className="block-header-between">
                  <div>
                    <h3 className="block-title">Transparent Repair Cost Breakdown (India)</h3>
                    <p className="block-desc">Aftermarket and OEM replacement benchmark ranges in ₹:</p>
                  </div>
                  <span className="confidence-tag">{currentAssessment.costEstimate.confidence.replace('_', ' ')}</span>
                </div>

                <div className="cost-metrics-grid">
                  <div className="cost-metric-card">
                    <span className="cm-label">Estimated Parts</span>
                    <div className="cm-val">
                      ₹{currentAssessment.costEstimate.partsMinINR.toLocaleString('en-IN')} – ₹{currentAssessment.costEstimate.partsMaxINR.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="cost-metric-card">
                    <span className="cm-label">Estimated Labor</span>
                    <div className="cm-val">
                      ₹{currentAssessment.costEstimate.laborMinINR.toLocaleString('en-IN')} – ₹{currentAssessment.costEstimate.laborMaxINR.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="cost-metric-card total">
                    <span className="cm-label">Fair Total Range</span>
                    <div className="cm-val total">
                      ₹{currentAssessment.costEstimate.totalMinINR.toLocaleString('en-IN')} – ₹{currentAssessment.costEstimate.totalMaxINR.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Certified Workshop Checkpoints */}
              <div className="inspection-double-grid">
                <div className="inspection-panel user-diy">
                  <div className="ip-header">
                    <CheckCircle2 size={16} className="ip-icon user" />
                    <h4>Safe Driver Checks (No Tools)</h4>
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

              {/* Scientific Limitations */}
              <div className="limitations-surface">
                <h4>Assessment Limitations & Scientific Uncertainty</h4>
                <ul>
                  {currentAssessment.limitations.map((lim, idx) => (
                    <li key={idx}>{lim}</li>
                  ))}
                </ul>
              </div>

              {/* Interactive Q&A */}
              <div className="interactive-qa-surface">
                <div className="qa-header">
                  <Sparkles size={16} className="qa-sparkle-icon" />
                  <div>
                    <h4>Ask clarifying questions about this diagnosis</h4>
                    <p>Inquire about parts, safety risks, or report newly observed symptoms:</p>
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
                    placeholder="Ask a question or report a new symptom..."
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
      )}

      {/* Requirement 18: Persistent Non-Alarming Footer Disclaimer */}
      <div className="persistent-disclaimer-strip">
        <span>This is clinical decision support, not a confirmed mechanical inspection. Always consult a certified technician for safety-critical components.</span>
      </div>
    </div>
  )
}
