import { useCallback, useEffect, useMemo, useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import {
  adminApi,
  type AdminActivityResponse,
  type AdminSession,
  type BlogListResponse,
  type MediaUploadResponse,
  type ProjectListResponse,
} from './api/adminApi'
import { DashboardScreen } from './screens/DashboardScreen'
import type { BlogPostMeta, BlogPostResponse, Project } from './types'
import type { BlogActivity, ConflictState, MediaTargetSelection, ProjectJsonErrors, ProjectJsonField } from './adminTypes'
import {
  DEFAULT_BLOG_MEDIA_SLUG,
  DEFAULT_SESSION,
  buildBlogPostPath,
  canReloadBlogPost,
  createClonedBlogPost,
  createClonedProject,
  createEmptyBlogPost,
  createEmptyProject,
  createProjectJsonDrafts,
  emptyImage,
  getApiErrorMessage,
  getBlogMediaSlug,
  getBlogValidationError,
  getMediaValidationError,
  getProjectMediaSlug,
  getProjectValidationError,
  isAdminApiError,
  normalizeSlug,
  parseProjectJsonField,
  splitLines,
} from './lib/adminHelpers'

export const App = () => {
  const [session, setSession] = useState<AdminSession>(DEFAULT_SESSION)
  const [authStatus, setAuthStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [loadingBlog, setLoadingBlog] = useState(false)
  const [loadingActivity, setLoadingActivity] = useState(false)

  const [projectResponse, setProjectResponse] = useState<ProjectListResponse | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectSlug, setSelectedProjectSlug] = useState('')
  const [projectConflict, setProjectConflict] = useState<ConflictState>(null)
  const [projectStatus, setProjectStatus] = useState<string | null>(null)
  const [savingProjects, setSavingProjects] = useState(false)
  const [projectJsonDrafts, setProjectJsonDrafts] = useState(createProjectJsonDrafts(null))
  const [projectJsonErrors, setProjectJsonErrors] = useState<ProjectJsonErrors>({})

  const [blogList, setBlogList] = useState<BlogListResponse | null>(null)
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPostResponse | null>(null)
  const [originalBlogPost, setOriginalBlogPost] = useState<BlogPostResponse | null>(null)
  const [selectedBlogSlug, setSelectedBlogSlug] = useState('')
  const [selectedBlogMeta, setSelectedBlogMeta] = useState<BlogPostMeta | null>(null)
  const [blogConflict, setBlogConflict] = useState<ConflictState>(null)
  const [blogStatus, setBlogStatus] = useState<string | null>(null)
  const [blogActivity, setBlogActivity] = useState<BlogActivity>(null)
  const [savingBlog, setSavingBlog] = useState(false)

  const [activityResponse, setActivityResponse] = useState<AdminActivityResponse | null>(null)
  const [activityError, setActivityError] = useState<string | null>(null)
  const [activityLoadedAt, setActivityLoadedAt] = useState<string | null>(null)

  const [mediaArea, setMediaArea] = useState<'blog' | 'projects'>('blog')
  const [mediaSlug, setMediaSlug] = useState(DEFAULT_BLOG_MEDIA_SLUG)
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaFileInputKey, setMediaFileInputKey] = useState(0)
  const [mediaResult, setMediaResult] = useState<MediaUploadResponse | null>(null)
  const [mediaStatus, setMediaStatus] = useState<string | null>(null)
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [mediaTarget, setMediaTarget] = useState<MediaTargetSelection | null>(null)

  const resetAuthenticatedState = useCallback(() => {
    setProjectResponse(null)
    setProjects([])
    setSelectedProjectSlug('')
    setProjectConflict(null)
    setProjectStatus(null)
    setProjectJsonDrafts(createProjectJsonDrafts(null))
    setProjectJsonErrors({})
    setBlogList(null)
    setSelectedBlogPost(null)
    setOriginalBlogPost(null)
    setSelectedBlogSlug('')
    setSelectedBlogMeta(null)
    setBlogConflict(null)
    setBlogStatus(null)
    setBlogActivity(null)
    setActivityResponse(null)
    setActivityError(null)
    setActivityLoadedAt(null)
    setMediaResult(null)
    setMediaStatus(null)
  }, [])

  const handleUnauthorizedError = useCallback((caught: unknown): boolean => {
    if (isAdminApiError(caught) && caught.status === 401) {
      setSession(DEFAULT_SESSION)
      resetAuthenticatedState()
      setError('Your admin session expired. Sign in again.')
      return true
    }
    return false
  }, [resetAuthenticatedState])

  const loadActivity = useCallback(async () => {
    setLoadingActivity(true)
    setActivityError(null)
    try {
      const response = await adminApi.getActivity()
      setActivityResponse(response)
      setActivityLoadedAt(new Date().toLocaleString())
    } catch (caught) {
      if (!handleUnauthorizedError(caught)) setActivityError(getApiErrorMessage(caught))
    } finally {
      setLoadingActivity(false)
    }
  }, [handleUnauthorizedError])

  const loadProjects = useCallback(async () => {
    setLoadingProjects(true)
    setError(null)
    try {
      const response = await adminApi.getProjects()
      setProjectResponse(response)
      setProjects(structuredClone(response.projects))
      setSelectedProjectSlug((current) => {
        if (response.projects.some((project) => project.slug === current)) return current
        return response.projects[0]?.slug ?? ''
      })
      setProjectConflict(null)
      setProjectStatus(`Loaded ${response.projects.length} project${response.projects.length === 1 ? '' : 's'} from GitHub.`)
    } catch (caught) {
      if (!handleUnauthorizedError(caught)) setError(getApiErrorMessage(caught))
    } finally {
      setLoadingProjects(false)
    }
  }, [handleUnauthorizedError])

  const loadBlogList = useCallback(async () => {
    setLoadingBlog(true)
    try {
      const response = await adminApi.getBlogPosts()
      setBlogList(response)
      setSelectedBlogMeta((current) => {
        if (current && response.posts.some((post) => post.slug === current.slug)) return current
        return response.posts[0] ?? null
      })
    } catch (caught) {
      if (!handleUnauthorizedError(caught)) setError(getApiErrorMessage(caught))
    } finally {
      setLoadingBlog(false)
    }
  }, [handleUnauthorizedError])

  const loadBlogPost = useCallback(async (slug: string) => {
    if (!slug) return
    setLoadingBlog(true)
    setBlogStatus(null)
    try {
      const response = await adminApi.getBlogPost(slug)
      setSelectedBlogPost(structuredClone(response.post))
      setOriginalBlogPost(structuredClone(response.post))
      setSelectedBlogSlug(response.post.slug)
      setSelectedBlogMeta(response.post)
      setMediaSlug((current) => (mediaArea === 'blog' ? response.post.slug || DEFAULT_BLOG_MEDIA_SLUG : current))
      setBlogConflict(null)
    } catch (caught) {
      if (!handleUnauthorizedError(caught)) setBlogStatus(getApiErrorMessage(caught))
    } finally {
      setLoadingBlog(false)
    }
  }, [handleUnauthorizedError, mediaArea])

  useEffect(() => {
    let mounted = true
    const initialize = async () => {
      setLoading(true)
      try {
        const response = await adminApi.getSession()
        if (!mounted) return
        setSession(response)
        if (response.authenticated) {
          await Promise.all([loadProjects(), loadBlogList(), loadActivity()])
        } else {
          resetAuthenticatedState()
        }
      } catch (caught) {
        if (!mounted) return
        setError(getApiErrorMessage(caught))
        setSession(DEFAULT_SESSION)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void initialize()
    return () => {
      mounted = false
    }
  }, [loadActivity, loadBlogList, loadProjects, resetAuthenticatedState])

  useEffect(() => {
    if (!selectedBlogPost && selectedBlogMeta?.slug) {
      void loadBlogPost(selectedBlogMeta.slug)
    }
  }, [loadBlogPost, selectedBlogMeta, selectedBlogPost])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash
    const queryIndex = hash.indexOf('?')
    if (queryIndex === -1) return

    const searchParams = new URLSearchParams(hash.slice(queryIndex + 1))
    const auth = searchParams.get('auth')
    if (!auth) return

    if (auth === 'success') {
      setAuthStatus('Signed in with GitHub.')
      setError(null)
    } else if (auth === 'error') {
      setError('GitHub sign-in failed. Check the admin environment variables and allowed login, then try again.')
    }

    const cleanHash = hash.slice(0, queryIndex) || '#/'
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${cleanHash}`)
  }, [])

  const selectedProject = useMemo(
    () => projects.find((project) => project.slug === selectedProjectSlug) ?? projects[0] ?? null,
    [projects, selectedProjectSlug],
  )

  useEffect(() => {
    setProjectJsonDrafts(createProjectJsonDrafts(selectedProject))
    setProjectJsonErrors({})
  }, [selectedProject])

  const projectDirty = useMemo(() => {
    if (!projectResponse) return false
    return JSON.stringify(projectResponse.projects) !== JSON.stringify(projects)
  }, [projectResponse, projects])

  const blogDirty = useMemo(() => {
    if (!selectedBlogPost) return false
    if (!originalBlogPost) return true
    return JSON.stringify(originalBlogPost) !== JSON.stringify(selectedBlogPost)
  }, [originalBlogPost, selectedBlogPost])

  const projectValidationError = useMemo(
    () => getProjectValidationError(projects, selectedProjectSlug),
    [projects, selectedProjectSlug],
  )
  const hasProjectJsonErrors = useMemo(
    () => Object.values(projectJsonErrors).some(Boolean),
    [projectJsonErrors],
  )
  const blogValidationError = useMemo(() => getBlogValidationError(selectedBlogPost), [selectedBlogPost])
  const mediaValidationError = useMemo(() => {
    if (!mediaFile) return null
    return getMediaValidationError({ area: mediaArea, file: mediaFile, selectedProject, slug: mediaSlug })
  }, [mediaArea, mediaFile, mediaSlug, selectedProject])

  const confirmDiscardChanges = useCallback((message: string): boolean => {
    if (typeof window === 'undefined') return true
    return window.confirm(message)
  }, [])

  const handleLogin = () => {
    window.location.href = '/api/admin/auth/start'
  }

  const handleLogout = async () => {
    try {
      await adminApi.logout()
      setSession(DEFAULT_SESSION)
      resetAuthenticatedState()
      setError(null)
      setAuthStatus('Signed out.')
    } catch (caught) {
      setError(getApiErrorMessage(caught))
    }
  }

  const updateSelectedProject = useCallback((updater: (project: Project) => Project) => {
    setProjects((current) => current.map((project) => (project.slug === selectedProjectSlug ? updater(project) : project)))
  }, [selectedProjectSlug])

  const handleProjectFieldChange = (field: keyof Project, value: string) => {
    if (field === 'slug') {
      const slug = normalizeSlug(value)
      updateSelectedProject((project) => ({ ...project, slug }))
      setSelectedProjectSlug(slug)
      setMediaSlug((current) => (mediaArea === 'projects' ? slug : current))
      return
    }

    updateSelectedProject((project) => {
      if (field === 'stack' || field === 'approach' || field === 'outcome') return { ...project, [field]: splitLines(value) }
      return { ...project, [field]: value }
    })
  }

  const handleProjectJsonFieldChange = (field: ProjectJsonField, value: string) => {
    setProjectJsonDrafts((current) => ({ ...current, [field]: value }))
    const result = parseProjectJsonField(field, value)
    if (!result.ok) {
      setProjectJsonErrors((current) => ({ ...current, [field]: result.error }))
      return
    }

    setProjectJsonErrors((current) => {
      const next = { ...current }
      delete next[field]
      return next
    })
    updateSelectedProject((project) => ({ ...project, [field]: result.parsedValue }))
  }

  const handleProjectCreate = () => {
    setProjects((current) => {
      const nextProject = createEmptyProject(current)
      setSelectedProjectSlug(nextProject.slug)
      setMediaArea('projects')
      setMediaSlug(nextProject.slug)
      return [...current, nextProject]
    })
  }

  const handleProjectDuplicate = () => {
    if (!selectedProject) return
    setProjects((current) => {
      const nextProject = createClonedProject(selectedProject, current)
      setSelectedProjectSlug(nextProject.slug)
      setMediaArea('projects')
      setMediaSlug(nextProject.slug)
      return [...current, nextProject]
    })
  }

  const handleProjectDelete = () => {
    if (!selectedProject) return
    if (!confirmDiscardChanges(`Delete project "${selectedProject.title}" from the admin working copy?`)) return
    setProjects((current) => {
      const nextProjects = current.filter((project) => project.slug !== selectedProject.slug)
      setSelectedProjectSlug(nextProjects[0]?.slug ?? '')
      return nextProjects
    })
  }

  const handleProjectMove = (direction: 'up' | 'down') => {
    setProjects((current) => {
      const index = current.findIndex((project) => project.slug === selectedProjectSlug)
      if (index === -1) return current
      const nextIndex = direction === 'up' ? index - 1 : index + 1
      if (nextIndex < 0 || nextIndex >= current.length) return current
      const next = [...current]
      const [moved] = next.splice(index, 1)
      next.splice(nextIndex, 0, moved)
      return next
    })
  }

  const handleProjectSelect = (slug: string) => {
    setSelectedProjectSlug(slug)
    setMediaArea('projects')
    setMediaSlug(slug)
  }

  const handleDiscardProjects = () => {
    if (!projectResponse) return
    setProjects(structuredClone(projectResponse.projects))
    setSelectedProjectSlug(projectResponse.projects[0]?.slug ?? '')
    setProjectConflict(null)
    setProjectJsonErrors({})
    setProjectStatus('Discarded unsaved project changes.')
  }

  const handleSaveProjects = async () => {
    if (!projectResponse || projectValidationError || hasProjectJsonErrors) return
    setSavingProjects(true)
    setProjectStatus(null)
    setProjectConflict(null)
    try {
      const response = await adminApi.saveProjects({
        branch: projectResponse.branch,
        commitMessage: 'chore(projects): update projects from admin',
        projects,
        sha: projectResponse.sha,
      })
      setProjectResponse(response)
      setProjects(structuredClone(response.projects))
      setProjectStatus(`Saved projects to ${response.path}.`)
      void loadActivity()
    } catch (caught) {
      if (isAdminApiError(caught) && caught.status === 409) {
        setProjectConflict({ currentSha: caught.currentSha, latestCommitSha: caught.latestCommitSha })
      }
      if (!handleUnauthorizedError(caught)) setProjectStatus(getApiErrorMessage(caught))
    } finally {
      setSavingProjects(false)
    }
  }

  const handleBlogCreate = () => {
    if (blogDirty && !confirmDiscardChanges('Discard unsaved blog edits and start a new post?')) return
    const post = createEmptyBlogPost(blogList?.posts ?? [])
    setOriginalBlogPost(null)
    setOriginalBlogPost(null)
    setSelectedBlogPost(post)
    setSelectedBlogSlug(post.slug)
    setSelectedBlogMeta(null)
    setMediaArea('blog')
    setMediaSlug(post.slug)
    setBlogStatus('Draft created locally. Save it to commit the Markdown file.')
  }

  const handleBlogDuplicate = () => {
    if (!selectedBlogPost) return
    if (blogDirty && !confirmDiscardChanges('Discard unsaved blog edits and duplicate the opened post?')) return
    const post = createClonedBlogPost(selectedBlogPost, blogList?.posts ?? [])
    setOriginalBlogPost(null)
    setOriginalBlogPost(null)
    setSelectedBlogPost(post)
    setSelectedBlogSlug(post.slug)
    setSelectedBlogMeta(null)
    setMediaArea('blog')
    setMediaSlug(post.slug)
    setBlogStatus('Blog post duplicated locally. Save it to commit a new Markdown file.')
  }

  const handleDiscardBlog = () => {
    if (selectedBlogMeta?.slug) {
      void loadBlogPost(selectedBlogMeta.slug)
      return
    }
    setSelectedBlogPost(null)
    setOriginalBlogPost(null)
    setSelectedBlogSlug('')
    setBlogStatus('Discarded unsaved blog draft.')
  }

  const handleBlogFieldChange = (field: keyof BlogPostResponse, value: string) => {
    setSelectedBlogPost((current) => {
      if (!current) return current
      if (field === 'slug') {
        const slug = normalizeSlug(value)
        return { ...current, slug, path: buildBlogPostPath(current.date, slug) }
      }
      if (field === 'date') return { ...current, date: value, path: buildBlogPostPath(value, current.slug) }
      if (field === 'status') return { ...current, status: value === 'published' ? 'published' : 'draft' }
      return { ...current, [field]: value }
    })
  }

  const handleBlogSave = async () => {
    if (!selectedBlogPost || blogValidationError) return
    setSavingBlog(true)
    setBlogStatus(null)
    setBlogConflict(null)
    try {
      const response = await adminApi.saveBlogPost(selectedBlogSlug || selectedBlogPost.slug, {
        branch: blogList?.branch ?? projectResponse?.branch ?? 'main',
        commitMessage: selectedBlogPost.sha ? 'chore(blog): update blog post from admin' : 'feat(blog): create blog post from admin',
        post: selectedBlogPost,
        sha: selectedBlogPost.sha || undefined,
      })
      setSelectedBlogPost(structuredClone(response.post))
      setOriginalBlogPost(structuredClone(response.post))
      setSelectedBlogSlug(response.post.slug)
      setSelectedBlogMeta(response.post)
      setBlogActivity({
        latestCommitSha: response.latestCommitSha,
        path: response.post.path,
        repo: response.repo,
        summary: `Saved ${response.post.title}.`,
      })
      setBlogStatus(`Saved ${response.post.title}.`)
      await loadBlogList()
      void loadActivity()
    } catch (caught) {
      if (isAdminApiError(caught) && caught.status === 409) {
        setBlogConflict({ currentSha: caught.currentSha, latestCommitSha: caught.latestCommitSha })
      }
      if (!handleUnauthorizedError(caught)) setBlogStatus(getApiErrorMessage(caught))
    } finally {
      setSavingBlog(false)
    }
  }

  const handleBlogDelete = async () => {
    if (!selectedBlogPost?.sha) return
    if (!confirmDiscardChanges(`Delete blog post "${selectedBlogPost.title}"? This commits a Markdown file deletion.`)) return
    setSavingBlog(true)
    setBlogStatus(null)
    try {
      const response = await adminApi.deleteBlogPost(selectedBlogSlug || selectedBlogPost.slug, {
        branch: blogList?.branch ?? projectResponse?.branch ?? 'main',
        commitMessage: 'chore(blog): delete blog post from admin',
        sha: selectedBlogPost.sha,
      })
      setBlogActivity({
        latestCommitSha: response.latestCommitSha,
        path: response.path,
        repo: response.repo,
        summary: `Deleted ${selectedBlogPost.title}.`,
      })
      setSelectedBlogPost(null)
      setOriginalBlogPost(null)
      setSelectedBlogSlug('')
      setSelectedBlogMeta(null)
      setBlogStatus('Deleted blog post.')
      await loadBlogList()
      void loadActivity()
    } catch (caught) {
      if (!handleUnauthorizedError(caught)) setBlogStatus(getApiErrorMessage(caught))
    } finally {
      setSavingBlog(false)
    }
  }

  const handleMediaAreaChange = (value: 'blog' | 'projects') => {
    setMediaArea(value)
    setMediaTarget(null)
    if (value === 'blog') setMediaSlug(getBlogMediaSlug(selectedBlogPost))
    if (value === 'projects') setMediaSlug(getProjectMediaSlug(selectedProject))
  }

  const handleMediaFileChange = (file: File | null) => {
    setMediaFile(file)
    setMediaStatus(null)
    setMediaResult(null)
  }

  const handleMediaFileClear = () => {
    setMediaFile(null)
    setMediaFileInputKey((key) => key + 1)
  }

  const assignMediaPath = (path: string) => {
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
  }

  const handleMediaUpload = async () => {
    if (!mediaFile || mediaValidationError) return
    setUploadingMedia(true)
    setMediaStatus(null)
    try {
      const response = await adminApi.uploadMedia({ area: mediaArea, slug: mediaSlug, file: mediaFile })
      setMediaResult(response)
      setMediaStatus(`Uploaded ${response.path}.`)
      assignMediaPath(response.path)
      handleMediaFileClear()
      void loadActivity()
    } catch (caught) {
      if (!handleUnauthorizedError(caught)) setMediaStatus(getApiErrorMessage(caught))
    } finally {
      setUploadingMedia(false)
    }
  }

  const dashboardProps = {
    activity: activityResponse?.commits ?? [],
    activityError,
    activityLoadedAt,
    authStatus,
    blogActivity,
    blogConflict,
    blogDirty,
    blogList: blogList?.posts ?? [],
    blogLoading: loadingBlog,
    blogRepo: blogList?.repo ?? projectResponse?.repo ?? null,
    blogMeta: selectedBlogMeta,
    blogPost: selectedBlogPost,
    blogStatus,
    blogValidationError,
    error,
    loading,
    loadingActivity,
    loadingProjects,
    mediaArea,
    mediaFile,
    mediaFileInputKey,
    mediaPath: mediaResult?.path ?? '',
    mediaSlug,
    mediaStatus,
    mediaTarget,
    mediaValidationError,
    onBlogCreate: handleBlogCreate,
    onBlogDelete: handleBlogDelete,
    onBlogDiscard: handleDiscardBlog,
    onBlogDuplicate: handleBlogDuplicate,
    onBlogFieldChange: handleBlogFieldChange,
    onBlogReload: () => { if (canReloadBlogPost(selectedBlogPost, selectedBlogSlug)) void loadBlogPost(selectedBlogSlug) },
    onBlogSave: () => { void handleBlogSave() },
    onBlogSelect: (slug: string) => {
      if (slug === selectedBlogSlug) return
      if (blogDirty && !confirmDiscardChanges('Discard unsaved blog edits and open another post?')) return
      void loadBlogPost(slug)
    },
    onLogout: () => { void handleLogout() },
    onLogin: handleLogin,
    onMediaAreaChange: handleMediaAreaChange,
    onMediaFileChange: handleMediaFileChange,
    onMediaFileClear: handleMediaFileClear,
    onMediaResultClear: () => setMediaResult(null),
    onMediaSlugChange: setMediaSlug,
    onMediaTargetClear: () => setMediaTarget(null),
    onMediaTargetSelect: setMediaTarget,
    onMediaUpload: () => { void handleMediaUpload() },
    onProjectCreate: handleProjectCreate,
    onProjectDelete: handleProjectDelete,
    onProjectDiscard: handleDiscardProjects,
    onProjectDuplicate: handleProjectDuplicate,
    onProjectFieldChange: handleProjectFieldChange,
    onProjectJsonFieldChange: handleProjectJsonFieldChange,
    onProjectMove: handleProjectMove,
    onProjectReload: () => { if (!projectDirty || confirmDiscardChanges('Discard unsaved project changes and reload from GitHub?')) void loadProjects() },
    onProjectSave: () => { void handleSaveProjects() },
    onProjectSelect: handleProjectSelect,
    onReloadActivity: () => { void loadActivity() },
    projectBranch: projectResponse?.branch ?? blogList?.branch ?? null,
    projectConflict,
    projectDirty,
    projectJsonDrafts,
    projectJsonErrors,
    projectOptions: projects.map((project) => ({ slug: project.slug, title: project.title })),
    projectPath: projectResponse?.path ?? 'content/site-content.json',
    projectRepo: projectResponse?.repo ?? null,
    projectStatus,
    projectValidationError,
    projects,
    savingBlog,
    savingProjects,
    selectedBlogSlug,
    selectedProject,
    selectedProjectSlug,
    session,
    siteUrl: typeof window === 'undefined' ? '' : window.location.origin,
    uploadingMedia,
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="*" element={<DashboardScreen {...dashboardProps} />} />
      </Routes>
    </HashRouter>
  )
}
