import { LuArrowDown, LuArrowUp, LuCopy, LuEraser, LuPlus, LuRefreshCw, LuSave, LuTrash2 } from 'react-icons/lu'
import type { DashboardProjectProps } from './dashboardTypes'
import { AdminIcon } from './AdminIcon'
import { Field, StatusMessage } from './AdminUi'

const lines = (items: string[] | undefined): string => (items ?? []).join('\n')

export const ProjectEditorSection = ({
  dirty,
  items,
  jsonDrafts,
  jsonErrors,
  loading,
  onCreate,
  onDelete,
  onDiscard,
  onDuplicate,
  onFieldChange,
  onJsonFieldChange,
  onMove,
  onReload,
  onSave,
  onSelect,
  options,
  path,
  saving,
  selected,
  selectedSlug,
  status,
  validationError,
}: DashboardProjectProps) => (
  <section id="admin-project-editor" className="admin-resource-section" aria-labelledby="admin-project-title">
    <div className="admin-section-header">
      <div>
        <p className="admin-kicker">Primary resource</p>
        <h2 id="admin-project-title">Projects</h2>
        <p className="admin-note">Stored in <span className="admin-code">{path}</span>. Saves merge only the projects array back into the JSON file.</p>
      </div>
      <div className="admin-save-group" aria-label="Project save actions">
        <button className="admin-button admin-button-secondary" type="button" onClick={onReload} disabled={loading || saving}><AdminIcon icon={LuRefreshCw} />Reload</button>
        <button className="admin-button admin-button-secondary" type="button" onClick={onDiscard} disabled={!dirty || saving}><AdminIcon icon={LuEraser} />Discard</button>
        <button className="admin-button admin-button-primary" type="button" onClick={onSave} disabled={!dirty || Boolean(validationError) || Object.values(jsonErrors).some(Boolean) || saving}>{saving ? 'Saving…' : <><AdminIcon icon={LuSave} />Save projects</>}</button>
      </div>
    </div>
    <StatusMessage message={status} />
    <StatusMessage kind="error" message={validationError} />

    <div className="admin-editor-shell">
      <aside className="admin-collection-panel" aria-labelledby="project-collection-title">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">Collection</p>
            <h3 id="project-collection-title">{items.length} project{items.length === 1 ? '' : 's'}</h3>
          </div>
          {dirty ? <span className="admin-badge">Unsaved</span> : null}
        </div>
        <div className="admin-actions admin-actions--wrap">
          <button className="admin-button admin-button-secondary" type="button" onClick={onCreate}><AdminIcon icon={LuPlus} />New</button>
          <button className="admin-button admin-button-secondary" type="button" onClick={onDuplicate} disabled={!selected}><AdminIcon icon={LuCopy} />Duplicate</button>
          <button className="admin-button admin-button-secondary" type="button" onClick={() => onMove('up')} disabled={!selected}><AdminIcon icon={LuArrowUp} />Move up</button>
          <button className="admin-button admin-button-secondary" type="button" onClick={() => onMove('down')} disabled={!selected}><AdminIcon icon={LuArrowDown} />Move down</button>
          <button className="admin-button admin-button-danger" type="button" onClick={onDelete} disabled={!selected}><AdminIcon icon={LuTrash2} />Delete</button>
        </div>
        <Field label="Project selector">
          <select id="project-select" value={selectedSlug} onChange={(event) => onSelect(event.target.value)}>
            {options.map((project) => <option key={project.slug} value={project.slug}>{project.title || project.slug}</option>)}
          </select>
        </Field>
        {options.length ? (
          <div className="admin-item-list" role="list" aria-label="Projects">
            {options.map((project, index) => (
              <button
                key={project.slug}
                className={`admin-item-row${project.slug === selectedSlug ? ' admin-item-row--active' : ''}`}
                type="button"
                onClick={() => onSelect(project.slug)}
              >
                <span>{project.title || project.slug}</span>
                <small>{String(index + 1).padStart(2, '0')} · {project.slug}</small>
              </button>
            ))}
          </div>
        ) : (
          <div className="admin-empty-state">
            <h3>No projects yet</h3>
            <p>Create the first project to start building the portfolio collection.</p>
          </div>
        )}
      </aside>

      <div className="admin-editor-panel">
        {selected ? (
          <div className="admin-form-grid">
            <div className="admin-form-row admin-form-row--split">
              <Field label="Slug"><input id="project-slug" value={selected.slug} onChange={(event) => onFieldChange('slug', event.target.value)} /></Field>
              <Field label="Year"><input id="project-year" value={selected.year} onChange={(event) => onFieldChange('year', event.target.value)} /></Field>
            </div>
            <Field label="Title"><input id="project-title" value={selected.title} onChange={(event) => onFieldChange('title', event.target.value)} /></Field>
            <div className="admin-form-row admin-form-row--split">
              <Field label="Client"><input id="project-client" value={selected.client} onChange={(event) => onFieldChange('client', event.target.value)} /></Field>
              <Field label="Role"><input id="project-role" value={selected.role} onChange={(event) => onFieldChange('role', event.target.value)} /></Field>
            </div>
            <div className="admin-form-row admin-form-row--split">
              <Field label="Kind">
                <select id="project-kind" value={selected.kind ?? 'case-study'} onChange={(event) => onFieldChange('kind', event.target.value)}>
                  <option value="case-study">Case study</option>
                  <option value="experiment">Experiment</option>
                </select>
              </Field>
              <Field label="Status"><input id="project-status" value={selected.status ?? ''} onChange={(event) => onFieldChange('status', event.target.value)} /></Field>
            </div>
            <Field label="Summary"><textarea id="project-summary" rows={3} value={selected.summary} onChange={(event) => onFieldChange('summary', event.target.value)} /></Field>
            <Field label="Overview"><textarea id="project-overview" rows={5} value={selected.overview} onChange={(event) => onFieldChange('overview', event.target.value)} /></Field>
            <Field label="Challenge"><textarea id="project-challenge" rows={4} value={selected.challenge} onChange={(event) => onFieldChange('challenge', event.target.value)} /></Field>
            <Field label="Approach summary"><textarea id="project-approach-summary" rows={4} value={selected.approachSummary} onChange={(event) => onFieldChange('approachSummary', event.target.value)} /></Field>
            <Field label="Result summary"><textarea id="project-result-summary" rows={4} value={selected.resultSummary} onChange={(event) => onFieldChange('resultSummary', event.target.value)} /></Field>
            <Field label="Reflection"><textarea id="project-reflection" rows={4} value={selected.reflection} onChange={(event) => onFieldChange('reflection', event.target.value)} /></Field>
            <div className="admin-form-row admin-form-row--split">
              <Field label="Stack" hint="One item per line."><textarea id="project-stack" rows={4} value={lines(selected.stack)} onChange={(event) => onFieldChange('stack', event.target.value)} /></Field>
              <Field label="Project scope" hint="One item per line."><textarea id="project-scope" rows={4} value={lines(selected.scope)} onChange={(event) => onFieldChange('scope', event.target.value)} /></Field>
            </div>
            <div className="admin-form-row admin-form-row--split">
              <Field label="Approach notes" hint="One item per line."><textarea id="project-approach" rows={5} value={lines(selected.approach)} onChange={(event) => onFieldChange('approach', event.target.value)} /></Field>
              <Field label="Outcome notes" hint="One item per line."><textarea id="project-outcome" rows={5} value={lines(selected.outcome)} onChange={(event) => onFieldChange('outcome', event.target.value)} /></Field>
            </div>
            <div className="admin-json-group">
              <Field label="Hero image JSON"><textarea id="project-image" rows={5} value={jsonDrafts.image} onChange={(event) => onJsonFieldChange('image', event.target.value)} /></Field>
              <StatusMessage kind="error" message={jsonErrors.image ?? null} />
              <Field label="Gallery JSON" hint="At least three images. Each image needs src and alt text."><textarea id="project-gallery" rows={8} value={jsonDrafts.gallery} onChange={(event) => onJsonFieldChange('gallery', event.target.value)} /></Field>
              <StatusMessage kind="error" message={jsonErrors.gallery ?? null} />
            </div>
          </div>
        ) : (
          <div className="admin-empty-state admin-empty-state--large">
            <p className="admin-kicker">No selection</p>
            <h3>Select or create a project</h3>
            <p>The editor will appear here once a project is selected from the collection panel.</p>
          </div>
        )}
      </div>
    </div>
  </section>
)
