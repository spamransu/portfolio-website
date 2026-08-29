import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { adminApi, type ProjectListResponse } from '../api/adminApi'
import type { ConflictState, ProjectJsonErrors, ProjectJsonField } from '../adminTypes'
import type { Project } from '../types'
import {
  createClonedProject,
  createEmptyProject,
  createProjectJsonDrafts,
  getApiErrorMessage,
  getProjectValidationError,
  isAdminApiError,
  normalizeSlug,
  parseProjectJsonField,
  splitLines,
} from '../lib/adminHelpers'

type UseProjectEditorOptions = {
  confirmDiscardChanges: (message: string) => boolean
  handleUnauthorizedError: (caught: Error) => boolean
  onAfterSave: () => void
  setGlobalError: (message: string | null) => void
}

const getProjectBySlug = (projects: Project[], slug: string): Project | null =>
  projects.find((project) => project.slug === slug) ?? projects[0] ?? null

export const useProjectEditor = ({
  confirmDiscardChanges,
  handleUnauthorizedError,
  onAfterSave,
  setGlobalError,
}: UseProjectEditorOptions) => {
  const [projectResponse, setProjectResponse] = useState<ProjectListResponse | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectSlug, setSelectedProjectSlug] = useState('')
  const [projectConflict, setProjectConflict] = useState<ConflictState>(null)
  const [projectStatus, setProjectStatus] = useState<string | null>(null)
  const [savingProjects, setSavingProjects] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [projectJsonDrafts, setProjectJsonDrafts] = useState(createProjectJsonDrafts(null))
  const [projectJsonErrors, setProjectJsonErrors] = useState<ProjectJsonErrors>({})
  const selectedProjectSlugRef = useRef(selectedProjectSlug)

  useEffect(() => {
    selectedProjectSlugRef.current = selectedProjectSlug
  }, [selectedProjectSlug])

  const selectedProject = useMemo(
    () => getProjectBySlug(projects, selectedProjectSlug),
    [projects, selectedProjectSlug],
  )

  const projectDirty = useMemo(() => {
    if (!projectResponse) return false
    return JSON.stringify(projectResponse.projects) !== JSON.stringify(projects)
  }, [projectResponse, projects])

  const projectValidationError = useMemo(
    () => getProjectValidationError(projects, selectedProjectSlug),
    [projects, selectedProjectSlug],
  )

  const hasProjectJsonErrors = useMemo(
    () => Object.values(projectJsonErrors).some(Boolean),
    [projectJsonErrors],
  )

  const setJsonDraftsForProject = useCallback((project: Project | null) => {
    setProjectJsonDrafts(createProjectJsonDrafts(project))
    setProjectJsonErrors({})
  }, [])

  const resetProjects = useCallback(() => {
    setProjectResponse(null)
    setProjects([])
    setSelectedProjectSlug('')
    setProjectConflict(null)
    setProjectStatus(null)
    setJsonDraftsForProject(null)
  }, [setJsonDraftsForProject])

  const loadProjects = useCallback(async () => {
    setLoadingProjects(true)
    setGlobalError(null)
    try {
      const response = await adminApi.getProjects()
      const nextProjects = structuredClone(response.projects)
      const currentSelectedSlug = selectedProjectSlugRef.current
      const nextSelectedSlug = response.projects.some((project) => project.slug === currentSelectedSlug)
        ? currentSelectedSlug
        : response.projects[0]?.slug ?? ''

      setProjectResponse(response)
      setProjects(nextProjects)
      setSelectedProjectSlug(nextSelectedSlug)
      setJsonDraftsForProject(getProjectBySlug(response.projects, nextSelectedSlug))
      setProjectConflict(null)
      setProjectStatus(`Loaded ${response.projects.length} project${response.projects.length === 1 ? '' : 's'} from GitHub.`)
    } catch (caught) {
      if (!handleUnauthorizedError(caught instanceof Error ? caught : new Error(String(caught)))) setGlobalError(getApiErrorMessage(caught instanceof Error ? caught : new Error(String(caught))))
    } finally {
      setLoadingProjects(false)
    }
  }, [handleUnauthorizedError, setGlobalError, setJsonDraftsForProject])

  const updateSelectedProject = useCallback((updater: (project: Project) => Project) => {
    setProjects((current) => current.map((project) => (project.slug === selectedProjectSlug ? updater(project) : project)))
  }, [selectedProjectSlug])

  const changeProjectField = useCallback((field: keyof Project, value: string): string | null => {
    if (field === 'slug') {
      const slug = normalizeSlug(value)
      updateSelectedProject((project) => ({ ...project, slug }))
      setSelectedProjectSlug(slug)
      return slug
    }

    updateSelectedProject((project) => {
      if (field === 'stack' || field === 'approach' || field === 'outcome' || field === 'scope') return { ...project, [field]: splitLines(value) }
      return { ...project, [field]: value }
    })
    return null
  }, [updateSelectedProject])

  const changeProjectJsonField = useCallback((field: ProjectJsonField, value: string) => {
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
  }, [updateSelectedProject])

  const createProject = useCallback((): string => {
    const nextProject = createEmptyProject(projects)
    setProjects((current) => [...current, nextProject])
    setSelectedProjectSlug(nextProject.slug)
    setJsonDraftsForProject(nextProject)
    return nextProject.slug
  }, [projects, setJsonDraftsForProject])

  const duplicateProject = useCallback((): string | null => {
    if (!selectedProject) return null
    const nextProject = createClonedProject(selectedProject, projects)
    setProjects((current) => [...current, nextProject])
    setSelectedProjectSlug(nextProject.slug)
    setJsonDraftsForProject(nextProject)
    return nextProject.slug
  }, [projects, selectedProject, setJsonDraftsForProject])

  const deleteProject = useCallback((): string | null => {
    if (!selectedProject) return null
    if (!confirmDiscardChanges(`Delete project "${selectedProject.title}" from the admin working copy?`)) return null

    const nextProjects = projects.filter((project) => project.slug !== selectedProject.slug)
    const nextSlug = nextProjects[0]?.slug ?? ''
    setProjects(nextProjects)
    setSelectedProjectSlug(nextSlug)
    setJsonDraftsForProject(getProjectBySlug(nextProjects, nextSlug))
    return nextSlug
  }, [confirmDiscardChanges, projects, selectedProject, setJsonDraftsForProject])

  const moveProject = useCallback((direction: 'up' | 'down') => {
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
  }, [selectedProjectSlug])

  const selectProject = useCallback((slug: string): string => {
    setSelectedProjectSlug(slug)
    setJsonDraftsForProject(getProjectBySlug(projects, slug))
    return slug
  }, [projects, setJsonDraftsForProject])

  const discardProjects = useCallback((): string | null => {
    if (!projectResponse) return null
    const nextProjects = structuredClone(projectResponse.projects)
    const nextSlug = projectResponse.projects[0]?.slug ?? ''
    setProjects(nextProjects)
    setSelectedProjectSlug(nextSlug)
    setProjectConflict(null)
    setProjectStatus('Discarded unsaved project changes.')
    setJsonDraftsForProject(getProjectBySlug(projectResponse.projects, nextSlug))
    return nextSlug
  }, [projectResponse, setJsonDraftsForProject])

  const saveProjects = useCallback(async () => {
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
      const nextProjects = structuredClone(response.projects)
      setProjectResponse(response)
      setProjects(nextProjects)
      setJsonDraftsForProject(getProjectBySlug(response.projects, selectedProjectSlug))
      setProjectStatus(`Saved projects to ${response.path}.`)
      onAfterSave()
    } catch (caught) {
      const error = caught instanceof Error ? caught : new Error(String(caught))
      if (isAdminApiError(error) && error.status === 409) {
        setProjectConflict({ currentSha: error.currentSha, latestCommitSha: error.latestCommitSha })
      }
      if (!handleUnauthorizedError(caught instanceof Error ? caught : new Error(String(caught)))) setProjectStatus(getApiErrorMessage(caught instanceof Error ? caught : new Error(String(caught))))
    } finally {
      setSavingProjects(false)
    }
  }, [handleUnauthorizedError, hasProjectJsonErrors, onAfterSave, projectResponse, projectValidationError, projects, selectedProjectSlug, setJsonDraftsForProject])

  const reloadProjects = useCallback(() => {
    if (!projectDirty || confirmDiscardChanges('Discard unsaved project changes and reload from GitHub?')) void loadProjects()
  }, [confirmDiscardChanges, loadProjects, projectDirty])

  return {
    changeProjectField,
    changeProjectJsonField,
    createProject,
    deleteProject,
    discardProjects,
    duplicateProject,
    hasProjectJsonErrors,
    loadProjects,
    loadingProjects,
    moveProject,
    projectBranch: projectResponse?.branch ?? null,
    projectConflict,
    projectDirty,
    projectJsonDrafts,
    projectJsonErrors,
    projectOptions: projects.map((project) => ({ slug: project.slug, title: project.title })),
    projectPath: projectResponse?.path ?? 'content/site-content.json',
    projectRepo: projectResponse?.repo ?? null,
    projectResponse,
    projects,
    projectStatus,
    projectValidationError,
    reloadProjects,
    resetProjects,
    saveProjects,
    savingProjects,
    selectProject,
    selectedProject,
    selectedProjectSlug,
    updateSelectedProject,
  }
}
