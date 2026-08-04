import type { AdminRepoInfo, AdminSession } from '../../api/adminApi'
import type { BlogActivity, ConflictState, MediaArea, MediaTargetSelection, ProjectJsonDrafts, ProjectJsonErrors, ProjectJsonField, ActivityItem } from '../../adminTypes'
import type { BlogPostMeta, BlogPostResponse, Project } from '../../types'

export type DashboardSessionProps = {
  authStatus: string | null
  error: string | null
  loading: boolean
  onLogin: () => void
  onLogout: () => void
  session: AdminSession
  siteUrl: string
}

export type DashboardProjectProps = {
  conflict: ConflictState
  dirty: boolean
  items: Project[]
  jsonDrafts: ProjectJsonDrafts
  jsonErrors: ProjectJsonErrors
  loading: boolean
  onCreate: () => void
  onDelete: () => void
  onDiscard: () => void
  onDuplicate: () => void
  onFieldChange: (field: keyof Project, value: string) => void
  onJsonFieldChange: (field: ProjectJsonField, value: string) => void
  onMove: (direction: 'up' | 'down') => void
  onReload: () => void
  onSave: () => void
  onSelect: (slug: string) => void
  options: Array<{ slug: string; title: string }>
  path: string
  repo: AdminRepoInfo | null
  saving: boolean
  selected: Project | null
  selectedSlug: string
  status: string | null
  validationError: string | null
}

export type DashboardBlogProps = {
  activity: BlogActivity
  conflict: ConflictState
  dirty: boolean
  list: BlogPostMeta[]
  loading: boolean
  meta: BlogPostMeta | null
  onCreate: () => void
  onDelete: () => void
  onDiscard: () => void
  onDuplicate: () => void
  onFieldChange: (field: keyof BlogPostResponse, value: string) => void
  onReload: () => void
  onSave: () => void
  onSelect: (slug: string) => void
  post: BlogPostResponse | null
  repo: AdminRepoInfo | null
  saving: boolean
  selectedSlug: string
  status: string | null
  validationError: string | null
}

export type DashboardMediaProps = {
  area: MediaArea
  file: File | null
  fileInputKey: number
  onAreaChange: (value: MediaArea) => void
  onFileChange: (file: File | null) => void
  onFileClear: () => void
  onResultClear: () => void
  onSlugChange: (value: string) => void
  onTargetClear: () => void
  onTargetSelect: (target: MediaTargetSelection) => void
  onUpload: () => void
  path: string
  slug: string
  status: string | null
  target: MediaTargetSelection | null
  validationError: string | null
  uploading: boolean
}

export type DashboardActivityProps = {
  branch: string | null
  commits: ActivityItem[]
  error: string | null
  loadedAt: string | null
  loading: boolean
  onReload: () => void
  projectPath: string
  projectRepo: AdminRepoInfo | null
  blogRepo: AdminRepoInfo | null
}

export type DashboardScreenProps = {
  activity: DashboardActivityProps
  blog: DashboardBlogProps
  media: DashboardMediaProps
  projects: DashboardProjectProps
  session: DashboardSessionProps
}
