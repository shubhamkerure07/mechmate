import React, { useState } from 'react'
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { TokenState, signInCustomer, signOutCustomer } from '../services/tokenService'
import { ZarionButton } from './common/ZarionButton'

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
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const isAlreadySignedIn = tokenState.tier === 'REGISTERED' && tokenState.user

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.')
      return
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.')
      return
    }

    setIsLoading(true)

    try {
      const res = signInCustomer(email, name || undefined)
      if (res.success) {
        onTokenStateChange(res.state)
        onClose()
      } else {
        setErrorMsg('Authentication failed. Please verify credentials.')
      }
    } catch {
      setErrorMsg('Network error. Please try again.')
    } finally {
      setIsLoading(false)
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
            <div className="auth-brand-badge">
              <Zap size={18} className="text-blue" />
            </div>
            <div>
              <h3 className="auth-title">
                {isAlreadySignedIn
                  ? 'Account Overview'
                  : mode === 'signin'
                  ? 'Sign In to MechMate'
                  : 'Create Driver Account'}
              </h3>
              <p className="auth-subtitle">
                {isAlreadySignedIn
                  ? '25 Daily Diagnostic Tokens Unlocked'
                  : 'Unlock 25 free daily diagnostic consultations'}
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        {isAlreadySignedIn ? (
          <div className="auth-profile-view">
            <div className="profile-identity-card">
              <div className="profile-avatar">
                <User size={22} />
              </div>
              <div className="profile-meta">
                <h4 className="profile-name">{tokenState.user?.name}</h4>
                <span className="profile-email">{tokenState.user?.email}</span>
                <span className="profile-tier-tag">REGISTERED CUSTOMER</span>
              </div>
            </div>

            <div className="quota-status-card">
              <div className="quota-row">
                <span className="quota-label">Daily Diagnostic Tokens</span>
                <span className="quota-value">
                  <strong>{tokenState.remainingTokens}</strong> / {tokenState.maxTokens}
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
                ⚡ Resets automatically every 24 hours at 00:00 local time.
              </span>
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
                <span>Privacy & Token Policy</span>
              </button>
              <ZarionButton
                variant="danger"
                size="sm"
                onClick={handleSignOut}
                showArrow={false}
              >
                Sign Out
              </ZarionButton>
            </div>
          </div>
        ) : (
          <div className="auth-flow-container">
            <div className="auth-tabs-row">
              <button
                type="button"
                className={`auth-tab-btn ${mode === 'signin' ? 'active' : ''}`}
                onClick={() => {
                  setMode('signin')
                  setErrorMsg('')
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`auth-tab-btn ${mode === 'signup' ? 'active' : ''}`}
                onClick={() => {
                  setMode('signup')
                  setErrorMsg('')
                }}
              >
                Create Account
              </button>
            </div>

            {errorMsg && (
              <div className="auth-error-banner">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form-body">
              {mode === 'signup' && (
                <div className="form-group">
                  <label>Full Name</label>
                  <div className="input-with-icon">
                    <User size={16} className="input-icon" />
                    <input
                      type="text"
                      placeholder="e.g. Shubham Kerure"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-icon" />
                  <input
                    type="email"
                    placeholder="driver@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-perks-box">
                <div className="perk-row">
                  <CheckCircle2 size={14} className="text-success" />
                  <span>25 free AI diagnoses / day (vs 5 anonymous)</span>
                </div>
                <div className="perk-row">
                  <CheckCircle2 size={14} className="text-success" />
                  <span>Zero trackers, zero database, 100% private</span>
                </div>
              </div>

              <div className="modal-actions">
                <ZarionButton
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  showArrow={false}
                >
                  Cancel
                </ZarionButton>
                <ZarionButton
                  type="submit"
                  variant="blue"
                  disabled={isLoading}
                  icon={<ArrowRight size={16} />}
                >
                  {isLoading
                    ? 'Authenticating...'
                    : mode === 'signin'
                    ? 'Sign In to Account'
                    : 'Create Free Account'}
                </ZarionButton>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
