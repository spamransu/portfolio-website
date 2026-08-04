import { useCallback, useEffect, useRef, useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { adminApi, type AdminSession } from './api/adminApi'
import { DashboardScreen } from './screens/DashboardScreen'
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
    if (typeof window === 'undefined') return true
    return window.confirm(message)
  }, [])

  const handleUnauthorizedError = useCallback((caught: unknown): boolean => {
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
    activity: activity.activity,
    activityError: activity.activityError,
    activityLoadedAt: activity.activityLoadedAt,
    authStatus,
    blogActivity: blog.blogActivity,
    blogConflict: blog.blogConflict,
    blogDirty: blog.blogDirty,
    blogList: blog.blogList?.posts ?? [],
    blogLoading: blog.loadingBlog,
    blogRepo: blog.blogRepo ?? projects.projectRepo,
    blogMeta: blog.blogMeta,
    blogPost: blog.blogPost,
    blogStatus: blog.blogStatus,
    blogValidationError: blog.blogValidationError,
    error,
    loading,
    loadingActivity: activity.loadingActivity,
    loadingProjects: projects.loadingProjects,
    mediaArea: media.mediaArea,
    mediaFile: media.mediaFile,
    mediaFileInputKey: media.mediaFileInputKey,
    mediaPath: media.mediaPath,
    mediaSlug: media.mediaSlug,
    mediaStatus: media.mediaStatus,
    mediaTarget: media.mediaTarget,
    mediaValidationError: media.mediaValidationError,
    onBlogCreate: blog.createBlogPost,
    onBlogDelete: blog.deleteBlogPost,
    onBlogDiscard: blog.discardBlogPost,
    onBlogDuplicate: blog.duplicateBlogPost,
    onBlogFieldChange: blog.changeBlogField,
    onBlogReload: blog.reloadBlogPost,
    onBlogSave: blog.saveBlogPost,
    onBlogSelect: blog.selectBlogPost,
    onLogout: () => { void handleLogout() },
    onLogin: handleLogin,
    onMediaAreaChange: media.changeMediaArea,
    onMediaFileChange: media.changeMediaFile,
    onMediaFileClear: media.clearMediaFile,
    onMediaResultClear: () => media.setMediaResult(null),
    onMediaSlugChange: media.setMediaSlug,
    onMediaTargetClear: () => media.setMediaTarget(null),
    onMediaTargetSelect: media.setMediaTarget,
    onMediaUpload: media.uploadMedia,
    onProjectCreate: handleProjectCreate,
    onProjectDelete: handleProjectDelete,
    onProjectDiscard: handleProjectDiscard,
    onProjectDuplicate: handleProjectDuplicate,
    onProjectFieldChange: handleProjectFieldChange,
    onProjectJsonFieldChange: projects.changeProjectJsonField,
    onProjectMove: projects.moveProject,
    onProjectReload: projects.reloadProjects,
    onProjectSave: projects.saveProjects,
    onProjectSelect: handleProjectSelect,
    onReloadActivity: reloadActivity,
    projectBranch: projects.projectBranch ?? blog.blogList?.branch ?? null,
    projectConflict: projects.projectConflict,
    projectDirty: projects.projectDirty,
    projectJsonDrafts: projects.projectJsonDrafts,
    projectJsonErrors: projects.projectJsonErrors,
    projectOptions: projects.projectOptions,
    projectPath: projects.projectPath,
    projectRepo: projects.projectRepo,
    projectStatus: projects.projectStatus,
    projectValidationError: projects.projectValidationError,
    projects: projects.projects,
    savingBlog: blog.savingBlog,
    savingProjects: projects.savingProjects,
    selectedBlogSlug: blog.selectedBlogSlug,
    selectedProject: projects.selectedProject,
    selectedProjectSlug: projects.selectedProjectSlug,
    session,
    siteUrl: typeof window === 'undefined' ? '' : window.location.origin,
    uploadingMedia: media.uploadingMedia,
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="*" element={<DashboardScreen {...dashboardProps} />} />
      </Routes>
    </HashRouter>
  )
}
