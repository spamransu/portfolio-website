import type { AdminRepoInfo, AdminSession, SiteContentResponse } from '../api/adminApi'
import { parseBlogMarkdownBlocks } from '../../../src/content/blogMarkdown'
import type { BlogPostMeta, BlogPostResponse, ContactMethod, HighlightStat, HomeStat, ImageAsset, Job, ProcessStep, Project, SiteContent, SocialLink } from '../types'

interface DashboardScreenProps {
  blogActivity: {
    latestCommitSha: string | null
    path: string
    repo: AdminRepoInfo
    summary: string
  } | null
  blogConflict: {
    currentSha?: string
    latestCommitSha?: string | null
  } | null
  blogDirty: boolean
  blogList: BlogPostMeta[]
  blogRepo: AdminRepoInfo | null
  blogLoading: boolean
  onBlogCreate: () => void
  onBlogDelete: () => void
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
  onStructuredAdd: (scope: string) => void
  onStructuredFieldChange: (scope: string, field: string, value: string, index?: number) => void
  onStructuredRemove: (scope: string, index?: number) => void
  onLogin: () => void
  onLogout: () => void
  onMediaAreaChange: (value: string) => void
  onMediaFileChange: (file: File | null) => void
  onMediaSlugChange: (value: string) => void
  onMediaUpload: () => void
  onProcessSelect: (value: number) => void
  onProjectGallerySelect: (value: number) => void
  onProjectSelect: (value: string) => void
  onHomeStatSelect: (value: number) => void
  onSocialSelect: (value: number) => void
  onHighlightSelect: (value: number) => void
  onExperienceSelect: (value: number) => void
  onMethodSelect: (value: number) => void
  onReload: () => void
  onSave: () => void
  projectOptions: Array<{ slug: string; title: string }>
  saveStatus: string | null
  saving: boolean
  savingBlog: boolean
  siteUrl: string
  selectedBlogSlug: string
  selectedExperience: Job | null
  selectedExperienceIndex: number
  selectedExperienceTotal: number
  selectedHighlight: HighlightStat | null
  selectedHighlightIndex: number
  selectedHighlightTotal: number
  selectedHomeStat: HomeStat | null
  selectedHomeStatIndex: number
  selectedHomeStatTotal: number
  selectedMethod: ContactMethod | null
  selectedMethodIndex: number
  selectedMethodTotal: number
  selectedProcess: ProcessStep | null
  selectedProcessIndex: number
  selectedProcessTotal: number
  selectedProject: Project | null
  selectedProjectGalleryIndex: number
  selectedProjectGalleryItem: ImageAsset | null
  selectedProjectGalleryTotal: number
  selectedProjectSlug: string
  selectedSocial: SocialLink | null
  selectedSocialIndex: number
  selectedSocialTotal: number
  session: AdminSession | null
  siteConflict: {
    currentSha?: string
    latestCommitSha?: string | null
  } | null
  siteContent: SiteContentResponse | null
  uploadingMedia: boolean
  workingCopy: SiteContent | null
}

const mediaAreas = ['blog', 'home', 'projects', 'about', 'resume', 'contact']
const toLines = (value: string[]): string => value.join('\n')

export const DashboardScreen = ({
  blogActivity,
  blogConflict,
  blogDirty,
  blogList,
  blogRepo,
  blogLoading,
  onBlogCreate,
  onBlogDelete,
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
  onStructuredAdd,
  onStructuredFieldChange,
  onStructuredRemove,
  onLogin,
  onLogout,
  onMediaAreaChange,
  onMediaFileChange,
  onMediaSlugChange,
  onMediaUpload,
  onProcessSelect,
  onProjectGallerySelect,
  onProjectSelect,
  onHomeStatSelect,
  onSocialSelect,
  onHighlightSelect,
  onExperienceSelect,
  onMethodSelect,
  onReload,
  onSave,
  projectOptions,
  saveStatus,
  saving,
  savingBlog,
  siteUrl,
  selectedBlogSlug,
  selectedExperience,
  selectedExperienceIndex,
  selectedExperienceTotal,
  selectedHighlight,
  selectedHighlightIndex,
  selectedHighlightTotal,
  selectedHomeStat,
  selectedHomeStatIndex,
  selectedHomeStatTotal,
  selectedMethod,
  selectedMethodIndex,
  selectedMethodTotal,
  selectedProcess,
  selectedProcessIndex,
  selectedProcessTotal,
  selectedProject,
  selectedProjectGalleryIndex,
  selectedProjectGalleryItem,
  selectedProjectGalleryTotal,
  selectedProjectSlug,
  selectedSocial,
  selectedSocialIndex,
  selectedSocialTotal,
  session,
  siteConflict,
  siteContent,
  uploadingMedia,
  workingCopy,
}: DashboardScreenProps) => {
  const formattedJson = workingCopy ? JSON.stringify(workingCopy, null, 2) : ''
  const sectionNames = workingCopy ? Object.keys(workingCopy) : []
  const activeRepo = siteContent?.repo ?? blogRepo ?? blogActivity?.repo ?? null
  const createCommitUrl = (repo: AdminRepoInfo | null, sha: string | null | undefined) =>
    repo && sha ? `${repo.repoUrl}/commit/${encodeURIComponent(sha)}` : null
  const createBlobUrl = (repo: AdminRepoInfo | null, branch: string | null | undefined, path: string | null | undefined) =>
    repo && branch && path ? `${repo.repoUrl}/blob/${encodeURIComponent(branch)}/${path}` : null
  const mediaRepoPath = mediaPath ? `public/${mediaPath.replace(/^\//, '')}` : null
  const selectedBlogPath = blogPost?.path ?? blogMeta?.path ?? null
  const siteContentUrl = createBlobUrl(siteContent?.repo ?? null, siteContent?.branch ?? null, siteContent?.path ?? null)
  const selectedBlogUrl = createBlobUrl(blogRepo, siteContent?.branch ?? null, selectedBlogPath)
  const uploadedMediaUrl = createBlobUrl(mediaPath ? activeRepo : null, siteContent?.branch ?? null, mediaRepoPath)
  const normalizedSiteUrl = siteUrl.trim().replace(/\/+$/, '')
  const publicBlogUrl = normalizedSiteUrl ? `${normalizedSiteUrl}/blog` : null
  const publicPostUrl = normalizedSiteUrl && blogPost?.status === 'published' ? `${normalizedSiteUrl}/blog/${blogPost.slug}` : null
  const previewBlocks = blogPost ? parseBlogMarkdownBlocks(blogPost.body) : []

  return (
    <main className="admin-shell">
      <section className="admin-panel admin-hero">
        <div>
          <p className="admin-kicker">Portfolio admin</p>
          <h1>Git-backed content dashboard</h1>
          <p className="admin-copy">
            This admin shell authenticates through GitHub, edits structured site content, exposes blog posts as markdown-backed content, uploads media into the repo, and now covers more repeatable project and profile data.
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
      {siteConflict ? (
        <section className="admin-panel admin-warning">
          <div className="admin-panel-header">
            <div>
              <h2>Content conflict</h2>
              <p className="admin-copy">GitHub changed this content after the admin loaded it. Reload before saving again.</p>
            </div>
            <button type="button" className="admin-button admin-button-secondary" onClick={onReload} disabled={loadingContent || saving}>
              Reload content
            </button>
          </div>
          <dl className="admin-meta-list">
            <div><dt>Loaded blob SHA</dt><dd className="admin-code">{siteContent?.sha ?? '—'}</dd></div>
            <div><dt>Current blob SHA</dt><dd className="admin-code">{siteConflict.currentSha ?? '—'}</dd></div>
            <div><dt>Latest commit</dt><dd className="admin-code">{siteConflict.latestCommitSha ?? '—'}</dd></div>
          </dl>
        </section>
      ) : null}
      {blogConflict ? (
        <section className="admin-panel admin-warning">
          <div className="admin-panel-header">
            <div>
              <h2>Blog conflict</h2>
              <p className="admin-copy">This post changed in GitHub after it was loaded. Reload the post before saving or deleting.</p>
            </div>
            <button type="button" className="admin-button admin-button-secondary" onClick={onBlogReload} disabled={!selectedBlogSlug || blogLoading || savingBlog}>
              Reload post
            </button>
          </div>
          <dl className="admin-meta-list">
            <div><dt>Loaded blob SHA</dt><dd className="admin-code">{blogPost?.sha ?? '—'}</dd></div>
            <div><dt>Current blob SHA</dt><dd className="admin-code">{blogConflict.currentSha ?? '—'}</dd></div>
            <div><dt>Latest commit</dt><dd className="admin-code">{blogConflict.latestCommitSha ?? '—'}</dd></div>
          </dl>
        </section>
      ) : null}
      {saveStatus ? <section className="admin-panel admin-success">{saveStatus}</section> : null}
      {blogStatus ? <section className="admin-panel admin-success">{blogStatus}</section> : null}
      {mediaStatus ? <section className="admin-panel admin-success">{mediaStatus}</section> : null}

      <section className="admin-grid">
        <article className="admin-panel">
          <h2>Session</h2>
          <dl className="admin-meta-list">
            <div><dt>Status</dt><dd>{session?.authenticated ? 'Authenticated' : 'Signed out'}</dd></div>
            <div><dt>GitHub login</dt><dd>{session?.login ?? '—'}</dd></div>
            <div><dt>Expires</dt><dd>{session?.expiresAt ?? '—'}</dd></div>
            <div><dt>Unsaved changes</dt><dd>{dirty || blogDirty ? 'Yes' : 'No'}</dd></div>
          </dl>
        </article>

        <article className="admin-panel">
          <h2>Repo content</h2>
          <dl className="admin-meta-list">
            <div><dt>Branch</dt><dd>{siteContent?.branch ?? '—'}</dd></div>
            <div><dt>Blob SHA</dt><dd className="admin-code">{siteContent?.sha ?? '—'}</dd></div>
            <div><dt>Latest commit</dt><dd className="admin-code">{siteContent?.latestCommitSha ?? '—'}</dd></div>
            <div><dt>Sections</dt><dd>{sectionNames.length ? sectionNames.join(', ') : '—'}</dd></div>
            <div><dt>Projects</dt><dd>{projectOptions.length}</dd></div>
            <div><dt>Blog posts</dt><dd>{blogList.length}</dd></div>
          </dl>
          <div className="admin-actions admin-actions--links">
            {activeRepo ? <a className="admin-button admin-button-secondary" href={activeRepo.repoUrl} target="_blank" rel="noreferrer">Open repo</a> : null}
            {siteContent?.repo ? <a className="admin-button admin-button-secondary" href={siteContent.repo.branchUrl} target="_blank" rel="noreferrer">Open branch</a> : null}
            {siteContentUrl ? <a className="admin-button admin-button-secondary" href={siteContentUrl} target="_blank" rel="noreferrer">Open site JSON</a> : null}
            {createCommitUrl(siteContent?.repo ?? null, siteContent?.latestCommitSha) ? (
              <a className="admin-button admin-button-secondary" href={createCommitUrl(siteContent?.repo ?? null, siteContent?.latestCommitSha) ?? undefined} target="_blank" rel="noreferrer">
                Latest site commit
              </a>
            ) : null}
            {selectedBlogUrl ? <a className="admin-button admin-button-secondary" href={selectedBlogUrl} target="_blank" rel="noreferrer">Open selected post</a> : null}
            {publicBlogUrl ? <a className="admin-button admin-button-secondary" href={publicBlogUrl} target="_blank" rel="noreferrer">Open public blog</a> : null}
            {publicPostUrl ? <a className="admin-button admin-button-secondary" href={publicPostUrl} target="_blank" rel="noreferrer">Open published post</a> : null}
            {blogActivity && createCommitUrl(blogActivity.repo, blogActivity.latestCommitSha) ? (
              <a className="admin-button admin-button-secondary" href={createCommitUrl(blogActivity.repo, blogActivity.latestCommitSha) ?? undefined} target="_blank" rel="noreferrer">
                {blogActivity.summary} commit
              </a>
            ) : null}
            {uploadedMediaUrl ? <a className="admin-button admin-button-secondary" href={uploadedMediaUrl} target="_blank" rel="noreferrer">Open uploaded asset</a> : null}
          </div>
        </article>
      </section>

      {workingCopy ? (
        <section className="admin-edit-grid">
          <article className="admin-panel">
            <h2>Home page</h2>
            <div className="admin-form-grid">
              <label className="admin-field"><span>Hero eyebrow</span><input value={workingCopy.home.hero.eyebrow} onChange={(event) => onFieldChange('home.hero.eyebrow', event.target.value)} /></label>
              <label className="admin-field"><span>Hero title lines (one per line)</span><textarea value={toLines(workingCopy.home.hero.titleLines)} onChange={(event) => onFieldChange('home.hero.titleLines', event.target.value)} /></label>
              <label className="admin-field"><span>Hero description</span><textarea value={workingCopy.home.hero.description} onChange={(event) => onFieldChange('home.hero.description', event.target.value)} /></label>
              <label className="admin-field"><span>Primary CTA label</span><input value={workingCopy.home.cta.primaryLabel} onChange={(event) => onFieldChange('home.cta.primaryLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Secondary CTA label</span><input value={workingCopy.home.cta.secondaryLabel} onChange={(event) => onFieldChange('home.cta.secondaryLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Featured projects title</span><input value={workingCopy.home.featuredProjects.title} onChange={(event) => onFieldChange('home.featuredProjects.title', event.target.value)} /></label>
              <label className="admin-field"><span>Featured projects intro</span><textarea value={workingCopy.home.featuredProjects.intro} onChange={(event) => onFieldChange('home.featuredProjects.intro', event.target.value)} /></label>
              <label className="admin-field"><span>Featured project slugs (one per line)</span><textarea value={toLines(workingCopy.home.featuredProjects.slugs)} onChange={(event) => onFieldChange('home.featuredProjects.slugs', event.target.value)} /></label>
              <label className="admin-field"><span>Featured fallback label</span><input value={workingCopy.home.featuredProjects.fallbackLabel} onChange={(event) => onFieldChange('home.featuredProjects.fallbackLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Featured fallback description</span><textarea value={workingCopy.home.featuredProjects.fallbackDescription} onChange={(event) => onFieldChange('home.featuredProjects.fallbackDescription', event.target.value)} /></label>
              <label className="admin-field"><span>Featured stack aria template</span><input value={workingCopy.home.featuredProjects.stackAriaTemplate ?? ''} onChange={(event) => onFieldChange('home.featuredProjects.stackAriaTemplate', event.target.value)} /></label>
              <label className="admin-field"><span>Bio eyebrow</span><input value={workingCopy.home.bio.eyebrow} onChange={(event) => onFieldChange('home.bio.eyebrow', event.target.value)} /></label>
              <label className="admin-field"><span>Bio title lines (one per line)</span><textarea value={toLines(workingCopy.home.bio.titleLines)} onChange={(event) => onFieldChange('home.bio.titleLines', event.target.value)} /></label>
              <label className="admin-field"><span>Bio description</span><textarea value={workingCopy.home.bio.description} onChange={(event) => onFieldChange('home.bio.description', event.target.value)} /></label>
              <label className="admin-field"><span>Skills title</span><input value={workingCopy.home.skills.title} onChange={(event) => onFieldChange('home.skills.title', event.target.value)} /></label>
              <label className="admin-field"><span>Skills description</span><textarea value={workingCopy.home.skills.description} onChange={(event) => onFieldChange('home.skills.description', event.target.value)} /></label>
              <label className="admin-field"><span>Skills items (one per line)</span><textarea value={toLines(workingCopy.home.skills.items)} onChange={(event) => onFieldChange('home.skills.items', event.target.value)} /></label>
              <label className="admin-field"><span>Skills cloud aria label</span><input value={workingCopy.home.skills.cloudAriaLabel ?? ''} onChange={(event) => onFieldChange('home.skills.cloudAriaLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Home contact title</span><input value={workingCopy.home.contact.title} onChange={(event) => onFieldChange('home.contact.title', event.target.value)} /></label>
              <label className="admin-field"><span>Home contact intro</span><textarea value={workingCopy.home.contact.intro} onChange={(event) => onFieldChange('home.contact.intro', event.target.value)} /></label>
              <label className="admin-field"><span>Home contact submit label</span><input value={workingCopy.home.contact.submitLabel} onChange={(event) => onFieldChange('home.contact.submitLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Home contact message limit</span><input type="number" min={0} value={workingCopy.home.contact.messageLimit} onChange={(event) => onFieldChange('home.contact.messageLimit', event.target.value)} /></label>
              <label className="admin-field"><span>Home contact name label</span><input value={workingCopy.home.contact.nameLabel} onChange={(event) => onFieldChange('home.contact.nameLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Home contact email label</span><input value={workingCopy.home.contact.emailLabel} onChange={(event) => onFieldChange('home.contact.emailLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Home contact message label</span><input value={workingCopy.home.contact.messageLabel} onChange={(event) => onFieldChange('home.contact.messageLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Home contact name placeholder</span><input value={workingCopy.home.contact.namePlaceholder} onChange={(event) => onFieldChange('home.contact.namePlaceholder', event.target.value)} /></label>
              <label className="admin-field"><span>Home contact email placeholder</span><input value={workingCopy.home.contact.emailPlaceholder} onChange={(event) => onFieldChange('home.contact.emailPlaceholder', event.target.value)} /></label>
              <label className="admin-field"><span>Home contact message placeholder</span><textarea value={workingCopy.home.contact.messagePlaceholder} onChange={(event) => onFieldChange('home.contact.messagePlaceholder', event.target.value)} /></label>
              <label className="admin-field"><span>Home contact name required error</span><input value={workingCopy.home.contact.nameRequiredError} onChange={(event) => onFieldChange('home.contact.nameRequiredError', event.target.value)} /></label>
              <label className="admin-field"><span>Home contact email required error</span><input value={workingCopy.home.contact.emailRequiredError} onChange={(event) => onFieldChange('home.contact.emailRequiredError', event.target.value)} /></label>
              <label className="admin-field"><span>Home contact email invalid error</span><input value={workingCopy.home.contact.emailInvalidError} onChange={(event) => onFieldChange('home.contact.emailInvalidError', event.target.value)} /></label>
              <label className="admin-field"><span>Home contact message required error</span><input value={workingCopy.home.contact.messageRequiredError} onChange={(event) => onFieldChange('home.contact.messageRequiredError', event.target.value)} /></label>
              <label className="admin-field"><span>Home contact message too long error</span><input value={workingCopy.home.contact.messageTooLongError} onChange={(event) => onFieldChange('home.contact.messageTooLongError', event.target.value)} /></label>
              <label className="admin-field"><span>Home contact count template</span><input value={workingCopy.home.contact.messageCountTemplate} onChange={(event) => onFieldChange('home.contact.messageCountTemplate', event.target.value)} /></label>
              <label className="admin-field"><span>Home contact mailto subject template</span><input value={workingCopy.home.contact.mailtoSubjectTemplate} onChange={(event) => onFieldChange('home.contact.mailtoSubjectTemplate', event.target.value)} /></label>
              <label className="admin-field"><span>Home contact mailto name label</span><input value={workingCopy.home.contact.mailtoNameLabel} onChange={(event) => onFieldChange('home.contact.mailtoNameLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Home contact mailto email label</span><input value={workingCopy.home.contact.mailtoEmailLabel} onChange={(event) => onFieldChange('home.contact.mailtoEmailLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Home contact mailto message label</span><input value={workingCopy.home.contact.mailtoMessageLabel} onChange={(event) => onFieldChange('home.contact.mailtoMessageLabel', event.target.value)} /></label>
            </div>
          </article>

          <article className="admin-panel">
            <div className="admin-panel-header"><div><h2>Home stats</h2><p className="admin-copy">Edit the stat cards shown on the homepage bio section.</p></div><div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('homeStat')}>Add stat</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('homeStat', selectedHomeStatIndex)} disabled={selectedHomeStatTotal <= 1}>Remove selected</button></div></div>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Selected stat</span>
                <select value={selectedHomeStatIndex} onChange={(event) => onHomeStatSelect(Number(event.target.value))}>
                  {workingCopy.home.stats.map((item, index) => <option key={`${item.label}-${index}`} value={index}>{index + 1} — {item.label}</option>)}
                </select>
              </label>
              <p className="admin-note">{selectedHomeStatTotal} home stats available.</p>
              {selectedHomeStat ? (
                <>
                  <label className="admin-field"><span>Value</span><input value={selectedHomeStat.value} onChange={(event) => onStructuredFieldChange('homeStat', 'value', event.target.value, selectedHomeStatIndex)} /></label>
                  <label className="admin-field"><span>Label</span><input value={selectedHomeStat.label} onChange={(event) => onStructuredFieldChange('homeStat', 'label', event.target.value, selectedHomeStatIndex)} /></label>
                  <label className="admin-field"><span>Tone</span><select value={selectedHomeStat.tone} onChange={(event) => onStructuredFieldChange('homeStat', 'tone', event.target.value, selectedHomeStatIndex)}><option value="accent">accent</option><option value="accent-2">accent-2</option><option value="accent-3">accent-3</option></select></label>
                </>
              ) : null}
            </div>
          </article>

          <article className="admin-panel">
            <h2>Site settings</h2>
            <div className="admin-form-grid">
              <label className="admin-field"><span>Name</span><input value={workingCopy.site.name} onChange={(event) => onFieldChange('site.name', event.target.value)} /></label>
              <label className="admin-field"><span>Tagline</span><textarea value={workingCopy.site.tagline} onChange={(event) => onFieldChange('site.tagline', event.target.value)} /></label>
              <label className="admin-field"><span>Description</span><textarea value={workingCopy.site.description} onChange={(event) => onFieldChange('site.description', event.target.value)} /></label>
              <label className="admin-field"><span>Email</span><input value={workingCopy.site.email} onChange={(event) => onFieldChange('site.email', event.target.value)} /></label>
              <label className="admin-field"><span>Location</span><input value={workingCopy.site.location} onChange={(event) => onFieldChange('site.location', event.target.value)} /></label>
              <label className="admin-field"><span>Site URL</span><input value={workingCopy.site.siteUrl} onChange={(event) => onFieldChange('site.siteUrl', event.target.value)} /></label>
            </div>
          </article>

          <article className="admin-panel">
            <h2>Site chrome</h2>
            <div className="admin-form-grid">
              <label className="admin-field"><span>Skip link label</span><input value={workingCopy.siteChrome?.skipToContentLabel ?? ''} onChange={(event) => onFieldChange('siteChrome.skipToContentLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Header nav aria label</span><input value={workingCopy.siteChrome?.headerNavAriaLabel ?? ''} onChange={(event) => onFieldChange('siteChrome.headerNavAriaLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Footer socials aria label</span><input value={workingCopy.siteChrome?.footerSocialsAriaLabel ?? ''} onChange={(event) => onFieldChange('siteChrome.footerSocialsAriaLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Header nav links (path | label)</span><textarea value={(workingCopy.siteChrome?.headerNav ?? []).map((link) => `${link.to} | ${link.label}`).join('\n')} onChange={(event) => onFieldChange('siteChrome.headerNav', event.target.value)} /></label>
              <label className="admin-field"><span>Header Linktree label</span><input value={workingCopy.siteChrome?.headerLinktreeLabel ?? ''} onChange={(event) => onFieldChange('siteChrome.headerLinktreeLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Footer copyright template</span><input value={workingCopy.siteChrome?.footer.copyrightTemplate ?? ''} onChange={(event) => onFieldChange('siteChrome.footer.copyrightTemplate', event.target.value)} /></label>
              <label className="admin-field"><span>Footer general heading</span><input value={workingCopy.siteChrome?.footer.generalHeading ?? ''} onChange={(event) => onFieldChange('siteChrome.footer.generalHeading', event.target.value)} /></label>
              <label className="admin-field"><span>Footer more heading</span><input value={workingCopy.siteChrome?.footer.moreHeading ?? ''} onChange={(event) => onFieldChange('siteChrome.footer.moreHeading', event.target.value)} /></label>
              <label className="admin-field"><span>Footer general links (path | label)</span><textarea value={(workingCopy.siteChrome?.footer.generalLinks ?? []).map((link) => `${link.to} | ${link.label}`).join('\n')} onChange={(event) => onFieldChange('siteChrome.footer.generalLinks', event.target.value)} /></label>
              <label className="admin-field"><span>Footer more links (path | label)</span><textarea value={(workingCopy.siteChrome?.footer.moreLinks ?? []).map((link) => `${link.to} | ${link.label}`).join('\n')} onChange={(event) => onFieldChange('siteChrome.footer.moreLinks', event.target.value)} /></label>
              <label className="admin-field"><span>Footer Linktree label</span><input value={workingCopy.siteChrome?.footer.linktreeLabel ?? ''} onChange={(event) => onFieldChange('siteChrome.footer.linktreeLabel', event.target.value)} /></label>
            </div>
          </article>

          <article className="admin-panel">
            <h2>Project detail page</h2>
            <div className="admin-form-grid">
              <label className="admin-field"><span>Eyebrow</span><input value={workingCopy.projectDetailPage?.eyebrow ?? ''} onChange={(event) => onFieldChange('projectDetailPage.eyebrow', event.target.value)} /></label>
              <label className="admin-field"><span>Not found title</span><input value={workingCopy.projectDetailPage?.notFoundTitle ?? ''} onChange={(event) => onFieldChange('projectDetailPage.notFoundTitle', event.target.value)} /></label>
              <label className="admin-field"><span>Not found intro</span><textarea value={workingCopy.projectDetailPage?.notFoundIntro ?? ''} onChange={(event) => onFieldChange('projectDetailPage.notFoundIntro', event.target.value)} /></label>
              <label className="admin-field"><span>Back to projects label</span><input value={workingCopy.projectDetailPage?.backToProjectsLabel ?? ''} onChange={(event) => onFieldChange('projectDetailPage.backToProjectsLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Start project label</span><input value={workingCopy.projectDetailPage?.startProjectLabel ?? ''} onChange={(event) => onFieldChange('projectDetailPage.startProjectLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Snapshot section title</span><input value={workingCopy.projectDetailPage?.snapshotTitle ?? ''} onChange={(event) => onFieldChange('projectDetailPage.snapshotTitle', event.target.value)} /></label>
              <label className="admin-field"><span>Role label</span><input value={workingCopy.projectDetailPage?.roleLabel ?? ''} onChange={(event) => onFieldChange('projectDetailPage.roleLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Client label</span><input value={workingCopy.projectDetailPage?.clientLabel ?? ''} onChange={(event) => onFieldChange('projectDetailPage.clientLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Year label</span><input value={workingCopy.projectDetailPage?.yearLabel ?? ''} onChange={(event) => onFieldChange('projectDetailPage.yearLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Stack label</span><input value={workingCopy.projectDetailPage?.stackLabel ?? ''} onChange={(event) => onFieldChange('projectDetailPage.stackLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Stack aria template</span><input value={workingCopy.projectDetailPage?.stackAriaTemplate ?? ''} onChange={(event) => onFieldChange('projectDetailPage.stackAriaTemplate', event.target.value)} /></label>
              <label className="admin-field"><span>Gallery section title</span><input value={workingCopy.projectDetailPage?.galleryTitle ?? ''} onChange={(event) => onFieldChange('projectDetailPage.galleryTitle', event.target.value)} /></label>
              <label className="admin-field"><span>Gallery section intro</span><textarea value={workingCopy.projectDetailPage?.galleryIntro ?? ''} onChange={(event) => onFieldChange('projectDetailPage.galleryIntro', event.target.value)} /></label>
              <label className="admin-field"><span>Next project eyebrow</span><input value={workingCopy.projectDetailPage?.nextProjectEyebrow ?? ''} onChange={(event) => onFieldChange('projectDetailPage.nextProjectEyebrow', event.target.value)} /></label>
              <label className="admin-field"><span>Next project label</span><input value={workingCopy.projectDetailPage?.nextProjectLabel ?? ''} onChange={(event) => onFieldChange('projectDetailPage.nextProjectLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Similar work eyebrow</span><input value={workingCopy.projectDetailPage?.similarWorkEyebrow ?? ''} onChange={(event) => onFieldChange('projectDetailPage.similarWorkEyebrow', event.target.value)} /></label>
              <label className="admin-field"><span>Similar work title</span><input value={workingCopy.projectDetailPage?.similarWorkTitle ?? ''} onChange={(event) => onFieldChange('projectDetailPage.similarWorkTitle', event.target.value)} /></label>
              <label className="admin-field"><span>Similar work intro</span><textarea value={workingCopy.projectDetailPage?.similarWorkIntro ?? ''} onChange={(event) => onFieldChange('projectDetailPage.similarWorkIntro', event.target.value)} /></label>
              <label className="admin-field"><span>Similar work label</span><input value={workingCopy.projectDetailPage?.similarWorkLabel ?? ''} onChange={(event) => onFieldChange('projectDetailPage.similarWorkLabel', event.target.value)} /></label>
            </div>
          </article>

          <article className="admin-panel">
            <h2>Projects page</h2>
            <div className="admin-form-grid">
              <label className="admin-field"><span>Projects eyebrow</span><input value={workingCopy.projectsPage?.eyebrow ?? ''} onChange={(event) => onFieldChange('projectsPage.eyebrow', event.target.value)} /></label>
              <label className="admin-field"><span>Projects title</span><input value={workingCopy.projectsPage?.title ?? ''} onChange={(event) => onFieldChange('projectsPage.title', event.target.value)} /></label>
              <label className="admin-field"><span>Projects intro</span><textarea value={workingCopy.projectsPage?.intro ?? ''} onChange={(event) => onFieldChange('projectsPage.intro', event.target.value)} /></label>
              <label className="admin-field"><span>Project role label prefix</span><input value={workingCopy.projectsPage?.roleLabelPrefix ?? ''} onChange={(event) => onFieldChange('projectsPage.roleLabelPrefix', event.target.value)} /></label>
              <label className="admin-field"><span>Project stack aria template</span><input value={workingCopy.projectsPage?.stackAriaTemplate ?? ''} onChange={(event) => onFieldChange('projectsPage.stackAriaTemplate', event.target.value)} /></label>
              <label className="admin-field"><span>Projects hero image src</span><input value={workingCopy.projectsPage?.heroImage?.src ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'projectsPage.src', event.target.value)} /></label>
              <label className="admin-field"><span>Projects hero image alt</span><input value={workingCopy.projectsPage?.heroImage?.alt ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'projectsPage.alt', event.target.value)} /></label>
              <label className="admin-field"><span>Projects hero caption</span><textarea value={workingCopy.projectsPage?.heroImage?.caption ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'projectsPage.caption', event.target.value)} /></label>
            </div>
          </article>

          <article className="admin-panel">
            <h2>Blog page</h2>
            <div className="admin-form-grid">
              <label className="admin-field"><span>Blog eyebrow</span><input value={workingCopy.blogPage?.eyebrow ?? ''} onChange={(event) => onFieldChange('blogPage.eyebrow', event.target.value)} /></label>
              <label className="admin-field"><span>Blog title</span><input value={workingCopy.blogPage?.title ?? ''} onChange={(event) => onFieldChange('blogPage.title', event.target.value)} /></label>
              <label className="admin-field"><span>Blog intro</span><textarea value={workingCopy.blogPage?.intro ?? ''} onChange={(event) => onFieldChange('blogPage.intro', event.target.value)} /></label>
              <label className="admin-field"><span>Blog hero image src</span><input value={workingCopy.blogPage?.heroImage?.src ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'blogPage.src', event.target.value)} /></label>
              <label className="admin-field"><span>Blog hero image alt</span><input value={workingCopy.blogPage?.heroImage?.alt ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'blogPage.alt', event.target.value)} /></label>
              <label className="admin-field"><span>Blog hero caption</span><textarea value={workingCopy.blogPage?.heroImage?.caption ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'blogPage.caption', event.target.value)} /></label>
            </div>
          </article>

          <article className="admin-panel">
            <h2>Blog post page</h2>
            <div className="admin-form-grid">
              <label className="admin-field"><span>Blog eyebrow prefix</span><input value={workingCopy.blogPostPage?.eyebrowPrefix ?? ''} onChange={(event) => onFieldChange('blogPostPage.eyebrowPrefix', event.target.value)} /></label>
              <label className="admin-field"><span>Not found title</span><input value={workingCopy.blogPostPage?.notFoundTitle ?? ''} onChange={(event) => onFieldChange('blogPostPage.notFoundTitle', event.target.value)} /></label>
              <label className="admin-field"><span>Not found intro</span><textarea value={workingCopy.blogPostPage?.notFoundIntro ?? ''} onChange={(event) => onFieldChange('blogPostPage.notFoundIntro', event.target.value)} /></label>
              <label className="admin-field"><span>Back to blog label</span><input value={workingCopy.blogPostPage?.backToBlogLabel ?? ''} onChange={(event) => onFieldChange('blogPostPage.backToBlogLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Start project label</span><input value={workingCopy.blogPostPage?.startProjectLabel ?? ''} onChange={(event) => onFieldChange('blogPostPage.startProjectLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Article section title</span><input value={workingCopy.blogPostPage?.articleSectionTitle ?? ''} onChange={(event) => onFieldChange('blogPostPage.articleSectionTitle', event.target.value)} /></label>
            </div>
          </article>

          <article className="admin-panel">
            <h2>404 page</h2>
            <div className="admin-form-grid">
              <label className="admin-field"><span>Eyebrow</span><input value={workingCopy.notFoundPage?.eyebrow ?? ''} onChange={(event) => onFieldChange('notFoundPage.eyebrow', event.target.value)} /></label>
              <label className="admin-field"><span>Title</span><input value={workingCopy.notFoundPage?.title ?? ''} onChange={(event) => onFieldChange('notFoundPage.title', event.target.value)} /></label>
              <label className="admin-field"><span>Intro</span><textarea value={workingCopy.notFoundPage?.intro ?? ''} onChange={(event) => onFieldChange('notFoundPage.intro', event.target.value)} /></label>
              <label className="admin-field"><span>Suggestions eyebrow</span><input value={workingCopy.notFoundPage?.suggestionsEyebrow ?? ''} onChange={(event) => onFieldChange('notFoundPage.suggestionsEyebrow', event.target.value)} /></label>
              <label className="admin-field"><span>View projects label</span><input value={workingCopy.notFoundPage?.viewProjectsLabel ?? ''} onChange={(event) => onFieldChange('notFoundPage.viewProjectsLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Back home label</span><input value={workingCopy.notFoundPage?.backHomeLabel ?? ''} onChange={(event) => onFieldChange('notFoundPage.backHomeLabel', event.target.value)} /></label>
            </div>
          </article>

          <article className="admin-panel">
            <div className="admin-panel-header"><div><h2>Social links</h2><p className="admin-copy">Edit the existing social entries from the site config.</p></div><div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('social')}>Add social</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('social', selectedSocialIndex)} disabled={selectedSocialTotal <= 1}>Remove selected</button></div></div>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Selected social</span>
                <select value={selectedSocialIndex} onChange={(event) => onSocialSelect(Number(event.target.value))}>
                  {workingCopy.site.socials.map((social, index) => <option key={`${social.label}-${index}`} value={index}>{index + 1} — {social.label}</option>)}
                </select>
              </label>
              <p className="admin-note">{selectedSocialTotal} social links available.</p>
              {selectedSocial ? (
                <>
                  <label className="admin-field"><span>Label</span><input value={selectedSocial.label} onChange={(event) => onStructuredFieldChange('social', 'label', event.target.value, selectedSocialIndex)} /></label>
                  <label className="admin-field"><span>URL</span><input value={selectedSocial.href} onChange={(event) => onStructuredFieldChange('social', 'href', event.target.value, selectedSocialIndex)} /></label>
                </>
              ) : null}
            </div>
          </article>

          <article className="admin-panel">
            <h2>About page</h2>
            <div className="admin-form-grid">
              <label className="admin-field"><span>Eyebrow</span><input value={workingCopy.about.eyebrow ?? ''} onChange={(event) => onFieldChange('about.eyebrow', event.target.value)} /></label>
              <label className="admin-field"><span>Title</span><input value={workingCopy.about.title} onChange={(event) => onFieldChange('about.title', event.target.value)} /></label>
              <label className="admin-field"><span>Intro</span><textarea value={workingCopy.about.intro} onChange={(event) => onFieldChange('about.intro', event.target.value)} /></label>
              <label className="admin-field"><span>Body section title</span><input value={workingCopy.about.bodySectionTitle} onChange={(event) => onFieldChange('about.bodySectionTitle', event.target.value)} /></label>
              <label className="admin-field"><span>Process section title</span><input value={workingCopy.about.processSectionTitle} onChange={(event) => onFieldChange('about.processSectionTitle', event.target.value)} /></label>
              <label className="admin-field"><span>Process section intro</span><textarea value={workingCopy.about.processSectionIntro} onChange={(event) => onFieldChange('about.processSectionIntro', event.target.value)} /></label>
              <label className="admin-field"><span>Principles section title</span><input value={workingCopy.about.principlesSectionTitle} onChange={(event) => onFieldChange('about.principlesSectionTitle', event.target.value)} /></label>
              <label className="admin-field"><span>Tools section title</span><input value={workingCopy.about.toolsSectionTitle} onChange={(event) => onFieldChange('about.toolsSectionTitle', event.target.value)} /></label>
              <label className="admin-field"><span>Body paragraphs (one per line)</span><textarea value={toLines(workingCopy.about.body)} onChange={(event) => onFieldChange('about.body', event.target.value)} /></label>
              <label className="admin-field"><span>Principles (one per line)</span><textarea value={toLines(workingCopy.about.principles)} onChange={(event) => onFieldChange('about.principles', event.target.value)} /></label>
              <label className="admin-field"><span>Tools (one per line)</span><textarea value={toLines(workingCopy.about.tools)} onChange={(event) => onFieldChange('about.tools', event.target.value)} /></label>
              <label className="admin-field"><span>Hero image src</span><input value={workingCopy.about.heroImage?.src ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'about.src', event.target.value)} /></label>
              <label className="admin-field"><span>Hero image alt</span><input value={workingCopy.about.heroImage?.alt ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'about.alt', event.target.value)} /></label>
              <label className="admin-field"><span>Hero image caption</span><textarea value={workingCopy.about.heroImage?.caption ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'about.caption', event.target.value)} /></label>
            </div>
          </article>

          <article className="admin-panel">
            <div className="admin-panel-header"><div><h2>Process steps</h2><p className="admin-copy">Edit the repeatable process cards shown on the about page.</p></div><div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('process')}>Add step</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('process', selectedProcessIndex)} disabled={selectedProcessTotal <= 1}>Remove selected</button></div></div>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Selected step</span>
                <select value={selectedProcessIndex} onChange={(event) => onProcessSelect(Number(event.target.value))}>
                  {workingCopy.about.process.map((step, index) => <option key={`${step.title}-${index}`} value={index}>{index + 1} — {step.title}</option>)}
                </select>
              </label>
              <p className="admin-note">{selectedProcessTotal} process steps available.</p>
              {selectedProcess ? (
                <>
                  <label className="admin-field"><span>Title</span><input value={selectedProcess.title} onChange={(event) => onStructuredFieldChange('process', 'title', event.target.value, selectedProcessIndex)} /></label>
                  <label className="admin-field"><span>Description</span><textarea value={selectedProcess.description} onChange={(event) => onStructuredFieldChange('process', 'description', event.target.value, selectedProcessIndex)} /></label>
                </>
              ) : null}
            </div>
          </article>

          <article className="admin-panel">
            <h2>Resume page</h2>
            <div className="admin-form-grid">
              <label className="admin-field"><span>Eyebrow</span><input value={workingCopy.resume.eyebrow ?? ''} onChange={(event) => onFieldChange('resume.eyebrow', event.target.value)} /></label>
              <label className="admin-field"><span>Headline</span><input value={workingCopy.resume.headline} onChange={(event) => onFieldChange('resume.headline', event.target.value)} /></label>
              <label className="admin-field"><span>Summary</span><textarea value={workingCopy.resume.summary} onChange={(event) => onFieldChange('resume.summary', event.target.value)} /></label>
              <label className="admin-field"><span>Highlights section title</span><input value={workingCopy.resume.highlightsSectionTitle} onChange={(event) => onFieldChange('resume.highlightsSectionTitle', event.target.value)} /></label>
              <label className="admin-field"><span>Skills section title</span><input value={workingCopy.resume.skillsSectionTitle} onChange={(event) => onFieldChange('resume.skillsSectionTitle', event.target.value)} /></label>
              <label className="admin-field"><span>Experience section title</span><input value={workingCopy.resume.experienceSectionTitle} onChange={(event) => onFieldChange('resume.experienceSectionTitle', event.target.value)} /></label>
              <label className="admin-field"><span>Resume hero image src</span><input value={workingCopy.resume.heroImage?.src ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'resume.src', event.target.value)} /></label>
              <label className="admin-field"><span>Resume hero image alt</span><input value={workingCopy.resume.heroImage?.alt ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'resume.alt', event.target.value)} /></label>
              <label className="admin-field"><span>Resume hero image caption</span><textarea value={workingCopy.resume.heroImage?.caption ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'resume.caption', event.target.value)} /></label>
            </div>
          </article>

          <article className="admin-panel">
            <div className="admin-panel-header"><div><h2>Resume highlights</h2><p className="admin-copy">Edit headline stat cards shown on the resume page.</p></div><div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('highlight')}>Add highlight</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('highlight', selectedHighlightIndex)} disabled={selectedHighlightTotal <= 1}>Remove selected</button></div></div>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Selected highlight</span>
                <select value={selectedHighlightIndex} onChange={(event) => onHighlightSelect(Number(event.target.value))}>
                  {workingCopy.resume.highlights.map((item, index) => <option key={`${item.label}-${index}`} value={index}>{index + 1} — {item.label}</option>)}
                </select>
              </label>
              <p className="admin-note">{selectedHighlightTotal} highlight cards available.</p>
              {selectedHighlight ? (
                <>
                  <label className="admin-field"><span>Value</span><input value={selectedHighlight.value} onChange={(event) => onStructuredFieldChange('highlight', 'value', event.target.value, selectedHighlightIndex)} /></label>
                  <label className="admin-field"><span>Label</span><input value={selectedHighlight.label} onChange={(event) => onStructuredFieldChange('highlight', 'label', event.target.value, selectedHighlightIndex)} /></label>
                </>
              ) : null}
            </div>
          </article>

          <article className="admin-panel">
            <div className="admin-panel-header"><div><h2>Resume experience</h2><p className="admin-copy">Edit each experience entry and its bullet highlights.</p></div><div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('experience')}>Add experience</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('experience', selectedExperienceIndex)} disabled={selectedExperienceTotal <= 1}>Remove selected</button></div></div>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Selected experience</span>
                <select value={selectedExperienceIndex} onChange={(event) => onExperienceSelect(Number(event.target.value))}>
                  {workingCopy.resume.experience.map((item, index) => <option key={`${item.company}-${index}`} value={index}>{index + 1} — {item.role}</option>)}
                </select>
              </label>
              <p className="admin-note">{selectedExperienceTotal} experience entries available.</p>
              {selectedExperience ? (
                <>
                  <label className="admin-field"><span>Role</span><input value={selectedExperience.role} onChange={(event) => onStructuredFieldChange('experience', 'role', event.target.value, selectedExperienceIndex)} /></label>
                  <label className="admin-field"><span>Company</span><input value={selectedExperience.company} onChange={(event) => onStructuredFieldChange('experience', 'company', event.target.value, selectedExperienceIndex)} /></label>
                  <label className="admin-field"><span>Period</span><input value={selectedExperience.period} onChange={(event) => onStructuredFieldChange('experience', 'period', event.target.value, selectedExperienceIndex)} /></label>
                  <label className="admin-field"><span>Highlights (one per line)</span><textarea value={toLines(selectedExperience.highlights)} onChange={(event) => onStructuredFieldChange('experience', 'highlights', event.target.value, selectedExperienceIndex)} /></label>
                </>
              ) : null}
            </div>
          </article>

          <article className="admin-panel">
            <h2>Contact page</h2>
            <div className="admin-form-grid">
              <label className="admin-field"><span>Eyebrow</span><input value={workingCopy.contact.eyebrow ?? ''} onChange={(event) => onFieldChange('contact.eyebrow', event.target.value)} /></label>
              <label className="admin-field"><span>Contact title</span><input value={workingCopy.contact.title} onChange={(event) => onFieldChange('contact.title', event.target.value)} /></label>
              <label className="admin-field"><span>Contact intro</span><textarea value={workingCopy.contact.body} onChange={(event) => onFieldChange('contact.body', event.target.value)} /></label>
              <label className="admin-field"><span>Email CTA prefix</span><input value={workingCopy.contact.emailCtaPrefix ?? ''} onChange={(event) => onFieldChange('contact.emailCtaPrefix', event.target.value)} /></label>
              <label className="admin-field"><span>Availability section title</span><input value={workingCopy.contact.availabilityTitle} onChange={(event) => onFieldChange('contact.availabilityTitle', event.target.value)} /></label>
              <label className="admin-field"><span>Availability status label</span><input value={workingCopy.contact.availabilityStatusLabel} onChange={(event) => onFieldChange('contact.availabilityStatusLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Availability location label</span><input value={workingCopy.contact.availabilityLocationLabel} onChange={(event) => onFieldChange('contact.availabilityLocationLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Availability body</span><textarea value={workingCopy.contact.availability} onChange={(event) => onFieldChange('contact.availability', event.target.value)} /></label>
              <label className="admin-field"><span>Form section title</span><input value={workingCopy.contact.formSectionTitle} onChange={(event) => onFieldChange('contact.formSectionTitle', event.target.value)} /></label>
              <label className="admin-field"><span>Form section intro</span><textarea value={workingCopy.contact.formSectionIntro} onChange={(event) => onFieldChange('contact.formSectionIntro', event.target.value)} /></label>
              <label className="admin-field"><span>Form card title</span><input value={workingCopy.contact.form.title} onChange={(event) => onFieldChange('contact.form.title', event.target.value)} /></label>
              <label className="admin-field"><span>Form card intro</span><textarea value={workingCopy.contact.form.intro} onChange={(event) => onFieldChange('contact.form.intro', event.target.value)} /></label>
              <label className="admin-field"><span>Form submit label</span><input value={workingCopy.contact.form.submitLabel} onChange={(event) => onFieldChange('contact.form.submitLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Form name label</span><input value={workingCopy.contact.form.nameLabel} onChange={(event) => onFieldChange('contact.form.nameLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Form email label</span><input value={workingCopy.contact.form.emailLabel} onChange={(event) => onFieldChange('contact.form.emailLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Form message label</span><input value={workingCopy.contact.form.messageLabel} onChange={(event) => onFieldChange('contact.form.messageLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Form name placeholder</span><input value={workingCopy.contact.form.namePlaceholder} onChange={(event) => onFieldChange('contact.form.namePlaceholder', event.target.value)} /></label>
              <label className="admin-field"><span>Form email placeholder</span><input value={workingCopy.contact.form.emailPlaceholder} onChange={(event) => onFieldChange('contact.form.emailPlaceholder', event.target.value)} /></label>
              <label className="admin-field"><span>Form message placeholder</span><textarea value={workingCopy.contact.form.messagePlaceholder} onChange={(event) => onFieldChange('contact.form.messagePlaceholder', event.target.value)} /></label>
              <label className="admin-field"><span>Form name required error</span><input value={workingCopy.contact.form.nameRequiredError} onChange={(event) => onFieldChange('contact.form.nameRequiredError', event.target.value)} /></label>
              <label className="admin-field"><span>Form email required error</span><input value={workingCopy.contact.form.emailRequiredError} onChange={(event) => onFieldChange('contact.form.emailRequiredError', event.target.value)} /></label>
              <label className="admin-field"><span>Form email invalid error</span><input value={workingCopy.contact.form.emailInvalidError} onChange={(event) => onFieldChange('contact.form.emailInvalidError', event.target.value)} /></label>
              <label className="admin-field"><span>Form message required error</span><input value={workingCopy.contact.form.messageRequiredError} onChange={(event) => onFieldChange('contact.form.messageRequiredError', event.target.value)} /></label>
              <label className="admin-field"><span>Form message too long error</span><input value={workingCopy.contact.form.messageTooLongError} onChange={(event) => onFieldChange('contact.form.messageTooLongError', event.target.value)} /></label>
              <label className="admin-field"><span>Form count template</span><input value={workingCopy.contact.form.messageCountTemplate} onChange={(event) => onFieldChange('contact.form.messageCountTemplate', event.target.value)} /></label>
              <label className="admin-field"><span>Form mailto subject template</span><input value={workingCopy.contact.form.mailtoSubjectTemplate} onChange={(event) => onFieldChange('contact.form.mailtoSubjectTemplate', event.target.value)} /></label>
              <label className="admin-field"><span>Form mailto name label</span><input value={workingCopy.contact.form.mailtoNameLabel} onChange={(event) => onFieldChange('contact.form.mailtoNameLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Form mailto email label</span><input value={workingCopy.contact.form.mailtoEmailLabel} onChange={(event) => onFieldChange('contact.form.mailtoEmailLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Form mailto message label</span><input value={workingCopy.contact.form.mailtoMessageLabel} onChange={(event) => onFieldChange('contact.form.mailtoMessageLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Methods section title</span><input value={workingCopy.contact.methodsSectionTitle} onChange={(event) => onFieldChange('contact.methodsSectionTitle', event.target.value)} /></label>
              <label className="admin-field"><span>Methods section intro</span><textarea value={workingCopy.contact.methodsSectionIntro} onChange={(event) => onFieldChange('contact.methodsSectionIntro', event.target.value)} /></label>
              <label className="admin-field"><span>Contact hero image src</span><input value={workingCopy.contact.heroImage?.src ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'contact.src', event.target.value)} /></label>
              <label className="admin-field"><span>Contact hero image alt</span><input value={workingCopy.contact.heroImage?.alt ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'contact.alt', event.target.value)} /></label>
              <label className="admin-field"><span>Contact hero image caption</span><textarea value={workingCopy.contact.heroImage?.caption ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'contact.caption', event.target.value)} /></label>
            </div>
          </article>

          <article className="admin-panel">
            <div className="admin-panel-header"><div><h2>Contact methods</h2><p className="admin-copy">Edit each contact method card.</p></div><div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('method')}>Add method</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('method', selectedMethodIndex)} disabled={selectedMethodTotal <= 1}>Remove selected</button></div></div>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Selected method</span>
                <select value={selectedMethodIndex} onChange={(event) => onMethodSelect(Number(event.target.value))}>
                  {workingCopy.contact.methods.map((method, index) => <option key={`${method.title}-${index}`} value={index}>{index + 1} — {method.title}</option>)}
                </select>
              </label>
              <p className="admin-note">{selectedMethodTotal} contact methods available.</p>
              {selectedMethod ? (
                <>
                  <label className="admin-field"><span>Title</span><input value={selectedMethod.title} onChange={(event) => onStructuredFieldChange('method', 'title', event.target.value, selectedMethodIndex)} /></label>
                  <label className="admin-field"><span>Label</span><input value={selectedMethod.label} onChange={(event) => onStructuredFieldChange('method', 'label', event.target.value, selectedMethodIndex)} /></label>
                  <label className="admin-field"><span>URL</span><input value={selectedMethod.href} onChange={(event) => onStructuredFieldChange('method', 'href', event.target.value, selectedMethodIndex)} /></label>
                  <label className="admin-field"><span>Description</span><textarea value={selectedMethod.description} onChange={(event) => onStructuredFieldChange('method', 'description', event.target.value, selectedMethodIndex)} /></label>
                </>
              ) : null}
            </div>
          </article>

          <article className="admin-panel">
            <div className="admin-panel-header"><div><h2>Project editor</h2><p className="admin-copy">Edit project metadata, stacks, narrative lists, and section copy for the selected case study.</p></div><div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('project')}>Add project</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('project')} disabled={projectOptions.length <= 1}>Remove selected</button></div></div>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Selected project</span>
                <select value={selectedProjectSlug} onChange={(event) => onProjectSelect(event.target.value)}>
                  {projectOptions.map((project) => <option key={project.slug} value={project.slug}>{project.title}</option>)}
                </select>
              </label>
              {selectedProject ? (
                <>
                  <label className="admin-field"><span>Title</span><input value={selectedProject.title} onChange={(event) => onStructuredFieldChange('project', 'title', event.target.value)} /></label>
                  <label className="admin-field"><span>Year</span><input value={selectedProject.year} onChange={(event) => onStructuredFieldChange('project', 'year', event.target.value)} /></label>
                  <label className="admin-field"><span>Client</span><input value={selectedProject.client} onChange={(event) => onStructuredFieldChange('project', 'client', event.target.value)} /></label>
                  <label className="admin-field"><span>Role</span><input value={selectedProject.role} onChange={(event) => onStructuredFieldChange('project', 'role', event.target.value)} /></label>
                  <label className="admin-field"><span>Summary</span><textarea value={selectedProject.summary} onChange={(event) => onStructuredFieldChange('project', 'summary', event.target.value)} /></label>
                  <label className="admin-field"><span>Challenge</span><textarea value={selectedProject.challenge} onChange={(event) => onStructuredFieldChange('project', 'challenge', event.target.value)} /></label>
                  <label className="admin-field"><span>Lead image src</span><input value={selectedProject.image?.src ?? ''} onChange={(event) => onStructuredFieldChange('projectImage', 'src', event.target.value)} /></label>
                  <label className="admin-field"><span>Lead image alt</span><input value={selectedProject.image?.alt ?? ''} onChange={(event) => onStructuredFieldChange('projectImage', 'alt', event.target.value)} /></label>
                  <label className="admin-field"><span>Stack (one per line)</span><textarea value={toLines(selectedProject.stack)} onChange={(event) => onStructuredFieldChange('project', 'stack', event.target.value)} /></label>
                  <label className="admin-field"><span>Approach bullets (one per line)</span><textarea value={toLines(selectedProject.approach)} onChange={(event) => onStructuredFieldChange('project', 'approach', event.target.value)} /></label>
                  <label className="admin-field"><span>Outcome bullets (one per line)</span><textarea value={toLines(selectedProject.outcome)} onChange={(event) => onStructuredFieldChange('project', 'outcome', event.target.value)} /></label>
                  <div className="admin-panel admin-panel--subtle">
                    <div className="admin-panel-header">
                      <div><h2>Project gallery</h2><p className="admin-copy">Edit gallery images for the selected project.</p></div>
                      <div className="admin-actions">
                        <button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('projectGallery')}>Add gallery image</button>
                        <button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('projectGallery', selectedProjectGalleryIndex)} disabled={selectedProjectGalleryTotal <= 1}>Remove selected</button>
                      </div>
                    </div>
                    <div className="admin-form-grid">
                      <label className="admin-field">
                        <span>Selected gallery image</span>
                        <select value={selectedProjectGalleryIndex} onChange={(event) => onProjectGallerySelect(Number(event.target.value))}>
                          {(selectedProject.gallery ?? []).map((image, index) => <option key={`${image.src}-${index}`} value={index}>{index + 1} — {image.alt || image.src || 'Gallery image'}</option>)}
                        </select>
                      </label>
                      {selectedProjectGalleryItem ? (
                        <>
                          <label className="admin-field"><span>Gallery image src</span><input value={selectedProjectGalleryItem.src} onChange={(event) => onStructuredFieldChange('projectGallery', 'src', event.target.value, selectedProjectGalleryIndex)} /></label>
                          <label className="admin-field"><span>Gallery image alt</span><input value={selectedProjectGalleryItem.alt} onChange={(event) => onStructuredFieldChange('projectGallery', 'alt', event.target.value, selectedProjectGalleryIndex)} /></label>
                          <label className="admin-field"><span>Gallery caption</span><textarea value={selectedProjectGalleryItem.caption ?? ''} onChange={(event) => onStructuredFieldChange('projectGallery', 'caption', event.target.value, selectedProjectGalleryIndex)} /></label>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('projectSection')}>Add section</button></div>
                  {selectedProject.sections?.map((section, index) => (
                    <div className="admin-subpanel" key={`${selectedProject.slug}-${section.title}-${index}`}>
                      <div className="admin-actions"><p className="admin-note">Section {index + 1}</p><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('projectSection', index)} disabled={(selectedProject.sections?.length ?? 0) <= 1}>Remove section</button></div>
                      <label className="admin-field"><span>Section kind</span><select value={section.kind} onChange={(event) => onStructuredFieldChange('projectSection', 'kind', event.target.value, index)}><option value="default">default</option><option value="approach">approach</option><option value="outcome">outcome</option></select></label>
                      <label className="admin-field"><span>Section title</span><input value={section.title} onChange={(event) => onStructuredFieldChange('projectSection', 'title', event.target.value, index)} /></label>
                      <label className="admin-field"><span>Section body</span><textarea value={section.body} onChange={(event) => onStructuredFieldChange('projectSection', 'body', event.target.value, index)} /></label>
                      <label className="admin-field"><span>Section image src</span><input value={section.image?.src ?? ''} onChange={(event) => onStructuredFieldChange('projectSection', 'image.src', event.target.value, index)} /></label>
                      <label className="admin-field"><span>Section image alt</span><input value={section.image?.alt ?? ''} onChange={(event) => onStructuredFieldChange('projectSection', 'image.alt', event.target.value, index)} /></label>
                      <label className="admin-field"><span>Section image caption</span><textarea value={section.image?.caption ?? ''} onChange={(event) => onStructuredFieldChange('projectSection', 'image.caption', event.target.value, index)} /></label>
                    </div>
                  ))}
                </>
              ) : null}
            </div>
          </article>

          <article className="admin-panel">
            <div className="admin-panel-header"><div><h2>Media uploader</h2><p className="admin-copy">Upload images into public/images and reuse the returned path in site or blog fields.</p></div><button type="button" className="admin-button" onClick={onMediaUpload} disabled={uploadingMedia || !mediaSlug.trim()}>{uploadingMedia ? 'Uploading…' : 'Upload media'}</button></div>
            <div className="admin-form-grid">
              <label className="admin-field"><span>Area</span><select value={mediaArea} onChange={(event) => onMediaAreaChange(event.target.value)}>{mediaAreas.map((area) => <option key={area} value={area}>{area}</option>)}</select></label>
              <label className="admin-field"><span>Slug</span><input value={mediaSlug} onChange={(event) => onMediaSlugChange(event.target.value)} placeholder="e.g. lightweight-git-backed-portfolio-cms" /></label>
              <label className="admin-field"><span>Image file</span><input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif" onChange={(event) => onMediaFileChange(event.target.files?.[0] ?? null)} /></label>
              {mediaPath ? <label className="admin-field"><span>Last uploaded path</span><input readOnly value={mediaPath} /></label> : null}
            </div>
          </article>

          <article className="admin-panel">
            <div className="admin-panel-header"><div><h2>Blog editor</h2><p className="admin-copy">Select a post from content/blog and edit its frontmatter plus markdown body.</p></div><div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={onBlogCreate}>New draft</button><button type="button" className="admin-button admin-button-secondary" onClick={onBlogReload} disabled={!selectedBlogSlug || blogLoading || savingBlog}>Reload post</button><button type="button" className="admin-button admin-button-secondary" onClick={onBlogDelete} disabled={!blogPost?.sha || savingBlog}>Delete post</button><button type="button" className="admin-button" onClick={onBlogSave} disabled={!blogDirty || !blogPost || savingBlog}>{savingBlog ? 'Saving…' : blogDirty ? 'Save post' : 'Post saved'}</button></div></div>
            <div className="admin-form-grid">
              <label className="admin-field"><span>Published posts + drafts</span><select value={selectedBlogSlug} onChange={(event) => onBlogSelect(event.target.value)}>{blogList.map((post) => <option key={post.slug} value={post.slug}>{post.date} — {post.title}</option>)}</select></label>
              {blogMeta ? <p className="admin-note">{blogMeta.path}</p> : null}
              {blogPost ? (
                <>
                  <label className="admin-field"><span>Title</span><input value={blogPost.title} onChange={(event) => onBlogFieldChange('title', event.target.value)} /></label>
                  <label className="admin-field"><span>Date</span><input value={blogPost.date} onChange={(event) => onBlogFieldChange('date', event.target.value)} /></label>
                  <label className="admin-field"><span>Status</span><select value={blogPost.status} onChange={(event) => onBlogFieldChange('status', event.target.value)}><option value="draft">draft</option><option value="published">published</option></select></label>
                  <label className="admin-field"><span>Cover image</span><input value={blogPost.coverImage ?? ''} onChange={(event) => onBlogFieldChange('coverImage', event.target.value)} /></label>
                  <label className="admin-field"><span>Cover alt</span><input value={blogPost.coverAlt ?? ''} onChange={(event) => onBlogFieldChange('coverAlt', event.target.value)} /></label>
                  <label className="admin-field"><span>Excerpt</span><textarea value={blogPost.excerpt ?? ''} onChange={(event) => onBlogFieldChange('excerpt', event.target.value)} /></label>
                  <label className="admin-field"><span>Markdown body</span><textarea className="admin-markdown" value={blogPost.body} onChange={(event) => onBlogFieldChange('body', event.target.value)} /></label>
                  <div className="admin-subpanel admin-preview">
                    <div className="admin-panel-header">
                      <div>
                        <p className="admin-kicker">Live preview</p>
                        <h3>Rendered article preview</h3>
                        <p className="admin-copy">
                          {blogPost.status === 'published'
                            ? 'This post is published and should match the public route styling closely.'
                            : 'This draft preview shows the current article rendering before the post is published.'}
                        </p>
                      </div>
                      <div className="admin-actions">
                        {publicPostUrl ? <a className="admin-button admin-button-secondary" href={publicPostUrl} target="_blank" rel="noreferrer">Open public route</a> : null}
                        {!publicPostUrl ? <p className="admin-note">Publish the post to open the public route.</p> : null}
                      </div>
                    </div>
                    <div className="admin-preview-hero">
                      <p className="admin-kicker">{blogPost.status} · {blogPost.date}</p>
                      <h3>{blogPost.title || 'Untitled post'}</h3>
                      <p className="admin-copy">{blogPost.excerpt ?? blogPost.body.split('\n').find(Boolean) ?? 'Add an excerpt or start writing to preview the intro.'}</p>
                    </div>
                    <div className="admin-preview-body">
                      {previewBlocks.length ? previewBlocks.map((block, index) => {
                        if (block.type === 'list') {
                          return (
                            <ul key={`${blogPost.slug}-${index}`} className="admin-preview-list">
                              {block.items.map((item) => <li key={item}>{item}</li>)}
                            </ul>
                          )
                        }

                        if (block.type === 'section') {
                          return (
                            <div key={`${blogPost.slug}-${index}`} className="admin-preview-copy">
                              <h4>{block.heading}</h4>
                              {block.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                            </div>
                          )
                        }

                        return (
                          <div key={`${blogPost.slug}-${index}`} className="admin-preview-copy">
                            {block.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                          </div>
                        )
                      }) : <p className="admin-note">Write the article body to preview how the post content renders.</p>}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </article>

          <section className="admin-panel">
            <div className="admin-panel-header"><div><h2>Live JSON preview</h2><p className="admin-copy">The save action commits this full structured object back to content/site-content.json.</p></div>{loadingContent ? <span className="admin-status">Loading…</span> : null}</div>
            <textarea readOnly value={formattedJson} className="admin-code-viewer" spellCheck={false} />
          </section>
        </section>
      ) : null}
    </main>
  )
}
