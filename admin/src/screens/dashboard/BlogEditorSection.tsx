import { useMemo } from 'react'
import { LuCopy, LuEraser, LuPlus, LuRefreshCw, LuSave, LuTrash2 } from 'react-icons/lu'
import { parseBlogMarkdownBlocks } from '../../../../src/content/blogMarkdown'
import type { DashboardBlogProps } from './dashboardTypes'
import { Field, StatusMessage } from './AdminUi'
import { AdminIcon } from './AdminIcon'

export const BlogEditorSection = ({
  activity,
  dirty,
  list,
  loading,
  meta,
  onCreate,
  onDelete,
  onDiscard,
  onDuplicate,
  onFieldChange,
  onReload,
  onSave,
  onSelect,
  post,
  saving,
  selectedSlug,
  status,
  validationError,
}: DashboardBlogProps) => {
  const previewBlocks = useMemo(() => (post ? parseBlogMarkdownBlocks(post.body) : []), [post])

  return (
    <section id="admin-blog-editor" className="admin-resource-section" aria-labelledby="admin-blog-title">
      <div className="admin-section-header">
        <div>
          <p className="admin-kicker">Primary resource</p>
          <h2 id="admin-blog-title">Blog posts</h2>
          <p className="admin-note">Markdown files in <span className="admin-code">content/blog</span>. Create, edit, delete, duplicate, and upload blog media remain supported.</p>
        </div>
        <div className="admin-save-group" aria-label="Blog save actions">
          <button className="admin-button admin-button-secondary" type="button" onClick={onReload} disabled={!post?.sha || loading || saving}><AdminIcon icon={LuRefreshCw} />Reload post</button>
          <button className="admin-button admin-button-secondary" type="button" onClick={onDiscard} disabled={!dirty || saving}><AdminIcon icon={LuEraser} />Discard</button>
          <button className="admin-button admin-button-primary" type="button" onClick={onSave} disabled={!post || !dirty || Boolean(validationError) || saving}>{saving ? 'Saving…' : <><AdminIcon icon={LuSave} />Save blog post</>}</button>
        </div>
      </div>
      <StatusMessage message={status} />
      <StatusMessage kind="error" message={validationError} />
      {activity ? <p className="admin-note">{activity.summary} Latest commit: {activity.latestCommitSha ?? 'unknown'}</p> : null}

      <div className="admin-editor-shell">
        <aside className="admin-collection-panel" aria-labelledby="blog-collection-title">
          <div className="admin-panel-header">
            <div>
              <p className="admin-kicker">Collection</p>
              <h3 id="blog-collection-title">{list.length} blog post{list.length === 1 ? '' : 's'}</h3>
            </div>
            {dirty ? <span className="admin-badge">Unsaved</span> : null}
          </div>
          <div className="admin-actions admin-actions--wrap">
            <button className="admin-button admin-button-secondary" type="button" onClick={onCreate}><AdminIcon icon={LuPlus} />New</button>
            <button className="admin-button admin-button-secondary" type="button" onClick={onDuplicate} disabled={!post}><AdminIcon icon={LuCopy} />Duplicate</button>
            <button className="admin-button admin-button-danger" type="button" onClick={onDelete} disabled={!post?.sha || saving}><AdminIcon icon={LuTrash2} />Delete</button>
          </div>
          <Field label="Blog selector">
            <select id="blog-select" value={selectedSlug} onChange={(event) => onSelect(event.target.value)}>
              <option value="">Select a post</option>
              {list.map((entry) => <option key={entry.slug} value={entry.slug}>{entry.title || entry.slug}</option>)}
            </select>
          </Field>
          {list.length ? (
            <div className="admin-item-list" role="list" aria-label="Blog posts">
              {list.map((entry) => (
                <button
                  key={entry.slug}
                  className={`admin-item-row${entry.slug === selectedSlug ? ' admin-item-row--active' : ''}`}
                  type="button"
                  onClick={() => onSelect(entry.slug)}
                >
                  <span>{entry.title || entry.slug}</span>
                  <small>{entry.date} · {entry.status} · {entry.slug}</small>
                </button>
              ))}
            </div>
          ) : (
            <div className="admin-empty-state">
              <h3>No blog posts yet</h3>
              <p>Create a draft to start writing portfolio notes or case-study updates.</p>
            </div>
          )}
          {meta ? <p className="admin-note admin-code">{meta.path}</p> : null}
        </aside>

        <div className="admin-editor-panel">
          {post ? (
            <div className="admin-form-grid">
              <Field label="Title"><input id="blog-title" value={post.title} onChange={(event) => onFieldChange('title', event.target.value)} /></Field>
              <div className="admin-form-row admin-form-row--split">
                <Field label="Slug"><input id="blog-slug" value={post.slug} onChange={(event) => onFieldChange('slug', event.target.value)} /></Field>
                <Field label="Date"><input id="blog-date" value={post.date} onChange={(event) => onFieldChange('date', event.target.value)} /></Field>
                <Field label="Status">
                  <select id="blog-status" value={post.status} onChange={(event) => onFieldChange('status', event.target.value)}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </Field>
              </div>
              <Field label="Excerpt"><textarea id="blog-excerpt" rows={3} value={post.excerpt ?? ''} onChange={(event) => onFieldChange('excerpt', event.target.value)} /></Field>
              <div className="admin-form-row admin-form-row--split">
                <Field label="Cover image"><input id="blog-cover" value={post.coverImage ?? ''} onChange={(event) => onFieldChange('coverImage', event.target.value)} /></Field>
                <Field label="Cover alt text"><input id="blog-cover-alt" value={post.coverAlt ?? ''} onChange={(event) => onFieldChange('coverAlt', event.target.value)} /></Field>
              </div>
              <Field label="Markdown body" hint={`Preview blocks: ${previewBlocks.length}`}><textarea id="blog-body" className="admin-markdown" rows={18} value={post.body} onChange={(event) => onFieldChange('body', event.target.value)} /></Field>
            </div>
          ) : (
            <div className="admin-empty-state admin-empty-state--large">
              <p className="admin-kicker">No selection</p>
              <h3>Select or create a blog post</h3>
              <p>The writing editor appears here when a post is selected from the collection panel.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
