import { useCallback, useEffect, useMemo, useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import {
  adminApi,
  type AdminActivityResponse,
  type AdminApiError,
  type AdminRepoInfo,
  type AdminSession,
  type BlogListResponse,
  type MediaUploadResponse,
  type ProjectListResponse,
} from './api/adminApi'
import { DashboardScreen, type MediaTargetSelection } from './screens/DashboardScreen'
import type { BlogPostMeta, BlogPostResponse, Project } from './types'

const DEFAULT_SESSION: AdminSession = {
  authenticated: false,
  login: null,
  expiresAt: null,
}

const MAX_MEDIA_FILE_BYTES = 5 * 1024 * 1024
const ALLOWED_MEDIA_TYPES = ['image/gif', 'image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'] as const
const DEFAULT_BLOG_MEDIA_SLUG = 'blog'

type ConflictState = {
  currentSha?: string
  latestCommitSha?: string | null
} | null

type BlogActivity = {
  latestCommitSha: string | null
  path: string
  repo: AdminRepoInfo
  summary: string
} | null

type ProjectJsonField = 'image' | 'gallery' | 'sections'

type ProjectJsonDrafts = Record<ProjectJsonField, string>
type ProjectJsonErrors = Partial<Record<ProjectJsonField, string>>

const splitLines = (value: string): string[] =>
  value
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean)

const todayDate = () => new Date().toISOString().slice(0, 10)

const normalizeSlug = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const buildBlogPostPath = (date: string, slug: string): string => `content/blog/${date}-${slug}.md`

const emptyImage = () => ({ src: '', alt: '', caption: '' })

const getUniqueBlogCloneSlug = (baseSlug: string, existingPosts: BlogPostMeta[], date: string): string => {
  const normalizedBase = normalizeSlug(baseSlug) || `draft-${todayDate()}`
  let candidate = normalizedBase
  let copyIndex = 2

  while (existingPosts.some((entry) => entry.slug === candidate || entry.path === buildBlogPostPath(date, candidate))) {
    candidate = `${normalizedBase}-${copyIndex}`
    copyIndex += 1
  }

  return candidate
}

const createEmptyBlogPost = (existingPosts: BlogPostMeta[]): BlogPostResponse => {
  const date = todayDate()
  const slug = getUniqueBlogCloneSlug('new-post', existingPosts, date)

  return {
    title: 'New blog post',
    slug,
    date,
    status: 'draft',
    body: 'Start writing here.\n\nAdd the main notes, decisions, or build details for this post.',
    coverAlt: '',
    coverImage: '',
    excerpt: 'Add a short excerpt before publishing.',
    path: buildBlogPostPath(date, slug),
    sha: '',
  }
}

const createClonedBlogPost = (source: BlogPostResponse, existingPosts: BlogPostMeta[]): BlogPostResponse => {
  const date = todayDate()
  const nextSlug = getUniqueBlogCloneSlug(`${source.slug || 'draft'}-copy`, existingPosts, date)

  return {
    ...structuredClone(source),
    title: source.title ? `${source.title} (Copy)` : 'Untitled draft',
    slug: nextSlug,
    date,
    status: 'draft',
    path: buildBlogPostPath(date, nextSlug),
    sha: '',
  }
}

const getUniqueProjectCloneSlug = (baseSlug: string, existingProjects: Project[]): string => {
  const normalizedBase = normalizeSlug(baseSlug) || 'new-project'
  let candidate = normalizedBase
  let copyIndex = 2

  while (existingProjects.some((project) => project.slug === candidate)) {
    candidate = `${normalizedBase}-${copyIndex}`
    copyIndex += 1
  }

  return candidate
}

const createEmptyProject = (existingProjects: Project[]): Project => {
  return {
    slug: getUniqueProjectCloneSlug('new-project', existingProjects),
    title: 'New project',
    year: `${new Date().getFullYear()}`,
    client: 'Personal project',
    summary: 'Short project summary.',
    role: 'Frontend developer',
    stack: ['React', 'TypeScript'],
    challenge: 'Describe the problem this project solved.',
    approach: ['Describe the approach.'],
    outcome: ['Describe the outcome.'],
    image: emptyImage(),
    gallery: [],
    sections: [],
  }
}

const createClonedProject = (source: Project, existingProjects: Project[]): Project => ({
  ...structuredClone(source),
  title: source.title ? `${source.title} (Copy)` : 'New project',
  slug: getUniqueProjectCloneSlug(`${source.slug || 'project'}-copy`, existingProjects),
})

const getProjectValidationError = (projects: Project[], selectedSlug: string): string | null => {
  const slugs = new Set<string>()
  for (const project of projects) {
    const label = project.title.trim() || project.slug.trim() || 'Untitled project'
    if (!project.slug.trim()) return `${label} needs a slug.`
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)) return `${label} slug must use lowercase letters, numbers, and hyphens only.`
    if (slugs.has(project.slug)) return `Project slug must be unique. Duplicate slug: ${project.slug}.`
    slugs.add(project.slug)
    if (!project.title.trim()) return `${label} needs a title.`
    if (!project.year.trim()) return `${label} needs a year.`
    if (!project.client.trim()) return `${label} needs a client.`
    if (!project.summary.trim()) return `${label} needs a summary.`
    if (!project.role.trim()) return `${label} needs a role.`
    if (!project.challenge.trim()) return `${label} needs a challenge.`
    if (!project.stack.some(Boolean)) return `${label} needs at least one stack item.`
    if (!project.approach.some(Boolean)) return `${label} needs at least one approach item.`
    if (!project.outcome.some(Boolean)) return `${label} needs at least one outcome item.`
    if (project.image?.src.trim() && !project.image.alt.trim()) return `${label} hero image alt text is required.`
    if (!project.image?.src.trim() && project.image?.alt.trim()) return `${label} hero image src is required.`
  }

  if (projects.length > 0 && selectedSlug && !projects.some((project) => project.slug === selectedSlug)) {
    return 'Select a valid project before saving.'
  }

  return null
}

const getBlogValidationError = (post: BlogPostResponse | null): string | null => {
  if (!post) return null
  if (!post.title.trim()) return 'Blog title is required.'
  if (!post.body.trim()) return 'Blog body is required.'
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug)) return 'Blog slug must use lowercase letters, numbers, and hyphens only.'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date)) return 'Blog date must use the YYYY-MM-DD format.'
  if (post.coverImage?.trim() && !post.coverAlt?.trim()) return 'Cover alt text is required when a blog cover image is set.'
  if (!post.coverImage?.trim() && post.coverAlt?.trim()) return 'Cover image is required when cover alt text is set.'
  if (post.status === 'published' && !post.excerpt?.trim()) return 'Published blog posts require an excerpt.'
  return null
}

const getApiErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) return error.message
  return 'Something went wrong. Try again.'
}

const isAdminApiError = (error: unknown): error is AdminApiError => error instanceof Error

const projectJsonFieldLabels: Record<ProjectJsonField, string> = {
  image: 'Hero image JSON',
  gallery: 'Gallery JSON',
  sections: 'Sections JSON',
}

const createProjectJsonDrafts = (project: Project | null): ProjectJsonDrafts => ({
  image: JSON.stringify(project?.image ?? emptyImage(), null, 2),
  gallery: JSON.stringify(project?.gallery ?? [], null, 2),
  sections: JSON.stringify(project?.sections ?? [], null, 2),
})

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
  const [projectJsonDrafts, setProjectJsonDrafts] = useState<ProjectJsonDrafts>(createProjectJsonDrafts(null))
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
    if (!ALLOWED_MEDIA_TYPES.includes(mediaFile.type as (typeof ALLOWED_MEDIA_TYPES)[number])) return 'Unsupported media type. Use png, jpg, webp, gif, or svg.'
    if (mediaFile.size > MAX_MEDIA_FILE_BYTES) return 'Media file is too large. Maximum size is 5 MB.'
    if (!mediaSlug.trim()) return 'Media slug is required.'
    if (mediaArea === 'projects' && !selectedProject) return 'Select a project before uploading project media.'
    return null
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

  const handleProjectJsonFieldChange = (field: 'image' | 'gallery' | 'sections', value: string) => {
    setProjectJsonDrafts((current) => ({ ...current, [field]: value }))
    try {
      const parsedValue = JSON.parse(value) as Project[typeof field]
      setProjectJsonErrors((current) => {
        const next = { ...current }
        delete next[field]
        return next
      })
      updateSelectedProject((project) => ({ ...project, [field]: parsedValue }))
    } catch {
      setProjectJsonErrors((current) => ({
        ...current,
        [field]: `${projectJsonFieldLabels[field]} is invalid. Fix the JSON before saving.`,
      }))
    }
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
    if (value === 'blog') setMediaSlug(selectedBlogPost?.slug || DEFAULT_BLOG_MEDIA_SLUG)
    if (value === 'projects') setMediaSlug(selectedProject?.slug || '')
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
    onBlogReload: () => { if (selectedBlogSlug) void loadBlogPost(selectedBlogSlug) },
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
