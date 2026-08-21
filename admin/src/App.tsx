import { useCallback, useEffect, useRef, useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { adminApi, type AdminSession } from './api/adminApi'
import { DashboardScreen } from './screens/DashboardScreen'
import type { DashboardScreenProps } from './screens/dashboard/dashboardTypes'
import { DEFAULT_SESSION, getApiErrorMessage, isAdminApiError } from './lib/adminHelpers'
import { useActivity } from './hooks/useActivity'
import { useBlogEditor } from './hooks/useBlogEditor'
import { useMediaUploader } from './hooks/useMediaUploader'
import { useProjectEditor } from './hooks/useProjectEditor'

export const App = () => {
  const [session, setSession] = useState<AdminSession>(DEFAULT_SESSION)
  const [authStatus, setAuthStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const resetAuthenticatedStateRef = useRef<() => void>(() => undefined)
  const selectBlogMediaResourceRef = useRef<(slug: string) => void>(() => undefined)
  const selectProjectMediaResourceRef = useRef<(slug: string) => void>(() => undefined)
  const syncBlogMediaSlugRef = useRef<(slug: string) => void>(() => undefined)
  const syncProjectMediaSlugRef = useRef<(slug: string) => void>(() => undefined)

  const confirmDiscardChanges = useCallback((message: string): boolean => {
    if (!globalThis.window) return true
    return window.confirm(message)
  }, [])

  const handleUnauthorizedError = useCallback((caught: Error): boolean => {
    if (isAdminApiError(caught) && caught.status === 401) {
      setSession(DEFAULT_SESSION)
      resetAuthenticatedStateRef.current()
      setError('Your admin session expired. Sign in again.')
      return true
    }
    return false
  }, [])

  const activity = useActivity(handleUnauthorizedError)
  const loadActivity = activity.loadActivity
  const resetActivity = activity.resetActivity
  const reloadActivity = useCallback(() => { void loadActivity() }, [loadActivity])

  const projects = useProjectEditor({
    confirmDiscardChanges,
    handleUnauthorizedError,
    onAfterSave: reloadActivity,
    setGlobalError: setError,
  })

  const loadProjects = projects.loadProjects
  const resetProjects = projects.resetProjects
  const handleBlogResourceSelected = useCallback((slug: string) => selectBlogMediaResourceRef.current(slug), [])
  const handleBlogSlugEdited = useCallback((slug: string) => syncBlogMediaSlugRef.current(slug), [])

  const blog = useBlogEditor({
    confirmDiscardChanges,
    fallbackBranch: projects.projectBranch,
    handleUnauthorizedError,
    onAfterGitWrite: reloadActivity,
    onBlogResourceSelected: handleBlogResourceSelected,
    onBlogSlugEdited: handleBlogSlugEdited,
    setGlobalError: setError,
  })

  const loadBlogList = blog.loadBlogList
  const resetBlog = blog.resetBlog

  const media = useMediaUploader({
    handleUnauthorizedError,
    onAfterUpload: reloadActivity,
    selectedBlogPost: blog.blogPost,
    selectedProject: projects.selectedProject,
    setSelectedBlogPost: blog.setSelectedBlogPost,
    updateSelectedProject: projects.updateSelectedProject,
  })

  const resetMedia = media.resetMedia
  const selectBlogMediaResource = media.selectBlogMediaResource
  const selectProjectMediaResource = media.selectProjectMediaResource
  const syncBlogMediaSlug = media.syncBlogMediaSlug
  const syncProjectMediaSlug = media.syncProjectMediaSlug

  const resetAuthenticatedState = useCallback(() => {
    resetProjects()
    resetBlog()
    resetActivity()
    resetMedia()
  }, [resetActivity, resetBlog, resetMedia, resetProjects])

  useEffect(() => {
    resetAuthenticatedStateRef.current = resetAuthenticatedState
  }, [resetAuthenticatedState])

  useEffect(() => {
    selectBlogMediaResourceRef.current = selectBlogMediaResource
    selectProjectMediaResourceRef.current = selectProjectMediaResource
    syncBlogMediaSlugRef.current = syncBlogMediaSlug
    syncProjectMediaSlugRef.current = syncProjectMediaSlug
  }, [selectBlogMediaResource, selectProjectMediaResource, syncBlogMediaSlug, syncProjectMediaSlug])

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
        setError(getApiErrorMessage(caught instanceof Error ? caught : new Error(String(caught))))
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
    if (!globalThis.window) return
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
      setError(getApiErrorMessage(caught instanceof Error ? caught : new Error(String(caught))))
    }
  }

  const handleProjectCreate = () => {
    media.selectProjectMediaResource(projects.createProject())
  }

  const handleProjectDuplicate = () => {
    const slug = projects.duplicateProject()
    if (slug) media.selectProjectMediaResource(slug)
  }

  const handleProjectDelete = () => {
    const slug = projects.deleteProject()
    if (slug !== null) media.syncProjectMediaSlug(slug)
  }

  const handleProjectDiscard = () => {
    const slug = projects.discardProjects()
    if (slug !== null) media.syncProjectMediaSlug(slug)
  }

  const handleProjectFieldChange = (field: Parameters<typeof projects.changeProjectField>[0], value: string) => {
    const slug = projects.changeProjectField(field, value)
    if (slug !== null) media.syncProjectMediaSlug(slug)
  }

  const handleProjectSelect = (slug: string) => {
    media.selectProjectMediaResource(projects.selectProject(slug))
  }

  const dashboardProps = {
    session: {
      authStatus,
      error,
      loading,
      onLogin: handleLogin,
      onLogout: () => { void handleLogout() },
      session,
      siteUrl: !globalThis.window ? '' : window.location.origin,
    },
    projects: {
      conflict: projects.projectConflict,
      dirty: projects.projectDirty,
      items: projects.projects,
      jsonDrafts: projects.projectJsonDrafts,
      jsonErrors: projects.projectJsonErrors,
      loading: projects.loadingProjects,
      onCreate: handleProjectCreate,
      onDelete: handleProjectDelete,
      onDiscard: handleProjectDiscard,
      onDuplicate: handleProjectDuplicate,
      onFieldChange: handleProjectFieldChange,
      onJsonFieldChange: projects.changeProjectJsonField,
      onMove: projects.moveProject,
      onReload: projects.reloadProjects,
      onSave: projects.saveProjects,
      onSelect: handleProjectSelect,
      options: projects.projectOptions,
      path: projects.projectPath,
      repo: projects.projectRepo,
      saving: projects.savingProjects,
      selected: projects.selectedProject,
      selectedSlug: projects.selectedProjectSlug,
      status: projects.projectStatus,
      validationError: projects.projectValidationError,
    },
    blog: {
      activity: blog.blogActivity,
      conflict: blog.blogConflict,
      dirty: blog.blogDirty,
      list: blog.blogList?.posts ?? [],
      loading: blog.loadingBlog,
      meta: blog.blogMeta,
      onCreate: blog.createBlogPost,
      onDelete: blog.deleteBlogPost,
      onDiscard: blog.discardBlogPost,
      onDuplicate: blog.duplicateBlogPost,
      onFieldChange: blog.changeBlogField,
      onReload: blog.reloadBlogPost,
      onSave: blog.saveBlogPost,
      onSelect: blog.selectBlogPost,
      post: blog.blogPost,
      repo: blog.blogRepo ?? projects.projectRepo,
      saving: blog.savingBlog,
      selectedSlug: blog.selectedBlogSlug,
      status: blog.blogStatus,
      validationError: blog.blogValidationError,
    },
    media: {
      area: media.mediaArea,
      file: media.mediaFile,
      fileInputKey: media.mediaFileInputKey,
      onAreaChange: media.changeMediaArea,
      onFileChange: media.changeMediaFile,
      onFileClear: media.clearMediaFile,
      onResultClear: () => media.setMediaResult(null),
      onSlugChange: media.setMediaSlug,
      onTargetClear: () => media.setMediaTarget(null),
      onTargetSelect: media.setMediaTarget,
      onUpload: media.uploadMedia,
      path: media.mediaPath,
      slug: media.mediaSlug,
      status: media.mediaStatus,
      target: media.mediaTarget,
      validationError: media.mediaValidationError,
      uploading: media.uploadingMedia,
    },
    activity: {
      branch: projects.projectBranch ?? blog.blogList?.branch ?? null,
      commits: activity.activity,
      error: activity.activityError,
      loadedAt: activity.activityLoadedAt,
      loading: activity.loadingActivity,
      onReload: reloadActivity,
      projectPath: projects.projectPath,
      projectRepo: projects.projectRepo,
      blogRepo: blog.blogRepo ?? projects.projectRepo,
    },
  } satisfies DashboardScreenProps

  return (
    <HashRouter>
      <Routes>
        <Route path="*" element={<DashboardScreen {...dashboardProps} />} />
      </Routes>
    </HashRouter>
  )
}
