import React, { useState } from 'react'
import {
  FileText,
  Copy,
  Check,
  Printer,
  ShieldAlert,
  AlertTriangle,
  Car
} from 'lucide-react'
import { DiagnosticAssessment } from '../types/automotive'
import { ZarionButton } from './common/ZarionButton'

interface MechanicSummaryModalProps {
  isOpen: boolean
  onClose: () => void
  assessment: DiagnosticAssessment
}

export const MechanicSummaryModal: React.FC<MechanicSummaryModalProps> = ({
  isOpen,
  onClose,
  assessment
}) => {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const primaryCause = assessment.potentialCauses[0]

  const summaryText = `--- MECHMATE WORKSHOP DIAGNOSTIC HANDOFF ---
Vehicle: ${assessment.vehicle ? `${assessment.vehicle.year} ${assessment.vehicle.make} ${assessment.vehicle.model} (${assessment.vehicle.odometerKm} km)` : 'Unspecified'}
Report ID: #${assessment.id.slice(-6)}
Timestamp: ${new Date(assessment.timestamp).toLocaleString('en-IN')}

Reported Symptoms:
"${assessment.symptomSummary}"

Safety Urgency: ${assessment.safety.overallSeverity.replace('_', ' ')}
${assessment.safety.requiresImmediateStop ? 'CRITICAL DIRECTIVE: Vehicle requires tow / immediate roadside shutdown.' : 'Vehicle driveable with caution.'}

Suspected Primary Root Cause:
- ${primaryCause?.name || 'Inconclusive'} (${primaryCause?.probability || 'Possible'} probability)
- Category: ${primaryCause?.systemCategory || 'General'}
- Key Evidence: ${primaryCause?.evidence.supporting.join('; ') || 'Standard symptom match'}
- Discriminating Test: ${primaryCause?.evidence.discriminatingTest || 'Physical inspection required'}

Recommended Workshop Procedure:
${primaryCause?.professionalMechanicSteps.map(s => `- ${s}`).join('\n') || '- Inspect relevant subsystem'}

Estimated Indian Market Fair Price Range:
₹${assessment.costEstimate.totalMinINR.toLocaleString('en-IN')} – ₹${assessment.costEstimate.totalMaxINR.toLocaleString('en-IN')} (Parts + Labor)

Disclaimer: Decision-support tool for informed customer-mechanic discussion.
--------------------------------------------`

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card mechanic-summary-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="summary-icon-wrap">
              <FileText size={20} className="text-blue" />
            </div>
            <div>
              <h3>Mechanic-Ready Workshop Summary</h3>
              <p className="modal-subtitle">Present this standardized diagnostic sheet to your technician</p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close dialog">
            ✕
          </button>
        </div>

        <div className="summary-print-container">
          {/* Header block */}
          <div className="print-header-row">
            <div>
              <span className="print-brand">MECHMATE CLINICAL TRIAGE</span>
              <div className="print-veh-title">
                <Car size={16} />
                <span>
                  {assessment.vehicle
                    ? `${assessment.vehicle.year} ${assessment.vehicle.make} ${assessment.vehicle.model} · ${assessment.vehicle.odometerKm.toLocaleString('en-IN')} km`
                    : 'Generic Automotive Profile'}
                </span>
              </div>
            </div>
            <div className="print-meta-right">
              <span className="print-report-id">Ref #{assessment.id.slice(-6)}</span>
              <span className="print-date">{new Date(assessment.timestamp).toLocaleDateString('en-IN')}</span>
            </div>
          </div>

          {/* Urgency Strip */}
          <div className={`print-urgency-strip ${assessment.safety.overallSeverity.toLowerCase()}`}>
            {assessment.safety.requiresImmediateStop ? (
              <ShieldAlert size={18} />
            ) : (
              <AlertTriangle size={18} />
            )}
            <span><strong>Urgency Level:</strong> {assessment.safety.overallSeverity.replace('_', ' ')}</span>
          </div>

          {/* Driver Symptoms */}
          <div className="print-section">
            <span className="print-sec-label">DRIVER REPORTED SYMPTOM:</span>
            <p className="print-symptom-text">"{assessment.symptomSummary}"</p>
          </div>

          {/* Primary Cause */}
          <div className="print-section">
            <span className="print-sec-label">PRIMARY SUSPECTED COMPONENT:</span>
            <div className="print-cause-card">
              <div className="print-cause-name">
                <strong>{primaryCause?.name}</strong>
                <span className="print-cause-pill">{primaryCause?.probability} Likelihood</span>
              </div>
              <p className="print-cause-desc">{primaryCause?.reasoning}</p>
              <div className="print-rec-checks">
                <strong>Recommended Verification:</strong> {primaryCause?.evidence.discriminatingTest}
              </div>
            </div>
          </div>

          {/* Fair Cost Guidance */}
          <div className="print-section">
            <span className="print-sec-label">ESTIMATED REPAIR BENCHMARK (INDIA):</span>
            <div className="print-cost-line">
              <span>Fair Range: <strong>₹{assessment.costEstimate.totalMinINR.toLocaleString('en-IN')} – ₹{assessment.costEstimate.totalMaxINR.toLocaleString('en-IN')}</strong></span>
              <span className="print-sub-note">(Includes standard parts & labor)</span>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={handlePrint}>
            <Printer size={15} />
            <span>Print Sheet</span>
          </button>
          <ZarionButton
            variant="blue"
            onClick={handleCopy}
            icon={copied ? <Check size={16} /> : <Copy size={16} />}
            showArrow={false}
          >
            {copied ? 'Copied to Clipboard!' : 'Copy Workshop Text'}
          </ZarionButton>
        </div>
      </div>
    </div>
  )
}
