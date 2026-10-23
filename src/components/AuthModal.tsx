import React, { useState } from 'react'
import {
  User,
  Zap,
  CheckCircle2,
  X,
  Mail,
  ShieldCheck,
  LogOut,
  Sparkles
} from 'lucide-react'
import { TokenState, signInCustomer, signOutCustomer } from '../services/tokenService'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  tokenState: TokenState
  onTokenStateChange: (newState: TokenState) => void
  onOpenPrivacyPolicy: () => void
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  tokenState,
  onTokenStateChange,
  onOpenPrivacyPolicy
}) => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [agreedToPolicy, setAgreedToPolicy] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const isAlreadySignedIn = tokenState.tier === 'REGISTERED' && tokenState.user

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.')
      return
    }
    if (!agreedToPolicy) {
      setErrorMsg('Please accept the Privacy Policy & Token Terms to proceed.')
      return
    }

    const res = signInCustomer(email, name)
    if (res.success) {
      onTokenStateChange(res.state)
      setErrorMsg('')
      onClose()
    } else {
      setErrorMsg('Unable to sign in. Please verify your email format.')
    }
  }

  const handleSignOut = () => {
    const updated = signOutCustomer()
    onTokenStateChange(updated)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card auth-modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Zap className="text-amber" size={22} />
            <div>
              <h3>
                {isAlreadySignedIn
                  ? 'Customer Account & Quota'
                  : 'Upgrade Daily Diagnostic Tokens'}
              </h3>
              <span className="auth-sub-badge">
                {isAlreadySignedIn
                  ? 'Active Customer Tier: 25 Tokens/Day'
                  : 'Free Customer Sign-In Policy'}
              </span>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {isAlreadySignedIn ? (
          /* Signed In View */
          <div className="auth-profile-view">
            <div className="profile-identity-card">
              <div className="profile-avatar">
                <User size={24} />
              </div>
              <div>
                <h4 className="profile-name">{tokenState.user?.name}</h4>
                <span className="profile-email">{tokenState.user?.email}</span>
                <span className="profile-tier-tag">REGISTERED CUSTOMER</span>
              </div>
            </div>

            {/* Token Quota Progress */}
            <div className="quota-status-card">
              <div className="quota-row">
                <span className="quota-label">Daily Diagnostic Allowance:</span>
                <span className="quota-value">
                  <strong>{tokenState.remainingTokens}</strong> / {tokenState.maxTokens} remaining
                </span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill healthy"
                  style={{
                    width: `${Math.round((tokenState.remainingTokens / tokenState.maxTokens) * 100)}%`
                  }}
                />
              </div>
              <span className="quota-reset-note">
                ⚡ Quota resets automatically at 00:00 (Midnight) local time.
              </span>
            </div>

            <div className="customer-benefits-list">
              <div className="benefit-item">
                <CheckCircle2 size={16} className="text-success" />
                <span>25 comprehensive AI diagnostic consultations every day.</span>
              </div>
              <div className="benefit-item">
                <CheckCircle2 size={16} className="text-success" />
                <span>Zero-database local vault security for your vehicle data.</span>
              </div>
              <div className="benefit-item">
                <CheckCircle2 size={16} className="text-success" />
                <span>100% free forever — no subscriptions or credit cards required.</span>
              </div>
            </div>

            <div className="auth-footer-actions">
              <button
                type="button"
                className="btn-text-link"
                onClick={() => {
                  onClose()
                  onOpenPrivacyPolicy()
                }}
              >
                <ShieldCheck size={14} />
                <span>Review Privacy Policy</span>
              </button>

              <button className="btn-danger small" onClick={handleSignOut}>
                <LogOut size={14} />
                <span>Sign Out (Revert to 5/day)</span>
              </button>
            </div>
          </div>
        ) : (
          /* Sign In Form to unlock 25 tokens/day */
          <form onSubmit={handleSignIn} className="auth-signin-form">
            <div className="tier-comparison-banner">
              <div className="tier-col current">
                <span className="tier-tag">CURRENT TIER</span>
                <span className="tier-name">Anonymous</span>
                <span className="tier-tokens">5 Tokens / Day</span>
              </div>
              <div className="tier-arrow">➔</div>
              <div className="tier-col upgraded">
                <span className="tier-tag upgraded">CUSTOMER TIER</span>
                <span className="tier-name">Registered</span>
                <span className="tier-tokens upgraded">25 Tokens / Day</span>
              </div>
            </div>

            <p className="auth-form-description">
              Sign in with your email to unlock <strong>25 daily diagnostic consultations</strong>.
              We never spam, never sell your data, and operate strictly under our zero-tracker privacy policy.
            </p>

            {errorMsg && <div className="form-error-banner">{errorMsg}</div>}

            <div className="form-group">
              <label>Your Email Address *</label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  placeholder="driver@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label>Your Name / Driver Handle (Optional)</label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  placeholder="e.g. Alex Kerure"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="privacy-checkbox-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreedToPolicy}
                  onChange={e => setAgreedToPolicy(e.target.checked)}
                />
                <span>
                  I understand and accept the{' '}
                  <button
                    type="button"
                    className="inline-policy-link"
                    onClick={e => {
                      e.preventDefault()
                      onOpenPrivacyPolicy()
                    }}
                  >
                    Privacy Policy & Daily Token Terms
                  </button>
                </span>
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                <Sparkles size={16} />
                <span>Unlock 25 Free Daily Tokens</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
