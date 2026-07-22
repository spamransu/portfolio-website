import { useCallback, useEffect, useMemo, useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { adminApi, type AdminApiError, type AdminSession, type BlogListResponse, type BlogDetailResponse, type SiteContentResponse } from './api/adminApi'
import { DashboardScreen } from './screens/DashboardScreen'
import type { BlogPostResponse, BlogPostMeta, SiteContent } from './types'

const DEFAULT_SESSION: AdminSession = {
  authenticated: false,
  login: null,
  expiresAt: null,
}

const splitLines = (value: string): string[] =>
  value
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean)

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
    case 'contact.form.title':
      next.contact.form.title = value
      return next
    case 'contact.form.intro':
      next.contact.form.intro = value
      return next
    case 'contact.form.submitLabel':
      next.contact.form.submitLabel = value
      return next
    case 'blogPage.title':
      next.blogPage = { title: value, intro: next.blogPage?.intro ?? '' }
      return next
    case 'blogPage.intro':
      next.blogPage = { title: next.blogPage?.title ?? '', intro: value }
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
  const [loading, setLoading] = useState(true)
  const [loadingContent, setLoadingContent] = useState(false)
  const [loadingBlog, setLoadingBlog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savingBlog, setSavingBlog] = useState(false)
  const [error, setError] = useState<string | null>(getAuthMessageFromUrl())
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [blogStatus, setBlogStatus] = useState<string | null>(null)

  const loadSiteContent = useCallback(async () => {
    setLoadingContent(true)

    try {
      const response = await adminApi.getSiteContent()
      setSiteContent(response)
      setWorkingCopy(structuredClone(response.content))
      setError(null)
      setSaveStatus(null)
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
      setBlogStatus(null)
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

  const handleLogin = () => {
    window.location.href = '/api/admin/auth/start'
  }

  const handleLogout = async () => {
    try {
      await adminApi.logout()
      setSession(DEFAULT_SESSION)
      setSiteContent(null)
      setWorkingCopy(null)
      setBlogList(null)
      setSelectedBlogSlug('')
      setSelectedBlogPost(null)
      setError(null)
      setSaveStatus(null)
      setBlogStatus(null)
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : 'Failed to log out.')
    }
  }

  const handleFieldChange = useCallback((field: string, value: string) => {
    setWorkingCopy((current) => (current ? updateWorkingCopy(current, field, value) : current))
    setSaveStatus(null)
    setError(null)
  }, [])

  const handleSave = useCallback(async () => {
    if (!siteContent || !workingCopy) return

    setSaving(true)
    setError(null)
    setSaveStatus(null)

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
    setError(null)
  }, [])

  const handleBlogSave = useCallback(async () => {
    if (!blogList || !selectedBlogPost) return

    setSavingBlog(true)
    setError(null)
    setBlogStatus(null)

    try {
      const response = await adminApi.saveBlogPost(selectedBlogPost.post.slug, {
        branch: blogList.branch,
        commitMessage: `feat(blog): update ${selectedBlogPost.post.slug} from admin`,
        post: selectedBlogPost.post,
        sha: selectedBlogPost.post.sha,
      })

      setSelectedBlogPost({ branch: response.branch, post: response.post })
      setBlogStatus(`Saved blog post at ${response.latestCommitSha ?? response.post.sha}.`)
      await loadBlogList()
    } catch (saveError) {
      const apiError = saveError as AdminApiError
      setError(
        apiError.status === 409
          ? 'Blog save conflict: reload the post before saving again.'
          : apiError.message || 'Failed to save blog post.',
      )
    } finally {
      setSavingBlog(false)
    }
  }, [blogList, loadBlogList, selectedBlogPost])

  const dirty = useMemo(() => {
    if (!siteContent || !workingCopy) return false
    return JSON.stringify(siteContent.content) !== JSON.stringify(workingCopy)
  }, [siteContent, workingCopy])

  const blogDirty = useMemo(() => {
    if (!selectedBlogPost) return false
    const original = blogList?.posts.find((post) => post.slug === selectedBlogPost.post.slug)
    return Boolean(original) && JSON.stringify({ ...original, body: selectedBlogPost.post.body }) !== JSON.stringify(selectedBlogPost.post)
  }, [blogList, selectedBlogPost])

  const selectedBlogMeta = useMemo<BlogPostMeta | null>(() => {
    return blogList?.posts.find((post) => post.slug === selectedBlogSlug) ?? null
  }, [blogList, selectedBlogSlug])

  const dashboardProps = useMemo(
    () => ({
      blogDirty,
      blogList: blogList?.posts ?? [],
      blogLoading: loadingBlog,
      blogMeta: selectedBlogMeta,
      blogPost: selectedBlogPost?.post ?? null,
      blogStatus,
      dirty,
      error,
      loading,
      loadingContent,
      onBlogFieldChange: handleBlogFieldChange,
      onBlogReload: () => {
        if (selectedBlogSlug) void loadBlogPost(selectedBlogSlug)
      },
      onBlogSave: () => {
        void handleBlogSave()
      },
      onBlogSelect: (slug: string) => {
        void loadBlogPost(slug)
      },
      onFieldChange: handleFieldChange,
      onLogin: handleLogin,
      onLogout: () => {
        void handleLogout()
      },
      onReload: () => {
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
      workingCopy,
    }),
    [
      blogDirty,
      blogList,
      blogStatus,
      dirty,
      error,
      handleBlogFieldChange,
      handleBlogSave,
      handleFieldChange,
      handleSave,
      loadBlogPost,
      loadSiteContent,
      loading,
      loadingBlog,
      loadingContent,
      saveStatus,
      saving,
      savingBlog,
      selectedBlogMeta,
      selectedBlogPost,
      selectedBlogSlug,
      session,
      siteContent,
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
