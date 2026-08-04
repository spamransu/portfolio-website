import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminApi, type MediaUploadResponse } from '../api/adminApi'
import type { MediaArea, MediaTargetSelection } from '../adminTypes'
import type { BlogPostResponse, Project } from '../types'
import {
  DEFAULT_BLOG_MEDIA_SLUG,
  emptyImage,
  getApiErrorMessage,
  getBlogMediaSlug,
  getMediaValidationError,
  getProjectMediaSlug,
} from '../lib/adminHelpers'

type UseMediaUploaderOptions = {
  handleUnauthorizedError: (caught: unknown) => boolean
  onAfterUpload: () => void
  selectedBlogPost: BlogPostResponse | null
  selectedProject: Project | null
  setSelectedBlogPost: React.Dispatch<React.SetStateAction<BlogPostResponse | null>>
  updateSelectedProject: (updater: (project: Project) => Project) => void
}

export const useMediaUploader = ({
  handleUnauthorizedError,
  onAfterUpload,
  selectedBlogPost,
  selectedProject,
  setSelectedBlogPost,
  updateSelectedProject,
}: UseMediaUploaderOptions) => {
  const [mediaArea, setMediaArea] = useState<MediaArea>('blog')
  const [mediaSlug, setMediaSlug] = useState(DEFAULT_BLOG_MEDIA_SLUG)
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaFileInputKey, setMediaFileInputKey] = useState(0)
  const [mediaResult, setMediaResult] = useState<MediaUploadResponse | null>(null)
  const [mediaStatus, setMediaStatus] = useState<string | null>(null)
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [mediaTarget, setMediaTarget] = useState<MediaTargetSelection | null>(null)

  const selectedBlogMediaSlug = getBlogMediaSlug(selectedBlogPost)
  const selectedProjectMediaSlug = getProjectMediaSlug(selectedProject)

  useEffect(() => {
    if (mediaArea === 'blog') setMediaSlug(selectedBlogMediaSlug)
    if (mediaArea === 'projects') setMediaSlug(selectedProjectMediaSlug)
    setMediaTarget(null)
  }, [mediaArea, selectedBlogMediaSlug, selectedProjectMediaSlug])

  const mediaValidationError = useMemo(() => {
    if (!mediaFile) return null
    return getMediaValidationError({ area: mediaArea, file: mediaFile, selectedProject, slug: mediaSlug })
  }, [mediaArea, mediaFile, mediaSlug, selectedProject])

  const resetMedia = useCallback(() => {
    setMediaArea('blog')
    setMediaSlug(DEFAULT_BLOG_MEDIA_SLUG)
    setMediaFile(null)
    setMediaFileInputKey((key) => key + 1)
    setMediaResult(null)
    setMediaStatus(null)
    setUploadingMedia(false)
    setMediaTarget(null)
  }, [])

  const selectBlogMediaResource = useCallback((slug: string) => {
    setMediaArea('blog')
    setMediaSlug(slug || DEFAULT_BLOG_MEDIA_SLUG)
    setMediaTarget(null)
  }, [])

  const selectProjectMediaResource = useCallback((slug: string) => {
    setMediaArea('projects')
    setMediaSlug(slug)
    setMediaTarget(null)
  }, [])

  const syncBlogMediaSlug = useCallback((slug: string) => {
    setMediaSlug((current) => (mediaArea === 'blog' ? slug || DEFAULT_BLOG_MEDIA_SLUG : current))
    setMediaTarget((current) => (mediaArea === 'blog' ? null : current))
  }, [mediaArea])

  const syncProjectMediaSlug = useCallback((slug: string) => {
    setMediaSlug((current) => (mediaArea === 'projects' ? slug : current))
    setMediaTarget((current) => (mediaArea === 'projects' ? null : current))
  }, [mediaArea])

  const changeMediaArea = useCallback((value: MediaArea) => {
    setMediaArea(value)
    setMediaTarget(null)
    if (value === 'blog') setMediaSlug(selectedBlogMediaSlug)
    if (value === 'projects') setMediaSlug(selectedProjectMediaSlug)
  }, [selectedBlogMediaSlug, selectedProjectMediaSlug])

  const changeMediaFile = useCallback((file: File | null) => {
    setMediaFile(file)
    setMediaStatus(null)
    setMediaResult(null)
  }, [])

  const clearMediaFile = useCallback(() => {
    setMediaFile(null)
    setMediaFileInputKey((key) => key + 1)
  }, [])

  const assignMediaPath = useCallback((path: string) => {
    if (!mediaTarget) return
    if (mediaTarget.kind === 'blog') {
      setSelectedBlogPost((current) => current ? { ...current, coverImage: path, coverAlt: current.coverAlt || current.title } : current)
      return
    }
    updateSelectedProject((project) => {
      if (mediaTarget.field === 'image') return { ...project, image: { ...(project.image ?? emptyImage()), src: path, alt: project.image?.alt || project.title } }
      if (mediaTarget.field === 'gallery') {
        const gallery = [...(project.gallery ?? [])]
        const index = mediaTarget.index ?? gallery.length
        gallery[index] = { ...(gallery[index] ?? emptyImage()), src: path, alt: gallery[index]?.alt || project.title }
        return { ...project, gallery }
      }
      if (mediaTarget.field === 'sectionImage') {
        const sections = [...(project.sections ?? [])]
        const index = mediaTarget.index ?? 0
        const section = sections[index]
        if (!section) return project
        sections[index] = { ...section, image: { ...(section.image ?? emptyImage()), src: path, alt: section.image?.alt || section.title } }
        return { ...project, sections }
      }
      return project
    })
  }, [mediaTarget, setSelectedBlogPost, updateSelectedProject])

  const uploadMedia = useCallback(async () => {
    if (!mediaFile || mediaValidationError) return
    setUploadingMedia(true)
    setMediaStatus(null)
    try {
      const response = await adminApi.uploadMedia({ area: mediaArea, slug: mediaSlug, file: mediaFile })
      setMediaResult(response)
      setMediaStatus(`Uploaded ${response.path}.`)
      assignMediaPath(response.path)
      clearMediaFile()
      onAfterUpload()
    } catch (caught) {
      if (!handleUnauthorizedError(caught)) setMediaStatus(getApiErrorMessage(caught))
    } finally {
      setUploadingMedia(false)
    }
  }, [assignMediaPath, clearMediaFile, handleUnauthorizedError, mediaArea, mediaFile, mediaSlug, mediaValidationError, onAfterUpload])

  return {
    changeMediaArea,
    changeMediaFile,
    clearMediaFile,
    mediaArea,
    mediaFile,
    mediaFileInputKey,
    mediaPath: mediaResult?.path ?? '',
    mediaSlug,
    mediaStatus,
    mediaTarget,
    mediaValidationError,
    resetMedia,
    selectBlogMediaResource,
    selectProjectMediaResource,
    setMediaResult,
    setMediaSlug,
    setMediaTarget,
    syncBlogMediaSlug,
    syncProjectMediaSlug,
    uploadingMedia,
    uploadMedia,
  }
}
