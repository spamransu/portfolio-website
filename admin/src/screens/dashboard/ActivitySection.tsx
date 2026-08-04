import type { DashboardActivityProps } from './dashboardTypes'
import { StatusMessage } from './AdminUi'

export const ActivitySection = ({
  blogRepo,
  branch,
  commits,
  error,
  loadedAt,
  loading,
  onReload,
  projectPath,
  projectRepo,
}: DashboardActivityProps) => (
  <section id="admin-recent-activity" className="admin-resource-section admin-resource-section--secondary" aria-labelledby="admin-activity-title">
    <div className="admin-section-header">
      <div>
        <p className="admin-kicker">Activity</p>
        <h2 id="admin-activity-title">Recent commits</h2>
        <p className="admin-note">{loadedAt ? `Loaded ${loadedAt}` : 'Not loaded yet'}</p>
      </div>
      <button className="admin-button admin-button-secondary" type="button" onClick={onReload} disabled={loading}>Refresh</button>
    </div>
    <dl className="admin-metadata">
      <dt>Branch</dt><dd>{branch ?? 'unknown'}</dd>
      <dt>Projects source file</dt><dd>{projectPath}</dd>
      <dt>Repository</dt><dd>{projectRepo ? `${projectRepo.owner}/${projectRepo.repo}` : blogRepo ? `${blogRepo.owner}/${blogRepo.repo}` : 'unknown'}</dd>
    </dl>
    {projectRepo ? <a className="admin-button admin-button-secondary admin-button-inline" href={projectRepo.branchUrl} target="_blank" rel="noreferrer">Open branch</a> : null}
    <StatusMessage kind="error" message={error} />
    {commits.length ? (
      <ul className="admin-activity-list">
        {commits.map((entry) => (
          <li key={entry.sha}>
            {entry.url ? <a href={entry.url} target="_blank" rel="noreferrer">{entry.message}</a> : <span>{entry.message}</span>}
            <p className="admin-note">{entry.authorLogin ?? entry.authorName ?? 'Unknown author'} · {entry.committedAt ?? 'unknown time'} · {entry.sha.slice(0, 7)}</p>
          </li>
        ))}
      </ul>
    ) : <div className="admin-empty-state"><h3>No activity loaded</h3><p>Refresh to check recent Git-backed writes.</p></div>}
  </section>
)
