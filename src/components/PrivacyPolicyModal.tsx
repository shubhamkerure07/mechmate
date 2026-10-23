import React from 'react'
import {
  ShieldCheck,
  X,
  Lock,
  Zap,
  UserCheck,
  AlertTriangle,
  Database,
  FileText
} from 'lucide-react'

interface PrivacyPolicyModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenAuth: () => void
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  onOpenAuth
}) => {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card privacy-modal-card"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <ShieldCheck className="text-amber" size={22} />
            <div>
              <h3>Customer Privacy Policy & Token Terms</h3>
              <span className="privacy-effective-date">Effective: October 2026 · Version 2.0</span>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} title="Close Privacy Policy">
            <X size={18} />
          </button>
        </div>

        <div className="privacy-modal-body">
          {/* Section 1: Introduction */}
          <div className="privacy-section">
            <div className="privacy-sec-header">
              <FileText size={16} className="text-amber" />
              <h4>1. Overview & Commitment to Customer Privacy</h4>
            </div>
            <p>
              MechMate ("we", "our", or "platform"), engineered by Shubham Kerure, is an AI automotive intelligence platform
              built to assist drivers in diagnosing vehicle problems, understanding mechanical symptoms, and estimating fair repair expenses.
              We are strictly committed to customer data sovereignty and operate under a <strong>Local-First Architecture</strong>.
            </p>
          </div>

          {/* Section 2: Daily Token Policy & Limits */}
          <div className="privacy-section highlight">
            <div className="privacy-sec-header">
              <Zap size={16} className="text-amber" />
              <h4>2. Daily Diagnostic Token Quotas & Usage Policy</h4>
            </div>
            <p>
              To maintain sustainable zero-cost serverless operations and protect AI infrastructure from automated scraping,
              MechMate enforces fair daily diagnostic token allowances:
            </p>
            <ul className="privacy-bullet-list">
              <li>
                <strong>Anonymous Tier (Default):</strong> Every visitor receives <strong>5 free diagnostic assessments per calendar day</strong> with no sign-in required.
              </li>
              <li>
                <strong>Registered Customer Tier (Expanded):</strong> Customers who sign in with their email address immediately unlock <strong>25 diagnostic assessments per calendar day</strong> at zero cost.
              </li>
              <li>
                <strong>24-Hour Reset Cycle:</strong> Token quotas reset automatically every night at <strong>00:00 (Midnight)</strong> based on your local device clock.
              </li>
              <li>
                <strong className="text-success">Critical Safety Hazard Exemption:</strong> Roadside hazard detection (such as total brake failure, severe engine overheating, and oil pressure warnings) is <strong>NEVER blocked by token limits</strong>. Deterministic roadside safety directives are always 100% free and unconstrained.
              </li>
            </ul>
            <div className="privacy-cta-box">
              <span>Need more than 5 daily consultations?</span>
              <button
                className="btn-primary small"
                onClick={() => {
                  onClose()
                  onOpenAuth()
                }}
              >
                Sign In to Unlock 25 Tokens/Day
              </button>
            </div>
          </div>

          {/* Section 3: Sign-In Policy */}
          <div className="privacy-section">
            <div className="privacy-sec-header">
              <UserCheck size={16} className="text-amber" />
              <h4>3. Customer Sign-In & Authentication Policy</h4>
            </div>
            <p>
              When upgrading to the Registered Customer Tier:
            </p>
            <ul className="privacy-bullet-list">
              <li>
                <strong>Minimal Information:</strong> We only request your email address and preferred display name. No complex passwords, phone numbers, or social media logins are forced upon you.
              </li>
              <li>
                <strong>No Marketing Spam:</strong> Your email is strictly used to identify your customer session and allocate your 25 daily token quota. We do not sell, rent, or share your email with third-party marketers or data brokers.
              </li>
              <li>
                <strong>Client-Side Session Storage:</strong> Your active session is encrypted and maintained within your browser's private local vault. You may sign out at any time with a single click.
              </li>
            </ul>
          </div>

          {/* Section 4: Data Collection & Storage */}
          <div className="privacy-section">
            <div className="privacy-sec-header">
              <Lock size={16} className="text-amber" />
              <h4>4. Data Collection, Transmission & Local Storage</h4>
            </div>
            <p>
              MechMate collects only the data necessary to provide intelligent vehicle troubleshooting:
            </p>
            <ul className="privacy-bullet-list">
              <li>
                <strong>Vehicle Garage Information:</strong> Make, model, year, transmission, fuel type, and odometer readings are stored <strong>strictly on your device</strong> in browser localStorage. No central cloud database records your vehicle profiles.
              </li>
              <li>
                <strong>Diagnostic Inquiries:</strong> Symptoms you submit are transmitted statelessly over TLS encryption to our serverless diagnostic engine. Inquiries are processed transiently and are never linked to personal identities.
              </li>
              <li>
                <strong>Zero Ad Trackers:</strong> MechMate contains zero advertising trackers, zero Facebook/Google marketing pixels, and zero cross-site behavioral cookies.
              </li>
            </ul>
          </div>

          {/* Section 5: Automotive & Safety Disclaimer */}
          <div className="privacy-section warning">
            <div className="privacy-sec-header">
              <AlertTriangle size={16} className="text-warning" />
              <h4>5. Automotive Advisory & Liability Disclaimer</h4>
            </div>
            <p>
              MechMate is an automotive intelligence advisor and triage tool, <strong>not a certified licensed auto repair shop or replacement for a professional mechanic</strong>:
            </p>
            <ul className="privacy-bullet-list">
              <li>
                Diagnostic evaluations represent probabilistic mechanical hypotheses based on driver-reported symptoms and standard SAE trouble codes.
              </li>
              <li>
                Never drive an unsafe vehicle when critical roadside hazard warnings are active. Always confirm repair requirements with a qualified, certified automotive technician before purchasing parts or performing DIY repairs.
              </li>
              <li>
                Repair cost estimates in ₹ are calibrated for typical Indian market aftermarket and OEM averages; actual garage labor rates and replacement part expenses may vary by city and workshop tier.
              </li>
            </ul>
          </div>

          {/* Section 6: Right to Erasure */}
          <div className="privacy-section">
            <div className="privacy-sec-header">
              <Database size={16} className="text-amber" />
              <h4>6. Data Sovereignty & Right to Erasure</h4>
            </div>
            <p>
              You own your data completely. At any time via the <strong>Vault tab</strong>, you can:
            </p>
            <ul className="privacy-bullet-list">
              <li>Export your entire vehicle history, diagnostic reports, and service ledger as a portable JSON file.</li>
              <li>Instantly wipe all stored vehicles, service schedules, and token records by clicking <em>Wipe Local Storage</em>.</li>
            </ul>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
