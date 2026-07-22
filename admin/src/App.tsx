import { useCallback, useEffect, useMemo, useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import {
  adminApi,
  type AdminApiError,
  type AdminRepoInfo,
  type AdminSession,
  type BlogDetailResponse,
  type BlogListResponse,
  type MediaUploadResponse,
  type SiteContentResponse,
} from './api/adminApi'
import { DashboardScreen } from './screens/DashboardScreen'
import type { BlogPostMeta, BlogPostResponse, SiteContent } from './types'

const DEFAULT_SESSION: AdminSession = {
  authenticated: false,
  login: null,
  expiresAt: null,
}

const DEFAULT_MEDIA_AREA = 'blog'

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

const splitLines = (value: string): string[] =>
  value
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean)

const updateRecordAtIndex = <T,>(items: T[], index: number, updater: (item: T) => T): T[] =>
  items.map((item, itemIndex) => (itemIndex === index ? updater(item) : item))

const normalizeTone = (value: string): 'accent' | 'accent-2' | 'accent-3' => {
  if (value === 'accent-2' || value === 'accent-3') return value
  return 'accent'
}

const todayDate = () => new Date().toISOString().slice(0, 10)

const createEmptyBlogPost = (slug = `draft-${todayDate()}`): BlogPostResponse => ({
  title: 'Untitled draft',
  slug,
  date: todayDate(),
  status: 'draft',
  body: '',
  coverAlt: '',
  coverImage: '',
  excerpt: '',
  path: `content/blog/${todayDate()}-${slug}.md`,
  sha: '',
})

const updateWorkingCopy = (content: SiteContent, field: string, value: string): SiteContent => {
  const next = structuredClone(content)

  switch (field) {
    case 'site.name':
      next.site.name = value
      return next
    case 'site.tagline':
      next.site.tagline = value
      return next
    case 'site.description':
      next.site.description = value
      return next
    case 'site.email':
      next.site.email = value
      return next
    case 'site.location':
      next.site.location = value
      return next
    case 'site.siteUrl':
      next.site.siteUrl = value
      return next
    case 'about.title':
      next.about.title = value
      return next
    case 'about.bodySectionTitle':
      next.about.bodySectionTitle = value
      return next
    case 'about.processSectionTitle':
      next.about.processSectionTitle = value
      return next
    case 'about.processSectionIntro':
      next.about.processSectionIntro = value
      return next
    case 'about.principlesSectionTitle':
      next.about.principlesSectionTitle = value
      return next
    case 'about.toolsSectionTitle':
      next.about.toolsSectionTitle = value
      return next
    case 'resume.highlightsSectionTitle':
      next.resume.highlightsSectionTitle = value
      return next
    case 'resume.skillsSectionTitle':
      next.resume.skillsSectionTitle = value
      return next
    case 'resume.experienceSectionTitle':
      next.resume.experienceSectionTitle = value
      return next
    case 'home.hero.eyebrow':
      next.home.hero.eyebrow = value
      return next
    case 'home.hero.titleLines':
      next.home.hero.titleLines = splitLines(value)
      return next
    case 'home.hero.description':
      next.home.hero.description = value
      return next
    case 'home.cta.primaryLabel':
      next.home.cta.primaryLabel = value
      return next
    case 'home.cta.secondaryLabel':
      next.home.cta.secondaryLabel = value
      return next
    case 'home.featuredProjects.title':
      next.home.featuredProjects.title = value
      return next
    case 'home.featuredProjects.intro':
      next.home.featuredProjects.intro = value
      return next
    case 'home.featuredProjects.slugs':
      next.home.featuredProjects.slugs = splitLines(value)
      return next
    case 'home.featuredProjects.fallbackLabel':
      next.home.featuredProjects.fallbackLabel = value
      return next
    case 'home.featuredProjects.fallbackDescription':
      next.home.featuredProjects.fallbackDescription = value
      return next
    case 'home.bio.eyebrow':
      next.home.bio.eyebrow = value
      return next
    case 'home.bio.titleLines':
      next.home.bio.titleLines = splitLines(value)
      return next
    case 'home.bio.description':
      next.home.bio.description = value
      return next
    case 'home.skills.title':
      next.home.skills.title = value
      return next
    case 'home.skills.description':
      next.home.skills.description = value
      return next
    case 'home.skills.items':
      next.home.skills.items = splitLines(value)
      return next
    case 'home.contact.title':
      next.home.contact.title = value
      return next
    case 'home.contact.intro':
      next.home.contact.intro = value
      return next
    case 'home.contact.submitLabel':
      next.home.contact.submitLabel = value
      return next
    case 'home.contact.messageLimit':
      next.home.contact.messageLimit = Number(value) || 0
      return next
    case 'about.intro':
      next.about.intro = value
      return next
    case 'about.body':
      next.about.body = splitLines(value)
      return next
    case 'about.principles':
      next.about.principles = splitLines(value)
      return next
    case 'about.tools':
      next.about.tools = splitLines(value)
      return next
    case 'contact.title':
      next.contact.title = value
      return next
    case 'contact.body':
      next.contact.body = value
      return next
    case 'contact.availability':
      next.contact.availability = value
      return next
    case 'contact.availabilityTitle':
      next.contact.availabilityTitle = value
      return next
    case 'contact.availabilityStatusLabel':
      next.contact.availabilityStatusLabel = value
      return next
    case 'contact.availabilityLocationLabel':
      next.contact.availabilityLocationLabel = value
      return next
    case 'contact.form.title':
      next.contact.form.title = value
      return next
    case 'contact.form.intro':
      next.contact.form.intro = value
      return next
    case 'contact.form.submitLabel':
      next.contact.form.submitLabel = value
      return next
    case 'contact.formSectionTitle':
      next.contact.formSectionTitle = value
      return next
    case 'contact.formSectionIntro':
      next.contact.formSectionIntro = value
      return next
    case 'contact.methodsSectionTitle':
      next.contact.methodsSectionTitle = value
      return next
    case 'contact.methodsSectionIntro':
      next.contact.methodsSectionIntro = value
      return next
    case 'projectsPage.title':
      next.projectsPage = {
        title: value,
        intro: next.projectsPage?.intro ?? '',
        heroImage: next.projectsPage?.heroImage,
      }
      return next
    case 'projectsPage.intro':
      next.projectsPage = {
        title: next.projectsPage?.title ?? '',
        intro: value,
        heroImage: next.projectsPage?.heroImage,
      }
      return next
    case 'blogPage.title':
      next.blogPage = {
        title: value,
        intro: next.blogPage?.intro ?? '',
        heroImage: next.blogPage?.heroImage,
      }
      return next
    case 'blogPage.intro':
      next.blogPage = {
        title: next.blogPage?.title ?? '',
        intro: value,
        heroImage: next.blogPage?.heroImage,
      }
      return next
    case 'projectDetailPage.notFoundTitle':
      next.projectDetailPage = { ...next.projectDetailPage, notFoundTitle: value, notFoundIntro: next.projectDetailPage?.notFoundIntro ?? '', snapshotTitle: next.projectDetailPage?.snapshotTitle ?? '', galleryTitle: next.projectDetailPage?.galleryTitle ?? '', galleryIntro: next.projectDetailPage?.galleryIntro ?? '', nextProjectEyebrow: next.projectDetailPage?.nextProjectEyebrow ?? '', similarWorkEyebrow: next.projectDetailPage?.similarWorkEyebrow ?? '', similarWorkTitle: next.projectDetailPage?.similarWorkTitle ?? '', similarWorkIntro: next.projectDetailPage?.similarWorkIntro ?? '' }
      return next
    case 'projectDetailPage.notFoundIntro':
      next.projectDetailPage = { ...next.projectDetailPage, notFoundTitle: next.projectDetailPage?.notFoundTitle ?? '', notFoundIntro: value, snapshotTitle: next.projectDetailPage?.snapshotTitle ?? '', galleryTitle: next.projectDetailPage?.galleryTitle ?? '', galleryIntro: next.projectDetailPage?.galleryIntro ?? '', nextProjectEyebrow: next.projectDetailPage?.nextProjectEyebrow ?? '', similarWorkEyebrow: next.projectDetailPage?.similarWorkEyebrow ?? '', similarWorkTitle: next.projectDetailPage?.similarWorkTitle ?? '', similarWorkIntro: next.projectDetailPage?.similarWorkIntro ?? '' }
      return next
    case 'projectDetailPage.snapshotTitle':
      next.projectDetailPage = { ...next.projectDetailPage, notFoundTitle: next.projectDetailPage?.notFoundTitle ?? '', notFoundIntro: next.projectDetailPage?.notFoundIntro ?? '', snapshotTitle: value, galleryTitle: next.projectDetailPage?.galleryTitle ?? '', galleryIntro: next.projectDetailPage?.galleryIntro ?? '', nextProjectEyebrow: next.projectDetailPage?.nextProjectEyebrow ?? '', similarWorkEyebrow: next.projectDetailPage?.similarWorkEyebrow ?? '', similarWorkTitle: next.projectDetailPage?.similarWorkTitle ?? '', similarWorkIntro: next.projectDetailPage?.similarWorkIntro ?? '' }
      return next
    case 'projectDetailPage.galleryTitle':
      next.projectDetailPage = { ...next.projectDetailPage, notFoundTitle: next.projectDetailPage?.notFoundTitle ?? '', notFoundIntro: next.projectDetailPage?.notFoundIntro ?? '', snapshotTitle: next.projectDetailPage?.snapshotTitle ?? '', galleryTitle: value, galleryIntro: next.projectDetailPage?.galleryIntro ?? '', nextProjectEyebrow: next.projectDetailPage?.nextProjectEyebrow ?? '', similarWorkEyebrow: next.projectDetailPage?.similarWorkEyebrow ?? '', similarWorkTitle: next.projectDetailPage?.similarWorkTitle ?? '', similarWorkIntro: next.projectDetailPage?.similarWorkIntro ?? '' }
      return next
    case 'projectDetailPage.galleryIntro':
      next.projectDetailPage = { ...next.projectDetailPage, notFoundTitle: next.projectDetailPage?.notFoundTitle ?? '', notFoundIntro: next.projectDetailPage?.notFoundIntro ?? '', snapshotTitle: next.projectDetailPage?.snapshotTitle ?? '', galleryTitle: next.projectDetailPage?.galleryTitle ?? '', galleryIntro: value, nextProjectEyebrow: next.projectDetailPage?.nextProjectEyebrow ?? '', similarWorkEyebrow: next.projectDetailPage?.similarWorkEyebrow ?? '', similarWorkTitle: next.projectDetailPage?.similarWorkTitle ?? '', similarWorkIntro: next.projectDetailPage?.similarWorkIntro ?? '' }
      return next
    case 'projectDetailPage.nextProjectEyebrow':
      next.projectDetailPage = { ...next.projectDetailPage, notFoundTitle: next.projectDetailPage?.notFoundTitle ?? '', notFoundIntro: next.projectDetailPage?.notFoundIntro ?? '', snapshotTitle: next.projectDetailPage?.snapshotTitle ?? '', galleryTitle: next.projectDetailPage?.galleryTitle ?? '', galleryIntro: next.projectDetailPage?.galleryIntro ?? '', nextProjectEyebrow: value, similarWorkEyebrow: next.projectDetailPage?.similarWorkEyebrow ?? '', similarWorkTitle: next.projectDetailPage?.similarWorkTitle ?? '', similarWorkIntro: next.projectDetailPage?.similarWorkIntro ?? '' }
      return next
    case 'projectDetailPage.similarWorkEyebrow':
      next.projectDetailPage = { ...next.projectDetailPage, notFoundTitle: next.projectDetailPage?.notFoundTitle ?? '', notFoundIntro: next.projectDetailPage?.notFoundIntro ?? '', snapshotTitle: next.projectDetailPage?.snapshotTitle ?? '', galleryTitle: next.projectDetailPage?.galleryTitle ?? '', galleryIntro: next.projectDetailPage?.galleryIntro ?? '', nextProjectEyebrow: next.projectDetailPage?.nextProjectEyebrow ?? '', similarWorkEyebrow: value, similarWorkTitle: next.projectDetailPage?.similarWorkTitle ?? '', similarWorkIntro: next.projectDetailPage?.similarWorkIntro ?? '' }
      return next
    case 'projectDetailPage.similarWorkTitle':
      next.projectDetailPage = { ...next.projectDetailPage, notFoundTitle: next.projectDetailPage?.notFoundTitle ?? '', notFoundIntro: next.projectDetailPage?.notFoundIntro ?? '', snapshotTitle: next.projectDetailPage?.snapshotTitle ?? '', galleryTitle: next.projectDetailPage?.galleryTitle ?? '', galleryIntro: next.projectDetailPage?.galleryIntro ?? '', nextProjectEyebrow: next.projectDetailPage?.nextProjectEyebrow ?? '', similarWorkEyebrow: next.projectDetailPage?.similarWorkEyebrow ?? '', similarWorkTitle: value, similarWorkIntro: next.projectDetailPage?.similarWorkIntro ?? '' }
      return next
    case 'projectDetailPage.similarWorkIntro':
      next.projectDetailPage = { ...next.projectDetailPage, notFoundTitle: next.projectDetailPage?.notFoundTitle ?? '', notFoundIntro: next.projectDetailPage?.notFoundIntro ?? '', snapshotTitle: next.projectDetailPage?.snapshotTitle ?? '', galleryTitle: next.projectDetailPage?.galleryTitle ?? '', galleryIntro: next.projectDetailPage?.galleryIntro ?? '', nextProjectEyebrow: next.projectDetailPage?.nextProjectEyebrow ?? '', similarWorkEyebrow: next.projectDetailPage?.similarWorkEyebrow ?? '', similarWorkTitle: next.projectDetailPage?.similarWorkTitle ?? '', similarWorkIntro: value }
      return next
    default:
      return next
  }
}

const updateBlogPost = (post: BlogPostResponse, field: string, value: string): BlogPostResponse => {
  const next = structuredClone(post)

  switch (field) {
    case 'title':
      next.title = value
      return next
    case 'date':
      next.date = value
      return next
    case 'status':
      next.status = value === 'draft' ? 'draft' : 'published'
      return next
    case 'coverImage':
      next.coverImage = value || undefined
      return next
    case 'coverAlt':
      next.coverAlt = value || undefined
      return next
    case 'excerpt':
      next.excerpt = value || undefined
      return next
    case 'body':
      next.body = value
      return next
    default:
      return next
  }
}

const getAuthMessageFromUrl = (): string | null => {
  const hash = window.location.hash
  const queryIndex = hash.indexOf('?')
  if (queryIndex === -1) return null

  const params = new URLSearchParams(hash.slice(queryIndex + 1))
  const auth = params.get('auth')
  if (!auth) return null

  const message = auth === 'success' ? 'GitHub login successful.' : 'GitHub login failed.'
  const nextHash = hash.slice(0, queryIndex) || '#/'
  window.history.replaceState({}, document.title, `${window.location.pathname}${nextHash}`)
  return message
}

export const App = () => {
  const [session, setSession] = useState<AdminSession>(DEFAULT_SESSION)
  const [siteContent, setSiteContent] = useState<SiteContentResponse | null>(null)
  const [workingCopy, setWorkingCopy] = useState<SiteContent | null>(null)
  const [blogList, setBlogList] = useState<BlogListResponse | null>(null)
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string>('')
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogDetailResponse | null>(null)
  const [selectedProjectSlug, setSelectedProjectSlug] = useState<string>('')
  const [selectedProjectGalleryIndex, setSelectedProjectGalleryIndex] = useState(0)
  const [selectedHomeStatIndex, setSelectedHomeStatIndex] = useState(0)
  const [selectedSocialIndex, setSelectedSocialIndex] = useState(0)
  const [selectedProcessIndex, setSelectedProcessIndex] = useState(0)
  const [selectedHighlightIndex, setSelectedHighlightIndex] = useState(0)
  const [selectedExperienceIndex, setSelectedExperienceIndex] = useState(0)
  const [selectedMethodIndex, setSelectedMethodIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingContent, setLoadingContent] = useState(false)
  const [loadingBlog, setLoadingBlog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savingBlog, setSavingBlog] = useState(false)
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [mediaArea, setMediaArea] = useState(DEFAULT_MEDIA_AREA)
  const [mediaSlug, setMediaSlug] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaResult, setMediaResult] = useState<MediaUploadResponse | null>(null)
  const [error, setError] = useState<string | null>(getAuthMessageFromUrl())
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [blogStatus, setBlogStatus] = useState<string | null>(null)
  const [mediaStatus, setMediaStatus] = useState<string | null>(null)
  const [siteConflict, setSiteConflict] = useState<ConflictState>(null)
  const [blogConflict, setBlogConflict] = useState<ConflictState>(null)
  const [blogActivity, setBlogActivity] = useState<BlogActivity>(null)

  const loadSiteContent = useCallback(async () => {
    setLoadingContent(true)

    try {
      const response = await adminApi.getSiteContent()
      setSiteContent(response)
      setWorkingCopy(structuredClone(response.content))
      setSelectedProjectSlug(response.content.projects[0]?.slug ?? '')
      setSelectedProjectGalleryIndex(0)
      setSelectedHomeStatIndex(0)
      setSelectedSocialIndex(0)
      setSelectedProcessIndex(0)
      setSelectedHighlightIndex(0)
      setSelectedExperienceIndex(0)
      setSelectedMethodIndex(0)
      setError(null)
      setSaveStatus(null)
      setSiteConflict(null)
    } catch (loadError) {
      setSiteContent(null)
      setWorkingCopy(null)
      setError(loadError instanceof Error ? loadError.message : 'Failed to load site content.')
    } finally {
      setLoadingContent(false)
    }
  }, [])

  const loadBlogPost = useCallback(async (slug: string) => {
    if (!slug) {
      setSelectedBlogPost(null)
      return
    }

    setLoadingBlog(true)

    try {
      const response = await adminApi.getBlogPost(slug)
      setSelectedBlogPost(response)
      setSelectedBlogSlug(slug)
      setMediaArea('blog')
      setMediaSlug(slug)
      setBlogStatus(null)
      setBlogConflict(null)
      setError(null)
    } catch (loadError) {
      setSelectedBlogPost(null)
      setError(loadError instanceof Error ? loadError.message : 'Failed to load blog post.')
    } finally {
      setLoadingBlog(false)
    }
  }, [])

  const loadBlogList = useCallback(async () => {
    try {
      const response = await adminApi.getBlogPosts()
      setBlogList(response)
      const firstSlug = response.posts[0]?.slug ?? ''
      if (firstSlug) {
        await loadBlogPost(firstSlug)
      } else {
        setSelectedBlogSlug('')
        setSelectedBlogPost(null)
      }
    } catch (loadError) {
      setBlogList(null)
      setSelectedBlogSlug('')
      setSelectedBlogPost(null)
      setError(loadError instanceof Error ? loadError.message : 'Failed to load blog posts.')
    }
  }, [loadBlogPost])

  const loadSession = useCallback(async () => {
    setLoading(true)

    try {
      const currentSession = await adminApi.getSession()
      setSession(currentSession)

      if (currentSession.authenticated) {
        await Promise.all([loadSiteContent(), loadBlogList()])
      } else {
        setSiteContent(null)
        setWorkingCopy(null)
        setBlogList(null)
        setSelectedBlogSlug('')
        setSelectedBlogPost(null)
      }
    } catch (sessionError) {
      setSession(DEFAULT_SESSION)
      setSiteContent(null)
      setWorkingCopy(null)
      setBlogList(null)
      setSelectedBlogSlug('')
      setSelectedBlogPost(null)
      setError(sessionError instanceof Error ? sessionError.message : 'Failed to load session.')
    } finally {
      setLoading(false)
    }
  }, [loadBlogList, loadSiteContent])

  useEffect(() => {
    void loadSession()
  }, [loadSession])

  const confirmDiscardChanges = useCallback((message: string) => {
    return window.confirm(message)
  }, [])

  const handleLogin = () => {
    window.location.href = '/api/admin/auth/start'
  }

  const handleLogout = async () => {
    if ((dirty || blogDirty) && !confirmDiscardChanges('You have unsaved content changes. Log out and discard them?')) {
      return
    }

    try {
      await adminApi.logout()
      setSession(DEFAULT_SESSION)
      setSiteContent(null)
      setWorkingCopy(null)
      setBlogList(null)
      setSelectedBlogSlug('')
      setSelectedBlogPost(null)
      setMediaArea(DEFAULT_MEDIA_AREA)
      setMediaSlug('')
      setMediaFile(null)
      setMediaResult(null)
      setError(null)
      setSaveStatus(null)
      setBlogStatus(null)
      setMediaStatus(null)
      setSiteConflict(null)
      setBlogConflict(null)
      setBlogActivity(null)
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : 'Failed to log out.')
    }
  }

  const handleFieldChange = useCallback((field: string, value: string) => {
    setWorkingCopy((current) => (current ? updateWorkingCopy(current, field, value) : current))
    setSaveStatus(null)
    setSiteConflict(null)
    setError(null)
  }, [])

  const handleStructuredFieldChange = useCallback((scope: string, field: string, value: string, index?: number) => {
    setWorkingCopy((current) => {
      if (!current) return current

      const next = structuredClone(current)

      switch (scope) {
        case 'social':
          if (index === undefined) return next
          next.site.socials = updateRecordAtIndex(next.site.socials, index, (item) => ({
            ...item,
            [field]: value,
          }))
          return next
        case 'process':
          if (index === undefined) return next
          next.about.process = updateRecordAtIndex(next.about.process, index, (item) => ({
            ...item,
            [field]: value,
          }))
          return next
        case 'highlight':
          if (index === undefined) return next
          next.resume.highlights = updateRecordAtIndex(next.resume.highlights, index, (item) => ({
            ...item,
            [field]: value,
          }))
          return next
        case 'homeStat':
          if (index === undefined) return next
          next.home.stats = updateRecordAtIndex(next.home.stats, index, (item) => ({
            ...item,
            [field]: field === 'tone' ? normalizeTone(value) : value,
          }))
          return next
        case 'experience':
          if (index === undefined) return next
          next.resume.experience = updateRecordAtIndex(next.resume.experience, index, (item) => ({
            ...item,
            [field]: field === 'highlights' ? splitLines(value) : value,
          }))
          return next
        case 'method':
          if (index === undefined) return next
          next.contact.methods = updateRecordAtIndex(next.contact.methods, index, (item) => ({
            ...item,
            [field]: value,
          }))
          return next
        case 'heroImage': {
          const target = field.split('.')[0] as 'about' | 'resume' | 'contact' | 'projectsPage' | 'blogPage'
          const property = field.split('.')[1] as 'src' | 'alt' | 'caption'
          if (target === 'projectsPage') {
            next.projectsPage = {
              title: next.projectsPage?.title ?? '',
              intro: next.projectsPage?.intro ?? '',
              heroImage: {
                ...(next.projectsPage?.heroImage ?? { src: '', alt: '' }),
                [property]: value || (property === 'caption' ? undefined : ''),
              },
            }
            return next
          }

          if (target === 'blogPage') {
            next.blogPage = {
              title: next.blogPage?.title ?? '',
              intro: next.blogPage?.intro ?? '',
              heroImage: {
                ...(next.blogPage?.heroImage ?? { src: '', alt: '' }),
                [property]: value || (property === 'caption' ? undefined : ''),
              },
            }
            return next
          }

          const currentImage = next[target].heroImage ?? { src: '', alt: '' }
          next[target].heroImage = {
            ...currentImage,
            [property]: value || (property === 'caption' ? undefined : ''),
          }
          return next
        }
        case 'project': {
          if (!selectedProjectSlug) return next
          const projectIndex = next.projects.findIndex((project) => project.slug === selectedProjectSlug)
          if (projectIndex === -1) return next
          next.projects = updateRecordAtIndex(next.projects, projectIndex, (project) => ({
            ...project,
            [field]: field === 'stack' || field === 'approach' || field === 'outcome' ? splitLines(value) : value,
          }))
          return next
        }
        case 'projectImage': {
          if (!selectedProjectSlug) return next
          const projectIndex = next.projects.findIndex((project) => project.slug === selectedProjectSlug)
          if (projectIndex === -1) return next
          next.projects = updateRecordAtIndex(next.projects, projectIndex, (project) => ({
            ...project,
            image: {
              ...(project.image ?? { src: '', alt: '' }),
              [field]: value || '',
            },
          }))
          return next
        }
        case 'projectGallery': {
          if (!selectedProjectSlug || index === undefined) return next
          const projectIndex = next.projects.findIndex((project) => project.slug === selectedProjectSlug)
          if (projectIndex === -1) return next
          const gallery = next.projects[projectIndex].gallery ?? []
          next.projects = updateRecordAtIndex(next.projects, projectIndex, (project) => ({
            ...project,
            gallery: updateRecordAtIndex(gallery, index, (image) => ({
              ...image,
              [field]: value || (field === 'caption' ? undefined : ''),
            })),
          }))
          return next
        }
        case 'projectSection': {
          if (index === undefined || !selectedProjectSlug) return next
          const projectIndex = next.projects.findIndex((project) => project.slug === selectedProjectSlug)
          if (projectIndex === -1) return next
          const project = next.projects[projectIndex]
          const sections = project.sections ?? []
          next.projects = updateRecordAtIndex(next.projects, projectIndex, (currentProject) => ({
            ...currentProject,
            sections: updateRecordAtIndex(sections, index, (section) => ({
              ...section,
              [field]: value,
            })),
          }))
          return next
        }
        default:
          return next
      }
    })
    setSaveStatus(null)
    setSiteConflict(null)
    setError(null)
  }, [selectedProjectSlug])

  const handleStructuredAdd = useCallback((scope: string) => {
    setWorkingCopy((current) => {
      if (!current) return current

      const next = structuredClone(current)

      switch (scope) {
        case 'social':
          next.site.socials.push({ label: 'New social', href: 'https://' })
          setSelectedSocialIndex(next.site.socials.length - 1)
          return next
        case 'process':
          next.about.process.push({ title: 'New step', description: '' })
          setSelectedProcessIndex(next.about.process.length - 1)
          return next
        case 'highlight':
          next.resume.highlights.push({ value: '0', label: 'New highlight' })
          setSelectedHighlightIndex(next.resume.highlights.length - 1)
          return next
        case 'homeStat':
          next.home.stats.push({ value: '0', label: 'New stat', tone: 'accent' })
          setSelectedHomeStatIndex(next.home.stats.length - 1)
          return next
        case 'experience':
          next.resume.experience.push({ role: 'New role', company: 'Company', period: todayDate(), highlights: [] })
          setSelectedExperienceIndex(next.resume.experience.length - 1)
          return next
        case 'method':
          next.contact.methods.push({ title: 'New method', label: 'Label', href: 'https://', description: '' })
          setSelectedMethodIndex(next.contact.methods.length - 1)
          return next
        case 'project':
          next.projects.push({
            slug: `new-project-${next.projects.length + 1}`,
            title: 'New project',
            year: todayDate().slice(0, 4),
            client: 'Client',
            summary: '',
            role: '',
            stack: [],
            challenge: '',
            approach: [],
            outcome: [],
            sections: [{ title: 'Overview', body: '' }],
          })
          setSelectedProjectSlug(next.projects[next.projects.length - 1].slug)
          setSelectedProjectGalleryIndex(0)
          return next
        case 'projectGallery': {
          if (!selectedProjectSlug) return next
          const projectIndex = next.projects.findIndex((project) => project.slug === selectedProjectSlug)
          if (projectIndex === -1) return next
          next.projects[projectIndex].gallery = [...(next.projects[projectIndex].gallery ?? []), { src: '', alt: '', caption: '' }]
          setSelectedProjectGalleryIndex((next.projects[projectIndex].gallery?.length ?? 1) - 1)
          return next
        }
        case 'projectSection': {
          if (!selectedProjectSlug) return next
          const projectIndex = next.projects.findIndex((project) => project.slug === selectedProjectSlug)
          if (projectIndex === -1) return next
          next.projects[projectIndex].sections = [...(next.projects[projectIndex].sections ?? []), { title: 'New section', body: '' }]
          return next
        }
        default:
          return next
      }
    })
    setSaveStatus(null)
    setSiteConflict(null)
    setError(null)
  }, [selectedProjectSlug])

  const handleStructuredRemove = useCallback((scope: string, index?: number) => {
    const confirmMessageByScope: Record<string, string> = {
      social: 'Remove this social link?',
      process: 'Remove this process step?',
      highlight: 'Remove this highlight card?',
      homeStat: 'Remove this home stat card?',
      experience: 'Remove this experience entry?',
      method: 'Remove this contact method?',
      project: 'Remove this project from site content?',
      projectGallery: 'Remove this gallery image?',
      projectSection: 'Remove this project section?',
    }

    const confirmMessage = confirmMessageByScope[scope]
    if (confirmMessage && !confirmDiscardChanges(confirmMessage)) return

    setWorkingCopy((current) => {
      if (!current) return current

      const next = structuredClone(current)

      switch (scope) {
        case 'social':
          if (index === undefined || next.site.socials.length <= 1) return next
          next.site.socials.splice(index, 1)
          setSelectedSocialIndex(Math.max(0, Math.min(index, next.site.socials.length - 1)))
          return next
        case 'process':
          if (index === undefined || next.about.process.length <= 1) return next
          next.about.process.splice(index, 1)
          setSelectedProcessIndex(Math.max(0, Math.min(index, next.about.process.length - 1)))
          return next
        case 'highlight':
          if (index === undefined || next.resume.highlights.length <= 1) return next
          next.resume.highlights.splice(index, 1)
          setSelectedHighlightIndex(Math.max(0, Math.min(index, next.resume.highlights.length - 1)))
          return next
        case 'homeStat':
          if (index === undefined || next.home.stats.length <= 1) return next
          next.home.stats.splice(index, 1)
          setSelectedHomeStatIndex(Math.max(0, Math.min(index, next.home.stats.length - 1)))
          return next
        case 'experience':
          if (index === undefined || next.resume.experience.length <= 1) return next
          next.resume.experience.splice(index, 1)
          setSelectedExperienceIndex(Math.max(0, Math.min(index, next.resume.experience.length - 1)))
          return next
        case 'method':
          if (index === undefined || next.contact.methods.length <= 1) return next
          next.contact.methods.splice(index, 1)
          setSelectedMethodIndex(Math.max(0, Math.min(index, next.contact.methods.length - 1)))
          return next
        case 'project':
          if (!selectedProjectSlug || next.projects.length <= 1) return next
          const projectIndex = next.projects.findIndex((project) => project.slug === selectedProjectSlug)
          if (projectIndex === -1) return next
          next.projects.splice(projectIndex, 1)
          setSelectedProjectSlug(next.projects[Math.max(0, Math.min(projectIndex, next.projects.length - 1))]?.slug ?? '')
          setSelectedProjectGalleryIndex(0)
          return next
        case 'projectGallery': {
          if (index === undefined || !selectedProjectSlug) return next
          const projectIndex = next.projects.findIndex((project) => project.slug === selectedProjectSlug)
          if (projectIndex === -1) return next
          const gallery = next.projects[projectIndex].gallery ?? []
          if (gallery.length <= 1) return next
          gallery.splice(index, 1)
          next.projects[projectIndex].gallery = gallery
          setSelectedProjectGalleryIndex(Math.max(0, Math.min(index, gallery.length - 1)))
          return next
        }
        case 'projectSection': {
          if (index === undefined || !selectedProjectSlug) return next
          const projectIndex = next.projects.findIndex((project) => project.slug === selectedProjectSlug)
          if (projectIndex === -1) return next
          const sections = next.projects[projectIndex].sections ?? []
          if (sections.length <= 1) return next
          sections.splice(index, 1)
          next.projects[projectIndex].sections = sections
          return next
        }
        default:
          return next
      }
    })
    setSaveStatus(null)
    setSiteConflict(null)
    setError(null)
  }, [confirmDiscardChanges, selectedProjectSlug])

  const handleSave = useCallback(async () => {
    if (!siteContent || !workingCopy) return

    setSaving(true)
    setError(null)
    setSaveStatus(null)
    setSiteConflict(null)

    try {
      const response = await adminApi.saveSiteContent({
        branch: siteContent.branch,
        commitMessage: 'feat(cms): update site content from admin',
        content: workingCopy,
        sha: siteContent.sha,
      })

      setSiteContent(response)
      setWorkingCopy(structuredClone(response.content))
      setSaveStatus(`Saved site content to ${response.branch} at ${response.latestCommitSha ?? response.sha}.`)
    } catch (saveError) {
      const apiError = saveError as AdminApiError
      setSiteConflict(
        apiError.status === 409
          ? {
              currentSha: apiError.currentSha,
              latestCommitSha: apiError.latestCommitSha,
            }
          : null,
      )
      setError(
        apiError.status === 409
          ? 'Save conflict: content changed in GitHub since this session loaded it. Reload before saving again.'
          : apiError.message || 'Failed to save site content.',
      )
    } finally {
      setSaving(false)
    }
  }, [siteContent, workingCopy])

  const handleBlogFieldChange = useCallback((field: string, value: string) => {
    setSelectedBlogPost((current) => (current ? { ...current, post: updateBlogPost(current.post, field, value) } : current))
    setBlogStatus(null)
    setBlogConflict(null)
    setError(null)
  }, [])

  const dirty = useMemo(() => {
    if (!siteContent || !workingCopy) return false
    return JSON.stringify(siteContent.content) !== JSON.stringify(workingCopy)
  }, [siteContent, workingCopy])

  const blogDirty = useMemo(() => {
    if (!selectedBlogPost) return false
    const original = blogList?.posts.find((post) => post.slug === selectedBlogPost.post.slug)
    if (!original) return true
    return JSON.stringify({ ...original, body: selectedBlogPost.post.body }) !== JSON.stringify(selectedBlogPost.post)
  }, [blogList, selectedBlogPost])

  const handleBlogSave = useCallback(async () => {
    if (!blogList || !selectedBlogPost) return

    setSavingBlog(true)
    setError(null)
    setBlogStatus(null)
    setBlogConflict(null)

    try {
      const response = await adminApi.saveBlogPost(selectedBlogPost.post.slug, {
        branch: blogList.branch,
        commitMessage: `feat(blog): update ${selectedBlogPost.post.slug} from admin`,
        post: selectedBlogPost.post,
        sha: selectedBlogPost.post.sha,
      })

      setSelectedBlogPost({ branch: response.branch, post: response.post, repo: response.repo })
      setBlogActivity({
        latestCommitSha: response.latestCommitSha,
        path: response.post.path,
        repo: response.repo,
        summary: `Saved ${response.post.slug}`,
      })
      setBlogStatus(`Saved blog post at ${response.latestCommitSha ?? response.post.sha}.`)
      await loadBlogList()
    } catch (saveError) {
      const apiError = saveError as AdminApiError
      setBlogConflict(
        apiError.status === 409
          ? {
              currentSha: apiError.currentSha,
              latestCommitSha: apiError.latestCommitSha,
            }
          : null,
      )
      setError(
        apiError.status === 409
          ? 'Blog save conflict: reload the post before saving again.'
          : apiError.message || 'Failed to save blog post.',
      )
    } finally {
      setSavingBlog(false)
    }
  }, [blogList, loadBlogList, selectedBlogPost])

  const handleBlogCreate = useCallback(() => {
    if (blogDirty && !confirmDiscardChanges('You have unsaved blog edits. Create a new draft and discard them?')) {
      return
    }

    const slug = `draft-${Date.now()}`
    const post = createEmptyBlogPost(slug)
    setSelectedBlogSlug(slug)
    setSelectedBlogPost({
      branch: blogList?.branch ?? siteContent?.branch ?? 'main',
      post,
      repo: blogList?.repo ?? siteContent?.repo ?? { branchUrl: '', owner: '', repo: '', repoUrl: '' },
    })
    setMediaArea('blog')
    setMediaSlug(slug)
    setBlogStatus('New draft created locally. Save it to create the markdown file.')
    setBlogConflict(null)
    setBlogActivity(null)
    setError(null)
  }, [blogDirty, blogList?.branch, blogList?.repo, confirmDiscardChanges, siteContent?.branch, siteContent?.repo])

  const handleBlogDelete = useCallback(async () => {
    if (!blogList || !selectedBlogPost?.post.sha) return
    if (!confirmDiscardChanges(`Delete blog post "${selectedBlogPost.post.title}"? This commits a file deletion to GitHub.`)) return

    setSavingBlog(true)
    setError(null)
    setBlogStatus(null)
    setBlogConflict(null)

    try {
      const response = await adminApi.deleteBlogPost(selectedBlogPost.post.slug, {
        branch: blogList.branch,
        commitMessage: `feat(blog): delete ${selectedBlogPost.post.slug} from admin`,
        sha: selectedBlogPost.post.sha,
      })

      setBlogActivity({
        latestCommitSha: response.latestCommitSha,
        path: response.path,
        repo: response.repo,
        summary: `Deleted ${selectedBlogPost.post.slug}`,
      })
      setBlogStatus(`Deleted ${response.path} at ${response.latestCommitSha ?? 'latest commit'}.`)
      await loadBlogList()
    } catch (deleteError) {
      const apiError = deleteError as AdminApiError
      setBlogConflict(
        apiError.status === 409
          ? {
              currentSha: apiError.currentSha,
              latestCommitSha: apiError.latestCommitSha,
            }
          : null,
      )
      setError(
        apiError.status === 409
          ? 'Blog delete conflict: reload the post before deleting.'
          : apiError.message || 'Failed to delete blog post.',
      )
    } finally {
      setSavingBlog(false)
    }
  }, [blogList, confirmDiscardChanges, loadBlogList, selectedBlogPost])

  const handleMediaUpload = useCallback(async () => {
    if (!mediaFile || !mediaArea || !mediaSlug.trim()) return

    setUploadingMedia(true)
    setError(null)
    setMediaStatus(null)

    try {
      const response = await adminApi.uploadMedia({
        area: mediaArea,
        slug: mediaSlug,
        file: mediaFile,
      })

      setMediaResult(response)
      setMediaStatus(`Uploaded ${response.path} at ${response.latestCommitSha ?? response.sha}.`)
      setMediaFile(null)
    } catch (uploadError) {
      const apiError = uploadError as AdminApiError
      setError(apiError.message || 'Failed to upload media.')
    } finally {
      setUploadingMedia(false)
    }
  }, [mediaArea, mediaFile, mediaSlug])

  const selectedBlogMeta = useMemo<BlogPostMeta | null>(() => {
    return blogList?.posts.find((post) => post.slug === selectedBlogSlug) ?? null
  }, [blogList, selectedBlogSlug])

  const selectedProject = useMemo(() => {
    return workingCopy?.projects.find((project) => project.slug === selectedProjectSlug) ?? workingCopy?.projects[0] ?? null
  }, [selectedProjectSlug, workingCopy])
  const selectedProjectGalleryItem = selectedProject?.gallery?.[selectedProjectGalleryIndex] ?? null

  const selectedSocial = workingCopy?.site.socials[selectedSocialIndex] ?? null
  const selectedProcess = workingCopy?.about.process[selectedProcessIndex] ?? null
  const selectedHomeStat = workingCopy?.home.stats[selectedHomeStatIndex] ?? null
  const selectedHighlight = workingCopy?.resume.highlights[selectedHighlightIndex] ?? null
  const selectedExperience = workingCopy?.resume.experience[selectedExperienceIndex] ?? null
  const selectedMethod = workingCopy?.contact.methods[selectedMethodIndex] ?? null

  useEffect(() => {
    if (!dirty && !blogDirty) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [blogDirty, dirty])

  const dashboardProps = useMemo(
    () => ({
      blogActivity,
      blogDirty,
      blogList: blogList?.posts ?? [],
      blogRepo: selectedBlogPost?.repo ?? blogList?.repo ?? null,
      blogLoading: loadingBlog,
      blogMeta: selectedBlogMeta,
      blogPost: selectedBlogPost?.post ?? null,
      blogStatus,
      blogConflict,
      dirty,
      error,
      loading,
      loadingContent,
      mediaArea,
      mediaPath: mediaResult?.path ?? '',
      mediaSlug,
      mediaStatus,
      siteUrl: workingCopy?.site.siteUrl ?? siteContent?.content.site.siteUrl ?? '',
      siteConflict,
      onBlogFieldChange: handleBlogFieldChange,
      onBlogCreate: () => {
        handleBlogCreate()
      },
      onBlogDelete: () => {
        void handleBlogDelete()
      },
      onBlogReload: () => {
        if (blogDirty && !confirmDiscardChanges('Discard unsaved blog edits and reload this post from GitHub?')) return
        if (selectedBlogSlug) void loadBlogPost(selectedBlogSlug)
      },
      onBlogSave: () => {
        void handleBlogSave()
      },
      onBlogSelect: (slug: string) => {
        if (slug === selectedBlogSlug) return
        if (blogDirty && !confirmDiscardChanges('Discard unsaved blog edits and open another post?')) return
        void loadBlogPost(slug)
      },
      onFieldChange: handleFieldChange,
      onStructuredAdd: handleStructuredAdd,
      onStructuredFieldChange: handleStructuredFieldChange,
      onStructuredRemove: handleStructuredRemove,
      onLogin: handleLogin,
      onLogout: () => {
        void handleLogout()
      },
      onMediaAreaChange: setMediaArea,
      onMediaFileChange: setMediaFile,
      onMediaSlugChange: setMediaSlug,
      onMediaUpload: () => {
        void handleMediaUpload()
      },
      onProjectSelect: setSelectedProjectSlug,
      onHomeStatSelect: setSelectedHomeStatIndex,
      onSocialSelect: setSelectedSocialIndex,
      onProcessSelect: setSelectedProcessIndex,
      onHighlightSelect: setSelectedHighlightIndex,
      onExperienceSelect: setSelectedExperienceIndex,
      onMethodSelect: setSelectedMethodIndex,
      onProjectGallerySelect: setSelectedProjectGalleryIndex,
      projectOptions: workingCopy?.projects.map((project) => ({ slug: project.slug, title: project.title })) ?? [],
      selectedProject,
      selectedProjectGalleryIndex,
      selectedProjectGalleryItem,
      selectedProjectGalleryTotal: selectedProject?.gallery?.length ?? 0,
      selectedProjectSlug,
      selectedSocial,
      selectedSocialIndex,
      selectedSocialTotal: workingCopy?.site.socials.length ?? 0,
      selectedProcess,
      selectedProcessIndex,
      selectedProcessTotal: workingCopy?.about.process.length ?? 0,
      selectedHomeStat,
      selectedHomeStatIndex,
      selectedHomeStatTotal: workingCopy?.home.stats.length ?? 0,
      selectedHighlight,
      selectedHighlightIndex,
      selectedHighlightTotal: workingCopy?.resume.highlights.length ?? 0,
      selectedExperience,
      selectedExperienceIndex,
      selectedExperienceTotal: workingCopy?.resume.experience.length ?? 0,
      selectedMethod,
      selectedMethodIndex,
      selectedMethodTotal: workingCopy?.contact.methods.length ?? 0,
      onReload: () => {
        if (dirty && !confirmDiscardChanges('Discard unsaved content changes and reload from GitHub?')) return
        void loadSiteContent()
      },
      onSave: () => {
        void handleSave()
      },
      saveStatus,
      saving,
      savingBlog,
      selectedBlogSlug,
      session,
      siteContent,
      uploadingMedia,
      workingCopy,
    }),
    [
      blogActivity,
      blogDirty,
      blogConflict,
      blogList,
      blogStatus,
      confirmDiscardChanges,
      dirty,
      error,
      handleBlogFieldChange,
      handleBlogCreate,
      handleBlogDelete,
      handleBlogSave,
      handleFieldChange,
      handleMediaUpload,
      handleStructuredAdd,
      handleStructuredFieldChange,
      handleStructuredRemove,
      handleSave,
      loadBlogPost,
      loadSiteContent,
      loading,
      loadingBlog,
      loadingContent,
      mediaArea,
      mediaResult,
      mediaSlug,
      mediaStatus,
      siteContent,
      siteConflict,
      saveStatus,
      saving,
      savingBlog,
      selectedBlogMeta,
      selectedExperience,
      selectedExperienceIndex,
      selectedHighlight,
      selectedHighlightIndex,
      selectedMethod,
      selectedMethodIndex,
      selectedProcess,
      selectedProcessIndex,
      selectedHomeStat,
      selectedHomeStatIndex,
      selectedProject,
      selectedProjectGalleryIndex,
      selectedProjectGalleryItem,
      selectedProjectSlug,
      selectedSocial,
      selectedSocialIndex,
      selectedBlogPost,
      selectedBlogSlug,
      session,
      uploadingMedia,
      workingCopy,
    ],
  )

  return (
    <HashRouter>
      <Routes>
        <Route path="*" element={<DashboardScreen {...dashboardProps} />} />
      </Routes>
    </HashRouter>
  )
}
