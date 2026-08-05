import { LuGithub, LuLogIn } from 'react-icons/lu'
import type { DashboardSessionProps } from './dashboardTypes'
import { AdminIcon } from './AdminIcon'
import { StatusMessage } from './AdminUi'

export const LoginScreen = ({ authStatus, error, loading, onLogin }: DashboardSessionProps) => (
  <main className="admin-shell admin-shell--login">
    <section className="admin-card admin-login-card" aria-labelledby="admin-login-title">
      <p className="admin-kicker">Portfolio admin</p>
      <h1 id="admin-login-title"><AdminIcon icon={LuGithub} />Sign in with GitHub</h1>
      <p className="admin-copy">Manage only portfolio projects, blog posts, and their related media. Site-wide copy stays in the source content files.</p>
      <div className="admin-actions">
        <button className="admin-button admin-button-primary" type="button" onClick={onLogin} disabled={loading}><AdminIcon icon={LuLogIn} />Sign in</button>
      </div>
      <StatusMessage kind="error" message={error} />
      <StatusMessage message={authStatus} />
    </section>
  </main>
)
