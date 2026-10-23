import React from 'react'
import { Zap, Lock, ExternalLink } from 'lucide-react'
import { TokenState } from '../services/tokenService'

interface FooterProps {
  tokenState: TokenState
  onOpenPrivacyPolicy: () => void
  onOpenAuth: () => void
}

export const Footer: React.FC<FooterProps> = ({
  tokenState,
  onOpenPrivacyPolicy,
  onOpenAuth
}) => {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-top-row">
          <div className="footer-brand-block">
            <div className="footer-logo-title">
              <span className="brand-name">MechMate</span>
              <span className="brand-badge">PROD</span>
            </div>
            <p className="footer-tagline">
              Production Automotive Intelligence Platform. Structured mechatronic troubleshooting,
              safety triage, and localized repair estimation.
            </p>
          </div>

          {/* Token & Privacy Status Badges */}
          <div className="footer-status-badges">
            <button
              className="footer-token-pill"
              onClick={onOpenAuth}
              title="Click to view token allowance or sign in"
            >
              <Zap size={14} className="text-amber" />
              <span>
                Daily Quota: <strong>{tokenState.remainingTokens}</strong>/{tokenState.maxTokens} Tokens
              </span>
              <span className="token-tier-sub">
                {tokenState.tier === 'REGISTERED' ? '(Registered)' : '(Free)'}
              </span>
            </button>

            <button
              className="footer-privacy-pill"
              onClick={onOpenPrivacyPolicy}
              title="Read Privacy Policy & Token Terms"
            >
              <Lock size={13} className="text-success" />
              <span>100% Local-First · Zero Database</span>
            </button>
          </div>
        </div>

        <div className="footer-bottom-row">
          <div className="footer-links">
            <button className="footer-link-btn" onClick={onOpenPrivacyPolicy}>
              Privacy Policy
            </button>
            <span className="footer-sep">•</span>
            <button className="footer-link-btn" onClick={onOpenPrivacyPolicy}>
              Daily Token & Sign-In Policy
            </button>
            <span className="footer-sep">•</span>
            <button className="footer-link-btn" onClick={onOpenAuth}>
              {tokenState.tier === 'REGISTERED' ? 'My Account' : 'Customer Sign In'}
            </button>
            <span className="footer-sep">•</span>
            <a
              href="https://github.com/shubhamkerure07/mechmate"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link-btn external"
            >
              <span>GitHub</span>
              <ExternalLink size={11} />
            </a>
          </div>

          <div className="footer-credit">
            <span>Built with precision by <strong>Shubham Kerure</strong></span>
            <span className="footer-sep">•</span>
            <span>Automotive Intelligence v2.0</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
