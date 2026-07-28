import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AdminRepoInfo, AdminSession } from '../api/adminApi'
import { parseBlogMarkdownBlocks } from '../../../src/content/blogMarkdown'
import type { BlogPostMeta, BlogPostResponse, Project } from '../types'

export type MediaTargetSelection = {
  kind: 'blog' | 'project'
  field: 'coverImage' | 'image' | 'gallery' | 'sectionImage'
  index?: number
  label: string
}

type SelectedMediaPreviewProps = {
  file: File
}

const SelectedMediaPreview = ({ file }: SelectedMediaPreviewProps) => {
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  return (
    <div className="admin-media-preview admin-media-preview--field">
      <div className="admin-panel-header">
        <div>
          <p className="admin-kicker">Selected upload preview</p>
          <h3>{file.name}</h3>
        </div>
        <p className="admin-note">{Math.max(1, Math.round(file.size / 1024))} KB</p>
      </div>
      <img className="admin-media-preview-image" src={previewUrl} alt={file.name} />
      <p className="admin-note admin-code">{file.type || 'unknown type'}</p>
    </div>
  )
}

type ConflictState = {
  currentSha?: string
  latestCommitSha?: string | null
} | null

interface DashboardScreenProps {
  activity: Array<{
    authorLogin: string | null
    authorName: string | null
    committedAt: string | null
    message: string
    sha: string
    url: string | null
  }>
  activityError: string | null
  activityLoadedAt: string | null
  authStatus: string | null
  blogActivity: {
    latestCommitSha: string | null
    path: string
    repo: AdminRepoInfo
    summary: string
  } | null
  blogConflict: ConflictState
  blogDirty: boolean
  blogList: BlogPostMeta[]
  blogLoading: boolean
  blogMeta: BlogPostMeta | null
  blogPost: BlogPostResponse | null
  blogRepo: AdminRepoInfo | null
  blogStatus: string | null
  blogValidationError: string | null
  error: string | null
  loading: boolean
  loadingActivity: boolean
  loadingProjects: boolean
  mediaArea: 'blog' | 'projects'
  mediaFile: File | null
  mediaFileInputKey: number
  mediaPath: string
  mediaSlug: string
  mediaStatus: string | null
  mediaTarget: MediaTargetSelection | null
  mediaValidationError: string | null
  onBlogCreate: () => void
  onBlogDelete: () => void
  onBlogDiscard: () => void
  onBlogDuplicate: () => void
  onBlogFieldChange: (field: keyof BlogPostResponse, value: string) => void
  onBlogReload: () => void
  onBlogSave: () => void
  onBlogSelect: (slug: string) => void
  onLogin: () => void
  onLogout: () => void
  onMediaAreaChange: (value: 'blog' | 'projects') => void
  onMediaFileChange: (file: File | null) => void
  onMediaFileClear: () => void
  onMediaResultClear: () => void
  onMediaSlugChange: (value: string) => void
  onMediaTargetClear: () => void
  onMediaTargetSelect: (target: MediaTargetSelection) => void
  onMediaUpload: () => void
  onProjectCreate: () => void
  onProjectDelete: () => void
  onProjectDiscard: () => void
  onProjectDuplicate: () => void
  onProjectFieldChange: (field: keyof Project, value: string) => void
  onProjectJsonFieldChange: (field: 'image' | 'gallery' | 'sections', value: string) => void
  onProjectMove: (direction: 'up' | 'down') => void
  onProjectReload: () => void
  onProjectSave: () => void
  onProjectSelect: (slug: string) => void
  onReloadActivity: () => void
  projectBranch: string | null
  projectConflict: ConflictState
  projectDirty: boolean
  projectOptions: Array<{ slug: string; title: string }>
  projectPath: string
  projectRepo: AdminRepoInfo | null
  projectStatus: string | null
  projectValidationError: string | null
  projects: Project[]
  savingBlog: boolean
  savingProjects: boolean
  selectedBlogSlug: string
  selectedProject: Project | null
  selectedProjectSlug: string
  session: AdminSession
  siteUrl: string
  uploadingMedia: boolean
}

type FieldProps = {
  children: ReactNode
  hint?: string
  label: string
}

const lines = (items: string[] | undefined): string => (items ?? []).join('\n')
const emptyImage = () => ({ src: '', alt: '', caption: '' })
const json = (value: unknown): string => JSON.stringify(value ?? null, null, 2)

const StatusMessage = ({ kind = 'info', message }: { kind?: 'info' | 'error' | 'success'; message: string | null }) => {
  if (!message) return null
  return <p className={`admin-status admin-status--${kind}`}>{message}</p>
}

const ConflictNotice = ({ conflict, label }: { conflict: ConflictState; label: string }) => {
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

const Field = ({ children, hint, label }: FieldProps) => (
  <div className="admin-field">
    <label className="admin-field-label">
      <span>{label}</span>
      {children}
    </label>
    {hint ? <p className="admin-note">{hint}</p> : null}
  </div>
)

export const DashboardScreen = ({
  activity,
  activityError,
  activityLoadedAt,
  authStatus,
  blogActivity,
  blogConflict,
  blogDirty,
  blogList,
  blogLoading,
  blogMeta,
  blogPost,
  blogRepo,
  blogStatus,
  blogValidationError,
  error,
  loading,
  loadingActivity,
  loadingProjects,
  mediaArea,
  mediaFile,
  mediaFileInputKey,
  mediaPath,
  mediaSlug,
  mediaStatus,
  mediaTarget,
  mediaValidationError,
  onBlogCreate,
  onBlogDelete,
  onBlogDiscard,
  onBlogDuplicate,
  onBlogFieldChange,
  onBlogReload,
  onBlogSave,
  onBlogSelect,
  onLogin,
  onLogout,
  onMediaAreaChange,
  onMediaFileChange,
  onMediaFileClear,
  onMediaResultClear,
  onMediaSlugChange,
  onMediaTargetClear,
  onMediaTargetSelect,
  onMediaUpload,
  onProjectCreate,
  onProjectDelete,
  onProjectDiscard,
  onProjectDuplicate,
  onProjectFieldChange,
  onProjectJsonFieldChange,
  onProjectMove,
  onProjectReload,
  onProjectSave,
  onProjectSelect,
  onReloadActivity,
  projectBranch,
  projectConflict,
  projectDirty,
  projectOptions,
  projectPath,
  projectRepo,
  projectStatus,
  projectValidationError,
  projects,
  savingBlog,
  savingProjects,
  selectedBlogSlug,
  selectedProject,
  selectedProjectSlug,
  session,
  siteUrl,
  uploadingMedia,
}: DashboardScreenProps) => {
  const blogPreviewBlocks = useMemo(() => (blogPost ? parseBlogMarkdownBlocks(blogPost.body) : []), [blogPost])
  const mediaTargets = useMemo<MediaTargetSelection[]>(() => {
    const targets: MediaTargetSelection[] = []
    if (mediaArea === 'blog' && blogPost) targets.push({ kind: 'blog', field: 'coverImage', label: 'Blog cover image' })
    if (mediaArea === 'projects' && selectedProject) {
      targets.push({ kind: 'project', field: 'image', label: 'Project hero image' })
      ;(selectedProject.gallery ?? []).forEach((_, index) => targets.push({ kind: 'project', field: 'gallery', index, label: `Gallery image ${index + 1}` }))
      ;(selectedProject.sections ?? []).forEach((section, index) => targets.push({ kind: 'project', field: 'sectionImage', index, label: `Section image: ${section.title || index + 1}` }))
    }
    return targets
  }, [blogPost, mediaArea, selectedProject])

  if (!session.authenticated) {
    return (
      <main className="admin-shell admin-shell--login">
        <section className="admin-card admin-login-card" aria-labelledby="admin-login-title">
          <p className="admin-kicker">Portfolio admin</p>
          <h1 id="admin-login-title">Sign in with GitHub</h1>
          <p className="admin-copy">Manage only portfolio projects, blog posts, and their related media. Site-wide copy stays in the source content files.</p>
          <div className="admin-actions">
            <button className="admin-button admin-button-primary" type="button" onClick={onLogin} disabled={loading}>Sign in</button>
          </div>
          <StatusMessage kind="error" message={error} />
          <StatusMessage message={authStatus} />
        </section>
      </main>
    )
  }

  return (
    <main className="admin-shell">
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
            <a className="admin-button admin-button-secondary" href={siteUrl || '/'} target="_blank" rel="noreferrer">Open site</a>
            <button className="admin-button admin-button-secondary" type="button" onClick={onLogout}>Sign out</button>
          </div>
        </div>
      </header>

      <nav className="admin-tabs" aria-label="Admin sections">
        <a href="#admin-project-editor" aria-current="page">Projects</a>
        <a href="#admin-blog-editor">Blog posts</a>
        <a href="#admin-media-uploader">Media</a>
        <a href="#admin-recent-activity">Activity</a>
      </nav>

      <div className="admin-message-stack" aria-live="polite">
        <StatusMessage kind="error" message={error} />
        <StatusMessage message={authStatus} />
        <ConflictNotice conflict={projectConflict} label="Projects" />
        <ConflictNotice conflict={blogConflict} label="Blog post" />
      </div>

      <section id="admin-project-editor" className="admin-resource-section" aria-labelledby="admin-project-title">
        <div className="admin-section-header">
          <div>
            <p className="admin-kicker">Primary resource</p>
            <h2 id="admin-project-title">Projects</h2>
            <p className="admin-note">Stored in <span className="admin-code">{projectPath}</span>. Saves merge only the projects array back into the JSON file.</p>
          </div>
          <div className="admin-save-group" aria-label="Project save actions">
            <button className="admin-button admin-button-secondary" type="button" onClick={onProjectReload} disabled={loadingProjects || savingProjects}>Reload</button>
            <button className="admin-button admin-button-secondary" type="button" onClick={onProjectDiscard} disabled={!projectDirty || savingProjects}>Discard</button>
            <button className="admin-button admin-button-primary" type="button" onClick={onProjectSave} disabled={!projectDirty || Boolean(projectValidationError) || savingProjects}>{savingProjects ? 'Saving…' : 'Save projects'}</button>
          </div>
        </div>
        <StatusMessage message={projectStatus} />
        <StatusMessage kind="error" message={projectValidationError} />

        <div className="admin-editor-shell">
          <aside className="admin-collection-panel" aria-labelledby="project-collection-title">
            <div className="admin-panel-header">
              <div>
                <p className="admin-kicker">Collection</p>
                <h3 id="project-collection-title">{projects.length} project{projects.length === 1 ? '' : 's'}</h3>
              </div>
              {projectDirty ? <span className="admin-badge">Unsaved</span> : null}
            </div>
            <div className="admin-actions admin-actions--wrap">
              <button className="admin-button admin-button-secondary" type="button" onClick={onProjectCreate}>New</button>
              <button className="admin-button admin-button-secondary" type="button" onClick={onProjectDuplicate} disabled={!selectedProject}>Duplicate</button>
              <button className="admin-button admin-button-secondary" type="button" onClick={() => onProjectMove('up')} disabled={!selectedProject}>Move up</button>
              <button className="admin-button admin-button-secondary" type="button" onClick={() => onProjectMove('down')} disabled={!selectedProject}>Move down</button>
              <button className="admin-button admin-button-danger" type="button" onClick={onProjectDelete} disabled={!selectedProject}>Delete</button>
            </div>
            <Field label="Project selector">
              <select id="project-select" value={selectedProjectSlug} onChange={(event) => onProjectSelect(event.target.value)}>
                {projectOptions.map((project) => <option key={project.slug} value={project.slug}>{project.title || project.slug}</option>)}
              </select>
            </Field>
            {projectOptions.length ? (
              <div className="admin-item-list" role="list" aria-label="Projects">
                {projectOptions.map((project, index) => (
                  <button
                    key={project.slug}
                    className={`admin-item-row${project.slug === selectedProjectSlug ? ' admin-item-row--active' : ''}`}
                    type="button"
                    onClick={() => onProjectSelect(project.slug)}
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
            {selectedProject ? (
              <div className="admin-form-grid">
                <div className="admin-form-row admin-form-row--split">
                  <Field label="Slug"><input id="project-slug" value={selectedProject.slug} onChange={(event) => onProjectFieldChange('slug', event.target.value)} /></Field>
                  <Field label="Year"><input id="project-year" value={selectedProject.year} onChange={(event) => onProjectFieldChange('year', event.target.value)} /></Field>
                </div>
                <Field label="Title"><input id="project-title" value={selectedProject.title} onChange={(event) => onProjectFieldChange('title', event.target.value)} /></Field>
                <div className="admin-form-row admin-form-row--split">
                  <Field label="Client"><input id="project-client" value={selectedProject.client} onChange={(event) => onProjectFieldChange('client', event.target.value)} /></Field>
                  <Field label="Role"><input id="project-role" value={selectedProject.role} onChange={(event) => onProjectFieldChange('role', event.target.value)} /></Field>
                </div>
                <Field label="Summary"><textarea id="project-summary" rows={3} value={selectedProject.summary} onChange={(event) => onProjectFieldChange('summary', event.target.value)} /></Field>
                <Field label="Challenge"><textarea id="project-challenge" rows={4} value={selectedProject.challenge} onChange={(event) => onProjectFieldChange('challenge', event.target.value)} /></Field>
                <div className="admin-form-row admin-form-row--split">
                  <Field label="Stack" hint="One item per line."><textarea id="project-stack" rows={4} value={lines(selectedProject.stack)} onChange={(event) => onProjectFieldChange('stack', event.target.value)} /></Field>
                  <Field label="Approach" hint="One item per line."><textarea id="project-approach" rows={5} value={lines(selectedProject.approach)} onChange={(event) => onProjectFieldChange('approach', event.target.value)} /></Field>
                </div>
                <Field label="Outcome" hint="One item per line."><textarea id="project-outcome" rows={5} value={lines(selectedProject.outcome)} onChange={(event) => onProjectFieldChange('outcome', event.target.value)} /></Field>
                <div className="admin-json-group">
                  <Field label="Hero image JSON"><textarea id="project-image" rows={5} value={json(selectedProject.image ?? emptyImage())} onChange={(event) => onProjectJsonFieldChange('image', event.target.value)} /></Field>
                  <Field label="Gallery JSON"><textarea id="project-gallery" rows={8} value={json(selectedProject.gallery ?? [])} onChange={(event) => onProjectJsonFieldChange('gallery', event.target.value)} /></Field>
                  <Field label="Sections JSON"><textarea id="project-sections" rows={10} value={json(selectedProject.sections ?? [])} onChange={(event) => onProjectJsonFieldChange('sections', event.target.value)} /></Field>
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

      <section id="admin-blog-editor" className="admin-resource-section" aria-labelledby="admin-blog-title">
        <div className="admin-section-header">
          <div>
            <p className="admin-kicker">Primary resource</p>
            <h2 id="admin-blog-title">Blog posts</h2>
            <p className="admin-note">Markdown files in <span className="admin-code">content/blog</span>. Create, edit, delete, duplicate, and upload blog media remain supported.</p>
          </div>
          <div className="admin-save-group" aria-label="Blog save actions">
            <button className="admin-button admin-button-secondary" type="button" onClick={onBlogReload} disabled={!blogPost || blogLoading || savingBlog}>Reload post</button>
            <button className="admin-button admin-button-secondary" type="button" onClick={onBlogDiscard} disabled={!blogDirty || savingBlog}>Discard</button>
            <button className="admin-button admin-button-primary" type="button" onClick={onBlogSave} disabled={!blogPost || !blogDirty || Boolean(blogValidationError) || savingBlog}>{savingBlog ? 'Saving…' : 'Save blog post'}</button>
          </div>
        </div>
        <StatusMessage message={blogStatus} />
        <StatusMessage kind="error" message={blogValidationError} />
        {blogActivity ? <p className="admin-note">{blogActivity.summary} Latest commit: {blogActivity.latestCommitSha ?? 'unknown'}</p> : null}

        <div className="admin-editor-shell">
          <aside className="admin-collection-panel" aria-labelledby="blog-collection-title">
            <div className="admin-panel-header">
              <div>
                <p className="admin-kicker">Collection</p>
                <h3 id="blog-collection-title">{blogList.length} blog post{blogList.length === 1 ? '' : 's'}</h3>
              </div>
              {blogDirty ? <span className="admin-badge">Unsaved</span> : null}
            </div>
            <div className="admin-actions admin-actions--wrap">
              <button className="admin-button admin-button-secondary" type="button" onClick={onBlogCreate}>New</button>
              <button className="admin-button admin-button-secondary" type="button" onClick={onBlogDuplicate} disabled={!blogPost}>Duplicate</button>
              <button className="admin-button admin-button-danger" type="button" onClick={onBlogDelete} disabled={!blogPost?.sha || savingBlog}>Delete</button>
            </div>
            <Field label="Blog post selector">
              <select id="blog-select" value={selectedBlogSlug} onChange={(event) => onBlogSelect(event.target.value)}>
                <option value="">Select a post</option>
                {blogList.map((post) => <option key={post.slug} value={post.slug}>{post.title || post.slug}</option>)}
              </select>
            </Field>
            {blogList.length ? (
              <div className="admin-item-list" role="list" aria-label="Blog posts">
                {blogList.map((post) => (
                  <button
                    key={post.slug}
                    className={`admin-item-row${post.slug === selectedBlogSlug ? ' admin-item-row--active' : ''}`}
                    type="button"
                    onClick={() => onBlogSelect(post.slug)}
                  >
                    <span>{post.title || post.slug}</span>
                    <small>{post.date} · {post.status} · {post.slug}</small>
                  </button>
                ))}
              </div>
            ) : (
              <div className="admin-empty-state">
                <h3>No blog posts yet</h3>
                <p>Create a draft to start writing portfolio notes or case-study updates.</p>
              </div>
            )}
            {blogMeta ? <p className="admin-note admin-code">{blogMeta.path}</p> : null}
          </aside>

          <div className="admin-editor-panel">
            {blogPost ? (
              <div className="admin-form-grid">
                <Field label="Title"><input id="blog-title" value={blogPost.title} onChange={(event) => onBlogFieldChange('title', event.target.value)} /></Field>
                <div className="admin-form-row admin-form-row--split">
                  <Field label="Slug"><input id="blog-slug" value={blogPost.slug} onChange={(event) => onBlogFieldChange('slug', event.target.value)} /></Field>
                  <Field label="Date"><input id="blog-date" value={blogPost.date} onChange={(event) => onBlogFieldChange('date', event.target.value)} /></Field>
                  <Field label="Status">
                    <select id="blog-status" value={blogPost.status} onChange={(event) => onBlogFieldChange('status', event.target.value)}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </Field>
                </div>
                <Field label="Excerpt"><textarea id="blog-excerpt" rows={3} value={blogPost.excerpt ?? ''} onChange={(event) => onBlogFieldChange('excerpt', event.target.value)} /></Field>
                <div className="admin-form-row admin-form-row--split">
                  <Field label="Cover image"><input id="blog-cover" value={blogPost.coverImage ?? ''} onChange={(event) => onBlogFieldChange('coverImage', event.target.value)} /></Field>
                  <Field label="Cover alt text"><input id="blog-cover-alt" value={blogPost.coverAlt ?? ''} onChange={(event) => onBlogFieldChange('coverAlt', event.target.value)} /></Field>
                </div>
                <Field label="Markdown body" hint={`Preview blocks: ${blogPreviewBlocks.length}`}><textarea id="blog-body" className="admin-markdown" rows={18} value={blogPost.body} onChange={(event) => onBlogFieldChange('body', event.target.value)} /></Field>
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

      <section id="admin-media-uploader" className="admin-resource-section" aria-labelledby="admin-media-title">
        <div className="admin-section-header">
          <div>
            <p className="admin-kicker">Media</p>
            <h2 id="admin-media-title">Upload blog or project media</h2>
            <p className="admin-note">Uploads are limited to <span className="admin-code">/images/blog/...</span> and <span className="admin-code">/images/projects/...</span>.</p>
          </div>
          <div className="admin-save-group" aria-label="Media upload actions">
            <button className="admin-button admin-button-primary" type="button" onClick={onMediaUpload} disabled={!mediaFile || Boolean(mediaValidationError) || uploadingMedia}>{uploadingMedia ? 'Uploading…' : 'Upload media'}</button>
          </div>
        </div>
        <StatusMessage message={mediaStatus} />
        <StatusMessage kind="error" message={mediaValidationError} />
        {mediaPath ? (
          <p className="admin-status admin-status--success">Uploaded path: <span className="admin-code">{mediaPath}</span> <button className="admin-button admin-button-secondary" type="button" onClick={onMediaResultClear}>Clear</button></p>
        ) : null}
        <div className="admin-editor-shell admin-editor-shell--media">
          <div className="admin-collection-panel">
            <div className="admin-form-grid">
              <Field label="Area">
                <select id="media-area" value={mediaArea} onChange={(event) => onMediaAreaChange(event.target.value as 'blog' | 'projects')}>
                  <option value="blog">Blog</option>
                  <option value="projects">Projects</option>
                </select>
              </Field>
              <Field label="Folder slug"><input id="media-slug" value={mediaSlug} onChange={(event) => onMediaSlugChange(event.target.value)} /></Field>
              <Field label="Assign uploaded path to">
                <select
                  id="media-target"
                  value={mediaTarget?.label ?? ''}
                  onChange={(event) => {
                    const target = mediaTargets.find((entry) => entry.label === event.target.value)
                    if (target) onMediaTargetSelect(target)
                    else onMediaTargetClear()
                  }}
                >
                  <option value="">Do not auto-assign</option>
                  {mediaTargets.map((target) => <option key={target.label} value={target.label}>{target.label}</option>)}
                </select>
              </Field>
              <Field label="File" hint="GIF, JPEG, PNG, SVG, or WebP up to the configured upload limit.">
                <input key={mediaFileInputKey} id="media-file" type="file" accept="image/gif,image/jpeg,image/png,image/svg+xml,image/webp" onChange={(event) => onMediaFileChange(event.target.files?.[0] ?? null)} />
              </Field>
              {mediaFile ? <button className="admin-button admin-button-secondary" type="button" onClick={onMediaFileClear}>Clear file</button> : null}
            </div>
          </div>
          <div className="admin-editor-panel">
            {mediaFile ? <SelectedMediaPreview file={mediaFile} /> : (
              <div className="admin-empty-state admin-empty-state--large">
                <p className="admin-kicker">Preview</p>
                <h3>Choose an image</h3>
                <p>The selected media preview and file details appear here before upload.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="admin-recent-activity" className="admin-resource-section admin-resource-section--secondary" aria-labelledby="admin-activity-title">
        <div className="admin-section-header">
          <div>
            <p className="admin-kicker">Activity</p>
            <h2 id="admin-activity-title">Recent commits</h2>
            <p className="admin-note">{activityLoadedAt ? `Loaded ${activityLoadedAt}` : 'Not loaded yet'}</p>
          </div>
          <button className="admin-button admin-button-secondary" type="button" onClick={onReloadActivity} disabled={loadingActivity}>Refresh</button>
        </div>
        <dl className="admin-metadata">
          <dt>Branch</dt><dd>{projectBranch ?? 'unknown'}</dd>
          <dt>Projects source file</dt><dd>{projectPath}</dd>
          <dt>Repository</dt><dd>{projectRepo ? `${projectRepo.owner}/${projectRepo.repo}` : blogRepo ? `${blogRepo.owner}/${blogRepo.repo}` : 'unknown'}</dd>
        </dl>
        {projectRepo ? <a className="admin-button admin-button-secondary admin-button-inline" href={projectRepo.branchUrl} target="_blank" rel="noreferrer">Open branch</a> : null}
        <StatusMessage kind="error" message={activityError} />
        {activity.length ? (
          <ul className="admin-activity-list">
            {activity.map((entry) => (
              <li key={entry.sha}>
                {entry.url ? <a href={entry.url} target="_blank" rel="noreferrer">{entry.message}</a> : <span>{entry.message}</span>}
                <p className="admin-note">{entry.authorLogin ?? entry.authorName ?? 'Unknown author'} · {entry.committedAt ?? 'unknown time'} · {entry.sha.slice(0, 7)}</p>
              </li>
            ))}
          </ul>
        ) : <div className="admin-empty-state"><h3>No activity loaded</h3><p>Refresh to check recent Git-backed writes.</p></div>}
      </section>
    </main>
  )
}
