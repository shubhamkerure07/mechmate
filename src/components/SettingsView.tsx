import React, { useState } from 'react'
import { exportAllUserData, importUserData, clearStorageForTesting } from '../services/storageService'

interface SettingsViewProps {
  onDataReset: () => void
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onDataReset }) => {
  const [importJsonText, setImportJsonText] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleExport = () => {
    try {
      const dataStr = exportAllUserData()
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mechmate_vault_backup_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setFeedback({ type: 'success', message: 'Vault exported to JSON backup successfully.' })
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Export error: ${err?.message || err}` })
    }
  }

  const handleImport = () => {
    if (!importJsonText.trim()) {
      setFeedback({ type: 'error', message: 'Paste valid JSON data into the field before importing.' })
      return
    }
    const result = importUserData(importJsonText)
    if (result.success) {
      setFeedback({ type: 'success', message: result.message })
      setImportJsonText('')
      onDataReset()
    } else {
      setFeedback({ type: 'error', message: result.message })
    }
  }

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete all saved vehicles, diagnostic reports, and service records? This cannot be undone.')) {
      clearStorageForTesting()
      onDataReset()
      setFeedback({ type: 'success', message: 'Local storage vault wiped.' })
    }
  }

  return (
    <div className="view-container note-page-layout">
      {/* Dossier Header */}
      <div className="note-dossier-header">
        <div className="dossier-meta-strip">
          <span className="mono-badge">SPEC // SYSTEM_VAULT</span>
          <span className="meta-divider">/</span>
          <span className="mono-text">PRIVACY: LOCAL_FIRST</span>
          <span className="meta-divider">/</span>
          <span className="mono-text">OP_COST: $0.00_PER_MONTH</span>
        </div>

        <div className="dossier-title-group">
          <h2 className="dossier-title">System Architecture, Privacy Vault & Backup</h2>
          <p className="dossier-sub">
            Review MechMate's zero-cost engineering architecture, export offline JSON diagnostic records,
            and audit local-first security guarantees.
          </p>
        </div>
      </div>

      {feedback && (
        <div className={`feedback-callout ${feedback.type}`}>
          <span className="callout-symbol">{feedback.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="vault-sections-grid">
        {/* Privacy Manifesto */}
        <div className="note-card vault-card">
          <div className="card-section-header">
            <span className="section-index">01</span>
            <div>
              <h3>Privacy Architecture & Data Sovereignty</h3>
              <p className="section-desc">Zero telemetry, zero user tracking, client-encrypted local storage</p>
            </div>
          </div>
          <p className="vault-p">
            MechMate is engineered with a strict <strong>local-first privacy architecture</strong>.
            Your vehicles, odometer readings, maintenance histories, and diagnostic inquiries are stored
            strictly on your client device using browser storage.
          </p>
          <ul className="spec-bullet-list">
            <li><span className="check">[✓]</span> <strong>Zero Cloud Database Dependencies</strong>: No remote databases holding user vehicle logs or VINs.</li>
            <li><span className="check">[✓]</span> <strong>No Trackers or Marketing Cookies</strong>: Completely clean, zero-analytics client runtime.</li>
            <li><span className="check">[✓]</span> <strong>Stateless Serverless Proxy</strong>: <code>/api/diagnose</code> passes zero persistent user identifiers.</li>
            <li><span className="check">[✓]</span> <strong>100% Offline Resilience</strong>: Built-in deterministic mechatronics engine operates with zero network access.</li>
          </ul>
        </div>

        {/* Operating Cost Economics */}
        <div className="note-card vault-card">
          <div className="card-section-header">
            <span className="section-index">02</span>
            <div>
              <h3>Free-First Operating Model</h3>
              <p className="section-desc">Sustainable zero-cost economics for independent builder products</p>
            </div>
          </div>
          <p className="vault-p">
            Designed to demonstrate sustainable software engineering with zero mandatory monthly operational subscriptions:
          </p>
          <ul className="spec-bullet-list">
            <li><span className="tag">[DETERMINISTIC_ENGINE]</span> 0 API calls, 0 cost, instant offline evaluation.</li>
            <li><span className="tag">[VERCEL_SERVERLESS]</span> Operates entirely within Vercel's generous free tier.</li>
            <li><span className="tag">[GEMINI_FREE_TIER]</span> Optional cloud AI uses standard free quota with rate guards.</li>
            <li><span className="tag">[CLIENT_STORAGE]</span> LocalStorage eliminates monthly managed database hosting fees.</li>
          </ul>
        </div>

        {/* Backup, Export & Restore Vault */}
        <div className="note-card vault-card full-width">
          <div className="card-section-header">
            <span className="section-index">03</span>
            <div>
              <h3>Data Vault: Export & Import</h3>
              <p className="section-desc">Export your entire garage manifest, service milestones, and diagnostic ledgers as standard portable JSON</p>
            </div>
          </div>

          <div className="vault-actions-strip">
            <button className="coded-primary-btn" onClick={handleExport}>
              📥 EXPORT_VAULT_BACKUP [.JSON]
            </button>
            <button className="coded-danger-btn" onClick={handleClearAll}>
              🗑️ WIPE_LOCAL_STORAGE
            </button>
          </div>

          <div className="vault-import-box">
            <span className="import-box-label">// RESTORE_FROM_RAW_JSON_BACKUP:</span>
            <textarea
              className="vault-textarea"
              placeholder="Paste exported MechMate JSON backup here..."
              rows={4}
              value={importJsonText}
              onChange={e => setImportJsonText(e.target.value)}
            />
            <div className="import-actions">
              <button
                className="coded-secondary-btn"
                onClick={handleImport}
                disabled={!importJsonText.trim()}
              >
                APPLY_JSON_RESTORE ↵
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
