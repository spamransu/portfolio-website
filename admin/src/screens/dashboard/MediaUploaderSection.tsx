import { useEffect, useMemo, useState } from 'react'
import type { MediaTargetSelection } from '../../adminTypes'
import type { BlogPostResponse, Project } from '../../types'
import type { DashboardMediaProps } from './dashboardTypes'
import { Field, StatusMessage } from './AdminUi'

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

export const MediaUploaderSection = ({
  blogPost,
  media,
  selectedProject,
}: {
  blogPost: BlogPostResponse | null
  media: DashboardMediaProps
  selectedProject: Project | null
}) => {
  const mediaTargets = useMemo<MediaTargetSelection[]>(() => {
    const targets: MediaTargetSelection[] = []
    if (media.area === 'blog' && blogPost) targets.push({ kind: 'blog', field: 'coverImage', label: 'Blog cover image' })
    if (media.area === 'projects' && selectedProject) {
      targets.push({ kind: 'project', field: 'image', label: 'Project hero image' })
      ;(selectedProject.gallery ?? []).forEach((_, index) => targets.push({ kind: 'project', field: 'gallery', index, label: `Gallery image ${index + 1}` }))
      ;(selectedProject.sections ?? []).forEach((section, index) => targets.push({ kind: 'project', field: 'sectionImage', index, label: `Section image: ${section.title || index + 1}` }))
    }
    return targets
  }, [blogPost, media.area, selectedProject])

  return (
    <section id="admin-media-uploader" className="admin-resource-section" aria-labelledby="admin-media-title">
      <div className="admin-section-header">
        <div>
          <p className="admin-kicker">Media</p>
          <h2 id="admin-media-title">Upload blog or project media</h2>
          <p className="admin-note">Uploads are limited to <span className="admin-code">/images/blog/...</span> and <span className="admin-code">/images/projects/...</span>.</p>
        </div>
        <div className="admin-save-group" aria-label="Media upload actions">
          <button className="admin-button admin-button-primary" type="button" onClick={media.onUpload} disabled={!media.file || Boolean(media.validationError) || media.uploading}>{media.uploading ? 'Uploading…' : 'Upload media'}</button>
        </div>
      </div>
      <StatusMessage message={media.status} />
      <StatusMessage kind="error" message={media.validationError} />
      {media.path ? (
        <p className="admin-status admin-status--success">Uploaded path: <span className="admin-code">{media.path}</span> <button className="admin-button admin-button-secondary" type="button" onClick={media.onResultClear}>Clear</button></p>
      ) : null}
      <div className="admin-editor-shell admin-editor-shell--media">
        <div className="admin-collection-panel">
          <div className="admin-form-grid">
            <Field label="Area">
              <select id="media-area" value={media.area} onChange={(event) => media.onAreaChange(event.target.value as DashboardMediaProps['area'])}>
                <option value="blog">Blog</option>
                <option value="projects">Projects</option>
              </select>
            </Field>
            <Field label="Folder slug"><input id="media-slug" value={media.slug} onChange={(event) => media.onSlugChange(event.target.value)} /></Field>
            <Field label="Assign uploaded path to">
              <select
                id="media-target"
                value={media.target?.label ?? ''}
                onChange={(event) => {
                  const target = mediaTargets.find((entry) => entry.label === event.target.value)
                  if (target) media.onTargetSelect(target)
                  else media.onTargetClear()
                }}
              >
                <option value="">Do not auto-assign</option>
                {mediaTargets.map((target) => <option key={target.label} value={target.label}>{target.label}</option>)}
              </select>
            </Field>
            <Field label="File" hint="GIF, JPEG, PNG, SVG, or WebP up to the configured upload limit.">
              <input key={media.fileInputKey} id="media-file" type="file" accept="image/gif,image/jpeg,image/png,image/svg+xml,image/webp" onChange={(event) => media.onFileChange(event.target.files?.[0] ?? null)} />
            </Field>
            {media.file ? <button className="admin-button admin-button-secondary" type="button" onClick={media.onFileClear}>Clear file</button> : null}
          </div>
        </div>
        <div className="admin-editor-panel">
          {media.file ? <SelectedMediaPreview file={media.file} /> : (
            <div className="admin-empty-state admin-empty-state--large">
              <p className="admin-kicker">Preview</p>
              <h3>Choose an image</h3>
              <p>The selected media preview and file details appear here before upload.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
