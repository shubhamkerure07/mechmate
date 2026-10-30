import React from 'react'
import { AlertOctagon, PhoneCall, Check } from 'lucide-react'
import { SafetyRuleMatch } from '../types/automotive'
import { ZarionButton } from './common/ZarionButton'

interface RedFlagModalProps {
  isOpen: boolean
  matches: SafetyRuleMatch[]
  summaryWarning: string
  emergencyChecklist: string[]
  onAcknowledgeSafetyDirective: () => void
}

export const RedFlagModal: React.FC<RedFlagModalProps> = ({
  isOpen,
  matches,
  summaryWarning,
  emergencyChecklist,
  onAcknowledgeSafetyDirective
}) => {
  if (!isOpen) return null

  const primaryMatch = matches[0]

  return (
    <div className="red-flag-backdrop" role="alertdialog" aria-modal="true">
      <div className="red-flag-modal">
        {/* Red Flag Alert Header */}
        <div className="red-flag-header">
          <div className="red-flag-icon-ring">
            <AlertOctagon size={36} className="text-danger-bright" />
          </div>
          <div>
            <span className="red-flag-kicker">CRITICAL ROADSIDE HAZARD DETECTED</span>
            <h2 className="red-flag-title">
              {primaryMatch?.hazardName || 'Imminent Safety Threat'}
            </h2>
          </div>
        </div>

        {/* Concrete Danger Explanation */}
        <div className="red-flag-danger-card">
          <h4>Concrete Danger to Life & Vehicle:</h4>
          <p>{summaryWarning}</p>
        </div>

        {/* Prohibited Actions */}
        {primaryMatch && primaryMatch.prohibitedActions.length > 0 && (
          <div className="red-flag-prohibited-box">
            <span className="prohibited-title">STRICTLY PROHIBITED:</span>
            <ul>
              {primaryMatch.prohibitedActions.map((act, i) => (
                <li key={i}>
                  <span className="prohibited-cross">✕</span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Immediate Safe Checklist */}
        <div className="red-flag-steps-box">
          <span className="steps-title">MANDATORY IMMEDIATE PROTOCOL:</span>
          <ol>
            {emergencyChecklist.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>

        {/* Non-Negotiable Primary Action */}
        <div className="red-flag-actions">
          <a
            href="tel:112"
            className="red-flag-call-btn"
            title="Call Emergency Roadside Assistance"
          >
            <PhoneCall size={18} />
            <span>Call Roadside Help / Emergency (112)</span>
          </a>

          <ZarionButton
            variant="danger"
            size="md"
            onClick={onAcknowledgeSafetyDirective}
            icon={<Check size={16} />}
            showArrow={false}
          >
            I Have Safely Pulled Over & Stopped
          </ZarionButton>
        </div>

        <p className="red-flag-disclaimer">
          MechMate safety triage enforces this stop directive to protect you from catastrophic brake, fire, or steering failure.
        </p>
      </div>
    </div>
  )
}
