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
      a.download = `mechmate_garage_backup_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setFeedback({ type: 'success', message: 'Garage records exported to JSON successfully.' })
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
    if (confirm('Are you sure you want to delete all saved vehicles, diagnostic reports, and maintenance records? This cannot be undone.')) {
      clearStorageForTesting()
      onDataReset()
      setFeedback({ type: 'success', message: 'All local vehicle records cleared.' })
    }
  }

  return (
    <div className="view-container">
      <div className="view-header">
        <div className="view-title">
          <div className="view-badge">DATA GOVERNANCE & PRIVACY</div>
          <h2>Settings & Architecture Transparency</h2>
          <p>
            Control your local vehicle data, export offline backups, and inspect MechMate's
            zero-cost, privacy-first engineering architecture.
          </p>
        </div>
      </div>

      {feedback && (
        <div className={`feedback-alert ${feedback.type}`}>
          {feedback.type === 'success' ? '✓' : '⚠️'} {feedback.message}
        </div>
      )}

      <div className="settings-grid">
        {/* Privacy Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="card-icon">🛡️</span>
            <h3>Privacy & Data Sovereignty</h3>
          </div>
          <p>
            MechMate is engineered with a strict <strong>local-first privacy architecture</strong>.
            Your vehicles, odometer readings, maintenance histories, and diagnostic inquiries are stored
            strictly on your client device using browser storage.
          </p>
          <ul className="settings-feature-list">
            <li>✓ No external database tracking or user profiling.</li>
            <li>✓ No marketing analytics or third-party cookies.</li>
            <li>✓ Serverless API proxy routes requests securely without logging sensitive vehicle VINs.</li>
            <li>✓ 100% offline operational mode available at all times.</li>
          </ul>
        </div>

        {/* Operating Cost Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="card-icon">⚡</span>
            <h3>Free-First Operating Model</h3>
          </div>
          <p>
            Designed to demonstrate sustainable software engineering with zero mandatory monthly operational subscriptions:
          </p>
          <ul className="settings-feature-list">
            <li>• <strong>Deterministic Mechatronic Engine</strong>: 0 API calls, 0 cost, instant offline evaluation.</li>
            <li>• <strong>Vercel Serverless Gateway</strong>: Operates entirely within Vercel's generous free tier.</li>
            <li>• <strong>AI Cloud Acceleration</strong>: Uses Google Gemini free-tier quota with automatic rate limiting.</li>
            <li>• <strong>Local-First Storage</strong>: Zero database hosting fees.</li>
          </ul>
        </div>

        {/* Backup & Export */}
        <div className="settings-card full-width">
          <div className="settings-card-header">
            <span className="card-icon">💾</span>
            <h3>Backup, Export & Restore</h3>
          </div>
          <p>
            Export your entire garage, diagnostic consults, and service logs as a standard portable JSON document.
          </p>

          <div className="export-actions">
            <button className="primary-btn" onClick={handleExport}>
              📥 Download JSON Backup
            </button>
            <button className="danger-btn" onClick={handleClearAll}>
              🗑️ Clear Local Storage
            </button>
          </div>

          <div className="import-box">
            <h4>Restore from JSON Backup</h4>
            <textarea
              className="import-textarea"
              placeholder="Paste exported MechMate JSON backup here..."
              rows={4}
              value={importJsonText}
              onChange={e => setImportJsonText(e.target.value)}
            />
            <button
              className="secondary-btn"
              onClick={handleImport}
              disabled={!importJsonText.trim()}
            >
              Restore Data
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
