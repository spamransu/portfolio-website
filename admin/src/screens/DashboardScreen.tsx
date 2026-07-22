import type { AdminSession, SiteContentResponse } from '../api/adminApi'
import type { BlogPostMeta, BlogPostResponse, SiteContent } from '../types'

interface DashboardScreenProps {
  blogDirty: boolean
  blogList: BlogPostMeta[]
  blogLoading: boolean
  blogMeta: BlogPostMeta | null
  blogPost: BlogPostResponse | null
  blogStatus: string | null
  dirty: boolean
  error: string | null
  loading: boolean
  loadingContent: boolean
  mediaArea: string
  mediaPath: string
  mediaSlug: string
  mediaStatus: string | null
  onBlogFieldChange: (field: string, value: string) => void
  onBlogReload: () => void
  onBlogSave: () => void
  onBlogSelect: (slug: string) => void
  onFieldChange: (field: string, value: string) => void
  onLogin: () => void
  onLogout: () => void
  onMediaAreaChange: (value: string) => void
  onMediaFileChange: (file: File | null) => void
  onMediaSlugChange: (value: string) => void
  onMediaUpload: () => void
  onReload: () => void
  onSave: () => void
  saveStatus: string | null
  saving: boolean
  savingBlog: boolean
  selectedBlogSlug: string
  session: AdminSession | null
  siteContent: SiteContentResponse | null
  uploadingMedia: boolean
  workingCopy: SiteContent | null
}

const mediaAreas = ['blog', 'home', 'projects', 'about', 'resume', 'contact']
const toLines = (value: string[]): string => value.join('\n')

export const DashboardScreen = ({
  blogDirty,
  blogList,
  blogLoading,
  blogMeta,
  blogPost,
  blogStatus,
  dirty,
  error,
  loading,
  loadingContent,
  mediaArea,
  mediaPath,
  mediaSlug,
  mediaStatus,
  onBlogFieldChange,
  onBlogReload,
  onBlogSave,
  onBlogSelect,
  onFieldChange,
  onLogin,
  onLogout,
  onMediaAreaChange,
  onMediaFileChange,
  onMediaSlugChange,
  onMediaUpload,
  onReload,
  onSave,
  saveStatus,
  saving,
  savingBlog,
  selectedBlogSlug,
  session,
  siteContent,
  uploadingMedia,
  workingCopy,
}: DashboardScreenProps) => {
  const formattedJson = workingCopy ? JSON.stringify(workingCopy, null, 2) : ''
  const sectionNames = workingCopy ? Object.keys(workingCopy) : []

  return (
    <main className="admin-shell">
      <section className="admin-panel admin-hero">
        <div>
          <p className="admin-kicker">Portfolio admin</p>
          <h1>Git-backed content dashboard</h1>
          <p className="admin-copy">
            This admin shell authenticates through GitHub, edits structured site content, exposes blog posts as markdown-backed content, and can now upload media directly into the repo.
          </p>
        </div>
        <div className="admin-actions">
          {session?.authenticated ? (
            <>
              <button type="button" className="admin-button admin-button-secondary" onClick={onReload} disabled={loadingContent || saving}>
                Reload content
              </button>
              <button type="button" className="admin-button" onClick={onSave} disabled={!dirty || saving || !workingCopy}>
                {saving ? 'Saving…' : dirty ? 'Save content' : 'Content saved'}
              </button>
              <button type="button" className="admin-button admin-button-secondary" onClick={onLogout} disabled={saving || savingBlog || uploadingMedia}>
                Log out
              </button>
            </>
          ) : (
            <button type="button" className="admin-button" onClick={onLogin} disabled={loading}>
              {loading ? 'Checking session…' : 'Log in with GitHub'}
            </button>
          )}
        </div>
      </section>

      {error ? <section className="admin-panel admin-error">{error}</section> : null}
      {saveStatus ? <section className="admin-panel admin-success">{saveStatus}</section> : null}
      {blogStatus ? <section className="admin-panel admin-success">{blogStatus}</section> : null}
      {mediaStatus ? <section className="admin-panel admin-success">{mediaStatus}</section> : null}

      <section className="admin-grid">
        <article className="admin-panel">
          <h2>Session</h2>
          <dl className="admin-meta-list">
            <div>
              <dt>Status</dt>
              <dd>{session?.authenticated ? 'Authenticated' : 'Signed out'}</dd>
            </div>
            <div>
              <dt>GitHub login</dt>
              <dd>{session?.login ?? '—'}</dd>
            </div>
            <div>
              <dt>Expires</dt>
              <dd>{session?.expiresAt ?? '—'}</dd>
            </div>
          </dl>
        </article>

        <article className="admin-panel">
          <h2>Repo content</h2>
          <dl className="admin-meta-list">
            <div>
              <dt>Branch</dt>
              <dd>{siteContent?.branch ?? '—'}</dd>
            </div>
            <div>
              <dt>Blob SHA</dt>
              <dd className="admin-code">{siteContent?.sha ?? '—'}</dd>
            </div>
            <div>
              <dt>Latest commit</dt>
              <dd className="admin-code">{siteContent?.latestCommitSha ?? '—'}</dd>
            </div>
            <div>
              <dt>Sections</dt>
              <dd>{sectionNames.length ? sectionNames.join(', ') : '—'}</dd>
            </div>
            <div>
              <dt>Blog posts</dt>
              <dd>{blogList.length}</dd>
            </div>
          </dl>
        </article>
      </section>

      {workingCopy ? (
        <section className="admin-edit-grid">
          <article className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h2>Site settings</h2>
                <p className="admin-copy">Global identity and contact details rendered throughout the public site.</p>
              </div>
            </div>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Name</span>
                <input value={workingCopy.site.name} onChange={(event) => onFieldChange('site.name', event.target.value)} />
              </label>
              <label className="admin-field">
                <span>Tagline</span>
                <textarea value={workingCopy.site.tagline} onChange={(event) => onFieldChange('site.tagline', event.target.value)} />
              </label>
              <label className="admin-field">
                <span>Description</span>
                <textarea value={workingCopy.site.description} onChange={(event) => onFieldChange('site.description', event.target.value)} />
              </label>
              <label className="admin-field">
                <span>Email</span>
                <input value={workingCopy.site.email} onChange={(event) => onFieldChange('site.email', event.target.value)} />
              </label>
              <label className="admin-field">
                <span>Location</span>
                <input value={workingCopy.site.location} onChange={(event) => onFieldChange('site.location', event.target.value)} />
              </label>
              <label className="admin-field">
                <span>Site URL</span>
                <input value={workingCopy.site.siteUrl} onChange={(event) => onFieldChange('site.siteUrl', event.target.value)} />
              </label>
            </div>
          </article>

          <article className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h2>Home hero</h2>
                <p className="admin-copy">Primary homepage intro copy and CTA labels.</p>
              </div>
            </div>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Eyebrow</span>
                <input value={workingCopy.home.hero.eyebrow} onChange={(event) => onFieldChange('home.hero.eyebrow', event.target.value)} />
              </label>
              <label className="admin-field">
                <span>Title lines (one per line)</span>
                <textarea value={toLines(workingCopy.home.hero.titleLines)} onChange={(event) => onFieldChange('home.hero.titleLines', event.target.value)} />
              </label>
              <label className="admin-field">
                <span>Description</span>
                <textarea value={workingCopy.home.hero.description} onChange={(event) => onFieldChange('home.hero.description', event.target.value)} />
              </label>
              <label className="admin-field">
                <span>Primary CTA</span>
                <input value={workingCopy.home.cta.primaryLabel} onChange={(event) => onFieldChange('home.cta.primaryLabel', event.target.value)} />
              </label>
              <label className="admin-field">
                <span>Secondary CTA</span>
                <input value={workingCopy.home.cta.secondaryLabel} onChange={(event) => onFieldChange('home.cta.secondaryLabel', event.target.value)} />
              </label>
            </div>
          </article>

          <article className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h2>About page</h2>
                <p className="admin-copy">Intro, body paragraphs, principles, and tools.</p>
              </div>
            </div>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Intro</span>
                <textarea value={workingCopy.about.intro} onChange={(event) => onFieldChange('about.intro', event.target.value)} />
              </label>
              <label className="admin-field">
                <span>Body paragraphs (one per line)</span>
                <textarea value={toLines(workingCopy.about.body)} onChange={(event) => onFieldChange('about.body', event.target.value)} />
              </label>
              <label className="admin-field">
                <span>Principles (one per line)</span>
                <textarea value={toLines(workingCopy.about.principles)} onChange={(event) => onFieldChange('about.principles', event.target.value)} />
              </label>
              <label className="admin-field">
                <span>Tools (one per line)</span>
                <textarea value={toLines(workingCopy.about.tools)} onChange={(event) => onFieldChange('about.tools', event.target.value)} />
              </label>
            </div>
          </article>

          <article className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h2>Blog page</h2>
                <p className="admin-copy">Public intro copy for the published blog archive.</p>
              </div>
            </div>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Blog title</span>
                <input value={workingCopy.blogPage?.title ?? ''} onChange={(event) => onFieldChange('blogPage.title', event.target.value)} />
              </label>
              <label className="admin-field">
                <span>Blog intro</span>
                <textarea value={workingCopy.blogPage?.intro ?? ''} onChange={(event) => onFieldChange('blogPage.intro', event.target.value)} />
              </label>
            </div>
          </article>

          <article className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h2>Contact page</h2>
                <p className="admin-copy">Public contact pitch and form copy.</p>
              </div>
            </div>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Title</span>
                <input value={workingCopy.contact.title} onChange={(event) => onFieldChange('contact.title', event.target.value)} />
              </label>
              <label className="admin-field">
                <span>Body</span>
                <textarea value={workingCopy.contact.body} onChange={(event) => onFieldChange('contact.body', event.target.value)} />
              </label>
              <label className="admin-field">
                <span>Availability</span>
                <textarea value={workingCopy.contact.availability} onChange={(event) => onFieldChange('contact.availability', event.target.value)} />
              </label>
              <label className="admin-field">
                <span>Form title</span>
                <input value={workingCopy.contact.form.title} onChange={(event) => onFieldChange('contact.form.title', event.target.value)} />
              </label>
              <label className="admin-field">
                <span>Form intro</span>
                <textarea value={workingCopy.contact.form.intro} onChange={(event) => onFieldChange('contact.form.intro', event.target.value)} />
              </label>
              <label className="admin-field">
                <span>Submit label</span>
                <input value={workingCopy.contact.form.submitLabel} onChange={(event) => onFieldChange('contact.form.submitLabel', event.target.value)} />
              </label>
            </div>
          </article>

          <article className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h2>Media uploader</h2>
                <p className="admin-copy">Upload images into public/images and reuse the returned path in site or blog fields.</p>
              </div>
              <button type="button" className="admin-button" onClick={onMediaUpload} disabled={uploadingMedia || !mediaSlug.trim()}>
                {uploadingMedia ? 'Uploading…' : 'Upload media'}
              </button>
            </div>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Area</span>
                <select value={mediaArea} onChange={(event) => onMediaAreaChange(event.target.value)}>
                  {mediaAreas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </label>
              <label className="admin-field">
                <span>Slug</span>
                <input value={mediaSlug} onChange={(event) => onMediaSlugChange(event.target.value)} placeholder="e.g. lightweight-git-backed-portfolio-cms" />
              </label>
              <label className="admin-field">
                <span>Image file</span>
                <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif" onChange={(event) => onMediaFileChange(event.target.files?.[0] ?? null)} />
              </label>
              {mediaPath ? (
                <label className="admin-field">
                  <span>Last uploaded path</span>
                  <input readOnly value={mediaPath} />
                </label>
              ) : null}
            </div>
          </article>

          <article className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h2>Blog editor</h2>
                <p className="admin-copy">Select a post from content/blog and edit its frontmatter plus markdown body.</p>
              </div>
              <div className="admin-actions">
                <button type="button" className="admin-button admin-button-secondary" onClick={onBlogReload} disabled={!selectedBlogSlug || blogLoading || savingBlog}>
                  Reload post
                </button>
                <button type="button" className="admin-button" onClick={onBlogSave} disabled={!blogDirty || !blogPost || savingBlog}>
                  {savingBlog ? 'Saving…' : blogDirty ? 'Save post' : 'Post saved'}
                </button>
              </div>
            </div>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Published posts + drafts</span>
                <select value={selectedBlogSlug} onChange={(event) => onBlogSelect(event.target.value)}>
                  {blogList.map((post) => (
                    <option key={post.slug} value={post.slug}>
                      {post.date} — {post.title}
                    </option>
                  ))}
                </select>
              </label>
              {blogMeta ? <p className="admin-note">{blogMeta.path}</p> : null}
              {blogPost ? (
                <>
                  <label className="admin-field">
                    <span>Title</span>
                    <input value={blogPost.title} onChange={(event) => onBlogFieldChange('title', event.target.value)} />
                  </label>
                  <label className="admin-field">
                    <span>Date</span>
                    <input value={blogPost.date} onChange={(event) => onBlogFieldChange('date', event.target.value)} />
                  </label>
                  <label className="admin-field">
                    <span>Status</span>
                    <select value={blogPost.status} onChange={(event) => onBlogFieldChange('status', event.target.value)}>
                      <option value="draft">draft</option>
                      <option value="published">published</option>
                    </select>
                  </label>
                  <label className="admin-field">
                    <span>Cover image</span>
                    <input value={blogPost.coverImage ?? ''} onChange={(event) => onBlogFieldChange('coverImage', event.target.value)} />
                  </label>
                  <label className="admin-field">
                    <span>Cover alt</span>
                    <input value={blogPost.coverAlt ?? ''} onChange={(event) => onBlogFieldChange('coverAlt', event.target.value)} />
                  </label>
                  <label className="admin-field">
                    <span>Excerpt</span>
                    <textarea value={blogPost.excerpt ?? ''} onChange={(event) => onBlogFieldChange('excerpt', event.target.value)} />
                  </label>
                  <label className="admin-field">
                    <span>Markdown body</span>
                    <textarea className="admin-markdown" value={blogPost.body} onChange={(event) => onBlogFieldChange('body', event.target.value)} />
                  </label>
                </>
              ) : null}
            </div>
          </article>

          <section className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h2>Live JSON preview</h2>
                <p className="admin-copy">The save action commits this full structured object back to content/site-content.json.</p>
              </div>
              {loadingContent ? <span className="admin-status">Loading…</span> : null}
            </div>
            <textarea readOnly value={formattedJson} className="admin-code-viewer" spellCheck={false} />
          </section>
        </section>
      ) : null}
    </main>
  )
}
