import { useEffect, useMemo, useState } from 'react'
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
    <div className="admin-alert admin-alert--warning">
      <strong>{label} changed on GitHub.</strong>
      <p>Reload before saving again.</p>
      {conflict.currentSha ? <p className="admin-code">Current file SHA: {conflict.currentSha}</p> : null}
      {conflict.latestCommitSha ? <p className="admin-code">Latest commit SHA: {conflict.latestCommitSha}</p> : null}
    </div>
  )
}

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
      <main className="admin-shell">
        <section className="admin-card admin-login-card">
          <p className="admin-kicker">Portfolio admin</p>
          <h1>Sign in with GitHub</h1>
          <p className="admin-note">Only Blog posts and Projects are editable here. Site-wide content is edited directly in code or JSON.</p>
          <div className="admin-actions">
            <button className="admin-button" type="button" onClick={onLogin} disabled={loading}>Sign in</button>
          </div>
          <StatusMessage kind="error" message={error} />
          <StatusMessage message={authStatus} />
        </section>
      </main>
    )
  }

  return (
    <main className="admin-shell">
      <header className="admin-hero">
        <div>
          <p className="admin-kicker">Portfolio admin</p>
          <h1>Blog posts + Projects only</h1>
          <p>Site chrome, page copy, socials, contact/resume/about/home config, and other SiteContent settings are intentionally not editable in this dashboard.</p>
        </div>
        <div className="admin-actions">
          <a className="admin-button admin-button-secondary" href={siteUrl || '/'} target="_blank" rel="noreferrer">Open site</a>
          <button className="admin-button admin-button-secondary" type="button" onClick={onLogout}>Sign out</button>
        </div>
      </header>

      <nav className="admin-card admin-quick-nav" aria-label="Admin quick links">
        <a href="#admin-project-editor">Projects</a>
        <a href="#admin-blog-editor">Blog posts</a>
        <a href="#admin-media-uploader">Media</a>
        <a href="#admin-repo-content">Repo</a>
        <a href="#admin-recent-activity">Activity</a>
      </nav>

      <StatusMessage kind="error" message={error} />
      <ConflictNotice conflict={projectConflict} label="Projects" />
      <ConflictNotice conflict={blogConflict} label="Blog post" />

      <section id="admin-session" className="admin-card">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">Session</p>
            <h2>{session.login ? `Signed in as ${session.login}` : 'Signed in'}</h2>
          </div>
          <p className="admin-note">Expires: {session.expiresAt ?? 'unknown'}</p>
        </div>
        <StatusMessage message={authStatus} />
      </section>

      <section id="admin-project-editor" className="admin-card">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">Editable resource</p>
            <h2>Projects</h2>
            <p className="admin-note">Stored inside {projectPath}; saves merge only the projects array back into the JSON file.</p>
          </div>
          <div className="admin-actions">
            <button className="admin-button admin-button-secondary" type="button" onClick={onProjectReload} disabled={loadingProjects || savingProjects}>Reload</button>
            <button className="admin-button admin-button-secondary" type="button" onClick={onProjectDiscard} disabled={!projectDirty || savingProjects}>Discard</button>
            <button className="admin-button" type="button" onClick={onProjectSave} disabled={!projectDirty || Boolean(projectValidationError) || savingProjects}>{savingProjects ? 'Saving…' : 'Save projects'}</button>
          </div>
        </div>
        <StatusMessage message={projectStatus} />
        <StatusMessage kind="error" message={projectValidationError} />
        <div className="admin-grid admin-grid--two">
          <div className="admin-field-group">
            <label htmlFor="project-select">Project</label>
            <select id="project-select" value={selectedProjectSlug} onChange={(event) => onProjectSelect(event.target.value)}>
              {projectOptions.map((project) => <option key={project.slug} value={project.slug}>{project.title || project.slug}</option>)}
            </select>
            <div className="admin-actions admin-actions--wrap">
              <button className="admin-button admin-button-secondary" type="button" onClick={onProjectCreate}>New</button>
              <button className="admin-button admin-button-secondary" type="button" onClick={onProjectDuplicate} disabled={!selectedProject}>Duplicate</button>
              <button className="admin-button admin-button-secondary" type="button" onClick={() => onProjectMove('up')} disabled={!selectedProject}>Move up</button>
              <button className="admin-button admin-button-secondary" type="button" onClick={() => onProjectMove('down')} disabled={!selectedProject}>Move down</button>
              <button className="admin-button admin-button-danger" type="button" onClick={onProjectDelete} disabled={!selectedProject}>Delete</button>
            </div>
            <p className="admin-note">{projects.length} project{projects.length === 1 ? '' : 's'} in the editable collection.</p>
          </div>

          {selectedProject ? (
            <div className="admin-field-group">
              <label htmlFor="project-slug">Slug</label>
              <input id="project-slug" value={selectedProject.slug} onChange={(event) => onProjectFieldChange('slug', event.target.value)} />
              <label htmlFor="project-title">Title</label>
              <input id="project-title" value={selectedProject.title} onChange={(event) => onProjectFieldChange('title', event.target.value)} />
              <label htmlFor="project-year">Year</label>
              <input id="project-year" value={selectedProject.year} onChange={(event) => onProjectFieldChange('year', event.target.value)} />
              <label htmlFor="project-client">Client</label>
              <input id="project-client" value={selectedProject.client} onChange={(event) => onProjectFieldChange('client', event.target.value)} />
              <label htmlFor="project-role">Role</label>
              <input id="project-role" value={selectedProject.role} onChange={(event) => onProjectFieldChange('role', event.target.value)} />
              <label htmlFor="project-summary">Summary</label>
              <textarea id="project-summary" rows={3} value={selectedProject.summary} onChange={(event) => onProjectFieldChange('summary', event.target.value)} />
              <label htmlFor="project-challenge">Challenge</label>
              <textarea id="project-challenge" rows={4} value={selectedProject.challenge} onChange={(event) => onProjectFieldChange('challenge', event.target.value)} />
              <label htmlFor="project-stack">Stack, one per line</label>
              <textarea id="project-stack" rows={4} value={lines(selectedProject.stack)} onChange={(event) => onProjectFieldChange('stack', event.target.value)} />
              <label htmlFor="project-approach">Approach, one per line</label>
              <textarea id="project-approach" rows={5} value={lines(selectedProject.approach)} onChange={(event) => onProjectFieldChange('approach', event.target.value)} />
              <label htmlFor="project-outcome">Outcome, one per line</label>
              <textarea id="project-outcome" rows={5} value={lines(selectedProject.outcome)} onChange={(event) => onProjectFieldChange('outcome', event.target.value)} />
              <label htmlFor="project-image">Hero image JSON</label>
              <textarea id="project-image" rows={5} value={json(selectedProject.image ?? emptyImage())} onChange={(event) => onProjectJsonFieldChange('image', event.target.value)} />
              <label htmlFor="project-gallery">Gallery JSON</label>
              <textarea id="project-gallery" rows={8} value={json(selectedProject.gallery ?? [])} onChange={(event) => onProjectJsonFieldChange('gallery', event.target.value)} />
              <label htmlFor="project-sections">Sections JSON</label>
              <textarea id="project-sections" rows={10} value={json(selectedProject.sections ?? [])} onChange={(event) => onProjectJsonFieldChange('sections', event.target.value)} />
            </div>
          ) : <p className="admin-note">No project selected.</p>}
        </div>
      </section>

      <section id="admin-blog-editor" className="admin-card">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">Editable resource</p>
            <h2>Blog posts</h2>
            <p className="admin-note">Markdown files in content/blog. Create, edit, delete, and upload blog media remain supported.</p>
          </div>
          <div className="admin-actions">
            <button className="admin-button admin-button-secondary" type="button" onClick={onBlogReload} disabled={!blogPost || blogLoading || savingBlog}>Reload post</button>
            <button className="admin-button admin-button-secondary" type="button" onClick={onBlogDiscard} disabled={!blogDirty || savingBlog}>Discard</button>
            <button className="admin-button" type="button" onClick={onBlogSave} disabled={!blogPost || !blogDirty || Boolean(blogValidationError) || savingBlog}>{savingBlog ? 'Saving…' : 'Save blog post'}</button>
          </div>
        </div>
        <StatusMessage message={blogStatus} />
        <StatusMessage kind="error" message={blogValidationError} />
        {blogActivity ? <p className="admin-note">{blogActivity.summary} Latest commit: {blogActivity.latestCommitSha ?? 'unknown'}</p> : null}
        <div className="admin-grid admin-grid--two">
          <div className="admin-field-group">
            <label htmlFor="blog-select">Blog post</label>
            <select id="blog-select" value={selectedBlogSlug} onChange={(event) => onBlogSelect(event.target.value)}>
              <option value="">Select a post</option>
              {blogList.map((post) => <option key={post.slug} value={post.slug}>{post.title || post.slug}</option>)}
            </select>
            <div className="admin-actions admin-actions--wrap">
              <button className="admin-button admin-button-secondary" type="button" onClick={onBlogCreate}>New</button>
              <button className="admin-button admin-button-secondary" type="button" onClick={onBlogDuplicate} disabled={!blogPost}>Duplicate</button>
              <button className="admin-button admin-button-danger" type="button" onClick={onBlogDelete} disabled={!blogPost?.sha || savingBlog}>Delete</button>
            </div>
            {blogMeta ? <p className="admin-note admin-code">{blogMeta.path}</p> : null}
          </div>

          {blogPost ? (
            <div className="admin-field-group">
              <label htmlFor="blog-title">Title</label>
              <input id="blog-title" value={blogPost.title} onChange={(event) => onBlogFieldChange('title', event.target.value)} />
              <label htmlFor="blog-slug">Slug</label>
              <input id="blog-slug" value={blogPost.slug} onChange={(event) => onBlogFieldChange('slug', event.target.value)} />
              <label htmlFor="blog-date">Date</label>
              <input id="blog-date" value={blogPost.date} onChange={(event) => onBlogFieldChange('date', event.target.value)} />
              <label htmlFor="blog-status">Status</label>
              <select id="blog-status" value={blogPost.status} onChange={(event) => onBlogFieldChange('status', event.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <label htmlFor="blog-excerpt">Excerpt</label>
              <textarea id="blog-excerpt" rows={3} value={blogPost.excerpt ?? ''} onChange={(event) => onBlogFieldChange('excerpt', event.target.value)} />
              <label htmlFor="blog-cover">Cover image</label>
              <input id="blog-cover" value={blogPost.coverImage ?? ''} onChange={(event) => onBlogFieldChange('coverImage', event.target.value)} />
              <label htmlFor="blog-cover-alt">Cover alt text</label>
              <input id="blog-cover-alt" value={blogPost.coverAlt ?? ''} onChange={(event) => onBlogFieldChange('coverAlt', event.target.value)} />
              <label htmlFor="blog-body">Markdown body</label>
              <textarea id="blog-body" rows={18} value={blogPost.body} onChange={(event) => onBlogFieldChange('body', event.target.value)} />
              <p className="admin-note">Preview blocks: {blogPreviewBlocks.length}</p>
            </div>
          ) : <p className="admin-note">Select or create a blog post.</p>}
        </div>
      </section>

      <section id="admin-media-uploader" className="admin-card">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">Media</p>
            <h2>Upload blog or project media</h2>
            <p className="admin-note">Uploads are limited to /images/blog/... and /images/projects/...</p>
          </div>
          <div className="admin-actions">
            <button className="admin-button" type="button" onClick={onMediaUpload} disabled={!mediaFile || Boolean(mediaValidationError) || uploadingMedia}>{uploadingMedia ? 'Uploading…' : 'Upload media'}</button>
          </div>
        </div>
        <StatusMessage message={mediaStatus} />
        <StatusMessage kind="error" message={mediaValidationError} />
        {mediaPath ? (
          <p className="admin-note">Uploaded path: <span className="admin-code">{mediaPath}</span> <button className="admin-button admin-button-secondary" type="button" onClick={onMediaResultClear}>Clear</button></p>
        ) : null}
        <div className="admin-grid admin-grid--two">
          <div className="admin-field-group">
            <label htmlFor="media-area">Area</label>
            <select id="media-area" value={mediaArea} onChange={(event) => onMediaAreaChange(event.target.value as 'blog' | 'projects')}>
              <option value="blog">Blog</option>
              <option value="projects">Projects</option>
            </select>
            <label htmlFor="media-slug">Folder slug</label>
            <input id="media-slug" value={mediaSlug} onChange={(event) => onMediaSlugChange(event.target.value)} />
            <label htmlFor="media-target">Assign uploaded path to</label>
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
            <label htmlFor="media-file">File</label>
            <input key={mediaFileInputKey} id="media-file" type="file" accept="image/gif,image/jpeg,image/png,image/svg+xml,image/webp" onChange={(event) => onMediaFileChange(event.target.files?.[0] ?? null)} />
            {mediaFile ? <button className="admin-button admin-button-secondary" type="button" onClick={onMediaFileClear}>Clear file</button> : null}
          </div>
          {mediaFile ? <SelectedMediaPreview file={mediaFile} /> : <p className="admin-note">Choose an image to preview it before upload.</p>}
        </div>
      </section>

      <section id="admin-repo-content" className="admin-card">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">Repo</p>
            <h2>Git-backed writes</h2>
          </div>
          {projectRepo ? <a className="admin-button admin-button-secondary" href={projectRepo.branchUrl} target="_blank" rel="noreferrer">Open branch</a> : null}
        </div>
        <dl className="admin-metadata">
          <dt>Branch</dt><dd>{projectBranch ?? 'unknown'}</dd>
          <dt>Projects source file</dt><dd>{projectPath}</dd>
          <dt>Repository</dt><dd>{projectRepo ? `${projectRepo.owner}/${projectRepo.repo}` : blogRepo ? `${blogRepo.owner}/${blogRepo.repo}` : 'unknown'}</dd>
        </dl>
      </section>

      <section id="admin-recent-activity" className="admin-card">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">Activity</p>
            <h2>Recent commits</h2>
            <p className="admin-note">{activityLoadedAt ? `Loaded ${activityLoadedAt}` : 'Not loaded yet'}</p>
          </div>
          <button className="admin-button admin-button-secondary" type="button" onClick={onReloadActivity} disabled={loadingActivity}>Refresh</button>
        </div>
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
        ) : <p className="admin-note">No recent activity loaded.</p>}
      </section>
    </main>
  )
}
