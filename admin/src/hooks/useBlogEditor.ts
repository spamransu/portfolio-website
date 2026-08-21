import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminApi, type BlogListResponse } from '../api/adminApi'
import type { BlogActivity, ConflictState } from '../adminTypes'
import type { BlogPostMeta, BlogPostResponse } from '../types'
import {
  buildBlogPostPath,
  canReloadBlogPost,
  createClonedBlogPost,
  createEmptyBlogPost,
  getApiErrorMessage,
  getBlogValidationError,
  isAdminApiError,
  normalizeSlug,
} from '../lib/adminHelpers'

type UseBlogEditorOptions = {
  confirmDiscardChanges: (message: string) => boolean
  fallbackBranch: string | null
  handleUnauthorizedError: (caught: Error) => boolean
  onAfterGitWrite: () => void
  onBlogResourceSelected: (slug: string) => void
  onBlogSlugEdited: (slug: string) => void
  setGlobalError: (message: string | null) => void
}

export const useBlogEditor = ({
  confirmDiscardChanges,
  fallbackBranch,
  handleUnauthorizedError,
  onAfterGitWrite,
  onBlogResourceSelected,
  onBlogSlugEdited,
  setGlobalError,
}: UseBlogEditorOptions) => {
  const [blogList, setBlogList] = useState<BlogListResponse | null>(null)
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPostResponse | null>(null)
  const [originalBlogPost, setOriginalBlogPost] = useState<BlogPostResponse | null>(null)
  const [selectedBlogSlug, setSelectedBlogSlug] = useState('')
  const [selectedBlogMeta, setSelectedBlogMeta] = useState<BlogPostMeta | null>(null)
  const [blogConflict, setBlogConflict] = useState<ConflictState>(null)
  const [blogStatus, setBlogStatus] = useState<string | null>(null)
  const [blogActivity, setBlogActivity] = useState<BlogActivity>(null)
  const [savingBlog, setSavingBlog] = useState(false)
  const [loadingBlog, setLoadingBlog] = useState(false)

  const blogDirty = useMemo(() => {
    if (!selectedBlogPost) return false
    if (!originalBlogPost) return true
    return JSON.stringify(originalBlogPost) !== JSON.stringify(selectedBlogPost)
  }, [originalBlogPost, selectedBlogPost])

  const blogValidationError = useMemo(() => getBlogValidationError(selectedBlogPost), [selectedBlogPost])

  const resetBlog = useCallback(() => {
    setBlogList(null)
    setSelectedBlogPost(null)
    setOriginalBlogPost(null)
    setSelectedBlogSlug('')
    setSelectedBlogMeta(null)
    setBlogConflict(null)
    setBlogStatus(null)
    setBlogActivity(null)
  }, [])

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
      if (!handleUnauthorizedError(caught instanceof Error ? caught : new Error(String(caught)))) setGlobalError(getApiErrorMessage(caught instanceof Error ? caught : new Error(String(caught))))
    } finally {
      setLoadingBlog(false)
    }
  }, [handleUnauthorizedError, setGlobalError])

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
      onBlogResourceSelected(response.post.slug)
      setBlogConflict(null)
    } catch (caught) {
      if (!handleUnauthorizedError(caught instanceof Error ? caught : new Error(String(caught)))) setBlogStatus(getApiErrorMessage(caught instanceof Error ? caught : new Error(String(caught))))
    } finally {
      setLoadingBlog(false)
    }
  }, [handleUnauthorizedError, onBlogResourceSelected])

  useEffect(() => {
    if (!selectedBlogPost && selectedBlogMeta?.slug) {
      void loadBlogPost(selectedBlogMeta.slug)
    }
  }, [loadBlogPost, selectedBlogMeta, selectedBlogPost])

  const createBlogPost = useCallback((): string | null => {
    if (blogDirty && !confirmDiscardChanges('Discard unsaved blog edits and start a new post?')) return null
    const post = createEmptyBlogPost(blogList?.posts ?? [])
    setOriginalBlogPost(null)
    setSelectedBlogPost(post)
    setSelectedBlogSlug(post.slug)
    setSelectedBlogMeta(null)
    setBlogStatus('Draft created locally. Save it to commit the Markdown file.')
    onBlogResourceSelected(post.slug)
    return post.slug
  }, [blogDirty, blogList, confirmDiscardChanges, onBlogResourceSelected])

  const duplicateBlogPost = useCallback((): string | null => {
    if (!selectedBlogPost) return null
    if (blogDirty && !confirmDiscardChanges('Discard unsaved blog edits and duplicate the opened post?')) return null
    const post = createClonedBlogPost(selectedBlogPost, blogList?.posts ?? [])
    setOriginalBlogPost(null)
    setSelectedBlogPost(post)
    setSelectedBlogSlug(post.slug)
    setSelectedBlogMeta(null)
    setBlogStatus('Blog post duplicated locally. Save it to commit a new Markdown file.')
    onBlogResourceSelected(post.slug)
    return post.slug
  }, [blogDirty, blogList, confirmDiscardChanges, onBlogResourceSelected, selectedBlogPost])

  const discardBlogPost = useCallback(() => {
    if (selectedBlogMeta?.slug) {
      void loadBlogPost(selectedBlogMeta.slug)
      return
    }
    setSelectedBlogPost(null)
    setOriginalBlogPost(null)
    setSelectedBlogSlug('')
    setBlogStatus('Discarded unsaved blog draft.')
    onBlogResourceSelected('')
  }, [loadBlogPost, onBlogResourceSelected, selectedBlogMeta])

  const changeBlogField = useCallback((field: keyof BlogPostResponse, value: string): string | null => {
    if (field === 'slug') {
      const slug = normalizeSlug(value)
      setSelectedBlogPost((current) => current ? { ...current, slug, path: buildBlogPostPath(current.date, slug) } : current)
      onBlogSlugEdited(slug)
      return slug
    }

    setSelectedBlogPost((current) => {
      if (!current) return current
      if (field === 'date') return { ...current, date: value, path: buildBlogPostPath(value, current.slug) }
      if (field === 'status') return { ...current, status: value === 'published' ? 'published' : 'draft' }
      return { ...current, [field]: value }
    })
    return null
  }, [onBlogSlugEdited])

  const saveBlogPost = useCallback(async () => {
    if (!selectedBlogPost || blogValidationError) return
    setSavingBlog(true)
    setBlogStatus(null)
    setBlogConflict(null)
    try {
      const response = await adminApi.saveBlogPost(selectedBlogSlug || selectedBlogPost.slug, {
        branch: blogList?.branch ?? fallbackBranch ?? 'main',
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
      onBlogResourceSelected(response.post.slug)
      await loadBlogList()
      onAfterGitWrite()
    } catch (caught) {
      const error = caught instanceof Error ? caught : new Error(String(caught))
      if (isAdminApiError(error) && error.status === 409) {
        setBlogConflict({ currentSha: error.currentSha, latestCommitSha: error.latestCommitSha })
      }
      if (!handleUnauthorizedError(caught instanceof Error ? caught : new Error(String(caught)))) setBlogStatus(getApiErrorMessage(caught instanceof Error ? caught : new Error(String(caught))))
    } finally {
      setSavingBlog(false)
    }
  }, [blogList, blogValidationError, fallbackBranch, handleUnauthorizedError, loadBlogList, onAfterGitWrite, onBlogResourceSelected, selectedBlogPost, selectedBlogSlug])

  const deleteBlogPost = useCallback(async () => {
    if (!selectedBlogPost?.sha) return
    if (!confirmDiscardChanges(`Delete blog post "${selectedBlogPost.title}"? This commits a Markdown file deletion.`)) return
    setSavingBlog(true)
    setBlogStatus(null)
    try {
      const response = await adminApi.deleteBlogPost(selectedBlogSlug || selectedBlogPost.slug, {
        branch: blogList?.branch ?? fallbackBranch ?? 'main',
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
      onBlogResourceSelected('')
      await loadBlogList()
      onAfterGitWrite()
    } catch (caught) {
      if (!handleUnauthorizedError(caught instanceof Error ? caught : new Error(String(caught)))) setBlogStatus(getApiErrorMessage(caught instanceof Error ? caught : new Error(String(caught))))
    } finally {
      setSavingBlog(false)
    }
  }, [blogList, confirmDiscardChanges, fallbackBranch, handleUnauthorizedError, loadBlogList, onAfterGitWrite, onBlogResourceSelected, selectedBlogPost, selectedBlogSlug])

  const reloadBlogPost = useCallback(() => {
    if (canReloadBlogPost(selectedBlogPost, selectedBlogSlug)) void loadBlogPost(selectedBlogSlug)
  }, [loadBlogPost, selectedBlogPost, selectedBlogSlug])

  const selectBlogPost = useCallback((slug: string) => {
    if (slug === selectedBlogSlug) return
    if (blogDirty && !confirmDiscardChanges('Discard unsaved blog edits and open another post?')) return
    void loadBlogPost(slug)
  }, [blogDirty, confirmDiscardChanges, loadBlogPost, selectedBlogSlug])

  return {
    blogActivity,
    blogConflict,
    blogDirty,
    blogList,
    blogMeta: selectedBlogMeta,
    blogPost: selectedBlogPost,
    blogRepo: blogList?.repo ?? null,
    blogStatus,
    blogValidationError,
    changeBlogField,
    createBlogPost,
    deleteBlogPost,
    discardBlogPost,
    duplicateBlogPost,
    loadBlogList,
    loadingBlog,
    reloadBlogPost,
    resetBlog,
    saveBlogPost,
    savingBlog,
    selectBlogPost,
    selectedBlogSlug,
    setSelectedBlogPost,
  }
}
