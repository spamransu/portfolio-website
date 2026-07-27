import { useEffect, useState } from 'react'
import type { AdminRepoInfo, AdminSession, SiteContentResponse } from '../api/adminApi'
import { parseBlogMarkdownBlocks } from '../../../src/content/blogMarkdown'
import type { BlogPostMeta, BlogPostResponse, ContactMethod, HighlightStat, HomeStat, ImageAsset, Job, ProcessStep, Project, SiteContent, SocialLink } from '../types'

export type MediaTargetSelection = {
  area: string
  slug: string
  key: string
  label: string
  kind: 'blog' | 'structured'
  field: string
  scope?: string
  index?: number
}

type AssignedImagePreviewProps = {
  alt?: string | null
  caption?: string | null
  label: string
  previewUrl: string
}

type SelectedMediaPreviewProps = {
  file: File
}

const AssignedImagePreview = ({ alt, caption, label, previewUrl }: AssignedImagePreviewProps) => {
  const [failed, setFailed] = useState(false)

  return (
    <div className="admin-media-preview admin-media-preview--field">
      <div className="admin-panel-header">
        <div>
          <p className="admin-kicker">Current image preview</p>
          <h3>{label}</h3>
        </div>
        <div className="admin-actions">
          <a className="admin-button admin-button-secondary" href={previewUrl} target="_blank" rel="noreferrer">Open image</a>
        </div>
      </div>
      {failed ? (
        <div className="admin-media-preview-error">
          <p className="admin-note">Preview unavailable for this image path.</p>
          <p className="admin-note admin-code">{previewUrl}</p>
        </div>
      ) : (
        <img className="admin-media-preview-image" src={previewUrl} alt={alt || label} onError={() => setFailed(true)} />
      )}
      {caption ? <p className="admin-note">{caption}</p> : null}
    </div>
  )
}

const SelectedMediaPreview = ({ file }: SelectedMediaPreviewProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>('')

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  return (
    <div className="admin-media-preview admin-media-preview--field">
      <div className="admin-panel-header">
        <div>
          <p className="admin-kicker">Selected upload preview</p>
          <h3>{file.name}</h3>
        </div>
        <div className="admin-actions">
          <p className="admin-note">{Math.max(1, Math.round(file.size / 1024))} KB</p>
        </div>
      </div>
      <img className="admin-media-preview-image" src={previewUrl} alt={file.name} />
      <p className="admin-note admin-code">{file.type || 'unknown type'}</p>
    </div>
  )
}

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
  blogConflict: {
    currentSha?: string
    latestCommitSha?: string | null
  } | null
  blogDirty: boolean
  blogList: BlogPostMeta[]
  blogRepo: AdminRepoInfo | null
  blogLoading: boolean
  onBlogCreate: () => void
  onBlogDuplicate: () => void
  onBlogDiscard: () => void
  onBlogDelete: () => void
  blogMeta: BlogPostMeta | null
  blogPost: BlogPostResponse | null
  blogStatus: string | null
  blogValidationError: string | null
  dirty: boolean
  error: string | null
  siteValidation: {
    featuredProjects?: string
    selectedProject?: string
    site?: string
    socials?: string
    siteChrome?: string
    homePage?: string
    homeContact?: string
    aboutPage?: string
    resumePage?: string
    contactPage?: string
    contactForm?: string
    contactMethods?: string
    projectsPage?: string
    blogPage?: string
    blogPostPage?: string
    projectDetailPage?: string
    notFoundPage?: string
  }
  siteValidationError: string | null
  loading: boolean
  loadingActivity: boolean
  loadingContent: boolean
  mediaArea: string
  mediaFile: File | null
  mediaFileInputKey: number
  mediaPath: string
  mediaSlug: string
  mediaStatus: string | null
  mediaValidationError: string | null
  mediaTargetKey: string
  mediaTargetLabel: string | null
  onBlogFieldChange: (field: string, value: string) => void
  onBlogReload: () => void
  onBlogSave: () => void
  onBlogSelect: (slug: string) => void
  onFieldChange: (field: string, value: string) => void
  onStructuredAdd: (scope: string) => void
  onStructuredDuplicate: (scope: string, index?: number) => void
  onStructuredFieldChange: (scope: string, field: string, value: string, index?: number) => void
  onStructuredMove: (scope: string, direction: 'up' | 'down', index?: number) => void
  onStructuredRemove: (scope: string, index?: number) => void
  onLogin: () => void
  onLogout: () => void
  onMediaAreaChange: (value: string) => void
  onMediaFileClear: () => void
  onMediaFileChange: (file: File | null) => void
  onMediaResultClear: () => void
  onMediaSlugCommit: () => void
  onMediaSlugChange: (value: string) => void
  onMediaTargetClear: () => void
  onMediaTargetSelect: (target: MediaTargetSelection) => void
  onMediaUpload: () => void
  onReloadActivity: () => void
  onProcessSelect: (value: number) => void
  onProjectGallerySelect: (value: number) => void
  onProjectSelect: (value: string) => void
  onHomeStatSelect: (value: number) => void
  onHomeHeroTitleLineSelect: (value: number) => void
  onFeaturedProjectSlugSelect: (value: number) => void
  onHomeBioTitleLineSelect: (value: number) => void
  onHomeSkillItemSelect: (value: number) => void
  onSocialSelect: (value: number) => void
  onHeaderNavSelect: (value: number) => void
  onFooterGeneralLinkSelect: (value: number) => void
  onFooterMoreLinkSelect: (value: number) => void
  onAboutBodySelect: (value: number) => void
  onAboutPrincipleSelect: (value: number) => void
  onAboutToolSelect: (value: number) => void
  onHighlightSelect: (value: number) => void
  onResumeSkillSelect: (value: number) => void
  onExperienceSelect: (value: number) => void
  onExperienceHighlightSelect: (value: number) => void
  onMethodSelect: (value: number) => void
  onProjectStackSelect: (value: number) => void
  onProjectApproachSelect: (value: number) => void
  onProjectOutcomeSelect: (value: number) => void
  onProjectDuplicate: () => void
  onReload: () => void
  onDiscard: () => void
  onSave: () => void
  projectOptions: Array<{ slug: string; title: string }>
  saveStatus: string | null
  saving: boolean
  savingBlog: boolean
  siteBranch: string | null
  unsavedChangesSummary: string
  siteUrl: string
  selectedBlogSlug: string
  selectedExperience: Job | null
  selectedExperienceIndex: number
  selectedExperienceHighlight: string | null
  selectedExperienceHighlightIndex: number
  selectedExperienceHighlightTotal: number
  selectedExperienceTotal: number
  selectedHighlight: HighlightStat | null
  selectedHighlightIndex: number
  selectedHighlightTotal: number
  selectedHomeStat: HomeStat | null
  selectedHomeStatIndex: number
  selectedHomeStatTotal: number
  selectedHomeHeroTitleLine: string | null
  selectedHomeHeroTitleLineIndex: number
  selectedHomeHeroTitleLineTotal: number
  selectedFeaturedProjectSlug: string | null
  selectedFeaturedProjectSlugIndex: number
  selectedFeaturedProjectSlugTotal: number
  selectedHomeBioTitleLine: string | null
  selectedHomeBioTitleLineIndex: number
  selectedHomeBioTitleLineTotal: number
  selectedHomeSkillItem: string | null
  selectedHomeSkillItemIndex: number
  selectedHomeSkillItemTotal: number
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
  selectedProjectStackItem: string | null
  selectedProjectStackIndex: number
  selectedProjectStackTotal: number
  selectedProjectApproachItem: string | null
  selectedProjectApproachIndex: number
  selectedProjectApproachTotal: number
  selectedProjectOutcomeItem: string | null
  selectedProjectOutcomeIndex: number
  selectedProjectOutcomeTotal: number
  selectedSocial: SocialLink | null
  selectedSocialIndex: number
  selectedSocialTotal: number
  selectedHeaderNavLink: { to: string; label: string } | null
  selectedHeaderNavIndex: number
  selectedHeaderNavTotal: number
  selectedFooterGeneralLink: { to: string; label: string } | null
  selectedFooterGeneralLinkIndex: number
  selectedFooterGeneralLinkTotal: number
  selectedFooterMoreLink: { to: string; label: string } | null
  selectedFooterMoreLinkIndex: number
  selectedFooterMoreLinkTotal: number
  selectedAboutBodyParagraph: string | null
  selectedAboutBodyIndex: number
  selectedAboutBodyTotal: number
  selectedAboutPrinciple: string | null
  selectedAboutPrincipleIndex: number
  selectedAboutPrincipleTotal: number
  selectedAboutTool: string | null
  selectedAboutToolIndex: number
  selectedAboutToolTotal: number
  selectedResumeSkill: string | null
  selectedResumeSkillIndex: number
  selectedResumeSkillTotal: number
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
const sanitizePathSegment = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')

const sanitizeFilename = (value: string): string => {
  const normalized = value.toLowerCase().trim()
  const dotIndex = normalized.lastIndexOf('.')
  const name = dotIndex === -1 ? normalized : normalized.slice(0, dotIndex)
  const extension = dotIndex === -1 ? '' : normalized.slice(dotIndex + 1)
  const safeName = sanitizePathSegment(name) || 'upload'
  const safeExtension = extension.replace(/[^a-z0-9]+/g, '')
  return safeExtension ? `${safeName}.${safeExtension}` : safeName
}

const extensionForMimeType = (mimeType: string): string => {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    case 'image/gif':
      return 'gif'
    case 'image/svg+xml':
      return 'svg'
    default:
      return 'bin'
  }
}

const resolveMediaFilename = (originalName: string, mimeType: string): string => {
  const filename = sanitizeFilename(originalName)
  if (filename.includes('.')) return filename
  return `${filename}.${extensionForMimeType(mimeType)}`
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
  blogRepo,
  blogLoading,
  onBlogCreate,
  onBlogDuplicate,
  onBlogDiscard,
  onBlogDelete,
  blogMeta,
  blogPost,
  blogStatus,
  blogValidationError,
  dirty,
  error,
  siteValidation,
  siteValidationError,
  loading,
  loadingActivity,
  loadingContent,
  mediaArea,
  mediaFile,
  mediaFileInputKey,
  mediaPath,
  mediaSlug,
  mediaStatus,
  mediaValidationError,
  mediaTargetKey,
  mediaTargetLabel,
  onBlogFieldChange,
  onBlogReload,
  onBlogSave,
  onBlogSelect,
  onFieldChange,
  onStructuredAdd,
  onStructuredDuplicate,
  onStructuredFieldChange,
  onStructuredMove,
  onStructuredRemove,
  onLogin,
  onLogout,
  onMediaAreaChange,
  onMediaFileClear,
  onMediaFileChange,
  onMediaResultClear,
  onMediaSlugCommit,
  onMediaSlugChange,
  onMediaTargetClear,
  onMediaTargetSelect,
  onMediaUpload,
  onReloadActivity,
  onProcessSelect,
  onProjectGallerySelect,
  onProjectSelect,
  onHomeStatSelect,
  onHomeHeroTitleLineSelect,
  onFeaturedProjectSlugSelect,
  onHomeBioTitleLineSelect,
  onHomeSkillItemSelect,
  onSocialSelect,
  onHeaderNavSelect,
  onFooterGeneralLinkSelect,
  onFooterMoreLinkSelect,
  onAboutBodySelect,
  onAboutPrincipleSelect,
  onAboutToolSelect,
  onHighlightSelect,
  onResumeSkillSelect,
  onExperienceSelect,
  onExperienceHighlightSelect,
  onMethodSelect,
  onProjectStackSelect,
  onProjectApproachSelect,
  onProjectOutcomeSelect,
  onProjectDuplicate,
  onReload,
  onDiscard,
  onSave,
  projectOptions,
  saveStatus,
  saving,
  savingBlog,
  siteBranch,
  unsavedChangesSummary,
  siteUrl,
  selectedBlogSlug,
  selectedExperience,
  selectedExperienceIndex,
  selectedExperienceHighlight,
  selectedExperienceHighlightIndex,
  selectedExperienceHighlightTotal,
  selectedExperienceTotal,
  selectedHighlight,
  selectedHighlightIndex,
  selectedHighlightTotal,
  selectedHomeStat,
  selectedHomeStatIndex,
  selectedHomeStatTotal,
  selectedHomeHeroTitleLine,
  selectedHomeHeroTitleLineIndex,
  selectedHomeHeroTitleLineTotal,
  selectedFeaturedProjectSlug,
  selectedFeaturedProjectSlugIndex,
  selectedFeaturedProjectSlugTotal,
  selectedHomeBioTitleLine,
  selectedHomeBioTitleLineIndex,
  selectedHomeBioTitleLineTotal,
  selectedHomeSkillItem,
  selectedHomeSkillItemIndex,
  selectedHomeSkillItemTotal,
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
  selectedProjectStackItem,
  selectedProjectStackIndex,
  selectedProjectStackTotal,
  selectedProjectApproachItem,
  selectedProjectApproachIndex,
  selectedProjectApproachTotal,
  selectedProjectOutcomeItem,
  selectedProjectOutcomeIndex,
  selectedProjectOutcomeTotal,
  selectedSocial,
  selectedSocialIndex,
  selectedSocialTotal,
  selectedHeaderNavLink,
  selectedHeaderNavIndex,
  selectedHeaderNavTotal,
  selectedFooterGeneralLink,
  selectedFooterGeneralLinkIndex,
  selectedFooterGeneralLinkTotal,
  selectedFooterMoreLink,
  selectedFooterMoreLinkIndex,
  selectedFooterMoreLinkTotal,
  selectedAboutBodyParagraph,
  selectedAboutBodyIndex,
  selectedAboutBodyTotal,
  selectedAboutPrinciple,
  selectedAboutPrincipleIndex,
  selectedAboutPrincipleTotal,
  selectedAboutTool,
  selectedAboutToolIndex,
  selectedAboutToolTotal,
  selectedResumeSkill,
  selectedResumeSkillIndex,
  selectedResumeSkillTotal,
  session,
  siteConflict,
  siteContent,
  uploadingMedia,
  workingCopy,
}: DashboardScreenProps) => {
  const [copyStatus, setCopyStatus] = useState<string>('')
  const formattedJson = workingCopy ? JSON.stringify(workingCopy, null, 2) : ''
  const sectionNames = workingCopy ? Object.keys(workingCopy) : []
  const activeRepo = siteContent?.repo ?? blogRepo ?? blogActivity?.repo ?? null
  const createCommitUrl = (repo: AdminRepoInfo | null, sha: string | null | undefined) =>
    repo && sha ? `${repo.repoUrl}/commit/${encodeURIComponent(sha)}` : null
  const createBlobUrl = (repo: AdminRepoInfo | null, branch: string | null | undefined, path: string | null | undefined) =>
    repo && branch && path ? `${repo.repoUrl}/blob/${encodeURIComponent(branch)}/${path}` : null
  const formatRefreshTimestamp = (value: string | null) => {
    if (!value) return null

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null

    return date.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }
  const mediaRepoPath = mediaPath ? `public/${mediaPath.replace(/^\//, '')}` : null
  const selectedBlogPath = blogPost?.path ?? blogMeta?.path ?? null
  const siteContentUrl = createBlobUrl(siteContent?.repo ?? null, siteBranch, siteContent?.path ?? null)
  const selectedBlogUrl = createBlobUrl(blogRepo, siteBranch, selectedBlogPath)
  const uploadedMediaUrl = createBlobUrl(mediaPath ? activeRepo : null, siteBranch, mediaRepoPath)
  const normalizedSiteUrl = siteUrl.trim().replace(/\/+$/, '')
  const publicMediaUrl = normalizedSiteUrl && mediaPath ? `${normalizedSiteUrl}${mediaPath}` : null
  const publicBlogUrl = normalizedSiteUrl ? `${normalizedSiteUrl}/blog` : null
  const publicPostUrl = normalizedSiteUrl && blogPost?.status === 'published' ? `${normalizedSiteUrl}/blog/${blogPost.slug}` : null
  const publicProjectUrl = normalizedSiteUrl && selectedProject?.slug ? `${normalizedSiteUrl}/projects/${selectedProject.slug}` : null
  const activityRefreshLabel = formatRefreshTimestamp(activityLoadedAt)
  const previewBlocks = blogPost ? parseBlogMarkdownBlocks(blogPost.body) : []
  const isUnsavedLocalBlogDraft = Boolean(blogPost && !blogPost.sha)
  const canSelectBlogEntry = Boolean(blogList.length || isUnsavedLocalBlogDraft)
  const unsavedLocalDraftOptionLabel = blogPost
    ? `${blogPost.date} — ${blogPost.title || blogPost.slug || 'Unsaved draft'} (unsaved draft)`
    : 'Unsaved draft'
  const quickJumpSections = [
    { id: 'admin-session', label: 'Session' },
    { id: 'admin-repo-content', label: 'Repo content' },
    { id: 'admin-workflow', label: 'Workflow' },
    { id: 'admin-recent-activity', label: 'Recent activity' },
    { id: 'admin-project-editor', label: 'Project editor' },
    { id: 'admin-media-uploader', label: 'Media uploader' },
    { id: 'admin-blog-editor', label: 'Blog editor' },
    { id: 'admin-live-json-preview', label: 'Live JSON preview' },
  ]
  const sanitizedMediaSlug = sanitizePathSegment(mediaSlug)
  const resolvedUploadFilename = mediaFile ? resolveMediaFilename(mediaFile.name, mediaFile.type) : ''
  const nextUploadRepoPath = mediaFile && sanitizedMediaSlug ? `public/images/${mediaArea}/${sanitizedMediaSlug}/${resolvedUploadFilename}` : ''
  const nextUploadPublicPath = nextUploadRepoPath ? `/${nextUploadRepoPath.replace(/^public\//, '')}` : ''
  const uploadSlugWillChange = Boolean(mediaSlug.trim() && sanitizedMediaSlug && mediaSlug.trim() !== sanitizedMediaSlug)
  const uploadFilenameWillChange = Boolean(mediaFile && mediaFile.name !== resolvedUploadFilename)
  const formatCommitDate = (value: string | null) => {
    if (!value) return '—'
    try {
      return new Date(value).toLocaleString()
    } catch {
      return value
    }
  }
  const resolvePreviewUrl = (src?: string | null) => {
    if (!src) return null
    if (/^(https?:|data:|blob:)/.test(src)) return src
    if (src.startsWith('/')) return normalizedSiteUrl ? `${normalizedSiteUrl}${src}` : src
    return src
  }
  const renderUseLastUploadButton = (onApply: () => void) =>
    mediaPath ? (
      <button type="button" className="admin-button admin-button-secondary" onClick={onApply}>
        Use last upload
      </button>
    ) : null
  const renderMediaTargetButton = (target: MediaTargetSelection) => (
    <button
      type="button"
      className="admin-button admin-button-secondary"
      onClick={() => onMediaTargetSelect(target)}
      aria-pressed={mediaTargetKey === target.key}
    >
      {mediaTargetKey === target.key ? 'Uploader targeted' : 'Target uploader here'}
    </button>
  )
  const renderAssignedImagePreview = (label: string, src?: string | null, alt?: string | null, caption?: string | null) => {
    const previewUrl = resolvePreviewUrl(src)
    if (!previewUrl) return null

    return <AssignedImagePreview label={label} previewUrl={previewUrl} alt={alt} caption={caption} />
  }
  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopyStatus(`${label} copied.`)
      window.setTimeout(() => {
        setCopyStatus((current) => (current === `${label} copied.` ? '' : current))
      }, 2000)
    } catch {
      setCopyStatus(`Could not copy ${label.toLowerCase()}.`)
    }
  }

  return (
    <main className="admin-shell">
      <section className="admin-panel admin-hero">
        <div>
          <p className="admin-kicker">Portfolio admin</p>
          <h1>Git-backed content dashboard</h1>
          <p className="admin-copy">
            This admin shell stays focused on the main content workflows: add, remove, and refine project case studies; create or delete blog posts; and upload the media those entries need.
          </p>
        </div>
        <div className="admin-actions">
          {session?.authenticated ? (
            <>
              {loadingContent ? <span className="admin-status">Loading…</span> : null}
              <button type="button" className="admin-button admin-button-secondary" onClick={onReload} disabled={loadingContent || saving}>
                Reload content
              </button>
              <button type="button" className="admin-button admin-button-secondary" onClick={onDiscard} disabled={!dirty || saving || !workingCopy}>
                Discard content edits
              </button>
              <button type="button" className="admin-button" onClick={onSave} disabled={!dirty || saving || !workingCopy || Boolean(siteValidationError)}>
                {saving ? 'Saving…' : siteValidationError ? 'Fix validation errors' : dirty ? 'Save content' : 'Content saved'}
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
      {authStatus ? <section className="admin-panel admin-success">{authStatus}</section> : null}
      {siteValidationError ? <section className="admin-panel admin-warning">{siteValidationError}</section> : null}
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
            <button type="button" className="admin-button admin-button-secondary" onClick={onBlogReload} disabled={!selectedBlogSlug || !blogPost?.sha || blogLoading || savingBlog}>
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
      {copyStatus ? <section className="admin-panel admin-success">{copyStatus}</section> : null}

      <section className="admin-grid">
        <article className="admin-panel" id="admin-session">
          <h2>Session</h2>
          <dl className="admin-meta-list">
            <div><dt>Status</dt><dd>{session?.authenticated ? 'Authenticated' : 'Signed out'}</dd></div>
            <div><dt>GitHub login</dt><dd>{session?.login ?? '—'}</dd></div>
            <div><dt>Expires</dt><dd>{session?.expiresAt ?? '—'}</dd></div>
            <div><dt>Unsaved changes</dt><dd>{unsavedChangesSummary}</dd></div>
          </dl>
        </article>

        <article className="admin-panel" id="admin-repo-content">
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
            {siteContent?.branch ? <button type="button" className="admin-button admin-button-secondary" onClick={() => void handleCopy(siteContent.branch, 'Branch name')}>Copy branch</button> : null}
            {siteContent?.sha ? <button type="button" className="admin-button admin-button-secondary" onClick={() => void handleCopy(siteContent.sha, 'Blob SHA')}>Copy blob SHA</button> : null}
            {siteContent?.latestCommitSha ? <button type="button" className="admin-button admin-button-secondary" onClick={() => void handleCopy(siteContent.latestCommitSha ?? '', 'Latest commit SHA')}>Copy latest commit SHA</button> : null}
            {selectedBlogPath ? <button type="button" className="admin-button admin-button-secondary" onClick={() => void handleCopy(selectedBlogPath, 'Selected post path')}>Copy post path</button> : null}
            {publicPostUrl ? <button type="button" className="admin-button admin-button-secondary" onClick={() => void handleCopy(publicPostUrl, 'Published post URL')}>Copy post URL</button> : null}
          </div>
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
            {publicMediaUrl ? <a className="admin-button admin-button-secondary" href={publicMediaUrl} target="_blank" rel="noreferrer">Open public asset</a> : null}
          </div>
        </article>

        <article className="admin-panel" id="admin-workflow">
          <h2>Workflow</h2>
          <p className="admin-copy">
            Keep this workflow lightweight: save project or blog changes here, review the resulting Git commit, then publish through the normal branch and build flow for the site.
          </p>
          <dl className="admin-meta-list">
            <div><dt>Write branch</dt><dd>{siteBranch ?? '—'}</dd></div>
            <div><dt>Selected post</dt><dd>{selectedBlogSlug || '—'}</dd></div>
            <div><dt>Selected project</dt><dd>{selectedProjectSlug || '—'}</dd></div>
          </dl>
          <ol className="admin-copy-list">
            <li>Add, reorder, or remove project entries in the project editor.</li>
            <li>Create, update, duplicate, or delete markdown posts in the blog editor.</li>
            <li>Use the repo and activity links to inspect the commit before publishing.</li>
          </ol>
        </article>

        <article className="admin-panel" id="admin-quick-jump">
          <h2>Quick jump</h2>
          <p className="admin-copy">Jump straight to the core project and blog tools instead of the full site-content form.</p>
          <div className="admin-link-grid">
            {quickJumpSections.map((section) => (
              <a key={section.id} className="admin-link-chip" href={`#${section.id}`}>
                {section.label}
              </a>
            ))}
          </div>
        </article>

        <article className="admin-panel" id="admin-recent-activity">
          <div className="admin-panel-header">
            <div>
              <h2>Recent activity</h2>
              {activityRefreshLabel ? <p className="admin-note">Last refreshed {activityRefreshLabel}</p> : null}
            </div>
            <div className="admin-actions">
              {loadingActivity ? <span className="admin-status">Refreshing…</span> : null}
              <button type="button" className="admin-button admin-button-secondary" onClick={onReloadActivity} disabled={loadingActivity}>
                {loadingActivity ? 'Refreshing…' : 'Refresh activity'}
              </button>
            </div>
          </div>
          {activityError ? <p className="admin-note admin-note-warning">{activityError}</p> : null}
          {activity.length ? (
            <div className="admin-form-grid">
              {activity.map((item) => (
                <div key={item.sha} className="admin-subpanel">
                  <div className="admin-panel-header">
                    <div>
                      <h3>{item.message}</h3>
                      <p className="admin-note">
                        {item.authorLogin ?? item.authorName ?? 'Unknown author'} · {formatCommitDate(item.committedAt)}
                      </p>
                    </div>
                    {item.url ? (
                      <div className="admin-actions">
                        <a className="admin-button admin-button-secondary" href={item.url} target="_blank" rel="noreferrer">Open commit</a>
                      </div>
                    ) : null}
                  </div>
                  <p className="admin-note admin-code">{item.sha || '—'}</p>
                </div>
              ))}
            </div>
          ) : loadingActivity ? (
            <p className="admin-note">Loading recent branch activity…</p>
          ) : (
            <p className="admin-note">No recent branch activity available yet.</p>
          )}
        </article>
      </section>

      {workingCopy ? (
        <section className="admin-edit-grid">
          <fieldset disabled={loadingContent || saving} style={{ border: 0, margin: 0, padding: 0, display: 'contents' }}>
          <details className="admin-panel" id="admin-advanced-site-fields">
            <summary>Advanced site-content fields</summary>
            <p className="admin-copy">The user asked for a lighter CMS, so the broad site copy editors stay collapsed by default. Use them only when a project or blog workflow genuinely depends on the surrounding page copy.</p>
          <article className="admin-panel" id="admin-home-page">
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
              {siteValidation.featuredProjects ? <p className="admin-note admin-note-warning">{siteValidation.featuredProjects}</p> : null}
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
            <div className="admin-subpanel">
              <div className="admin-panel-header"><div><h3>Hero title lines</h3><p className="admin-copy">Manage the homepage hero title as ordered lines instead of rewriting the whole textarea.</p></div><div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('homeHeroTitleLine')}>Add line</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredDuplicate('homeHeroTitleLine', selectedHomeHeroTitleLineIndex)} disabled={selectedHomeHeroTitleLine == null}>Duplicate selected</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('homeHeroTitleLine', 'up', selectedHomeHeroTitleLineIndex)} disabled={selectedHomeHeroTitleLineIndex <= 0}>Move up</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('homeHeroTitleLine', 'down', selectedHomeHeroTitleLineIndex)} disabled={selectedHomeHeroTitleLineIndex >= selectedHomeHeroTitleLineTotal - 1}>Move down</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('homeHeroTitleLine', selectedHomeHeroTitleLineIndex)} disabled={selectedHomeHeroTitleLineTotal <= 1}>Remove selected</button></div></div>
              <div className="admin-form-grid">
                <label className="admin-field"><span>Selected hero title line</span><select value={selectedHomeHeroTitleLineIndex} onChange={(event) => onHomeHeroTitleLineSelect(Number(event.target.value))}>{workingCopy.home.hero.titleLines.map((line, index) => <option key={`${line}-${index}`} value={index}>{index + 1} — {line || 'Untitled line'}</option>)}</select></label>
                <label className="admin-field"><span>Line text</span><input value={selectedHomeHeroTitleLine ?? ''} onChange={(event) => onStructuredFieldChange('homeHeroTitleLine', 'value', event.target.value, selectedHomeHeroTitleLineIndex)} /></label>
              </div>
            </div>
            <div className="admin-subpanel">
              <div className="admin-panel-header"><div><h3>Featured project slugs</h3><p className="admin-copy">Manage the featured project order as structured slug entries.</p></div><div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('featuredProjectSlug')}>Add slug</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredDuplicate('featuredProjectSlug', selectedFeaturedProjectSlugIndex)} disabled={selectedFeaturedProjectSlug == null}>Duplicate selected</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('featuredProjectSlug', 'up', selectedFeaturedProjectSlugIndex)} disabled={selectedFeaturedProjectSlugIndex <= 0}>Move up</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('featuredProjectSlug', 'down', selectedFeaturedProjectSlugIndex)} disabled={selectedFeaturedProjectSlugIndex >= selectedFeaturedProjectSlugTotal - 1}>Move down</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('featuredProjectSlug', selectedFeaturedProjectSlugIndex)} disabled={selectedFeaturedProjectSlugTotal <= 1}>Remove selected</button></div></div>
              <div className="admin-form-grid">
                <label className="admin-field"><span>Selected featured slug</span><select value={selectedFeaturedProjectSlugIndex} onChange={(event) => onFeaturedProjectSlugSelect(Number(event.target.value))}>{workingCopy.home.featuredProjects.slugs.map((slug, index) => <option key={`${slug}-${index}`} value={index}>{index + 1} — {slug || 'Empty slug'}</option>)}</select></label>
                <label className="admin-field"><span>Slug</span><input value={selectedFeaturedProjectSlug ?? ''} onChange={(event) => onStructuredFieldChange('featuredProjectSlug', 'value', event.target.value, selectedFeaturedProjectSlugIndex)} /></label>
              </div>
            </div>
            <div className="admin-subpanel">
              <div className="admin-panel-header"><div><h3>Bio title lines</h3><p className="admin-copy">Edit the homepage bio heading as separate ordered lines.</p></div><div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('homeBioTitleLine')}>Add line</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredDuplicate('homeBioTitleLine', selectedHomeBioTitleLineIndex)} disabled={selectedHomeBioTitleLine == null}>Duplicate selected</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('homeBioTitleLine', 'up', selectedHomeBioTitleLineIndex)} disabled={selectedHomeBioTitleLineIndex <= 0}>Move up</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('homeBioTitleLine', 'down', selectedHomeBioTitleLineIndex)} disabled={selectedHomeBioTitleLineIndex >= selectedHomeBioTitleLineTotal - 1}>Move down</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('homeBioTitleLine', selectedHomeBioTitleLineIndex)} disabled={selectedHomeBioTitleLineTotal <= 1}>Remove selected</button></div></div>
              <div className="admin-form-grid">
                <label className="admin-field"><span>Selected bio title line</span><select value={selectedHomeBioTitleLineIndex} onChange={(event) => onHomeBioTitleLineSelect(Number(event.target.value))}>{workingCopy.home.bio.titleLines.map((line, index) => <option key={`${line}-${index}`} value={index}>{index + 1} — {line || 'Untitled line'}</option>)}</select></label>
                <label className="admin-field"><span>Line text</span><input value={selectedHomeBioTitleLine ?? ''} onChange={(event) => onStructuredFieldChange('homeBioTitleLine', 'value', event.target.value, selectedHomeBioTitleLineIndex)} /></label>
              </div>
            </div>
            <div className="admin-subpanel">
              <div className="admin-panel-header"><div><h3>Skills items</h3><p className="admin-copy">Manage the homepage skills list as individual items.</p></div><div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('homeSkillItem')}>Add skill</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredDuplicate('homeSkillItem', selectedHomeSkillItemIndex)} disabled={selectedHomeSkillItem == null}>Duplicate selected</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('homeSkillItem', 'up', selectedHomeSkillItemIndex)} disabled={selectedHomeSkillItemIndex <= 0}>Move up</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('homeSkillItem', 'down', selectedHomeSkillItemIndex)} disabled={selectedHomeSkillItemIndex >= selectedHomeSkillItemTotal - 1}>Move down</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('homeSkillItem', selectedHomeSkillItemIndex)} disabled={selectedHomeSkillItemTotal <= 1}>Remove selected</button></div></div>
              <div className="admin-form-grid">
                <label className="admin-field"><span>Selected skill item</span><select value={selectedHomeSkillItemIndex} onChange={(event) => onHomeSkillItemSelect(Number(event.target.value))}>{workingCopy.home.skills.items.map((item, index) => <option key={`${item}-${index}`} value={index}>{index + 1} — {item || 'Untitled skill'}</option>)}</select></label>
                <label className="admin-field"><span>Skill item</span><input value={selectedHomeSkillItem ?? ''} onChange={(event) => onStructuredFieldChange('homeSkillItem', 'value', event.target.value, selectedHomeSkillItemIndex)} /></label>
              </div>
            </div>
            {siteValidation.homePage ? <p className="admin-note admin-note-warning">{siteValidation.homePage}</p> : null}
          </article>

          <article className="admin-panel" id="admin-home-stats">
            <div className="admin-panel-header"><div><h2>Home stats</h2><p className="admin-copy">Edit the stat cards shown on the homepage bio section.</p></div><div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('homeStat')}>Add stat</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredDuplicate('homeStat', selectedHomeStatIndex)} disabled={!selectedHomeStat}>Duplicate selected</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('homeStat', 'up', selectedHomeStatIndex)} disabled={selectedHomeStatIndex <= 0}>Move up</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('homeStat', 'down', selectedHomeStatIndex)} disabled={selectedHomeStatIndex >= selectedHomeStatTotal - 1}>Move down</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('homeStat', selectedHomeStatIndex)} disabled={selectedHomeStatTotal <= 1}>Remove selected</button></div></div>
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
            {siteValidation.homeContact ? <p className="admin-note admin-note-warning">{siteValidation.homeContact}</p> : null}
          </article>

          <article className="admin-panel" id="admin-site-settings">
            <h2>Site settings</h2>
            <div className="admin-form-grid">
              <label className="admin-field"><span>Name</span><input value={workingCopy.site.name} onChange={(event) => onFieldChange('site.name', event.target.value)} /></label>
              <label className="admin-field"><span>Tagline</span><textarea value={workingCopy.site.tagline} onChange={(event) => onFieldChange('site.tagline', event.target.value)} /></label>
              <label className="admin-field"><span>Description</span><textarea value={workingCopy.site.description} onChange={(event) => onFieldChange('site.description', event.target.value)} /></label>
              <label className="admin-field"><span>Email</span><input value={workingCopy.site.email} onChange={(event) => onFieldChange('site.email', event.target.value)} /></label>
              <label className="admin-field"><span>Location</span><input value={workingCopy.site.location} onChange={(event) => onFieldChange('site.location', event.target.value)} /></label>
              <label className="admin-field"><span>Site URL</span><input value={workingCopy.site.siteUrl} onChange={(event) => onFieldChange('site.siteUrl', event.target.value)} /></label>
            </div>
            {siteValidation.site ? <p className="admin-note admin-note-warning">{siteValidation.site}</p> : null}
          </article>

          <article className="admin-panel" id="admin-site-chrome">
            <h2>Site chrome</h2>
            <div className="admin-form-grid">
              <label className="admin-field"><span>Skip link label</span><input value={workingCopy.siteChrome?.skipToContentLabel ?? ''} onChange={(event) => onFieldChange('siteChrome.skipToContentLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Header nav aria label</span><input value={workingCopy.siteChrome?.headerNavAriaLabel ?? ''} onChange={(event) => onFieldChange('siteChrome.headerNavAriaLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Footer socials aria label</span><input value={workingCopy.siteChrome?.footerSocialsAriaLabel ?? ''} onChange={(event) => onFieldChange('siteChrome.footerSocialsAriaLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Header Linktree label</span><input value={workingCopy.siteChrome?.headerLinktreeLabel ?? ''} onChange={(event) => onFieldChange('siteChrome.headerLinktreeLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Footer copyright template</span><input value={workingCopy.siteChrome?.footer.copyrightTemplate ?? ''} onChange={(event) => onFieldChange('siteChrome.footer.copyrightTemplate', event.target.value)} /></label>
              <label className="admin-field"><span>Footer general heading</span><input value={workingCopy.siteChrome?.footer.generalHeading ?? ''} onChange={(event) => onFieldChange('siteChrome.footer.generalHeading', event.target.value)} /></label>
              <label className="admin-field"><span>Footer more heading</span><input value={workingCopy.siteChrome?.footer.moreHeading ?? ''} onChange={(event) => onFieldChange('siteChrome.footer.moreHeading', event.target.value)} /></label>
              <label className="admin-field"><span>Footer Linktree label</span><input value={workingCopy.siteChrome?.footer.linktreeLabel ?? ''} onChange={(event) => onFieldChange('siteChrome.footer.linktreeLabel', event.target.value)} /></label>
            </div>
            <div className="admin-subpanel">
              <div className="admin-panel-header"><div><h3>Header navigation</h3><p className="admin-copy">Manage the internal links shown in the header.</p></div><div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('headerNav')}>Add link</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredDuplicate('headerNav', selectedHeaderNavIndex)} disabled={!selectedHeaderNavLink}>Duplicate selected</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('headerNav', 'up', selectedHeaderNavIndex)} disabled={selectedHeaderNavIndex <= 0}>Move up</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('headerNav', 'down', selectedHeaderNavIndex)} disabled={selectedHeaderNavIndex >= selectedHeaderNavTotal - 1}>Move down</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('headerNav', selectedHeaderNavIndex)} disabled={selectedHeaderNavTotal <= 1}>Remove selected</button></div></div>
              <div className="admin-form-grid">
                <label className="admin-field"><span>Selected header link</span><select value={selectedHeaderNavIndex} onChange={(event) => onHeaderNavSelect(Number(event.target.value))} disabled={!selectedHeaderNavTotal}>{selectedHeaderNavTotal ? (workingCopy.siteChrome?.headerNav ?? []).map((link, index) => <option key={`${link.to}-${index}`} value={index}>{index + 1} — {link.label || link.to || 'Header link'}</option>) : <option value={0}>No header links yet</option>}</select></label>
                {!selectedHeaderNavTotal ? <p className="admin-note">No header links yet. Add one to manage the main site navigation here.</p> : null}
                {selectedHeaderNavLink ? (
                  <>
                    <label className="admin-field"><span>Header link path</span><input value={selectedHeaderNavLink.to} onChange={(event) => onStructuredFieldChange('headerNav', 'to', event.target.value, selectedHeaderNavIndex)} /></label>
                    <label className="admin-field"><span>Header link label</span><input value={selectedHeaderNavLink.label} onChange={(event) => onStructuredFieldChange('headerNav', 'label', event.target.value, selectedHeaderNavIndex)} /></label>
                  </>
                ) : null}
              </div>
            </div>
            <div className="admin-subpanel">
              <div className="admin-panel-header"><div><h3>Footer general links</h3><p className="admin-copy">Manage the first footer link group without editing raw path-label lines.</p></div><div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('footerGeneralLink')}>Add link</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredDuplicate('footerGeneralLink', selectedFooterGeneralLinkIndex)} disabled={!selectedFooterGeneralLink}>Duplicate selected</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('footerGeneralLink', 'up', selectedFooterGeneralLinkIndex)} disabled={selectedFooterGeneralLinkIndex <= 0}>Move up</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('footerGeneralLink', 'down', selectedFooterGeneralLinkIndex)} disabled={selectedFooterGeneralLinkIndex >= selectedFooterGeneralLinkTotal - 1}>Move down</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('footerGeneralLink', selectedFooterGeneralLinkIndex)} disabled={selectedFooterGeneralLinkTotal <= 1}>Remove selected</button></div></div>
              <div className="admin-form-grid">
                <label className="admin-field"><span>Selected footer general link</span><select value={selectedFooterGeneralLinkIndex} onChange={(event) => onFooterGeneralLinkSelect(Number(event.target.value))} disabled={!selectedFooterGeneralLinkTotal}>{selectedFooterGeneralLinkTotal ? (workingCopy.siteChrome?.footer.generalLinks ?? []).map((link, index) => <option key={`${link.to}-${index}`} value={index}>{index + 1} — {link.label || link.to || 'Footer link'}</option>) : <option value={0}>No footer general links yet</option>}</select></label>
                {!selectedFooterGeneralLinkTotal ? <p className="admin-note">No footer general links yet. Add one to populate the first footer column.</p> : null}
                {selectedFooterGeneralLink ? (
                  <>
                    <label className="admin-field"><span>Footer general path</span><input value={selectedFooterGeneralLink.to} onChange={(event) => onStructuredFieldChange('footerGeneralLink', 'to', event.target.value, selectedFooterGeneralLinkIndex)} /></label>
                    <label className="admin-field"><span>Footer general label</span><input value={selectedFooterGeneralLink.label} onChange={(event) => onStructuredFieldChange('footerGeneralLink', 'label', event.target.value, selectedFooterGeneralLinkIndex)} /></label>
                  </>
                ) : null}
              </div>
            </div>
            <div className="admin-subpanel">
              <div className="admin-panel-header"><div><h3>Footer more links</h3><p className="admin-copy">Manage the secondary footer link group as structured items.</p></div><div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('footerMoreLink')}>Add link</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredDuplicate('footerMoreLink', selectedFooterMoreLinkIndex)} disabled={!selectedFooterMoreLink}>Duplicate selected</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('footerMoreLink', 'up', selectedFooterMoreLinkIndex)} disabled={selectedFooterMoreLinkIndex <= 0}>Move up</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('footerMoreLink', 'down', selectedFooterMoreLinkIndex)} disabled={selectedFooterMoreLinkIndex >= selectedFooterMoreLinkTotal - 1}>Move down</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('footerMoreLink', selectedFooterMoreLinkIndex)} disabled={selectedFooterMoreLinkTotal <= 1}>Remove selected</button></div></div>
              <div className="admin-form-grid">
                <label className="admin-field"><span>Selected footer more link</span><select value={selectedFooterMoreLinkIndex} onChange={(event) => onFooterMoreLinkSelect(Number(event.target.value))} disabled={!selectedFooterMoreLinkTotal}>{selectedFooterMoreLinkTotal ? (workingCopy.siteChrome?.footer.moreLinks ?? []).map((link, index) => <option key={`${link.to}-${index}`} value={index}>{index + 1} — {link.label || link.to || 'Footer link'}</option>) : <option value={0}>No footer more links yet</option>}</select></label>
                {!selectedFooterMoreLinkTotal ? <p className="admin-note">No footer more links yet. Add one to populate the second footer column.</p> : null}
                {selectedFooterMoreLink ? (
                  <>
                    <label className="admin-field"><span>Footer more path</span><input value={selectedFooterMoreLink.to} onChange={(event) => onStructuredFieldChange('footerMoreLink', 'to', event.target.value, selectedFooterMoreLinkIndex)} /></label>
                    <label className="admin-field"><span>Footer more label</span><input value={selectedFooterMoreLink.label} onChange={(event) => onStructuredFieldChange('footerMoreLink', 'label', event.target.value, selectedFooterMoreLinkIndex)} /></label>
                  </>
                ) : null}
              </div>
            </div>
            {siteValidation.siteChrome ? <p className="admin-note admin-note-warning">{siteValidation.siteChrome}</p> : null}
          </article>

          <article className="admin-panel" id="admin-project-detail-page">
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
            {siteValidation.projectDetailPage ? <p className="admin-note admin-note-warning">{siteValidation.projectDetailPage}</p> : null}
          </article>

          <article className="admin-panel" id="admin-projects-page">
            <h2>Projects page</h2>
            <div className="admin-form-grid">
              <label className="admin-field"><span>Projects eyebrow</span><input value={workingCopy.projectsPage?.eyebrow ?? ''} onChange={(event) => onFieldChange('projectsPage.eyebrow', event.target.value)} /></label>
              <label className="admin-field"><span>Projects title</span><input value={workingCopy.projectsPage?.title ?? ''} onChange={(event) => onFieldChange('projectsPage.title', event.target.value)} /></label>
              <label className="admin-field"><span>Projects intro</span><textarea value={workingCopy.projectsPage?.intro ?? ''} onChange={(event) => onFieldChange('projectsPage.intro', event.target.value)} /></label>
              <label className="admin-field"><span>Project role label prefix</span><input value={workingCopy.projectsPage?.roleLabelPrefix ?? ''} onChange={(event) => onFieldChange('projectsPage.roleLabelPrefix', event.target.value)} /></label>
              <label className="admin-field"><span>Project stack aria template</span><input value={workingCopy.projectsPage?.stackAriaTemplate ?? ''} onChange={(event) => onFieldChange('projectsPage.stackAriaTemplate', event.target.value)} /></label>
              <label className="admin-field"><span>Projects hero image src</span><input value={workingCopy.projectsPage?.heroImage?.src ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'projectsPage.src', event.target.value)} />{renderUseLastUploadButton(() => onStructuredFieldChange('heroImage', 'projectsPage.src', mediaPath))}{renderMediaTargetButton({ area: 'projects', slug: 'projects-page', key: 'heroImage:projectsPage.src', kind: 'structured', scope: 'heroImage', field: 'projectsPage.src', label: 'Projects page hero image' })}</label>
              <label className="admin-field"><span>Projects hero image alt</span><input value={workingCopy.projectsPage?.heroImage?.alt ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'projectsPage.alt', event.target.value)} /></label>
              <label className="admin-field"><span>Projects hero caption</span><textarea value={workingCopy.projectsPage?.heroImage?.caption ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'projectsPage.caption', event.target.value)} /></label>
              {renderAssignedImagePreview('Projects page hero image', workingCopy.projectsPage?.heroImage?.src, workingCopy.projectsPage?.heroImage?.alt, workingCopy.projectsPage?.heroImage?.caption)}
            </div>
            {siteValidation.projectsPage ? <p className="admin-note admin-note-warning">{siteValidation.projectsPage}</p> : null}
          </article>

          <article className="admin-panel" id="admin-blog-page">
            <h2>Blog page</h2>
            <div className="admin-form-grid">
              <label className="admin-field"><span>Blog eyebrow</span><input value={workingCopy.blogPage?.eyebrow ?? ''} onChange={(event) => onFieldChange('blogPage.eyebrow', event.target.value)} /></label>
              <label className="admin-field"><span>Blog title</span><input value={workingCopy.blogPage?.title ?? ''} onChange={(event) => onFieldChange('blogPage.title', event.target.value)} /></label>
              <label className="admin-field"><span>Blog intro</span><textarea value={workingCopy.blogPage?.intro ?? ''} onChange={(event) => onFieldChange('blogPage.intro', event.target.value)} /></label>
              <label className="admin-field"><span>Blog hero image src</span><input value={workingCopy.blogPage?.heroImage?.src ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'blogPage.src', event.target.value)} />{renderUseLastUploadButton(() => onStructuredFieldChange('heroImage', 'blogPage.src', mediaPath))}{renderMediaTargetButton({ area: 'blog', slug: 'blog', key: 'heroImage:blogPage.src', kind: 'structured', scope: 'heroImage', field: 'blogPage.src', label: 'Blog page hero image' })}</label>
              <label className="admin-field"><span>Blog hero image alt</span><input value={workingCopy.blogPage?.heroImage?.alt ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'blogPage.alt', event.target.value)} /></label>
              <label className="admin-field"><span>Blog hero caption</span><textarea value={workingCopy.blogPage?.heroImage?.caption ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'blogPage.caption', event.target.value)} /></label>
              {renderAssignedImagePreview('Blog page hero image', workingCopy.blogPage?.heroImage?.src, workingCopy.blogPage?.heroImage?.alt, workingCopy.blogPage?.heroImage?.caption)}
            </div>
            {siteValidation.blogPage ? <p className="admin-note admin-note-warning">{siteValidation.blogPage}</p> : null}
          </article>

          <article className="admin-panel" id="admin-blog-post-page">
            <h2>Blog post page</h2>
            <div className="admin-form-grid">
              <label className="admin-field"><span>Blog eyebrow prefix</span><input value={workingCopy.blogPostPage?.eyebrowPrefix ?? ''} onChange={(event) => onFieldChange('blogPostPage.eyebrowPrefix', event.target.value)} /></label>
              <label className="admin-field"><span>Not found title</span><input value={workingCopy.blogPostPage?.notFoundTitle ?? ''} onChange={(event) => onFieldChange('blogPostPage.notFoundTitle', event.target.value)} /></label>
              <label className="admin-field"><span>Not found intro</span><textarea value={workingCopy.blogPostPage?.notFoundIntro ?? ''} onChange={(event) => onFieldChange('blogPostPage.notFoundIntro', event.target.value)} /></label>
              <label className="admin-field"><span>Back to blog label</span><input value={workingCopy.blogPostPage?.backToBlogLabel ?? ''} onChange={(event) => onFieldChange('blogPostPage.backToBlogLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Start project label</span><input value={workingCopy.blogPostPage?.startProjectLabel ?? ''} onChange={(event) => onFieldChange('blogPostPage.startProjectLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Article section title</span><input value={workingCopy.blogPostPage?.articleSectionTitle ?? ''} onChange={(event) => onFieldChange('blogPostPage.articleSectionTitle', event.target.value)} /></label>
            </div>
            {siteValidation.blogPostPage ? <p className="admin-note admin-note-warning">{siteValidation.blogPostPage}</p> : null}
          </article>

          <article className="admin-panel" id="admin-not-found-page">
            <h2>404 page</h2>
            <div className="admin-form-grid">
              <label className="admin-field"><span>Eyebrow</span><input value={workingCopy.notFoundPage?.eyebrow ?? ''} onChange={(event) => onFieldChange('notFoundPage.eyebrow', event.target.value)} /></label>
              <label className="admin-field"><span>Title</span><input value={workingCopy.notFoundPage?.title ?? ''} onChange={(event) => onFieldChange('notFoundPage.title', event.target.value)} /></label>
              <label className="admin-field"><span>Intro</span><textarea value={workingCopy.notFoundPage?.intro ?? ''} onChange={(event) => onFieldChange('notFoundPage.intro', event.target.value)} /></label>
              <label className="admin-field"><span>Suggestions eyebrow</span><input value={workingCopy.notFoundPage?.suggestionsEyebrow ?? ''} onChange={(event) => onFieldChange('notFoundPage.suggestionsEyebrow', event.target.value)} /></label>
              <label className="admin-field"><span>View projects label</span><input value={workingCopy.notFoundPage?.viewProjectsLabel ?? ''} onChange={(event) => onFieldChange('notFoundPage.viewProjectsLabel', event.target.value)} /></label>
              <label className="admin-field"><span>Back home label</span><input value={workingCopy.notFoundPage?.backHomeLabel ?? ''} onChange={(event) => onFieldChange('notFoundPage.backHomeLabel', event.target.value)} /></label>
            </div>
            {siteValidation.notFoundPage ? <p className="admin-note admin-note-warning">{siteValidation.notFoundPage}</p> : null}
          </article>

          <article className="admin-panel" id="admin-social-links">
            <div className="admin-panel-header"><div><h2>Social links</h2><p className="admin-copy">Edit the existing social entries from the site config.</p></div><div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('social')}>Add social</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredDuplicate('social', selectedSocialIndex)} disabled={!selectedSocial}>Duplicate selected</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('social', 'up', selectedSocialIndex)} disabled={selectedSocialIndex <= 0}>Move up</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('social', 'down', selectedSocialIndex)} disabled={selectedSocialIndex >= selectedSocialTotal - 1}>Move down</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('social', selectedSocialIndex)} disabled={selectedSocialTotal <= 1}>Remove selected</button></div></div>
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
            {siteValidation.socials ? <p className="admin-note admin-note-warning">{siteValidation.socials}</p> : null}
          </article>

          <article className="admin-panel" id="admin-about-page">
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
              <label className="admin-field"><span>Hero image src</span><input value={workingCopy.about.heroImage?.src ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'about.src', event.target.value)} />{renderUseLastUploadButton(() => onStructuredFieldChange('heroImage', 'about.src', mediaPath))}{renderMediaTargetButton({ area: 'about', slug: 'about', key: 'heroImage:about.src', kind: 'structured', scope: 'heroImage', field: 'about.src', label: 'About hero image' })}</label>
              <label className="admin-field"><span>Hero image alt</span><input value={workingCopy.about.heroImage?.alt ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'about.alt', event.target.value)} /></label>
              <label className="admin-field"><span>Hero image caption</span><textarea value={workingCopy.about.heroImage?.caption ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'about.caption', event.target.value)} /></label>
              {renderAssignedImagePreview('About hero image', workingCopy.about.heroImage?.src, workingCopy.about.heroImage?.alt, workingCopy.about.heroImage?.caption)}
            </div>
            <div className="admin-subpanel">
              <div className="admin-panel-header"><div><h3>Body paragraphs</h3><p className="admin-copy">Manage the about page body copy as ordered paragraphs.</p></div><div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('aboutBody')}>Add paragraph</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredDuplicate('aboutBody', selectedAboutBodyIndex)} disabled={selectedAboutBodyParagraph == null}>Duplicate selected</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('aboutBody', 'up', selectedAboutBodyIndex)} disabled={selectedAboutBodyIndex <= 0}>Move up</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('aboutBody', 'down', selectedAboutBodyIndex)} disabled={selectedAboutBodyIndex >= selectedAboutBodyTotal - 1}>Move down</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('aboutBody', selectedAboutBodyIndex)} disabled={selectedAboutBodyTotal <= 1}>Remove selected</button></div></div>
              <div className="admin-form-grid">
                <label className="admin-field"><span>Selected paragraph</span><select value={selectedAboutBodyIndex} onChange={(event) => onAboutBodySelect(Number(event.target.value))}>{workingCopy.about.body.map((item, index) => <option key={`${item}-${index}`} value={index}>{index + 1} — {item.slice(0, 40) || 'Paragraph'}</option>)}</select></label>
                <label className="admin-field"><span>Paragraph text</span><textarea value={selectedAboutBodyParagraph ?? ''} onChange={(event) => onStructuredFieldChange('aboutBody', 'value', event.target.value, selectedAboutBodyIndex)} /></label>
              </div>
            </div>
            <div className="admin-subpanel">
              <div className="admin-panel-header"><div><h3>Principles</h3><p className="admin-copy">Edit the about page principles as individual list items.</p></div><div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('aboutPrinciple')}>Add principle</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredDuplicate('aboutPrinciple', selectedAboutPrincipleIndex)} disabled={selectedAboutPrinciple == null}>Duplicate selected</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('aboutPrinciple', 'up', selectedAboutPrincipleIndex)} disabled={selectedAboutPrincipleIndex <= 0}>Move up</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('aboutPrinciple', 'down', selectedAboutPrincipleIndex)} disabled={selectedAboutPrincipleIndex >= selectedAboutPrincipleTotal - 1}>Move down</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('aboutPrinciple', selectedAboutPrincipleIndex)} disabled={selectedAboutPrincipleTotal <= 1}>Remove selected</button></div></div>
              <div className="admin-form-grid">
                <label className="admin-field"><span>Selected principle</span><select value={selectedAboutPrincipleIndex} onChange={(event) => onAboutPrincipleSelect(Number(event.target.value))}>{workingCopy.about.principles.map((item, index) => <option key={`${item}-${index}`} value={index}>{index + 1} — {item.slice(0, 40) || 'Principle'}</option>)}</select></label>
                <label className="admin-field"><span>Principle text</span><textarea value={selectedAboutPrinciple ?? ''} onChange={(event) => onStructuredFieldChange('aboutPrinciple', 'value', event.target.value, selectedAboutPrincipleIndex)} /></label>
              </div>
            </div>
            <div className="admin-subpanel">
              <div className="admin-panel-header"><div><h3>Tools</h3><p className="admin-copy">Manage the tools list without editing a raw multiline field.</p></div><div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('aboutTool')}>Add tool</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredDuplicate('aboutTool', selectedAboutToolIndex)} disabled={selectedAboutTool == null}>Duplicate selected</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('aboutTool', 'up', selectedAboutToolIndex)} disabled={selectedAboutToolIndex <= 0}>Move up</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('aboutTool', 'down', selectedAboutToolIndex)} disabled={selectedAboutToolIndex >= selectedAboutToolTotal - 1}>Move down</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('aboutTool', selectedAboutToolIndex)} disabled={selectedAboutToolTotal <= 1}>Remove selected</button></div></div>
              <div className="admin-form-grid">
                <label className="admin-field"><span>Selected tool</span><select value={selectedAboutToolIndex} onChange={(event) => onAboutToolSelect(Number(event.target.value))}>{workingCopy.about.tools.map((item, index) => <option key={`${item}-${index}`} value={index}>{index + 1} — {item || 'Tool'}</option>)}</select></label>
                <label className="admin-field"><span>Tool label</span><input value={selectedAboutTool ?? ''} onChange={(event) => onStructuredFieldChange('aboutTool', 'value', event.target.value, selectedAboutToolIndex)} /></label>
              </div>
            </div>
            {siteValidation.aboutPage ? <p className="admin-note admin-note-warning">{siteValidation.aboutPage}</p> : null}
          </article>

          <article className="admin-panel" id="admin-process-steps">
            <div className="admin-panel-header"><div><h2>Process steps</h2><p className="admin-copy">Edit the repeatable process cards shown on the about page.</p></div><div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('process')}>Add step</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredDuplicate('process', selectedProcessIndex)} disabled={!selectedProcess}>Duplicate selected</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('process', 'up', selectedProcessIndex)} disabled={selectedProcessIndex <= 0}>Move up</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('process', 'down', selectedProcessIndex)} disabled={selectedProcessIndex >= selectedProcessTotal - 1}>Move down</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('process', selectedProcessIndex)} disabled={selectedProcessTotal <= 1}>Remove selected</button></div></div>
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

          <article className="admin-panel" id="admin-resume-page">
            <h2>Resume page</h2>
            <div className="admin-form-grid">
              <label className="admin-field"><span>Eyebrow</span><input value={workingCopy.resume.eyebrow ?? ''} onChange={(event) => onFieldChange('resume.eyebrow', event.target.value)} /></label>
              <label className="admin-field"><span>Headline</span><input value={workingCopy.resume.headline} onChange={(event) => onFieldChange('resume.headline', event.target.value)} /></label>
              <label className="admin-field"><span>Summary</span><textarea value={workingCopy.resume.summary} onChange={(event) => onFieldChange('resume.summary', event.target.value)} /></label>
              <label className="admin-field"><span>Highlights section title</span><input value={workingCopy.resume.highlightsSectionTitle} onChange={(event) => onFieldChange('resume.highlightsSectionTitle', event.target.value)} /></label>
              <label className="admin-field"><span>Skills section title</span><input value={workingCopy.resume.skillsSectionTitle} onChange={(event) => onFieldChange('resume.skillsSectionTitle', event.target.value)} /></label>
              <label className="admin-field"><span>Experience section title</span><input value={workingCopy.resume.experienceSectionTitle} onChange={(event) => onFieldChange('resume.experienceSectionTitle', event.target.value)} /></label>
              <label className="admin-field"><span>Resume hero image src</span><input value={workingCopy.resume.heroImage?.src ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'resume.src', event.target.value)} />{renderUseLastUploadButton(() => onStructuredFieldChange('heroImage', 'resume.src', mediaPath))}{renderMediaTargetButton({ area: 'resume', slug: 'resume', key: 'heroImage:resume.src', kind: 'structured', scope: 'heroImage', field: 'resume.src', label: 'Resume hero image' })}</label>
              <label className="admin-field"><span>Resume hero image alt</span><input value={workingCopy.resume.heroImage?.alt ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'resume.alt', event.target.value)} /></label>
              <label className="admin-field"><span>Resume hero image caption</span><textarea value={workingCopy.resume.heroImage?.caption ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'resume.caption', event.target.value)} /></label>
              {renderAssignedImagePreview('Resume hero image', workingCopy.resume.heroImage?.src, workingCopy.resume.heroImage?.alt, workingCopy.resume.heroImage?.caption)}
            </div>
            <div className="admin-subpanel">
              <div className="admin-panel-header"><div><h3>Resume skills</h3><p className="admin-copy">Manage the resume skills list as ordered items.</p></div><div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('resumeSkill')}>Add skill</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredDuplicate('resumeSkill', selectedResumeSkillIndex)} disabled={selectedResumeSkill == null}>Duplicate selected</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('resumeSkill', 'up', selectedResumeSkillIndex)} disabled={selectedResumeSkillIndex <= 0}>Move up</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('resumeSkill', 'down', selectedResumeSkillIndex)} disabled={selectedResumeSkillIndex >= selectedResumeSkillTotal - 1}>Move down</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('resumeSkill', selectedResumeSkillIndex)} disabled={selectedResumeSkillTotal <= 1}>Remove selected</button></div></div>
              <div className="admin-form-grid">
                <label className="admin-field"><span>Selected resume skill</span><select value={selectedResumeSkillIndex} onChange={(event) => onResumeSkillSelect(Number(event.target.value))}>{workingCopy.resume.skills.map((item, index) => <option key={`${item}-${index}`} value={index}>{index + 1} — {item || 'Skill'}</option>)}</select></label>
                <label className="admin-field"><span>Skill item</span><input value={selectedResumeSkill ?? ''} onChange={(event) => onStructuredFieldChange('resumeSkill', 'value', event.target.value, selectedResumeSkillIndex)} /></label>
              </div>
            </div>
            {siteValidation.resumePage ? <p className="admin-note admin-note-warning">{siteValidation.resumePage}</p> : null}
          </article>

          <article className="admin-panel" id="admin-resume-highlights">
            <div className="admin-panel-header"><div><h2>Resume highlights</h2><p className="admin-copy">Edit headline stat cards shown on the resume page.</p></div><div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('highlight')}>Add highlight</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredDuplicate('highlight', selectedHighlightIndex)} disabled={!selectedHighlight}>Duplicate selected</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('highlight', 'up', selectedHighlightIndex)} disabled={selectedHighlightIndex <= 0}>Move up</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('highlight', 'down', selectedHighlightIndex)} disabled={selectedHighlightIndex >= selectedHighlightTotal - 1}>Move down</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('highlight', selectedHighlightIndex)} disabled={selectedHighlightTotal <= 1}>Remove selected</button></div></div>
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

          <article className="admin-panel" id="admin-resume-experience">
            <div className="admin-panel-header"><div><h2>Resume experience</h2><p className="admin-copy">Edit each experience entry and its bullet highlights.</p></div><div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('experience')}>Add experience</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredDuplicate('experience', selectedExperienceIndex)} disabled={!selectedExperience}>Duplicate selected</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('experience', 'up', selectedExperienceIndex)} disabled={selectedExperienceIndex <= 0}>Move up</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('experience', 'down', selectedExperienceIndex)} disabled={selectedExperienceIndex >= selectedExperienceTotal - 1}>Move down</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('experience', selectedExperienceIndex)} disabled={selectedExperienceTotal <= 1}>Remove selected</button></div></div>
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
                </>
              ) : null}
            </div>
            {selectedExperience ? (
              <div className="admin-subpanel">
                <div className="admin-panel-header"><div><h3>Experience highlights</h3><p className="admin-copy">Manage each experience bullet as its own editable item.</p></div><div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('experienceHighlight')}>Add highlight</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredDuplicate('experienceHighlight', selectedExperienceHighlightIndex)} disabled={selectedExperienceHighlight == null}>Duplicate selected</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('experienceHighlight', 'up', selectedExperienceHighlightIndex)} disabled={selectedExperienceHighlightIndex <= 0}>Move up</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('experienceHighlight', 'down', selectedExperienceHighlightIndex)} disabled={selectedExperienceHighlightIndex >= selectedExperienceHighlightTotal - 1}>Move down</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('experienceHighlight', selectedExperienceHighlightIndex)} disabled={selectedExperienceHighlightTotal <= 1}>Remove selected</button></div></div>
                <div className="admin-form-grid">
                  <label className="admin-field"><span>Selected highlight</span><select value={selectedExperienceHighlightIndex} onChange={(event) => onExperienceHighlightSelect(Number(event.target.value))}>{selectedExperience.highlights.map((item, index) => <option key={`${item}-${index}`} value={index}>{index + 1} — {item.slice(0, 48) || 'Highlight'}</option>)}</select></label>
                  <label className="admin-field"><span>Highlight text</span><textarea value={selectedExperienceHighlight ?? ''} onChange={(event) => onStructuredFieldChange('experienceHighlight', 'value', event.target.value, selectedExperienceHighlightIndex)} /></label>
                </div>
              </div>
            ) : null}
          </article>

          <article className="admin-panel" id="admin-contact-page">
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
              <label className="admin-field"><span>Contact hero image src</span><input value={workingCopy.contact.heroImage?.src ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'contact.src', event.target.value)} />{renderUseLastUploadButton(() => onStructuredFieldChange('heroImage', 'contact.src', mediaPath))}{renderMediaTargetButton({ area: 'contact', slug: 'contact', key: 'heroImage:contact.src', kind: 'structured', scope: 'heroImage', field: 'contact.src', label: 'Contact hero image' })}</label>
              <label className="admin-field"><span>Contact hero image alt</span><input value={workingCopy.contact.heroImage?.alt ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'contact.alt', event.target.value)} /></label>
              <label className="admin-field"><span>Contact hero image caption</span><textarea value={workingCopy.contact.heroImage?.caption ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'contact.caption', event.target.value)} /></label>
              {renderAssignedImagePreview('Contact hero image', workingCopy.contact.heroImage?.src, workingCopy.contact.heroImage?.alt, workingCopy.contact.heroImage?.caption)}
            </div>
            {siteValidation.contactPage ? <p className="admin-note admin-note-warning">{siteValidation.contactPage}</p> : null}
            {siteValidation.contactForm ? <p className="admin-note admin-note-warning">{siteValidation.contactForm}</p> : null}
          </article>

          <article className="admin-panel" id="admin-contact-methods">
            <div className="admin-panel-header"><div><h2>Contact methods</h2><p className="admin-copy">Edit each contact method card.</p></div><div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('method')}>Add method</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredDuplicate('method', selectedMethodIndex)} disabled={!selectedMethod}>Duplicate selected</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('method', 'up', selectedMethodIndex)} disabled={selectedMethodIndex <= 0}>Move up</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('method', 'down', selectedMethodIndex)} disabled={selectedMethodIndex >= selectedMethodTotal - 1}>Move down</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('method', selectedMethodIndex)} disabled={selectedMethodTotal <= 1}>Remove selected</button></div></div>
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
            {siteValidation.contactMethods ? <p className="admin-note admin-note-warning">{siteValidation.contactMethods}</p> : null}
          </article>

          </details>

          <article className="admin-panel" id="admin-project-editor">
            <div className="admin-panel-header"><div><h2>Project editor</h2><p className="admin-copy">Keep project management first-class here: add new case studies, remove old ones, reorder the archive, then refine the selected entry below.</p></div><div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('project')}>Add project</button><button type="button" className="admin-button admin-button-secondary" onClick={onProjectDuplicate} disabled={!selectedProject}>Duplicate project</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('project', 'up')} disabled={projectOptions.length <= 1 || !selectedProject || projectOptions[0]?.slug === selectedProject.slug}>Move up</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('project', 'down')} disabled={projectOptions.length <= 1 || !selectedProject || projectOptions[projectOptions.length - 1]?.slug === selectedProject.slug}>Move down</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('project')} disabled={projectOptions.length <= 1}>Remove selected</button></div></div>
            <div className="admin-subpanel">
              <div className="admin-panel-header">
                <div>
                  <h3>Project library</h3>
                  <p className="admin-copy">Select an entry to edit it. New projects appear here immediately before you save the JSON back to GitHub.</p>
                </div>
                <div className="admin-actions">
                  <p className="admin-note">{projectOptions.length} total projects</p>
                </div>
              </div>
              <div className="admin-selection-grid">
                {projectOptions.map((project, index) => (
                  <button
                    key={project.slug}
                    type="button"
                    className={`admin-selection-card${project.slug === selectedProjectSlug ? ' admin-selection-card-active' : ''}`}
                    onClick={() => onProjectSelect(project.slug)}
                  >
                    <span className="admin-kicker">Project {index + 1}</span>
                    <strong>{project.title}</strong>
                    <span className="admin-note admin-code">{project.slug}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Selected project</span>
                <select value={selectedProjectSlug} onChange={(event) => onProjectSelect(event.target.value)}>
                  {projectOptions.map((project) => <option key={project.slug} value={project.slug}>{project.title}</option>)}
                </select>
              </label>
              {selectedProject ? (
                <>
                  <div className="admin-actions">
                    <p className="admin-note">Selected slug: <span className="admin-code">{selectedProject.slug}</span></p>
                    <button type="button" className="admin-button admin-button-secondary" onClick={() => void handleCopy(selectedProject.slug, 'Project slug')}>Copy slug</button>
                    {publicProjectUrl ? <a className="admin-button admin-button-secondary" href={publicProjectUrl} target="_blank" rel="noreferrer">Open public route</a> : null}
                    {publicProjectUrl ? <button type="button" className="admin-button admin-button-secondary" onClick={() => void handleCopy(publicProjectUrl, 'Project route URL')}>Copy route</button> : null}
                  </div>
                  <label className="admin-field"><span>Title</span><input value={selectedProject.title} onChange={(event) => onStructuredFieldChange('project', 'title', event.target.value)} /></label>
                  <label className="admin-field"><span>Slug</span><input value={selectedProject.slug} onChange={(event) => onStructuredFieldChange('project', 'slug', event.target.value)} /></label>
                  {siteValidation.selectedProject ? <p className="admin-note admin-note-warning">{siteValidation.selectedProject}</p> : null}
                  <label className="admin-field"><span>Year</span><input value={selectedProject.year} onChange={(event) => onStructuredFieldChange('project', 'year', event.target.value)} /></label>
                  <label className="admin-field"><span>Client</span><input value={selectedProject.client} onChange={(event) => onStructuredFieldChange('project', 'client', event.target.value)} /></label>
                  <label className="admin-field"><span>Role</span><input value={selectedProject.role} onChange={(event) => onStructuredFieldChange('project', 'role', event.target.value)} /></label>
                  <label className="admin-field"><span>Summary</span><textarea value={selectedProject.summary} onChange={(event) => onStructuredFieldChange('project', 'summary', event.target.value)} /></label>
                  <label className="admin-field"><span>Challenge</span><textarea value={selectedProject.challenge} onChange={(event) => onStructuredFieldChange('project', 'challenge', event.target.value)} /></label>
                  <label className="admin-field"><span>Lead image src</span><input value={selectedProject.image?.src ?? ''} onChange={(event) => onStructuredFieldChange('projectImage', 'src', event.target.value)} />{renderUseLastUploadButton(() => onStructuredFieldChange('projectImage', 'src', mediaPath))}{renderMediaTargetButton({ area: 'projects', slug: selectedProject.slug, key: `project:${selectedProject.slug}:image.src`, kind: 'structured', scope: 'projectImage', field: 'src', label: `${selectedProject.title} lead image` })}</label>
                  <label className="admin-field"><span>Lead image alt</span><input value={selectedProject.image?.alt ?? ''} onChange={(event) => onStructuredFieldChange('projectImage', 'alt', event.target.value)} /></label>
                  {renderAssignedImagePreview(`${selectedProject.title} lead image`, selectedProject.image?.src, selectedProject.image?.alt, selectedProject.summary)}
                  <div className="admin-subpanel">
                    <div className="admin-panel-header"><div><h3>Project stack</h3><p className="admin-copy">Manage the tech stack as ordered structured items.</p></div><div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('projectStack')}>Add stack item</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredDuplicate('projectStack', selectedProjectStackIndex)} disabled={selectedProjectStackItem == null}>Duplicate selected</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('projectStack', 'up', selectedProjectStackIndex)} disabled={selectedProjectStackIndex <= 0}>Move up</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('projectStack', 'down', selectedProjectStackIndex)} disabled={selectedProjectStackIndex >= selectedProjectStackTotal - 1}>Move down</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('projectStack', selectedProjectStackIndex)} disabled={selectedProjectStackTotal <= 1}>Remove selected</button></div></div>
                    <div className="admin-form-grid">
                      <label className="admin-field"><span>Selected stack item</span><select value={selectedProjectStackIndex} onChange={(event) => onProjectStackSelect(Number(event.target.value))}>{selectedProject.stack.map((item, index) => <option key={`${item}-${index}`} value={index}>{index + 1} — {item || 'Stack item'}</option>)}</select></label>
                      <label className="admin-field"><span>Stack item</span><input value={selectedProjectStackItem ?? ''} onChange={(event) => onStructuredFieldChange('projectStack', 'value', event.target.value, selectedProjectStackIndex)} /></label>
                    </div>
                  </div>
                  <div className="admin-subpanel">
                    <div className="admin-panel-header"><div><h3>Approach bullets</h3><p className="admin-copy">Edit approach points one at a time.</p></div><div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('projectApproach')}>Add bullet</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredDuplicate('projectApproach', selectedProjectApproachIndex)} disabled={selectedProjectApproachItem == null}>Duplicate selected</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('projectApproach', 'up', selectedProjectApproachIndex)} disabled={selectedProjectApproachIndex <= 0}>Move up</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('projectApproach', 'down', selectedProjectApproachIndex)} disabled={selectedProjectApproachIndex >= selectedProjectApproachTotal - 1}>Move down</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('projectApproach', selectedProjectApproachIndex)} disabled={selectedProjectApproachTotal <= 1}>Remove selected</button></div></div>
                    <div className="admin-form-grid">
                      <label className="admin-field"><span>Selected approach bullet</span><select value={selectedProjectApproachIndex} onChange={(event) => onProjectApproachSelect(Number(event.target.value))}>{selectedProject.approach.map((item, index) => <option key={`${item}-${index}`} value={index}>{index + 1} — {item.slice(0, 48) || 'Approach bullet'}</option>)}</select></label>
                      <label className="admin-field"><span>Approach text</span><textarea value={selectedProjectApproachItem ?? ''} onChange={(event) => onStructuredFieldChange('projectApproach', 'value', event.target.value, selectedProjectApproachIndex)} /></label>
                    </div>
                  </div>
                  <div className="admin-subpanel">
                    <div className="admin-panel-header"><div><h3>Outcome bullets</h3><p className="admin-copy">Manage outcome points as structured ordered items.</p></div><div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('projectOutcome')}>Add bullet</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredDuplicate('projectOutcome', selectedProjectOutcomeIndex)} disabled={selectedProjectOutcomeItem == null}>Duplicate selected</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('projectOutcome', 'up', selectedProjectOutcomeIndex)} disabled={selectedProjectOutcomeIndex <= 0}>Move up</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('projectOutcome', 'down', selectedProjectOutcomeIndex)} disabled={selectedProjectOutcomeIndex >= selectedProjectOutcomeTotal - 1}>Move down</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('projectOutcome', selectedProjectOutcomeIndex)} disabled={selectedProjectOutcomeTotal <= 1}>Remove selected</button></div></div>
                    <div className="admin-form-grid">
                      <label className="admin-field"><span>Selected outcome bullet</span><select value={selectedProjectOutcomeIndex} onChange={(event) => onProjectOutcomeSelect(Number(event.target.value))}>{selectedProject.outcome.map((item, index) => <option key={`${item}-${index}`} value={index}>{index + 1} — {item.slice(0, 48) || 'Outcome bullet'}</option>)}</select></label>
                      <label className="admin-field"><span>Outcome text</span><textarea value={selectedProjectOutcomeItem ?? ''} onChange={(event) => onStructuredFieldChange('projectOutcome', 'value', event.target.value, selectedProjectOutcomeIndex)} /></label>
                    </div>
                  </div>
                  <div className="admin-panel admin-panel--subtle" id="admin-project-gallery">
                    <div className="admin-panel-header">
                      <div><h2>Project gallery</h2><p className="admin-copy">Edit gallery images for the selected project.</p></div>
                      <div className="admin-actions">
                        <button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('projectGallery')}>Add gallery image</button>
                        <button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredDuplicate('projectGallery', selectedProjectGalleryIndex)} disabled={!selectedProjectGalleryItem}>Duplicate selected</button>
                        <button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('projectGallery', 'up', selectedProjectGalleryIndex)} disabled={selectedProjectGalleryIndex <= 0}>Move up</button>
                        <button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('projectGallery', 'down', selectedProjectGalleryIndex)} disabled={selectedProjectGalleryIndex >= selectedProjectGalleryTotal - 1}>Move down</button>
                        <button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('projectGallery', selectedProjectGalleryIndex)} disabled={selectedProjectGalleryTotal <= 1}>Remove selected</button>
                      </div>
                    </div>
                    <div className="admin-form-grid">
                      <label className="admin-field">
                        <span>Selected gallery image</span>
                        <select value={selectedProjectGalleryIndex} onChange={(event) => onProjectGallerySelect(Number(event.target.value))} disabled={!selectedProjectGalleryTotal}>
                          {selectedProjectGalleryTotal ? (
                            (selectedProject.gallery ?? []).map((image, index) => <option key={`${image.src}-${index}`} value={index}>{index + 1} — {image.alt || image.src || 'Gallery image'}</option>)
                          ) : (
                            <option value={0}>No gallery images yet</option>
                          )}
                        </select>
                      </label>
                      {!selectedProjectGalleryTotal ? <p className="admin-note">No gallery images yet. Use Add gallery image to create one for this project.</p> : null}
                      {selectedProjectGalleryItem ? (
                        <>
                          <label className="admin-field"><span>Gallery image src</span><input value={selectedProjectGalleryItem.src} onChange={(event) => onStructuredFieldChange('projectGallery', 'src', event.target.value, selectedProjectGalleryIndex)} />{renderUseLastUploadButton(() => onStructuredFieldChange('projectGallery', 'src', mediaPath, selectedProjectGalleryIndex))}{renderMediaTargetButton({ area: 'projects', slug: selectedProject.slug, key: `projectGallery:${selectedProject.slug}:${selectedProjectGalleryIndex}:src`, kind: 'structured', scope: 'projectGallery', field: 'src', index: selectedProjectGalleryIndex, label: `${selectedProject.title} gallery image ${selectedProjectGalleryIndex + 1}` })}</label>
                          <label className="admin-field"><span>Gallery image alt</span><input value={selectedProjectGalleryItem.alt} onChange={(event) => onStructuredFieldChange('projectGallery', 'alt', event.target.value, selectedProjectGalleryIndex)} /></label>
                          <label className="admin-field"><span>Gallery caption</span><textarea value={selectedProjectGalleryItem.caption ?? ''} onChange={(event) => onStructuredFieldChange('projectGallery', 'caption', event.target.value, selectedProjectGalleryIndex)} /></label>
                          {renderAssignedImagePreview(`${selectedProject.title} gallery image ${selectedProjectGalleryIndex + 1}`, selectedProjectGalleryItem.src, selectedProjectGalleryItem.alt, selectedProjectGalleryItem.caption)}
                        </>
                      ) : null}
                    </div>
                  </div>
                  <div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredAdd('projectSection')}>Add section</button></div>
                  {selectedProject.sections?.length ? selectedProject.sections.map((section, index) => (
                    <div className="admin-subpanel" key={`${selectedProject.slug}-${section.title}-${index}`}>
                      <div className="admin-actions"><p className="admin-note">Section {index + 1}</p><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredDuplicate('projectSection', index)}>Duplicate section</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('projectSection', 'up', index)} disabled={index <= 0}>Move up</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredMove('projectSection', 'down', index)} disabled={index >= (selectedProject.sections?.length ?? 0) - 1}>Move down</button><button type="button" className="admin-button admin-button-secondary" onClick={() => onStructuredRemove('projectSection', index)} disabled={(selectedProject.sections?.length ?? 0) <= 1}>Remove section</button></div>
                      <label className="admin-field"><span>Section kind</span><select value={section.kind} onChange={(event) => onStructuredFieldChange('projectSection', 'kind', event.target.value, index)}><option value="default">default</option><option value="approach">approach</option><option value="outcome">outcome</option></select></label>
                      <label className="admin-field"><span>Section title</span><input value={section.title} onChange={(event) => onStructuredFieldChange('projectSection', 'title', event.target.value, index)} /></label>
                      <label className="admin-field"><span>Section body</span><textarea value={section.body} onChange={(event) => onStructuredFieldChange('projectSection', 'body', event.target.value, index)} /></label>
                      <label className="admin-field"><span>Section image src</span><input value={section.image?.src ?? ''} onChange={(event) => onStructuredFieldChange('projectSection', 'image.src', event.target.value, index)} />{renderUseLastUploadButton(() => onStructuredFieldChange('projectSection', 'image.src', mediaPath, index))}{renderMediaTargetButton({ area: 'projects', slug: selectedProject.slug, key: `projectSection:${selectedProject.slug}:${index}:image.src`, kind: 'structured', scope: 'projectSection', field: 'image.src', index, label: `${selectedProject.title} section ${index + 1} image` })}</label>
                      <label className="admin-field"><span>Section image alt</span><input value={section.image?.alt ?? ''} onChange={(event) => onStructuredFieldChange('projectSection', 'image.alt', event.target.value, index)} /></label>
                      <label className="admin-field"><span>Section image caption</span><textarea value={section.image?.caption ?? ''} onChange={(event) => onStructuredFieldChange('projectSection', 'image.caption', event.target.value, index)} /></label>
                      {renderAssignedImagePreview(`${selectedProject.title} section ${index + 1} image`, section.image?.src, section.image?.alt, section.image?.caption)}
                    </div>
                  )) : <p className="admin-note">No custom sections yet. Use Add section to create one for this project.</p>}
                </>
              ) : null}
            </div>
          </article>
          </fieldset>

          <article className="admin-panel" id="admin-media-uploader">
            <div className="admin-panel-header">
              <div>
                <h2>Media uploader</h2>
                <p className="admin-copy">Upload images into public/images and reuse the returned path in site or blog fields.</p>
              </div>
              <div className="admin-actions">
                {uploadingMedia ? <span className="admin-status">Uploading…</span> : null}
                <button type="button" className="admin-button admin-button-secondary" onClick={onMediaTargetClear} disabled={!mediaTargetKey || uploadingMedia}>Clear target</button>
                <button type="button" className="admin-button admin-button-secondary" onClick={onMediaFileClear} disabled={!mediaFile || uploadingMedia}>Clear file</button>
                <button type="button" className="admin-button admin-button-secondary" onClick={onMediaResultClear} disabled={!mediaPath || uploadingMedia}>Clear uploaded result</button>
                <button type="button" className="admin-button" onClick={onMediaUpload} disabled={uploadingMedia || !sanitizedMediaSlug || !mediaFile || Boolean(mediaValidationError)}>{uploadingMedia ? 'Uploading…' : mediaValidationError ? 'Fix validation errors' : 'Upload media'}</button>
              </div>
            </div>
            <fieldset disabled={uploadingMedia} style={{ border: 0, margin: 0, padding: 0 }}>
              <div className="admin-form-grid">
              <label className="admin-field"><span>Area</span><select value={mediaArea} onChange={(event) => onMediaAreaChange(event.target.value)}>{mediaAreas.map((area) => <option key={area} value={area}>{area}</option>)}</select></label>
              <label className="admin-field"><span>Slug</span><input value={mediaSlug} onChange={(event) => onMediaSlugChange(event.target.value)} onBlur={onMediaSlugCommit} placeholder="e.g. lightweight-git-backed-portfolio-cms" /></label>
              <label className="admin-field"><span>Image file</span><input key={mediaFileInputKey} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif" onChange={(event) => onMediaFileChange(event.target.files?.[0] ?? null)} /></label>
              {mediaFile ? <p className="admin-note">Ready to upload: <span className="admin-code">{mediaFile.name}</span></p> : <p className="admin-note">Choose an image file before uploading.</p>}
              {mediaValidationError ? <p className="admin-note admin-note-warning">{mediaValidationError}</p> : null}
              {mediaSlug.trim() && !sanitizedMediaSlug ? <p className="admin-note admin-note-warning">Media slug must include letters or numbers after sanitization.</p> : null}
              {uploadSlugWillChange ? <p className="admin-note">Slug will upload as <span className="admin-code">{sanitizedMediaSlug}</span>.</p> : null}
              {uploadFilenameWillChange ? <p className="admin-note">Filename will upload as <span className="admin-code">{resolvedUploadFilename}</span>.</p> : null}
              {mediaPath ? <label className="admin-field"><span>Last uploaded path</span><input readOnly value={mediaPath} /></label> : null}
              {mediaPath ? <div className="admin-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => void handleCopy(mediaPath, 'Uploaded path')}>Copy uploaded path</button></div> : null}
              <p className="admin-note">Current uploader target: <span className="admin-code">{mediaArea}/{mediaSlug || '—'}</span>{mediaTargetLabel ? ` — ${mediaTargetLabel}` : ' — manual selection'}</p>
              {nextUploadRepoPath ? <div className="admin-actions"><p className="admin-note">Next upload repo path: <span className="admin-code">{nextUploadRepoPath}</span></p><button type="button" className="admin-button admin-button-secondary" onClick={() => void handleCopy(nextUploadRepoPath, 'Next repo path')}>Copy next repo path</button></div> : null}
              {nextUploadPublicPath ? <div className="admin-actions"><p className="admin-note">Next upload public path: <span className="admin-code">{nextUploadPublicPath}</span></p><button type="button" className="admin-button admin-button-secondary" onClick={() => void handleCopy(nextUploadPublicPath, 'Next public path')}>Copy next public path</button></div> : null}
              {mediaPath ? <p className="admin-note">Use the last uploaded path button beside image source fields to apply this asset without copying it manually.</p> : null}
              {mediaFile ? <SelectedMediaPreview file={mediaFile} /> : null}
              {mediaPath ? (
                <div className="admin-media-preview">
                  <div className="admin-panel-header">
                    <div>
                      <p className="admin-kicker">Uploaded asset preview</p>
                      <h3>{mediaPath}</h3>
                    </div>
                    <div className="admin-actions">
                      <button type="button" className="admin-button admin-button-secondary" onClick={() => void handleCopy(mediaPath, 'Uploaded path')}>Copy path</button>
                      {publicMediaUrl ? <a className="admin-button admin-button-secondary" href={publicMediaUrl} target="_blank" rel="noreferrer">Open public asset</a> : null}
                      {publicMediaUrl ? <button type="button" className="admin-button admin-button-secondary" onClick={() => void handleCopy(publicMediaUrl, 'Public URL')}>Copy public URL</button> : null}
                      {uploadedMediaUrl ? <a className="admin-button admin-button-secondary" href={uploadedMediaUrl} target="_blank" rel="noreferrer">Open repo blob</a> : null}
                    </div>
                  </div>
                  {publicMediaUrl ? <img className="admin-media-preview-image" src={publicMediaUrl} alt={mediaTargetLabel ?? mediaPath} /> : null}
                </div>
              ) : null}
              </div>
            </fieldset>
          </article>

          <article className="admin-panel" id="admin-blog-editor">
            <div className="admin-panel-header">
              <div>
                <h2>Blog editor</h2>
                <p className="admin-copy">Create, remove, and refine markdown posts without needing the rest of the site to become broadly editable.</p>
              </div>
              <div className="admin-actions">
                {blogLoading ? <span className="admin-status">Loading…</span> : null}
                <button type="button" className="admin-button admin-button-secondary" onClick={onBlogCreate} disabled={blogLoading || savingBlog}>New draft</button>
                <button type="button" className="admin-button admin-button-secondary" onClick={onBlogDuplicate} disabled={!blogPost || blogLoading || savingBlog}>Duplicate draft</button>
                <button type="button" className="admin-button admin-button-secondary" onClick={onBlogDiscard} disabled={!blogDirty || !blogPost || blogLoading || savingBlog}>Discard blog edits</button>
                <button type="button" className="admin-button admin-button-secondary" onClick={onBlogReload} disabled={!selectedBlogSlug || !blogPost?.sha || blogLoading || savingBlog}>Reload post</button>
                <button type="button" className="admin-button admin-button-secondary" onClick={onBlogDelete} disabled={!blogPost?.sha || blogLoading || savingBlog}>Delete post</button>
                <button type="button" className="admin-button" onClick={onBlogSave} disabled={!blogDirty || !blogPost || blogLoading || savingBlog || Boolean(blogValidationError)}>{savingBlog ? 'Saving…' : blogValidationError ? 'Fix validation errors' : blogDirty ? 'Save post' : 'Post saved'}</button>
              </div>
            </div>
            <div className="admin-subpanel">
              <div className="admin-panel-header">
                <div>
                  <h3>Blog library</h3>
                  <p className="admin-copy">Start a new draft for a new post, or pick an existing markdown file to update or delete it.</p>
                </div>
                <div className="admin-actions">
                  <p className="admin-note">{blogList.length} saved posts</p>
                </div>
              </div>
              <div className="admin-selection-grid">
                {blogList.map((post) => (
                  <button
                    key={post.slug}
                    type="button"
                    className={`admin-selection-card${post.slug === selectedBlogSlug ? ' admin-selection-card-active' : ''}`}
                    onClick={() => onBlogSelect(post.slug)}
                    disabled={blogLoading || savingBlog}
                  >
                    <span className="admin-kicker">{post.status}</span>
                    <strong>{post.title}</strong>
                    <span className="admin-note">{post.date}</span>
                    <span className="admin-note admin-code">{post.slug}</span>
                  </button>
                ))}
              </div>
              {!blogList.length ? <p className="admin-note">No saved posts yet. Use New draft to create the first markdown entry.</p> : null}
            </div>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Published posts + drafts</span>
                <select value={selectedBlogSlug} onChange={(event) => onBlogSelect(event.target.value)} disabled={!canSelectBlogEntry || blogLoading || savingBlog}>
                  {isUnsavedLocalBlogDraft ? (
                    <option value={selectedBlogSlug}>{unsavedLocalDraftOptionLabel}</option>
                  ) : null}
                  {blogList.length ? (
                    blogList.map((post) => <option key={post.slug} value={post.slug}>{post.date} — {post.title}</option>)
                  ) : !isUnsavedLocalBlogDraft ? (
                    <option value="">No saved blog posts yet</option>
                  ) : null}
                </select>
              </label>
              {!blogList.length && !isUnsavedLocalBlogDraft ? <p className="admin-note">No saved posts yet. Use New draft to start a post, then save it to create the markdown file.</p> : null}
              {blogMeta ? (
                <div className="admin-actions">
                  <p className="admin-note">Selected file: <span className="admin-code">{blogMeta.path}</span></p>
                  <button type="button" className="admin-button admin-button-secondary" onClick={() => void handleCopy(blogMeta.path, 'Selected blog path')}>Copy file path</button>
                </div>
              ) : null}
              {blogPost ? (
                <fieldset disabled={blogLoading || savingBlog} style={{ border: 0, margin: 0, padding: 0 }}>
                  <label className="admin-field"><span>Title</span><input value={blogPost.title} onChange={(event) => onBlogFieldChange('title', event.target.value)} /></label>
                  <label className="admin-field"><span>Slug</span><input value={blogPost.slug} onChange={(event) => onBlogFieldChange('slug', event.target.value)} /></label>
                  <label className="admin-field"><span>Date</span><input value={blogPost.date} onChange={(event) => onBlogFieldChange('date', event.target.value)} /></label>
                  <label className="admin-field"><span>Status</span><select value={blogPost.status} onChange={(event) => onBlogFieldChange('status', event.target.value)}><option value="draft">draft</option><option value="published">published</option></select></label>
                  {blogValidationError ? <p className="admin-note admin-note-warning">{blogValidationError}</p> : null}
                  {isUnsavedLocalBlogDraft ? <p className="admin-note">This is a local draft. Save it once to create the markdown file in GitHub.</p> : null}
                  {blogPost.sha ? <p className="admin-note">Changing the slug or date will rename the markdown file on the next save.</p> : null}
                  <label className="admin-field"><span>Cover image</span><input value={blogPost.coverImage ?? ''} onChange={(event) => onBlogFieldChange('coverImage', event.target.value)} />{renderUseLastUploadButton(() => onBlogFieldChange('coverImage', mediaPath))}{renderMediaTargetButton({ area: 'blog', slug: blogPost.slug, key: `blog:${blogPost.slug}:coverImage`, kind: 'blog', field: 'coverImage', label: `${blogPost.title || blogPost.slug} cover image` })}</label>
                  <label className="admin-field"><span>Cover alt</span><input value={blogPost.coverAlt ?? ''} onChange={(event) => onBlogFieldChange('coverAlt', event.target.value)} /></label>
                  {renderAssignedImagePreview(`${blogPost.title || blogPost.slug} cover image`, blogPost.coverImage, blogPost.coverAlt, blogPost.excerpt)}
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
                        <button type="button" className="admin-button admin-button-secondary" onClick={() => void handleCopy(blogPost.path, 'Blog file path')}>Copy file path</button>
                        {publicPostUrl ? <a className="admin-button admin-button-secondary" href={publicPostUrl} target="_blank" rel="noreferrer">Open public route</a> : null}
                        {publicPostUrl ? <button type="button" className="admin-button admin-button-secondary" onClick={() => void handleCopy(publicPostUrl, 'Public route URL')}>Copy public route</button> : null}
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
                </fieldset>
              ) : null}
            </div>
          </article>

          <section className="admin-panel" id="admin-live-json-preview">
            <div className="admin-panel-header">
              <div>
                <h2>Live JSON preview</h2>
                <p className="admin-copy">The save action commits this full structured object back to content/site-content.json.</p>
              </div>
              <div className="admin-actions">
                {siteContent?.path ? <button type="button" className="admin-button admin-button-secondary" onClick={() => void handleCopy(siteContent.path, 'Site JSON path')}>Copy file path</button> : null}
                {formattedJson ? <button type="button" className="admin-button admin-button-secondary" onClick={() => void handleCopy(formattedJson, 'Live JSON')}>Copy JSON</button> : null}
                {loadingContent ? <span className="admin-status">Loading…</span> : null}
              </div>
            </div>
            <textarea readOnly value={formattedJson} className="admin-code-viewer" spellCheck={false} />
          </section>
        </section>
      ) : null}
    </main>
  )
}
