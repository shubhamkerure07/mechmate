import React, { useState } from 'react'
import { exportAllUserData, importUserData, clearStorageForTesting } from '../services/storageService'
import {
  Database,
  ShieldCheck,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  Zap,
  Lock,
  RefreshCw,
  ServerOff
} from 'lucide-react'

interface SettingsViewProps {
  onDataReset: () => void
  onOpenPrivacyPolicy?: () => void
  onOpenAuth?: () => void
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onDataReset,
  onOpenPrivacyPolicy,
  onOpenAuth
}) => {
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
      setFeedback({ type: 'success', message: 'Vault exported to portable JSON backup successfully.' })
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Export error: ${err?.message || err}` })
    }
  }

  const handleImport = () => {
    if (!importJsonText.trim()) {
      setFeedback({ type: 'error', message: 'Please paste valid JSON data before attempting import.' })
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
    if (confirm('Are you sure you want to permanently erase all saved vehicles, diagnostic reports, and service logs? This cannot be undone.')) {
      clearStorageForTesting()
      onDataReset()
      setFeedback({ type: 'success', message: 'Local storage vault wiped clean.' })
    }
  }

  return (
    <div className="view-container">
      {/* View Header */}
      <div className="view-header">
        <div className="view-meta-pill">
          <Database className="meta-icon" size={13} />
          <span>System Vault & Privacy Architecture</span>
          <span className="meta-dot">•</span>
          <span>Zero-Cost Infrastructure</span>
        </div>

        <h1 className="view-title">Vault & Architecture</h1>
        <p className="view-subtitle">
          Audit MechMate's local-first privacy guarantees, zero cloud database footprint,
          and manage your portable JSON diagnostic backups.
        </p>
      </div>

      {feedback && (
        <div className={`feedback-alert ${feedback.type}`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 size={18} className="text-success" />
          ) : (
            <AlertTriangle size={18} className="text-danger" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="vault-grid">
        {/* Privacy Architecture Card */}
        <div className="vault-card">
          <div className="vault-card-header">
            <div className="vault-card-icon">
              <Lock size={18} className="text-amber" />
            </div>
            <div>
              <h3>Local-First Data Sovereignty</h3>
              <p className="vault-card-desc">Zero telemetry, zero cross-site tracking, client-encrypted storage</p>
            </div>
          </div>

          <p className="vault-text">
            MechMate is engineered with a strict <strong>local-first privacy architecture</strong>.
            Your vehicles, odometer readings, maintenance histories, and diagnostic consultations are persisted
            strictly on your local device.
          </p>

          <ul className="vault-features-list">
            <li>
              <CheckCircle2 size={15} className="text-success" />
              <span><strong>Zero Cloud Database Dependencies:</strong> No remote databases storing user VINs or logs.</span>
            </li>
            <li>
              <CheckCircle2 size={15} className="text-success" />
              <span><strong>No Marketing Cookies:</strong> 100% clean runtime with zero ad networks or analytics beacons.</span>
            </li>
            <li>
              <CheckCircle2 size={15} className="text-success" />
              <span><strong>Stateless Serverless Proxy:</strong> Backend AI passes zero persistent user identifiers.</span>
            </li>
            <li>
              <CheckCircle2 size={15} className="text-success" />
              <span><strong>Offline Capable:</strong> Deterministic diagnostic engine operates without network connection.</span>
            </li>
          </ul>

          {onOpenPrivacyPolicy && (
            <div style={{ marginTop: '16px' }}>
              <button className="btn-secondary small" onClick={onOpenPrivacyPolicy}>
                <ShieldCheck size={14} />
                <span>Read Full Customer Privacy Policy</span>
              </button>
            </div>
          )}
        </div>

        {/* Operating Cost Economics Card */}
        <div className="vault-card">
          <div className="vault-card-header">
            <div className="vault-card-icon">
              <Zap size={18} className="text-amber" />
            </div>
            <div>
              <h3>Free-First Operating Economics</h3>
              <p className="vault-card-desc">Sustainable zero-cost design for indie builder applications</p>
            </div>
          </div>

          <p className="vault-text">
            Designed to demonstrate sustainable software engineering with fair daily token quotas:
          </p>

          <ul className="vault-features-list">
            <li>
              <ServerOff size={15} className="text-amber" />
              <span><strong>Deterministic Engine:</strong> Instant local evaluation with 0 API calls and $0.00 compute expense.</span>
            </li>
            <li>
              <ShieldCheck size={15} className="text-amber" />
              <span><strong>Anonymous Drivers:</strong> 5 free full diagnostic consultations every 24-hour cycle.</span>
            </li>
            <li>
              <RefreshCw size={15} className="text-amber" />
              <span><strong>Registered Customers:</strong> 25 free daily consultations unlocked upon email sign-in.</span>
            </li>
            <li>
              <Database size={15} className="text-amber" />
              <span><strong>LocalStorage Vault:</strong> Avoids expensive managed database hosting fees.</span>
            </li>
          </ul>

          {onOpenAuth && (
            <div style={{ marginTop: '16px' }}>
              <button className="btn-secondary small" onClick={onOpenAuth}>
                <Zap size={14} />
                <span>Manage Customer Account & Token Quota</span>
              </button>
            </div>
          )}
        </div>

        {/* Data Vault: Export & Import */}
        <div className="vault-card full-width">
          <div className="vault-card-header">
            <div className="vault-card-icon">
              <FileJson size={18} className="text-amber" />
            </div>
            <div>
              <h3>Data Vault: Backup, Export & Restore</h3>
              <p className="vault-card-desc">Export your fleet manifest, service milestones, and diagnostic history as standard portable JSON</p>
            </div>
          </div>

          <div className="vault-actions-bar">
            <button className="btn-primary" onClick={handleExport}>
              <Download size={16} />
              <span>Export Vault Backup (.JSON)</span>
            </button>
            <button className="btn-danger" onClick={handleClearAll}>
              <Trash2 size={16} />
              <span>Wipe Local Storage</span>
            </button>
          </div>

          <div className="restore-box">
            <label className="restore-label">
              <span>Restore from Raw JSON Backup</span>
            </label>
            <textarea
              className="restore-textarea"
              placeholder="Paste exported MechMate JSON backup here..."
              rows={4}
              value={importJsonText}
              onChange={e => setImportJsonText(e.target.value)}
            />
            <div className="restore-submit-row">
              <button
                className="btn-secondary"
                onClick={handleImport}
                disabled={!importJsonText.trim()}
              >
                <RefreshCw size={14} />
                <span>Apply JSON Restore</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
