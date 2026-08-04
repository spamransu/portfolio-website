import type { ReactNode } from 'react'
import type { ConflictState } from '../../adminTypes'

export const StatusMessage = ({ kind = 'info', message }: { kind?: 'info' | 'error' | 'success'; message: string | null }) => {
  if (!message) return null
  return <p className={`admin-status admin-status--${kind}`}>{message}</p>
}

export const ConflictNotice = ({ conflict, label }: { conflict: ConflictState; label: string }) => {
  if (!conflict) return null
  return (
    <div className="admin-alert admin-alert--warning" role="alert">
      <strong>{label} changed on GitHub.</strong>
      <p>Reload before saving again.</p>
      {conflict.currentSha ? <p className="admin-code">Current file SHA: {conflict.currentSha}</p> : null}
      {conflict.latestCommitSha ? <p className="admin-code">Latest commit SHA: {conflict.latestCommitSha}</p> : null}
    </div>
  )
}

export const Field = ({ children, hint, label }: { children: ReactNode; hint?: string; label: string }) => (
  <div className="admin-field">
    <label className="admin-field-label">
      <span>{label}</span>
      {children}
    </label>
    {hint ? <p className="admin-note">{hint}</p> : null}
  </div>
)
