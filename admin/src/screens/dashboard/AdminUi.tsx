import type { ReactNode } from 'react'
import { LuCircleCheck, LuCircleX, LuInfo, LuTriangleAlert } from 'react-icons/lu'
import type { ConflictState } from '../../adminTypes'
import { AdminIcon } from './AdminIcon'

const statusIcons = {
  error: LuCircleX,
  info: LuInfo,
  success: LuCircleCheck,
}

export const StatusMessage = ({ kind = 'info', message }: { kind?: 'info' | 'error' | 'success'; message: string | null }) => {
  if (!message) return null
  return <p className={`admin-status admin-status--${kind}`}><AdminIcon icon={statusIcons[kind]} />{message}</p>
}

export const ConflictNotice = ({ conflict, label }: { conflict: ConflictState; label: string }) => {
  if (!conflict) return null
  return (
    <div className="admin-alert admin-alert--warning" role="alert">
      <strong><AdminIcon icon={LuTriangleAlert} />{label} changed on GitHub.</strong>
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
