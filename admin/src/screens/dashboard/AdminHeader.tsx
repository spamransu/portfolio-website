import { LuExternalLink, LuLogOut } from 'react-icons/lu'
import type { DashboardSessionProps } from './dashboardTypes'
import { AdminIcon } from './AdminIcon'

export const AdminHeader = ({ onLogout, session, siteUrl }: DashboardSessionProps) => (
  <header className="admin-hero" aria-labelledby="admin-page-title">
    <div className="admin-hero-copy">
      <p className="admin-kicker">Portfolio content studio</p>
      <h1 id="admin-page-title">Projects, blog posts, and media</h1>
      <p>Focused editing for case studies, writing, and supporting images. Site chrome, home/about/contact/resume settings, and broader SiteContent fields are intentionally outside this admin.</p>
    </div>
    <div className="admin-session-card" aria-label="Admin session">
      <p className="admin-kicker">Session</p>
      <p className="admin-session-user">{session.login ? `Signed in as ${session.login}` : 'Signed in'}</p>
      <p className="admin-note">Expires: {session.expiresAt ?? 'unknown'}</p>
      <div className="admin-actions admin-actions--compact">
        <a className="admin-button admin-button-secondary" href={siteUrl || '/'} target="_blank" rel="noreferrer"><AdminIcon icon={LuExternalLink} />Open site</a>
        <button className="admin-button admin-button-secondary" type="button" onClick={onLogout}><AdminIcon icon={LuLogOut} />Sign out</button>
      </div>
    </div>
  </header>
)
