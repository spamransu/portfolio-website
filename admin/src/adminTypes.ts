import type { AdminActivityItem, AdminRepoInfo } from './api/adminApi'

export type ConflictState = {
  currentSha?: string
  latestCommitSha?: string | null
} | null

export type BlogActivity = {
  latestCommitSha: string | null
  path: string
  repo: AdminRepoInfo
  summary: string
} | null

export type ProjectJsonField = 'image' | 'gallery' | 'sections'
export type ProjectJsonDrafts = Record<ProjectJsonField, string>
export type ProjectJsonErrors = Partial<Record<ProjectJsonField, string>>

export type MediaArea = 'blog' | 'projects'

export type MediaTargetSelection = {
  kind: 'blog' | 'project'
  field: 'coverImage' | 'image' | 'gallery' | 'sectionImage'
  index?: number
  label: string
}

export type ActivityItem = AdminActivityItem
