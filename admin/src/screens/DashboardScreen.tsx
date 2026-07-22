import type { AdminSession, SiteContentResponse } from '../api/adminApi'
import type { BlogPostMeta, BlogPostResponse, ContactMethod, HighlightStat, ImageAsset, Job, ProcessStep, Project, SiteContent, SocialLink } from '../types'

interface DashboardScreenProps {
  blogDirty: boolean
  blogList: BlogPostMeta[]
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
  selectedBlogSlug: string
  selectedExperience: Job | null
  selectedExperienceIndex: number
  selectedExperienceTotal: number
  selectedHighlight: HighlightStat | null
  selectedHighlightIndex: number
  selectedHighlightTotal: number
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
  selectedBlogSlug,
  selectedExperience,
  selectedExperienceIndex,
  selectedExperienceTotal,
  selectedHighlight,
  selectedHighlightIndex,
  selectedHighlightTotal,
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
        </article>
      </section>

      {workingCopy ? (
        <section className="admin-edit-grid">
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
              <label className="admin-field"><span>Intro</span><textarea value={workingCopy.about.intro} onChange={(event) => onFieldChange('about.intro', event.target.value)} /></label>
              <label className="admin-field"><span>Body paragraphs (one per line)</span><textarea value={toLines(workingCopy.about.body)} onChange={(event) => onFieldChange('about.body', event.target.value)} /></label>
              <label className="admin-field"><span>Principles (one per line)</span><textarea value={toLines(workingCopy.about.principles)} onChange={(event) => onFieldChange('about.principles', event.target.value)} /></label>
              <label className="admin-field"><span>Tools (one per line)</span><textarea value={toLines(workingCopy.about.tools)} onChange={(event) => onFieldChange('about.tools', event.target.value)} /></label>
              <label className="admin-field"><span>Hero image src</span><input value={workingCopy.about.heroImage?.src ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'about.src', event.target.value)} /></label>
              <label className="admin-field"><span>Hero image alt</span><input value={workingCopy.about.heroImage?.alt ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'about.alt', event.target.value)} /></label>
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
              <label className="admin-field"><span>Resume hero image src</span><input value={workingCopy.resume.heroImage?.src ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'resume.src', event.target.value)} /></label>
              <label className="admin-field"><span>Resume hero image alt</span><input value={workingCopy.resume.heroImage?.alt ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'resume.alt', event.target.value)} /></label>
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
              <label className="admin-field"><span>Contact hero image src</span><input value={workingCopy.contact.heroImage?.src ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'contact.src', event.target.value)} /></label>
              <label className="admin-field"><span>Contact hero image alt</span><input value={workingCopy.contact.heroImage?.alt ?? ''} onChange={(event) => onStructuredFieldChange('heroImage', 'contact.alt', event.target.value)} /></label>
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
                      <label className="admin-field"><span>Section title</span><input value={section.title} onChange={(event) => onStructuredFieldChange('projectSection', 'title', event.target.value, index)} /></label>
                      <label className="admin-field"><span>Section body</span><textarea value={section.body} onChange={(event) => onStructuredFieldChange('projectSection', 'body', event.target.value, index)} /></label>
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
