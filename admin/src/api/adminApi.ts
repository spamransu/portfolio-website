import type { BlogPost, BlogPostMeta, BlogPostResponse, SiteContent } from '../types'

export interface AdminSession {
  authenticated: boolean
  login: string | null
  expiresAt: string | null
}

export interface AdminRepoInfo {
  branchUrl: string
  owner: string
  repo: string
  repoUrl: string
}

export interface SiteContentResponse {
  branch: string
  sha: string
  latestCommitSha: string | null
  path: string
  repo: AdminRepoInfo
  content: SiteContent
}

export interface SaveSiteContentRequest {
  branch: string
  commitMessage: string
  content: SiteContent
  sha: string
}

export interface BlogListResponse {
  branch: string
  posts: BlogPostMeta[]
  repo: AdminRepoInfo
}

export interface BlogDetailResponse {
  branch: string
  post: BlogPostResponse
  repo: AdminRepoInfo
}

export interface SaveBlogPostRequest {
  branch: string
  commitMessage: string
  post: BlogPost
  sha?: string
}

export interface DeleteBlogPostRequest {
  branch: string
  commitMessage: string
  sha: string
}

export interface MediaUploadResponse {
  branch: string
  path: string
  repo: AdminRepoInfo
  sha: string
  latestCommitSha: string | null
}

export interface MediaUploadRequest {
  area: string
  slug: string
  file: File
}

export interface AdminActivityItem {
  authorLogin: string | null
  authorName: string | null
  committedAt: string | null
  message: string
  sha: string
  url: string | null
}

export interface AdminActivityResponse {
  branch: string
  commits: AdminActivityItem[]
  repo: AdminRepoInfo
}

export interface AdminApiError extends Error {
  currentSha?: string
  latestCommitSha?: string | null
  status?: number
}

const toApiError = async (response: Response): Promise<AdminApiError> => {
  const fallback = `Request failed (${response.status})`
  const error = new Error(fallback) as AdminApiError
  error.status = response.status

  try {
    const payload = (await response.json()) as {
      currentSha?: string
      error?: string
      latestCommitSha?: string | null
    }

    if (payload.error) error.message = payload.error
    if (payload.currentSha) error.currentSha = payload.currentSha
    if (payload.latestCommitSha !== undefined) error.latestCommitSha = payload.latestCommitSha
  } catch {
    error.message = fallback
  }

  return error
}

const getJson = async <T>(input: RequestInfo | URL): Promise<T> => {
  const response = await fetch(input, {
    credentials: 'same-origin',
    headers: { accept: 'application/json' },
  })

  if (!response.ok) throw await toApiError(response)
  return (await response.json()) as T
}

export const adminApi = {
  getSession: () => getJson<AdminSession>('/api/admin/auth/me'),
  getActivity: () => getJson<AdminActivityResponse>('/api/admin/activity'),
  getSiteContent: () => getJson<SiteContentResponse>('/api/admin/content/site'),
  saveSiteContent: async (payload: SaveSiteContentRequest) => {
    const response = await fetch('/api/admin/content/site', {
      method: 'PUT',
      credentials: 'same-origin',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) throw await toApiError(response)
    return (await response.json()) as SiteContentResponse
  },
  getBlogPosts: () => getJson<BlogListResponse>('/api/admin/blog'),
  getBlogPost: (slug: string) => getJson<BlogDetailResponse>(`/api/admin/blog/${slug}`),
  saveBlogPost: async (slug: string, payload: SaveBlogPostRequest) => {
    const response = await fetch(`/api/admin/blog/${slug}`, {
      method: 'PUT',
      credentials: 'same-origin',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) throw await toApiError(response)
    return (await response.json()) as BlogDetailResponse & { latestCommitSha: string | null }
  },
  deleteBlogPost: async (slug: string, payload: DeleteBlogPostRequest) => {
    const response = await fetch(`/api/admin/blog/${slug}`, {
      method: 'DELETE',
      credentials: 'same-origin',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) throw await toApiError(response)
    return (await response.json()) as { branch: string; latestCommitSha: string | null; path: string; repo: AdminRepoInfo }
  },
  uploadMedia: async (payload: MediaUploadRequest) => {
    const formData = new FormData()
    formData.set('area', payload.area)
    formData.set('slug', payload.slug)
    formData.set('file', payload.file)

    const response = await fetch('/api/admin/media', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { accept: 'application/json' },
      body: formData,
    })

    if (!response.ok) throw await toApiError(response)
    return (await response.json()) as MediaUploadResponse
  },
  logout: async () => {
    const response = await fetch('/api/admin/auth/logout', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { accept: 'application/json' },
    })

    if (!response.ok) throw await toApiError(response)
  },
}
