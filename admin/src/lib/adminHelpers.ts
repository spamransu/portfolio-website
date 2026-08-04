import type { AdminApiError, AdminSession } from '../api/adminApi'
import type { BlogPostMeta, BlogPostResponse, Project } from '../types'
import type { MediaArea, ProjectJsonDrafts, ProjectJsonField } from '../adminTypes'

export const DEFAULT_SESSION: AdminSession = {
  authenticated: false,
  login: null,
  expiresAt: null,
}

export const MAX_MEDIA_FILE_BYTES = 5 * 1024 * 1024
export const ALLOWED_MEDIA_TYPES = ['image/gif', 'image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'] as const
export const DEFAULT_BLOG_MEDIA_SLUG = 'blog'

export const splitLines = (value: string): string[] =>
  value
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean)

export const todayDate = () => new Date().toISOString().slice(0, 10)

export const normalizeSlug = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const buildBlogPostPath = (date: string, slug: string): string => `content/blog/${date}-${slug}.md`

export const emptyImage = () => ({ src: '', alt: '', caption: '' })

export const getUniqueBlogCloneSlug = (baseSlug: string, existingPosts: BlogPostMeta[], date: string): string => {
  const normalizedBase = normalizeSlug(baseSlug) || `draft-${todayDate()}`
  let candidate = normalizedBase
  let copyIndex = 2

  while (existingPosts.some((entry) => entry.slug === candidate || entry.path === buildBlogPostPath(date, candidate))) {
    candidate = `${normalizedBase}-${copyIndex}`
    copyIndex += 1
  }

  return candidate
}

export const createEmptyBlogPost = (existingPosts: BlogPostMeta[], date = todayDate()): BlogPostResponse => {
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

export const createClonedBlogPost = (
  source: BlogPostResponse,
  existingPosts: BlogPostMeta[],
  date = todayDate(),
): BlogPostResponse => {
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

export const getUniqueProjectCloneSlug = (baseSlug: string, existingProjects: Project[]): string => {
  const normalizedBase = normalizeSlug(baseSlug) || 'new-project'
  let candidate = normalizedBase
  let copyIndex = 2

  while (existingProjects.some((project) => project.slug === candidate)) {
    candidate = `${normalizedBase}-${copyIndex}`
    copyIndex += 1
  }

  return candidate
}

export const createEmptyProject = (existingProjects: Project[], year = `${new Date().getFullYear()}`): Project => ({
  slug: getUniqueProjectCloneSlug('new-project', existingProjects),
  title: 'New project',
  year,
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
})

export const createClonedProject = (source: Project, existingProjects: Project[]): Project => ({
  ...structuredClone(source),
  title: source.title ? `${source.title} (Copy)` : 'New project',
  slug: getUniqueProjectCloneSlug(`${source.slug || 'project'}-copy`, existingProjects),
})

export const getProjectValidationError = (projects: Project[], selectedSlug: string): string | null => {
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

export const getBlogValidationError = (post: BlogPostResponse | null): string | null => {
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

export const getApiErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) return error.message
  return 'Something went wrong. Try again.'
}

export const isAdminApiError = (error: unknown): error is AdminApiError => error instanceof Error

export const projectJsonFieldLabels: Record<ProjectJsonField, string> = {
  image: 'Hero image JSON',
  gallery: 'Gallery JSON',
  sections: 'Sections JSON',
}

export const createProjectJsonDrafts = (project: Project | null): ProjectJsonDrafts => ({
  image: JSON.stringify(project?.image ?? emptyImage(), null, 2),
  gallery: JSON.stringify(project?.gallery ?? [], null, 2),
  sections: JSON.stringify(project?.sections ?? [], null, 2),
})

export const parseProjectJsonField = <Field extends ProjectJsonField>(
  field: Field,
  value: string,
): { ok: true; parsedValue: Project[Field] } | { ok: false; error: string } => {
  try {
    return { ok: true, parsedValue: JSON.parse(value) as Project[Field] }
  } catch {
    return { ok: false, error: `${projectJsonFieldLabels[field]} is invalid. Fix the JSON before saving.` }
  }
}

export const getMediaValidationError = ({
  area,
  file,
  selectedProject,
  slug,
}: {
  area: MediaArea
  file: File | null
  selectedProject: Project | null
  slug: string
}): string | null => {
  if (!file) return null
  if (!ALLOWED_MEDIA_TYPES.includes(file.type as (typeof ALLOWED_MEDIA_TYPES)[number])) return 'Unsupported media type. Use png, jpg, webp, gif, or svg.'
  if (file.size > MAX_MEDIA_FILE_BYTES) return 'Media file is too large. Maximum size is 5 MB.'
  if (!slug.trim()) return 'Media slug is required.'
  if (area === 'projects' && !selectedProject) return 'Select a project before uploading project media.'
  return null
}

export const getBlogMediaSlug = (post: BlogPostResponse | null): string => post?.slug || DEFAULT_BLOG_MEDIA_SLUG
export const getProjectMediaSlug = (project: Project | null): string => project?.slug || ''
export const canReloadBlogPost = (post: BlogPostResponse | null, selectedSlug: string): boolean => Boolean(post?.sha && selectedSlug)
