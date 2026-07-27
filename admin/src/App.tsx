import { useCallback, useEffect, useMemo, useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import {
  adminApi,
  type AdminActivityResponse,
  type AdminApiError,
  type AdminRepoInfo,
  type AdminSession,
  type BlogDetailResponse,
  type BlogListResponse,
  type MediaUploadResponse,
  type SiteContentResponse,
} from './api/adminApi'
import { DashboardScreen, type MediaTargetSelection } from './screens/DashboardScreen'
import type { BlogPostMeta, BlogPostResponse, SiteContent } from './types'

const DEFAULT_SESSION: AdminSession = {
  authenticated: false,
  login: null,
  expiresAt: null,
}

const DEFAULT_MEDIA_AREA = 'blog'
const MAX_MEDIA_FILE_BYTES = 5 * 1024 * 1024
const ALLOWED_MEDIA_TYPES = ['image/gif', 'image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'] as const

type ConflictState = {
  currentSha?: string
  latestCommitSha?: string | null
} | null

type SiteValidationState = {
  featuredProjects?: string
  selectedProject?: string
  site?: string
  socials?: string
  siteChrome?: string
  homePage?: string
  homeContact?: string
  aboutPage?: string
  resumePage?: string
  contactPage?: string
  contactForm?: string
  contactMethods?: string
  projectsPage?: string
  blogPage?: string
  blogPostPage?: string
  projectDetailPage?: string
  notFoundPage?: string
}

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

const splitLinkLines = (value: string): Array<{ to: string; label: string }> =>
  value
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [to, ...labelParts] = entry.split('|')
      return {
        to: to?.trim() ?? '',
        label: labelParts.join('|').trim(),
      }
    })
    .filter((entry) => entry.to && entry.label)

const updateRecordAtIndex = <T,>(items: T[], index: number, updater: (item: T) => T): T[] =>
  items.map((item, itemIndex) => (itemIndex === index ? updater(item) : item))

const moveArrayItem = <T,>(items: T[], fromIndex: number, toIndex: number): T[] => {
  const next = [...items]
  const [movedItem] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, movedItem)
  return next
}

const normalizeTone = (value: string): 'accent' | 'accent-2' | 'accent-3' => {
  if (value === 'accent-2' || value === 'accent-3') return value
  return 'accent'
}

const normalizeProjectSectionKind = (value: string): 'default' | 'approach' | 'outcome' => {
  if (value === 'approach' || value === 'outcome') return value
  return 'default'
}

const todayDate = () => new Date().toISOString().slice(0, 10)

const normalizeSlug = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const buildBlogPostPath = (date: string, slug: string): string => `content/blog/${date}-${slug}.md`
const DEFAULT_BLOG_MEDIA_SLUG = 'blog'
const DEFAULT_HOME_MEDIA_SLUG = 'home'
const DEFAULT_PROJECTS_MEDIA_SLUG = 'projects-page'
const DEFAULT_ABOUT_MEDIA_SLUG = 'about'
const DEFAULT_RESUME_MEDIA_SLUG = 'resume'
const DEFAULT_CONTACT_MEDIA_SLUG = 'contact'

const getPreferredMediaSlugForArea = (
  area: string,
  currentSlug: string,
  selectedBlogSlug: string,
  selectedProjectSlug: string,
): string => {
  switch (area) {
    case 'blog':
      return selectedBlogSlug || DEFAULT_BLOG_MEDIA_SLUG
    case 'home':
      return DEFAULT_HOME_MEDIA_SLUG
    case 'projects':
      return selectedProjectSlug || DEFAULT_PROJECTS_MEDIA_SLUG
    case 'about':
      return DEFAULT_ABOUT_MEDIA_SLUG
    case 'resume':
      return DEFAULT_RESUME_MEDIA_SLUG
    case 'contact':
      return DEFAULT_CONTACT_MEDIA_SLUG
    default:
      return currentSlug
  }
}

const getUniqueBlogCloneSlug = (baseSlug: string, existingPosts: BlogPostMeta[], date: string): string => {
  const normalizedBase = normalizeSlug(baseSlug) || `draft-${todayDate()}`
  let candidate = normalizedBase
  let copyIndex = 2

  while (
    existingPosts.some((entry) => entry.slug === candidate || entry.path === buildBlogPostPath(date, candidate))
  ) {
    candidate = `${normalizedBase}-${copyIndex}`
    copyIndex += 1
  }

  return candidate
}

const createEmptyBlogPost = (existingPosts: BlogPostMeta[]): BlogPostResponse => {
  const date = todayDate()
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

const createClonedBlogPost = (source: BlogPostResponse, existingPosts: BlogPostMeta[]): BlogPostResponse => {
  const date = todayDate()
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

const getUniqueProjectCloneSlug = (baseSlug: string, existingProjects: SiteContent['projects']): string => {
  const normalizedBase = normalizeSlug(baseSlug) || 'new-project'
  let candidate = normalizedBase
  let copyIndex = 2

  while (existingProjects.some((project) => project.slug === candidate)) {
    candidate = `${normalizedBase}-${copyIndex}`
    copyIndex += 1
  }

  return candidate
}

const createClonedProject = (
  source: SiteContent['projects'][number],
  existingProjects: SiteContent['projects'],
): SiteContent['projects'][number] => {
  const nextSlug = getUniqueProjectCloneSlug(`${source.slug || 'project'}-copy`, existingProjects)

  return {
    ...structuredClone(source),
    title: source.title ? `${source.title} (Copy)` : 'New project',
    slug: nextSlug,
  }
}

const createEmptyProject = (
  existingProjects: SiteContent['projects'],
): SiteContent['projects'][number] => {
  const nextSlug = getUniqueProjectCloneSlug('new-project', existingProjects)
  const nextIndex = existingProjects.length + 1

  return {
    slug: nextSlug,
    title: `New project ${nextIndex}`,
    year: todayDate().slice(0, 4),
    client: 'Internal project',
    summary: 'Add a short summary for this project.',
    role: 'Add your role',
    stack: ['Add stack item'],
    challenge: 'Describe the challenge this project solved.',
    approach: ['Describe the approach you took.'],
    outcome: ['Describe the result or impact.'],
    sections: [{ kind: 'default', title: 'Overview', body: 'Add project overview copy.' }],
  }
}

const retargetProjectMediaSelection = (
  target: MediaTargetSelection,
  nextSlug: string,
  projectTitle: string,
): MediaTargetSelection => {
  switch (target.scope) {
    case 'projectImage':
      return {
        ...target,
        key: `project:${nextSlug}:image.src`,
        label: `${projectTitle} lead image`,
        slug: nextSlug,
      }
    case 'projectGallery':
      return {
        ...target,
        key: `projectGallery:${nextSlug}:${target.index ?? 0}:src`,
        label: `${projectTitle} gallery image ${(target.index ?? 0) + 1}`,
        slug: nextSlug,
      }
    case 'projectSection':
      return {
        ...target,
        key: `projectSection:${nextSlug}:${target.index ?? 0}:image.src`,
        label: `${projectTitle} section ${(target.index ?? 0) + 1} image`,
        slug: nextSlug,
      }
    default:
      return target
  }
}

const retargetBlogMediaSelection = (
  target: MediaTargetSelection,
  nextSlug: string,
  postTitle: string,
): MediaTargetSelection => ({
  ...target,
  key: `blog:${nextSlug}:${target.field}`,
  label: `${postTitle || nextSlug} cover image`,
  slug: nextSlug,
})

const getResetProjectSelectionSlug = (projects: SiteContent['projects'], currentSlug: string): string => {
  if (currentSlug && projects.some((project) => project.slug === currentSlug)) return currentSlug
  return projects[0]?.slug ?? ''
}

const syncResetProjectMediaSlug = (
  currentMediaSlug: string,
  previousSelectedProjectSlug: string,
  nextSelectedProjectSlug: string,
): string => (currentMediaSlug === previousSelectedProjectSlug ? nextSelectedProjectSlug : currentMediaSlug)

const syncActiveProjectMediaSlug = (
  currentMediaSlug: string,
  currentMediaArea: string,
  previousSelectedProjectSlug: string,
  nextSelectedProjectSlug: string,
): string => (
  currentMediaArea === 'projects'
    ? syncResetProjectMediaSlug(currentMediaSlug, previousSelectedProjectSlug, nextSelectedProjectSlug)
    : currentMediaSlug
)

const syncClearedProjectMediaSlug = (
  currentMediaSlug: string,
  currentMediaArea: string,
  previousSelectedProjectSlug: string,
): string => {
  if (currentMediaArea !== 'projects') return currentMediaSlug
  if (!currentMediaSlug || currentMediaSlug === previousSelectedProjectSlug || currentMediaSlug === DEFAULT_PROJECTS_MEDIA_SLUG) {
    return DEFAULT_PROJECTS_MEDIA_SLUG
  }
  return currentMediaSlug
}

const syncEnteredProjectMediaSlug = (
  currentMediaSlug: string,
  currentMediaArea: string,
  currentMediaTarget: MediaTargetSelection | null,
  previousSelectedProjectSlug: string,
  nextSelectedProjectSlug: string,
): string => {
  if (currentMediaArea !== 'projects') return currentMediaSlug
  if (!currentMediaTarget) {
    if (currentMediaSlug === DEFAULT_PROJECTS_MEDIA_SLUG) return nextSelectedProjectSlug
    return syncResetProjectMediaSlug(currentMediaSlug, previousSelectedProjectSlug, nextSelectedProjectSlug)
  }
  if (currentMediaTarget.area !== 'projects') return nextSelectedProjectSlug
  if (currentMediaTarget.scope === 'projectImage' || currentMediaTarget.scope === 'projectGallery' || currentMediaTarget.scope === 'projectSection') {
    return syncResetProjectMediaSlug(currentMediaSlug, previousSelectedProjectSlug, nextSelectedProjectSlug)
  }
  return nextSelectedProjectSlug
}

const syncResetProjectMediaTarget = (
  currentMediaTarget: MediaTargetSelection | null,
  projects: SiteContent['projects'],
  previousSelectedProjectSlug: string,
  nextSelectedProjectSlug: string,
): MediaTargetSelection | null => {
  if (!currentMediaTarget || currentMediaTarget.area !== 'projects') return currentMediaTarget

  const matchingProject = projects.find((project) => project.slug === currentMediaTarget.slug)
  if (matchingProject) return currentMediaTarget

  if (currentMediaTarget.slug !== previousSelectedProjectSlug || !nextSelectedProjectSlug) {
    return null
  }

  const nextProject = projects.find((project) => project.slug === nextSelectedProjectSlug)
  return nextProject
    ? retargetProjectMediaSelection(currentMediaTarget, nextProject.slug, nextProject.title)
    : null
}

const syncResetBlogMediaSlug = (
  currentMediaSlug: string,
  previousSelectedBlogSlug: string,
  nextSelectedBlogSlug: string,
): string => (currentMediaSlug === previousSelectedBlogSlug ? nextSelectedBlogSlug : currentMediaSlug)

const syncActiveBlogMediaSlug = (
  currentMediaSlug: string,
  currentMediaArea: string,
  previousSelectedBlogSlug: string,
  nextSelectedBlogSlug: string,
): string => (
  currentMediaArea === 'blog'
    ? syncResetBlogMediaSlug(currentMediaSlug, previousSelectedBlogSlug, nextSelectedBlogSlug)
    : currentMediaSlug
)

const syncEnteredBlogMediaSlug = (
  currentMediaSlug: string,
  currentMediaArea: string,
  currentMediaTarget: MediaTargetSelection | null,
  previousSelectedBlogSlug: string,
  nextSelectedBlogSlug: string,
): string => {
  if (currentMediaArea !== 'blog') return currentMediaSlug
  if (!currentMediaTarget) {
    if (currentMediaSlug === DEFAULT_BLOG_MEDIA_SLUG) return nextSelectedBlogSlug
    return syncResetBlogMediaSlug(currentMediaSlug, previousSelectedBlogSlug, nextSelectedBlogSlug)
  }
  if (currentMediaTarget.area !== 'blog') return nextSelectedBlogSlug
  if (currentMediaTarget.kind === 'blog') {
    return syncResetBlogMediaSlug(currentMediaSlug, previousSelectedBlogSlug, nextSelectedBlogSlug)
  }
  return nextSelectedBlogSlug
}

const syncClearedBlogMediaSlug = (
  currentMediaSlug: string,
  currentMediaArea: string,
  previousSelectedBlogSlug: string,
): string => {
  if (currentMediaArea !== 'blog') return currentMediaSlug
  if (!currentMediaSlug || currentMediaSlug === previousSelectedBlogSlug || currentMediaSlug === DEFAULT_BLOG_MEDIA_SLUG) {
    return DEFAULT_BLOG_MEDIA_SLUG
  }
  return currentMediaSlug
}

const syncResetBlogMediaTarget = (
  currentMediaTarget: MediaTargetSelection | null,
  previousSelectedBlogSlug: string,
  nextPost: BlogPostResponse | null,
): MediaTargetSelection | null => {
  if (!currentMediaTarget || currentMediaTarget.kind !== 'blog') return currentMediaTarget
  if (!nextPost) return null

  if (currentMediaTarget.slug !== previousSelectedBlogSlug && currentMediaTarget.slug === nextPost.slug) {
    return currentMediaTarget
  }

  if (currentMediaTarget.slug !== previousSelectedBlogSlug) return null

  return retargetBlogMediaSelection(currentMediaTarget, nextPost.slug, nextPost.title)
}

const normalizeProjectDetailPage = (value?: SiteContent['projectDetailPage']) => ({
  eyebrow: value?.eyebrow ?? '',
  notFoundTitle: value?.notFoundTitle ?? '',
  notFoundIntro: value?.notFoundIntro ?? '',
  backToProjectsLabel: value?.backToProjectsLabel ?? '',
  startProjectLabel: value?.startProjectLabel ?? '',
  snapshotTitle: value?.snapshotTitle ?? '',
  roleLabel: value?.roleLabel ?? '',
  clientLabel: value?.clientLabel ?? '',
  yearLabel: value?.yearLabel ?? '',
  stackLabel: value?.stackLabel ?? '',
  stackAriaTemplate: value?.stackAriaTemplate ?? '',
  galleryTitle: value?.galleryTitle ?? '',
  galleryIntro: value?.galleryIntro ?? '',
  nextProjectEyebrow: value?.nextProjectEyebrow ?? '',
  nextProjectLabel: value?.nextProjectLabel ?? '',
  similarWorkEyebrow: value?.similarWorkEyebrow ?? '',
  similarWorkTitle: value?.similarWorkTitle ?? '',
  similarWorkIntro: value?.similarWorkIntro ?? '',
  similarWorkLabel: value?.similarWorkLabel ?? '',
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
    case 'siteChrome.skipToContentLabel':
      next.siteChrome = {
        skipToContentLabel: value,
        headerNavAriaLabel: next.siteChrome?.headerNavAriaLabel ?? '',
        footerSocialsAriaLabel: next.siteChrome?.footerSocialsAriaLabel ?? '',
        headerNav: next.siteChrome?.headerNav ?? [],
        headerLinktreeLabel: next.siteChrome?.headerLinktreeLabel ?? '',
        footer: {
          copyrightTemplate: next.siteChrome?.footer.copyrightTemplate ?? '',
          generalHeading: next.siteChrome?.footer.generalHeading ?? '',
          moreHeading: next.siteChrome?.footer.moreHeading ?? '',
          generalLinks: next.siteChrome?.footer.generalLinks ?? [],
          moreLinks: next.siteChrome?.footer.moreLinks ?? [],
          linktreeLabel: next.siteChrome?.footer.linktreeLabel ?? '',
        },
      }
      return next
    case 'siteChrome.headerNavAriaLabel':
      next.siteChrome = {
        skipToContentLabel: next.siteChrome?.skipToContentLabel ?? '',
        headerNavAriaLabel: value,
        footerSocialsAriaLabel: next.siteChrome?.footerSocialsAriaLabel ?? '',
        headerNav: next.siteChrome?.headerNav ?? [],
        headerLinktreeLabel: next.siteChrome?.headerLinktreeLabel ?? '',
        footer: {
          copyrightTemplate: next.siteChrome?.footer.copyrightTemplate ?? '',
          generalHeading: next.siteChrome?.footer.generalHeading ?? '',
          moreHeading: next.siteChrome?.footer.moreHeading ?? '',
          generalLinks: next.siteChrome?.footer.generalLinks ?? [],
          moreLinks: next.siteChrome?.footer.moreLinks ?? [],
          linktreeLabel: next.siteChrome?.footer.linktreeLabel ?? '',
        },
      }
      return next
    case 'siteChrome.footerSocialsAriaLabel':
      next.siteChrome = {
        skipToContentLabel: next.siteChrome?.skipToContentLabel ?? '',
        headerNavAriaLabel: next.siteChrome?.headerNavAriaLabel ?? '',
        footerSocialsAriaLabel: value,
        headerNav: next.siteChrome?.headerNav ?? [],
        headerLinktreeLabel: next.siteChrome?.headerLinktreeLabel ?? '',
        footer: {
          copyrightTemplate: next.siteChrome?.footer.copyrightTemplate ?? '',
          generalHeading: next.siteChrome?.footer.generalHeading ?? '',
          moreHeading: next.siteChrome?.footer.moreHeading ?? '',
          generalLinks: next.siteChrome?.footer.generalLinks ?? [],
          moreLinks: next.siteChrome?.footer.moreLinks ?? [],
          linktreeLabel: next.siteChrome?.footer.linktreeLabel ?? '',
        },
      }
      return next
    case 'siteChrome.headerNav':
      next.siteChrome = {
        skipToContentLabel: next.siteChrome?.skipToContentLabel ?? '',
        headerNavAriaLabel: next.siteChrome?.headerNavAriaLabel ?? '',
        footerSocialsAriaLabel: next.siteChrome?.footerSocialsAriaLabel ?? '',
        headerNav: splitLinkLines(value),
        headerLinktreeLabel: next.siteChrome?.headerLinktreeLabel ?? '',
        footer: {
          copyrightTemplate: next.siteChrome?.footer.copyrightTemplate ?? '',
          generalHeading: next.siteChrome?.footer.generalHeading ?? '',
          moreHeading: next.siteChrome?.footer.moreHeading ?? '',
          generalLinks: next.siteChrome?.footer.generalLinks ?? [],
          moreLinks: next.siteChrome?.footer.moreLinks ?? [],
          linktreeLabel: next.siteChrome?.footer.linktreeLabel ?? '',
        },
      }
      return next
    case 'siteChrome.headerLinktreeLabel':
      next.siteChrome = {
        skipToContentLabel: next.siteChrome?.skipToContentLabel ?? '',
        headerNavAriaLabel: next.siteChrome?.headerNavAriaLabel ?? '',
        footerSocialsAriaLabel: next.siteChrome?.footerSocialsAriaLabel ?? '',
        headerNav: next.siteChrome?.headerNav ?? [],
        headerLinktreeLabel: value,
        footer: {
          copyrightTemplate: next.siteChrome?.footer.copyrightTemplate ?? '',
          generalHeading: next.siteChrome?.footer.generalHeading ?? '',
          moreHeading: next.siteChrome?.footer.moreHeading ?? '',
          generalLinks: next.siteChrome?.footer.generalLinks ?? [],
          moreLinks: next.siteChrome?.footer.moreLinks ?? [],
          linktreeLabel: next.siteChrome?.footer.linktreeLabel ?? '',
        },
      }
      return next
    case 'siteChrome.footer.copyrightTemplate':
      next.siteChrome = {
        skipToContentLabel: next.siteChrome?.skipToContentLabel ?? '',
        headerNavAriaLabel: next.siteChrome?.headerNavAriaLabel ?? '',
        footerSocialsAriaLabel: next.siteChrome?.footerSocialsAriaLabel ?? '',
        headerNav: next.siteChrome?.headerNav ?? [],
        headerLinktreeLabel: next.siteChrome?.headerLinktreeLabel ?? '',
        footer: {
          copyrightTemplate: value,
          generalHeading: next.siteChrome?.footer.generalHeading ?? '',
          moreHeading: next.siteChrome?.footer.moreHeading ?? '',
          generalLinks: next.siteChrome?.footer.generalLinks ?? [],
          moreLinks: next.siteChrome?.footer.moreLinks ?? [],
          linktreeLabel: next.siteChrome?.footer.linktreeLabel ?? '',
        },
      }
      return next
    case 'siteChrome.footer.generalHeading':
      next.siteChrome = {
        skipToContentLabel: next.siteChrome?.skipToContentLabel ?? '',
        headerNavAriaLabel: next.siteChrome?.headerNavAriaLabel ?? '',
        footerSocialsAriaLabel: next.siteChrome?.footerSocialsAriaLabel ?? '',
        headerNav: next.siteChrome?.headerNav ?? [],
        headerLinktreeLabel: next.siteChrome?.headerLinktreeLabel ?? '',
        footer: {
          copyrightTemplate: next.siteChrome?.footer.copyrightTemplate ?? '',
          generalHeading: value,
          moreHeading: next.siteChrome?.footer.moreHeading ?? '',
          generalLinks: next.siteChrome?.footer.generalLinks ?? [],
          moreLinks: next.siteChrome?.footer.moreLinks ?? [],
          linktreeLabel: next.siteChrome?.footer.linktreeLabel ?? '',
        },
      }
      return next
    case 'siteChrome.footer.moreHeading':
      next.siteChrome = {
        skipToContentLabel: next.siteChrome?.skipToContentLabel ?? '',
        headerNavAriaLabel: next.siteChrome?.headerNavAriaLabel ?? '',
        footerSocialsAriaLabel: next.siteChrome?.footerSocialsAriaLabel ?? '',
        headerNav: next.siteChrome?.headerNav ?? [],
        headerLinktreeLabel: next.siteChrome?.headerLinktreeLabel ?? '',
        footer: {
          copyrightTemplate: next.siteChrome?.footer.copyrightTemplate ?? '',
          generalHeading: next.siteChrome?.footer.generalHeading ?? '',
          moreHeading: value,
          generalLinks: next.siteChrome?.footer.generalLinks ?? [],
          moreLinks: next.siteChrome?.footer.moreLinks ?? [],
          linktreeLabel: next.siteChrome?.footer.linktreeLabel ?? '',
        },
      }
      return next
    case 'siteChrome.footer.generalLinks':
      next.siteChrome = {
        skipToContentLabel: next.siteChrome?.skipToContentLabel ?? '',
        headerNavAriaLabel: next.siteChrome?.headerNavAriaLabel ?? '',
        footerSocialsAriaLabel: next.siteChrome?.footerSocialsAriaLabel ?? '',
        headerNav: next.siteChrome?.headerNav ?? [],
        headerLinktreeLabel: next.siteChrome?.headerLinktreeLabel ?? '',
        footer: {
          copyrightTemplate: next.siteChrome?.footer.copyrightTemplate ?? '',
          generalHeading: next.siteChrome?.footer.generalHeading ?? '',
          moreHeading: next.siteChrome?.footer.moreHeading ?? '',
          generalLinks: splitLinkLines(value),
          moreLinks: next.siteChrome?.footer.moreLinks ?? [],
          linktreeLabel: next.siteChrome?.footer.linktreeLabel ?? '',
        },
      }
      return next
    case 'siteChrome.footer.moreLinks':
      next.siteChrome = {
        skipToContentLabel: next.siteChrome?.skipToContentLabel ?? '',
        headerNavAriaLabel: next.siteChrome?.headerNavAriaLabel ?? '',
        footerSocialsAriaLabel: next.siteChrome?.footerSocialsAriaLabel ?? '',
        headerNav: next.siteChrome?.headerNav ?? [],
        headerLinktreeLabel: next.siteChrome?.headerLinktreeLabel ?? '',
        footer: {
          copyrightTemplate: next.siteChrome?.footer.copyrightTemplate ?? '',
          generalHeading: next.siteChrome?.footer.generalHeading ?? '',
          moreHeading: next.siteChrome?.footer.moreHeading ?? '',
          generalLinks: next.siteChrome?.footer.generalLinks ?? [],
          moreLinks: splitLinkLines(value),
          linktreeLabel: next.siteChrome?.footer.linktreeLabel ?? '',
        },
      }
      return next
    case 'siteChrome.footer.linktreeLabel':
      next.siteChrome = {
        skipToContentLabel: next.siteChrome?.skipToContentLabel ?? '',
        headerNavAriaLabel: next.siteChrome?.headerNavAriaLabel ?? '',
        footerSocialsAriaLabel: next.siteChrome?.footerSocialsAriaLabel ?? '',
        headerNav: next.siteChrome?.headerNav ?? [],
        headerLinktreeLabel: next.siteChrome?.headerLinktreeLabel ?? '',
        footer: {
          copyrightTemplate: next.siteChrome?.footer.copyrightTemplate ?? '',
          generalHeading: next.siteChrome?.footer.generalHeading ?? '',
          moreHeading: next.siteChrome?.footer.moreHeading ?? '',
          generalLinks: next.siteChrome?.footer.generalLinks ?? [],
          moreLinks: next.siteChrome?.footer.moreLinks ?? [],
          linktreeLabel: value,
        },
      }
      return next
    case 'about.title':
      next.about.title = value
      return next
    case 'about.eyebrow':
      next.about.eyebrow = value
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
    case 'resume.eyebrow':
      next.resume.eyebrow = value
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
    case 'home.featuredProjects.stackAriaTemplate':
      next.home.featuredProjects.stackAriaTemplate = value
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
    case 'home.skills.cloudAriaLabel':
      next.home.skills.cloudAriaLabel = value
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
    case 'home.contact.nameLabel':
      next.home.contact.nameLabel = value
      return next
    case 'home.contact.emailLabel':
      next.home.contact.emailLabel = value
      return next
    case 'home.contact.messageLabel':
      next.home.contact.messageLabel = value
      return next
    case 'home.contact.namePlaceholder':
      next.home.contact.namePlaceholder = value
      return next
    case 'home.contact.emailPlaceholder':
      next.home.contact.emailPlaceholder = value
      return next
    case 'home.contact.messagePlaceholder':
      next.home.contact.messagePlaceholder = value
      return next
    case 'home.contact.nameRequiredError':
      next.home.contact.nameRequiredError = value
      return next
    case 'home.contact.emailRequiredError':
      next.home.contact.emailRequiredError = value
      return next
    case 'home.contact.emailInvalidError':
      next.home.contact.emailInvalidError = value
      return next
    case 'home.contact.messageRequiredError':
      next.home.contact.messageRequiredError = value
      return next
    case 'home.contact.messageTooLongError':
      next.home.contact.messageTooLongError = value
      return next
    case 'home.contact.messageCountTemplate':
      next.home.contact.messageCountTemplate = value
      return next
    case 'home.contact.mailtoSubjectTemplate':
      next.home.contact.mailtoSubjectTemplate = value
      return next
    case 'home.contact.mailtoNameLabel':
      next.home.contact.mailtoNameLabel = value
      return next
    case 'home.contact.mailtoEmailLabel':
      next.home.contact.mailtoEmailLabel = value
      return next
    case 'home.contact.mailtoMessageLabel':
      next.home.contact.mailtoMessageLabel = value
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
    case 'contact.eyebrow':
      next.contact.eyebrow = value
      return next
    case 'contact.body':
      next.contact.body = value
      return next
    case 'contact.emailCtaPrefix':
      next.contact.emailCtaPrefix = value
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
    case 'contact.form.nameLabel':
      next.contact.form.nameLabel = value
      return next
    case 'contact.form.emailLabel':
      next.contact.form.emailLabel = value
      return next
    case 'contact.form.messageLabel':
      next.contact.form.messageLabel = value
      return next
    case 'contact.form.namePlaceholder':
      next.contact.form.namePlaceholder = value
      return next
    case 'contact.form.emailPlaceholder':
      next.contact.form.emailPlaceholder = value
      return next
    case 'contact.form.messagePlaceholder':
      next.contact.form.messagePlaceholder = value
      return next
    case 'contact.form.nameRequiredError':
      next.contact.form.nameRequiredError = value
      return next
    case 'contact.form.emailRequiredError':
      next.contact.form.emailRequiredError = value
      return next
    case 'contact.form.emailInvalidError':
      next.contact.form.emailInvalidError = value
      return next
    case 'contact.form.messageRequiredError':
      next.contact.form.messageRequiredError = value
      return next
    case 'contact.form.messageTooLongError':
      next.contact.form.messageTooLongError = value
      return next
    case 'contact.form.messageCountTemplate':
      next.contact.form.messageCountTemplate = value
      return next
    case 'contact.form.mailtoSubjectTemplate':
      next.contact.form.mailtoSubjectTemplate = value
      return next
    case 'contact.form.mailtoNameLabel':
      next.contact.form.mailtoNameLabel = value
      return next
    case 'contact.form.mailtoEmailLabel':
      next.contact.form.mailtoEmailLabel = value
      return next
    case 'contact.form.mailtoMessageLabel':
      next.contact.form.mailtoMessageLabel = value
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
        eyebrow: next.projectsPage?.eyebrow ?? '',
        title: value,
        intro: next.projectsPage?.intro ?? '',
        roleLabelPrefix: next.projectsPage?.roleLabelPrefix ?? '',
        stackAriaTemplate: next.projectsPage?.stackAriaTemplate ?? '',
        heroImage: next.projectsPage?.heroImage,
      }
      return next
    case 'projectsPage.eyebrow':
      next.projectsPage = {
        eyebrow: value,
        title: next.projectsPage?.title ?? '',
        intro: next.projectsPage?.intro ?? '',
        roleLabelPrefix: next.projectsPage?.roleLabelPrefix ?? '',
        stackAriaTemplate: next.projectsPage?.stackAriaTemplate ?? '',
        heroImage: next.projectsPage?.heroImage,
      }
      return next
    case 'projectsPage.intro':
      next.projectsPage = {
        eyebrow: next.projectsPage?.eyebrow ?? '',
        title: next.projectsPage?.title ?? '',
        intro: value,
        roleLabelPrefix: next.projectsPage?.roleLabelPrefix ?? '',
        stackAriaTemplate: next.projectsPage?.stackAriaTemplate ?? '',
        heroImage: next.projectsPage?.heroImage,
      }
      return next
    case 'projectsPage.roleLabelPrefix':
      next.projectsPage = {
        eyebrow: next.projectsPage?.eyebrow ?? '',
        title: next.projectsPage?.title ?? '',
        intro: next.projectsPage?.intro ?? '',
        roleLabelPrefix: value,
        stackAriaTemplate: next.projectsPage?.stackAriaTemplate ?? '',
        heroImage: next.projectsPage?.heroImage,
      }
      return next
    case 'projectsPage.stackAriaTemplate':
      next.projectsPage = {
        eyebrow: next.projectsPage?.eyebrow ?? '',
        title: next.projectsPage?.title ?? '',
        intro: next.projectsPage?.intro ?? '',
        roleLabelPrefix: next.projectsPage?.roleLabelPrefix ?? '',
        stackAriaTemplate: value,
        heroImage: next.projectsPage?.heroImage,
      }
      return next
    case 'blogPage.title':
      next.blogPage = {
        eyebrow: next.blogPage?.eyebrow ?? '',
        title: value,
        intro: next.blogPage?.intro ?? '',
        heroImage: next.blogPage?.heroImage,
      }
      return next
    case 'blogPage.eyebrow':
      next.blogPage = {
        eyebrow: value,
        title: next.blogPage?.title ?? '',
        intro: next.blogPage?.intro ?? '',
        heroImage: next.blogPage?.heroImage,
      }
      return next
    case 'blogPage.intro':
      next.blogPage = {
        eyebrow: next.blogPage?.eyebrow ?? '',
        title: next.blogPage?.title ?? '',
        intro: value,
        heroImage: next.blogPage?.heroImage,
      }
      return next
    case 'blogPostPage.eyebrowPrefix':
      next.blogPostPage = {
        eyebrowPrefix: value,
        notFoundTitle: next.blogPostPage?.notFoundTitle ?? '',
        notFoundIntro: next.blogPostPage?.notFoundIntro ?? '',
        backToBlogLabel: next.blogPostPage?.backToBlogLabel ?? '',
        startProjectLabel: next.blogPostPage?.startProjectLabel ?? '',
        articleSectionTitle: next.blogPostPage?.articleSectionTitle ?? '',
      }
      return next
    case 'blogPostPage.notFoundTitle':
      next.blogPostPage = {
        eyebrowPrefix: next.blogPostPage?.eyebrowPrefix ?? '',
        notFoundTitle: value,
        notFoundIntro: next.blogPostPage?.notFoundIntro ?? '',
        backToBlogLabel: next.blogPostPage?.backToBlogLabel ?? '',
        startProjectLabel: next.blogPostPage?.startProjectLabel ?? '',
        articleSectionTitle: next.blogPostPage?.articleSectionTitle ?? '',
      }
      return next
    case 'blogPostPage.notFoundIntro':
      next.blogPostPage = {
        eyebrowPrefix: next.blogPostPage?.eyebrowPrefix ?? '',
        notFoundTitle: next.blogPostPage?.notFoundTitle ?? '',
        notFoundIntro: value,
        backToBlogLabel: next.blogPostPage?.backToBlogLabel ?? '',
        startProjectLabel: next.blogPostPage?.startProjectLabel ?? '',
        articleSectionTitle: next.blogPostPage?.articleSectionTitle ?? '',
      }
      return next
    case 'blogPostPage.backToBlogLabel':
      next.blogPostPage = {
        eyebrowPrefix: next.blogPostPage?.eyebrowPrefix ?? '',
        notFoundTitle: next.blogPostPage?.notFoundTitle ?? '',
        notFoundIntro: next.blogPostPage?.notFoundIntro ?? '',
        backToBlogLabel: value,
        startProjectLabel: next.blogPostPage?.startProjectLabel ?? '',
        articleSectionTitle: next.blogPostPage?.articleSectionTitle ?? '',
      }
      return next
    case 'blogPostPage.startProjectLabel':
      next.blogPostPage = {
        eyebrowPrefix: next.blogPostPage?.eyebrowPrefix ?? '',
        notFoundTitle: next.blogPostPage?.notFoundTitle ?? '',
        notFoundIntro: next.blogPostPage?.notFoundIntro ?? '',
        backToBlogLabel: next.blogPostPage?.backToBlogLabel ?? '',
        startProjectLabel: value,
        articleSectionTitle: next.blogPostPage?.articleSectionTitle ?? '',
      }
      return next
    case 'blogPostPage.articleSectionTitle':
      next.blogPostPage = {
        eyebrowPrefix: next.blogPostPage?.eyebrowPrefix ?? '',
        notFoundTitle: next.blogPostPage?.notFoundTitle ?? '',
        notFoundIntro: next.blogPostPage?.notFoundIntro ?? '',
        backToBlogLabel: next.blogPostPage?.backToBlogLabel ?? '',
        startProjectLabel: next.blogPostPage?.startProjectLabel ?? '',
        articleSectionTitle: value,
      }
      return next
    case 'projectDetailPage.notFoundTitle':
      next.projectDetailPage = { ...normalizeProjectDetailPage(next.projectDetailPage), notFoundTitle: value }
      return next
    case 'projectDetailPage.eyebrow':
      next.projectDetailPage = { ...normalizeProjectDetailPage(next.projectDetailPage), eyebrow: value }
      return next
    case 'projectDetailPage.notFoundIntro':
      next.projectDetailPage = { ...normalizeProjectDetailPage(next.projectDetailPage), notFoundIntro: value }
      return next
    case 'projectDetailPage.backToProjectsLabel':
      next.projectDetailPage = { ...normalizeProjectDetailPage(next.projectDetailPage), backToProjectsLabel: value }
      return next
    case 'projectDetailPage.startProjectLabel':
      next.projectDetailPage = { ...normalizeProjectDetailPage(next.projectDetailPage), startProjectLabel: value }
      return next
    case 'projectDetailPage.snapshotTitle':
      next.projectDetailPage = { ...normalizeProjectDetailPage(next.projectDetailPage), snapshotTitle: value }
      return next
    case 'projectDetailPage.roleLabel':
      next.projectDetailPage = { ...normalizeProjectDetailPage(next.projectDetailPage), roleLabel: value }
      return next
    case 'projectDetailPage.clientLabel':
      next.projectDetailPage = { ...normalizeProjectDetailPage(next.projectDetailPage), clientLabel: value }
      return next
    case 'projectDetailPage.yearLabel':
      next.projectDetailPage = { ...normalizeProjectDetailPage(next.projectDetailPage), yearLabel: value }
      return next
    case 'projectDetailPage.stackLabel':
      next.projectDetailPage = { ...normalizeProjectDetailPage(next.projectDetailPage), stackLabel: value }
      return next
    case 'projectDetailPage.stackAriaTemplate':
      next.projectDetailPage = { ...normalizeProjectDetailPage(next.projectDetailPage), stackAriaTemplate: value }
      return next
    case 'projectDetailPage.galleryTitle':
      next.projectDetailPage = { ...normalizeProjectDetailPage(next.projectDetailPage), galleryTitle: value }
      return next
    case 'projectDetailPage.galleryIntro':
      next.projectDetailPage = { ...normalizeProjectDetailPage(next.projectDetailPage), galleryIntro: value }
      return next
    case 'projectDetailPage.nextProjectEyebrow':
      next.projectDetailPage = { ...normalizeProjectDetailPage(next.projectDetailPage), nextProjectEyebrow: value }
      return next
    case 'projectDetailPage.nextProjectLabel':
      next.projectDetailPage = { ...normalizeProjectDetailPage(next.projectDetailPage), nextProjectLabel: value }
      return next
    case 'projectDetailPage.similarWorkEyebrow':
      next.projectDetailPage = { ...normalizeProjectDetailPage(next.projectDetailPage), similarWorkEyebrow: value }
      return next
    case 'projectDetailPage.similarWorkTitle':
      next.projectDetailPage = { ...normalizeProjectDetailPage(next.projectDetailPage), similarWorkTitle: value }
      return next
    case 'projectDetailPage.similarWorkIntro':
      next.projectDetailPage = { ...normalizeProjectDetailPage(next.projectDetailPage), similarWorkIntro: value }
      return next
    case 'projectDetailPage.similarWorkLabel':
      next.projectDetailPage = { ...normalizeProjectDetailPage(next.projectDetailPage), similarWorkLabel: value }
      return next
    case 'notFoundPage.eyebrow':
      next.notFoundPage = {
        eyebrow: value,
        title: next.notFoundPage?.title ?? '',
        intro: next.notFoundPage?.intro ?? '',
        suggestionsEyebrow: next.notFoundPage?.suggestionsEyebrow ?? '',
        viewProjectsLabel: next.notFoundPage?.viewProjectsLabel ?? '',
        backHomeLabel: next.notFoundPage?.backHomeLabel ?? '',
      }
      return next
    case 'notFoundPage.title':
      next.notFoundPage = {
        eyebrow: next.notFoundPage?.eyebrow ?? '',
        title: value,
        intro: next.notFoundPage?.intro ?? '',
        suggestionsEyebrow: next.notFoundPage?.suggestionsEyebrow ?? '',
        viewProjectsLabel: next.notFoundPage?.viewProjectsLabel ?? '',
        backHomeLabel: next.notFoundPage?.backHomeLabel ?? '',
      }
      return next
    case 'notFoundPage.intro':
      next.notFoundPage = {
        eyebrow: next.notFoundPage?.eyebrow ?? '',
        title: next.notFoundPage?.title ?? '',
        intro: value,
        suggestionsEyebrow: next.notFoundPage?.suggestionsEyebrow ?? '',
        viewProjectsLabel: next.notFoundPage?.viewProjectsLabel ?? '',
        backHomeLabel: next.notFoundPage?.backHomeLabel ?? '',
      }
      return next
    case 'notFoundPage.suggestionsEyebrow':
      next.notFoundPage = {
        eyebrow: next.notFoundPage?.eyebrow ?? '',
        title: next.notFoundPage?.title ?? '',
        intro: next.notFoundPage?.intro ?? '',
        suggestionsEyebrow: value,
        viewProjectsLabel: next.notFoundPage?.viewProjectsLabel ?? '',
        backHomeLabel: next.notFoundPage?.backHomeLabel ?? '',
      }
      return next
    case 'notFoundPage.viewProjectsLabel':
      next.notFoundPage = {
        eyebrow: next.notFoundPage?.eyebrow ?? '',
        title: next.notFoundPage?.title ?? '',
        intro: next.notFoundPage?.intro ?? '',
        suggestionsEyebrow: next.notFoundPage?.suggestionsEyebrow ?? '',
        viewProjectsLabel: value,
        backHomeLabel: next.notFoundPage?.backHomeLabel ?? '',
      }
      return next
    case 'notFoundPage.backHomeLabel':
      next.notFoundPage = {
        eyebrow: next.notFoundPage?.eyebrow ?? '',
        title: next.notFoundPage?.title ?? '',
        intro: next.notFoundPage?.intro ?? '',
        suggestionsEyebrow: next.notFoundPage?.suggestionsEyebrow ?? '',
        viewProjectsLabel: next.notFoundPage?.viewProjectsLabel ?? '',
        backHomeLabel: value,
      }
      return next
    default:
      return next
  }
}

const BLOG_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const PROJECT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const isContactHref = (value: string): boolean => {
  if (value.startsWith('mailto:')) return EMAIL_PATTERN.test(value.slice('mailto:'.length).trim())
  if (value.startsWith('tel:')) return value.slice('tel:'.length).trim().length > 0
  return isHttpUrl(value)
}

const isInternalPath = (value: string): boolean => value.startsWith('/')

const getSiteValidationState = (content: SiteContent | null, selectedProjectSlug: string): SiteValidationState => {
  if (!content) return {}

  const hasNonEmptyItems = (items: string[]): boolean => items.some((item) => item.trim())
  const getImageValidationError = (label: string, image?: { src: string; alt: string; caption?: string }): string | undefined => {
    if (!image) return undefined
    if (!image.src.trim() && ((image.alt ?? '').trim() || (image.caption ?? '').trim())) {
      return `${label} image src is required when image details are set.`
    }
    if (image.src.trim() && !image.alt.trim()) {
      return `${label} image alt text is required.`
    }
    return undefined
  }

  const getContactFormContentError = (label: string, form: SiteContent['home']['contact'] | SiteContent['contact']['form']): string | undefined => {
    if (!form.title.trim()) return `${label} title is required.`
    if (!form.submitLabel.trim()) return `${label} submit label is required.`
    if (!form.nameLabel.trim()) return `${label} name label is required.`
    if (!form.emailLabel.trim()) return `${label} email label is required.`
    if (!form.messageLabel.trim()) return `${label} message label is required.`
    if (!form.namePlaceholder.trim()) return `${label} name placeholder is required.`
    if (!form.emailPlaceholder.trim()) return `${label} email placeholder is required.`
    if (!form.messagePlaceholder.trim()) return `${label} message placeholder is required.`
    if (!form.nameRequiredError.trim()) return `${label} name-required error is required.`
    if (!form.emailRequiredError.trim()) return `${label} email-required error is required.`
    if (!form.emailInvalidError.trim()) return `${label} email-invalid error is required.`
    if (!form.messageRequiredError.trim()) return `${label} message-required error is required.`
    if (!form.mailtoSubjectTemplate.trim()) return `${label} mailto subject template is required.`
    if (!form.mailtoNameLabel.trim()) return `${label} mailto name label is required.`
    if (!form.mailtoEmailLabel.trim()) return `${label} mailto email label is required.`
    if (!form.mailtoMessageLabel.trim()) return `${label} mailto message label is required.`
    return undefined
  }

  const getProjectValidationError = (project: SiteContent['projects'][number] | null): string | undefined => {
    if (!project) return undefined
    if (!project.title.trim()) return 'Project title is required.'
    if (!project.year.trim()) return `Project year is required for ${project.slug || project.title || 'this project'}.`
    if (!project.client.trim()) return `Project client is required for ${project.slug || project.title || 'this project'}.`
    if (!project.summary.trim()) return `Project summary is required for ${project.slug || project.title || 'this project'}.`
    if (!project.role.trim()) return `Project role is required for ${project.slug || project.title || 'this project'}.`
    if (!project.challenge.trim()) return `Project challenge is required for ${project.slug || project.title || 'this project'}.`
    if (!project.stack.some((item) => item.trim())) return `Project stack must include at least one item for ${project.slug || project.title || 'this project'}.`
    if (!project.approach.some((item) => item.trim())) return `Project approach must include at least one item for ${project.slug || project.title || 'this project'}.`
    if (!project.outcome.some((item) => item.trim())) return `Project outcome must include at least one item for ${project.slug || project.title || 'this project'}.`
    if (!project.sections?.length) return `Project sections are required for ${project.slug || project.title || 'this project'}.`

    if (project.image) {
      if (!project.image.src.trim() && ((project.image.alt ?? '').trim() || (project.image.caption ?? '').trim())) {
        return `Project lead image src is required when image details are set for ${project.slug || project.title || 'this project'}.`
      }
      if (project.image.src.trim() && !project.image.alt.trim()) {
        return `Project lead image alt text is required for ${project.slug || project.title || 'this project'}.`
      }
    }

    const invalidGalleryItem = project.gallery?.find((item) => !item.src.trim() || !item.alt.trim())
    if (invalidGalleryItem) {
      return `Every project gallery image needs both src and alt text for ${project.slug || project.title || 'this project'}.`
    }

    const invalidSection = project.sections.find((section) => {
      if (!section.title.trim() || !section.body.trim()) return true
      if (!section.image) return false
      if (!section.image.src.trim() && ((section.image.alt ?? '').trim() || (section.image.caption ?? '').trim())) return true
      if (section.image.src.trim() && !section.image.alt.trim()) return true
      return false
    })
    if (invalidSection) {
      if (!invalidSection.title.trim()) return `Project sections need a title for ${project.slug || project.title || 'this project'}.`
      if (!invalidSection.body.trim()) return `Project sections need body copy for ${project.slug || project.title || 'this project'}.`
      return `Project section images need both src and alt text for ${project.slug || project.title || 'this project'}.`
    }

    return undefined
  }

  const slugCounts = new Map<string, number>()
  for (const project of content.projects) {
    slugCounts.set(project.slug, (slugCounts.get(project.slug) ?? 0) + 1)
  }

  const selectedProject = content.projects.find((project) => project.slug === selectedProjectSlug) ?? content.projects[0] ?? null
  const duplicateSlugs = [...slugCounts.entries()].filter(([, count]) => count > 1).map(([slug]) => slug)
  const missingFeatured = content.home.featuredProjects.slugs.filter((slug) => !slugCounts.has(slug))
  const invalidProjectSlug = content.projects.find((project) => !project.slug || !PROJECT_SLUG_PATTERN.test(project.slug))
  const invalidProjectContent = content.projects.find((project) => getProjectValidationError(project))

  const invalidSocial = content.site.socials.find((entry) => !entry.label.trim() || !isHttpUrl(entry.href.trim()))
  const invalidHeaderNav = content.siteChrome?.headerNav.find((entry) => !entry.label.trim() || !isInternalPath(entry.to.trim()))
  const invalidGeneralLink = content.siteChrome?.footer.generalLinks.find((entry) => !entry.label.trim() || !isInternalPath(entry.to.trim()))
  const invalidMoreLink = content.siteChrome?.footer.moreLinks.find((entry) => !entry.label.trim() || !isInternalPath(entry.to.trim()))
  const invalidMethod = content.contact.methods.find((entry) => !entry.title.trim() || !entry.label.trim() || !entry.description.trim() || !isContactHref(entry.href.trim()))
  const invalidHomeStat = content.home.stats.find((entry) => !entry.value.trim() || !entry.label.trim())
  const invalidProcessStep = content.about.process.find((entry) => !entry.title.trim() || !entry.description.trim())
  const invalidHighlight = content.resume.highlights.find((entry) => !entry.value.trim() || !entry.label.trim())
  const invalidExperience = content.resume.experience.find((entry) => !entry.role.trim() || !entry.company.trim() || !entry.period.trim() || !entry.highlights.some((item) => item.trim()))

  const homeMessageLimit = content.home.contact.messageLimit
  const contactMessageLimit = content.contact.form.messageLimit
  const projectsPage = content.projectsPage
  const blogPage = content.blogPage
  const blogPostPage = content.blogPostPage
  const projectDetailPage = content.projectDetailPage
  const notFoundPage = content.notFoundPage

  return {
    selectedProject: invalidProjectSlug
      ? `Project slug must use lowercase letters, numbers, and hyphens only. Check: ${invalidProjectSlug.slug || '(empty slug)'}.`
      : selectedProject && duplicateSlugs.includes(selectedProject.slug)
        ? `Project slug must be unique. Duplicate slug: ${selectedProject.slug}.`
          : duplicateSlugs[0]
            ? `Project slug must be unique. Duplicate slug: ${duplicateSlugs[0]}.`
            : selectedProject
              ? getProjectValidationError(selectedProject)
              : invalidProjectContent
                ? getProjectValidationError(invalidProjectContent)
          : undefined,
    featuredProjects: missingFeatured.length
      ? `Featured project slugs must match existing projects. Missing: ${missingFeatured.join(', ')}.`
      : undefined,
    site: !EMAIL_PATTERN.test(content.site.email.trim())
      ? 'Site email must use a valid email address.'
      : !content.site.name.trim()
        ? 'Site name is required.'
        : !content.site.tagline.trim()
          ? 'Site tagline is required.'
          : !content.site.description.trim()
            ? 'Site description is required.'
            : !content.site.location.trim()
              ? 'Site location is required.'
              : !isHttpUrl(content.site.siteUrl.trim())
                ? 'Site URL must use a full http or https URL.'
                : undefined,
    socials: invalidSocial
      ? `Social links must have a label and a full http or https URL. Check: ${invalidSocial.label || invalidSocial.href}.`
      : undefined,
    siteChrome: !content.siteChrome?.skipToContentLabel.trim()
      ? 'Skip link label is required.'
      : !content.siteChrome.headerNavAriaLabel.trim()
        ? 'Header nav aria label is required.'
        : !content.siteChrome.footerSocialsAriaLabel.trim()
          ? 'Footer socials aria label is required.'
          : !(content.siteChrome.headerNav?.length)
            ? 'Header nav needs at least one link.'
            : invalidHeaderNav
              ? `Header nav links must use internal paths that start with /. Check: ${invalidHeaderNav.to || invalidHeaderNav.label}.`
              : !content.siteChrome.footer.copyrightTemplate.trim()
                ? 'Footer copyright template is required.'
                : !content.siteChrome.footer.copyrightTemplate.includes('{year}') || !content.siteChrome.footer.copyrightTemplate.includes('{siteName}')
                  ? 'Footer copyright template must include both {year} and {siteName}.'
                  : !content.siteChrome.footer.generalHeading.trim()
                    ? 'Footer general heading is required.'
                    : !content.siteChrome.footer.moreHeading.trim()
                      ? 'Footer more heading is required.'
                      : !(content.siteChrome.footer.generalLinks?.length)
                        ? 'Footer general links need at least one link.'
                        : invalidGeneralLink
                          ? `Footer general links must use internal paths that start with /. Check: ${invalidGeneralLink.to || invalidGeneralLink.label}.`
                          : !(content.siteChrome.footer.moreLinks?.length)
                            ? 'Footer more links need at least one link.'
                            : invalidMoreLink
                              ? `Footer more links must use internal paths that start with /. Check: ${invalidMoreLink.to || invalidMoreLink.label}.`
                              : undefined,
    homePage: !content.home.hero.eyebrow.trim()
      ? 'Home hero eyebrow is required.'
      : !hasNonEmptyItems(content.home.hero.titleLines)
        ? 'Home hero title needs at least one line.'
        : !content.home.hero.description.trim()
          ? 'Home hero description is required.'
          : !content.home.cta.primaryLabel.trim()
            ? 'Home primary CTA label is required.'
            : !content.home.featuredProjects.title.trim()
              ? 'Featured projects title is required.'
              : !content.home.bio.eyebrow.trim()
                ? 'Home bio eyebrow is required.'
                : !hasNonEmptyItems(content.home.bio.titleLines)
                  ? 'Home bio title needs at least one line.'
                  : !content.home.bio.description.trim()
                    ? 'Home bio description is required.'
                    : invalidHomeStat
                      ? `Home stats need both value and label. Check: ${invalidHomeStat.label || invalidHomeStat.value || 'empty stat'}.`
                      : !content.home.skills.title.trim()
                        ? 'Home skills title is required.'
                        : !content.home.skills.description.trim()
                          ? 'Home skills description is required.'
                          : !hasNonEmptyItems(content.home.skills.items)
                            ? 'Home skills need at least one item.'
                            : getContactFormContentError('Home contact form', content.home.contact),
    homeContact: !Number.isInteger(homeMessageLimit) || homeMessageLimit <= 0
      ? 'Home contact message limit must be a whole number greater than 0.'
      : !content.home.contact.messageCountTemplate.includes('{count}') || !content.home.contact.messageCountTemplate.includes('{limit}')
        ? 'Home contact count template must include both {count} and {limit}.'
        : !content.home.contact.messageTooLongError.includes('{limit}')
          ? 'Home contact message-too-long error must include {limit}.'
          : undefined,
    aboutPage: !content.about.title.trim()
      ? 'About page title is required.'
      : !content.about.intro.trim()
        ? 'About page intro is required.'
        : !content.about.bodySectionTitle.trim()
          ? 'About body section title is required.'
          : !content.about.processSectionTitle.trim()
            ? 'About process section title is required.'
            : !content.about.processSectionIntro.trim()
              ? 'About process section intro is required.'
              : !content.about.principlesSectionTitle.trim()
                ? 'About principles section title is required.'
                : !content.about.toolsSectionTitle.trim()
                  ? 'About tools section title is required.'
                  : !hasNonEmptyItems(content.about.body)
                    ? 'About body needs at least one paragraph.'
                    : !hasNonEmptyItems(content.about.principles)
                      ? 'About principles need at least one item.'
                      : invalidProcessStep
                        ? `About process steps need both title and description. Check: ${invalidProcessStep.title || invalidProcessStep.description || 'empty step'}.`
                        : !hasNonEmptyItems(content.about.tools)
                          ? 'About tools need at least one item.'
                          : getImageValidationError('About hero', content.about.heroImage),
    resumePage: !content.resume.headline.trim()
      ? 'Resume headline is required.'
      : !content.resume.summary.trim()
        ? 'Resume summary is required.'
        : !content.resume.highlightsSectionTitle.trim()
          ? 'Resume highlights section title is required.'
          : !content.resume.skillsSectionTitle.trim()
            ? 'Resume skills section title is required.'
            : !content.resume.experienceSectionTitle.trim()
              ? 'Resume experience section title is required.'
              : invalidHighlight
                ? `Resume highlights need both value and label. Check: ${invalidHighlight.label || invalidHighlight.value || 'empty highlight'}.`
                : !hasNonEmptyItems(content.resume.skills)
                  ? 'Resume skills need at least one item.'
                  : invalidExperience
                    ? `Resume experience entries need role, company, period, and at least one highlight. Check: ${invalidExperience.role || invalidExperience.company || 'empty experience'}.`
                    : getImageValidationError('Resume hero', content.resume.heroImage),
    contactPage: !content.contact.title.trim()
      ? 'Contact page title is required.'
      : !content.contact.body.trim()
        ? 'Contact page intro is required.'
        : !content.contact.availabilityTitle.trim()
          ? 'Contact availability title is required.'
          : !content.contact.availabilityStatusLabel.trim()
            ? 'Contact availability status label is required.'
            : !content.contact.availabilityLocationLabel.trim()
              ? 'Contact availability location label is required.'
              : !content.contact.availability.trim()
                ? 'Contact availability body is required.'
                : !content.contact.formSectionTitle.trim()
                  ? 'Contact form section title is required.'
                  : !content.contact.formSectionIntro.trim()
                    ? 'Contact form section intro is required.'
                    : !content.contact.methodsSectionTitle.trim()
                      ? 'Contact methods section title is required.'
                      : !content.contact.methodsSectionIntro.trim()
                        ? 'Contact methods section intro is required.'
                        : getContactFormContentError('Contact form', content.contact.form)
                          ?? getImageValidationError('Contact hero', content.contact.heroImage),
    contactForm: !Number.isInteger(contactMessageLimit) || contactMessageLimit <= 0
      ? 'Contact form message limit must be a whole number greater than 0.'
      : !content.contact.form.messageCountTemplate.includes('{count}') || !content.contact.form.messageCountTemplate.includes('{limit}')
        ? 'Contact form count template must include both {count} and {limit}.'
        : !content.contact.form.messageTooLongError.includes('{limit}')
          ? 'Contact form message-too-long error must include {limit}.'
          : undefined,
    contactMethods: invalidMethod
      ? `Contact methods must have title, label, description, and a valid mailto, tel, or http/https URL. Check: ${invalidMethod.title || invalidMethod.href}.`
      : undefined,
    projectsPage: !projectsPage?.title.trim()
      ? 'Projects page title is required.'
      : !projectsPage.intro.trim()
        ? 'Projects page intro is required.'
        : getImageValidationError('Projects page hero', projectsPage.heroImage),
    blogPage: !blogPage?.title.trim()
      ? 'Blog page title is required.'
      : !blogPage.intro.trim()
        ? 'Blog page intro is required.'
        : getImageValidationError('Blog page hero', blogPage.heroImage),
    blogPostPage: !blogPostPage?.eyebrowPrefix.trim()
      ? 'Blog post eyebrow prefix is required.'
      : !blogPostPage.notFoundTitle.trim()
        ? 'Blog post not-found title is required.'
        : !blogPostPage.notFoundIntro.trim()
          ? 'Blog post not-found intro is required.'
          : !blogPostPage.backToBlogLabel.trim()
            ? 'Blog post back-to-blog label is required.'
            : !blogPostPage.startProjectLabel.trim()
              ? 'Blog post start-project label is required.'
              : !blogPostPage.articleSectionTitle.trim()
                ? 'Blog post article section title is required.'
                : undefined,
    projectDetailPage: !projectDetailPage?.notFoundTitle.trim()
      ? 'Project detail not-found title is required.'
      : !projectDetailPage.notFoundIntro.trim()
        ? 'Project detail not-found intro is required.'
        : !projectDetailPage.backToProjectsLabel.trim()
          ? 'Project detail back-to-projects label is required.'
          : !projectDetailPage.startProjectLabel.trim()
            ? 'Project detail start-project label is required.'
            : !projectDetailPage.snapshotTitle.trim()
              ? 'Project detail snapshot title is required.'
              : !projectDetailPage.roleLabel.trim()
                ? 'Project detail role label is required.'
                : !projectDetailPage.clientLabel.trim()
                  ? 'Project detail client label is required.'
                  : !projectDetailPage.yearLabel.trim()
                    ? 'Project detail year label is required.'
                    : !projectDetailPage.stackLabel.trim()
                      ? 'Project detail stack label is required.'
                      : !projectDetailPage.stackAriaTemplate.trim()
                        ? 'Project detail stack aria template is required.'
                        : !projectDetailPage.galleryTitle.trim()
                          ? 'Project detail gallery title is required.'
                          : !projectDetailPage.galleryIntro.trim()
                            ? 'Project detail gallery intro is required.'
                            : !projectDetailPage.nextProjectEyebrow.trim()
                              ? 'Project detail next-project eyebrow is required.'
                              : !projectDetailPage.nextProjectLabel.trim()
                                ? 'Project detail next-project label is required.'
                                : !projectDetailPage.similarWorkEyebrow.trim()
                                  ? 'Project detail similar-work eyebrow is required.'
                                  : !projectDetailPage.similarWorkTitle.trim()
                                    ? 'Project detail similar-work title is required.'
                                    : !projectDetailPage.similarWorkIntro.trim()
                                      ? 'Project detail similar-work intro is required.'
                                      : !projectDetailPage.similarWorkLabel.trim()
                                        ? 'Project detail similar-work label is required.'
                                        : undefined,
    notFoundPage: !notFoundPage?.eyebrow.trim()
      ? '404 page eyebrow is required.'
      : !notFoundPage.title.trim()
        ? '404 page title is required.'
        : !notFoundPage.intro.trim()
          ? '404 page intro is required.'
          : !notFoundPage.suggestionsEyebrow.trim()
            ? '404 page suggestions eyebrow is required.'
            : !notFoundPage.viewProjectsLabel.trim()
              ? '404 page view-projects label is required.'
              : !notFoundPage.backHomeLabel.trim()
                ? '404 page back-home label is required.'
                : undefined,
  }
}

const BLOG_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const getBlogValidationError = (
  post: BlogPostResponse | null,
  existingPosts: BlogPostMeta[],
): string | null => {
  if (!post) return null
  if (!post.title.trim()) {
    return 'Blog title is required.'
  }
  if (!post.body.trim()) {
    return 'Blog body is required.'
  }
  if (!post.slug || !BLOG_SLUG_PATTERN.test(post.slug)) {
    return 'Blog slug must use lowercase letters, numbers, and hyphens only.'
  }
  if (!BLOG_DATE_PATTERN.test(post.date)) {
    return 'Blog date must use the YYYY-MM-DD format.'
  }
  if (post.coverImage?.trim() && !post.coverAlt?.trim()) {
    return 'Cover alt text is required when a blog cover image is set.'
  }
  if (!post.coverImage?.trim() && post.coverAlt?.trim()) {
    return 'Cover image is required when cover alt text is set.'
  }
  if (post.status === 'published' && !post.excerpt?.trim()) {
    return 'Published blog posts require an excerpt.'
  }
  const conflictingSlugPost = existingPosts.find((entry) => entry.slug === post.slug && entry.sha !== post.sha)
  if (conflictingSlugPost) {
    return `Blog slug must be unique. Another post already uses slug "${post.slug}".`
  }
  const candidatePath = buildBlogPostPath(post.date, post.slug)
  const conflictingPost = existingPosts.find((entry) => entry.path === candidatePath && entry.sha !== post.sha)
  if (conflictingPost) {
    return `Another blog post already exists at ${candidatePath}. Change the slug or date before saving.`
  }
  return null
}

const getMediaValidationError = (file: File | null): string | null => {
  if (!file) return null
  if (!(ALLOWED_MEDIA_TYPES as readonly string[]).includes(file.type)) {
    return 'Unsupported media type. Use png, jpg, webp, gif, or svg.'
  }
  if (file.size > MAX_MEDIA_FILE_BYTES) {
    return 'Media file is too large. Maximum size is 5 MB.'
  }
  return null
}

const updateBlogPost = (post: BlogPostResponse, field: string, value: string): BlogPostResponse => {
  const next = structuredClone(post)

  switch (field) {
    case 'title':
      next.title = value
      return next
    case 'slug': {
      const normalizedSlug = normalizeSlug(value)
      next.slug = normalizedSlug
      next.path = buildBlogPostPath(next.date, normalizedSlug || 'draft')
      return next
    }
    case 'date':
      next.date = value
      next.path = buildBlogPostPath(value, next.slug || 'draft')
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

const getAuthMessageFromUrl = (): { kind: 'error' | 'success'; message: string } | null => {
  const hash = window.location.hash
  const queryIndex = hash.indexOf('?')
  if (queryIndex === -1) return null

  const params = new URLSearchParams(hash.slice(queryIndex + 1))
  const auth = params.get('auth')
  if (!auth) return null

  const kind = auth === 'success' ? 'success' : 'error'
  const message = auth === 'success' ? 'GitHub login successful.' : 'GitHub login failed.'
  const nextHash = hash.slice(0, queryIndex) || '#/'
  window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}${nextHash}`)
  return { kind, message }
}

const getAdminUrlState = () => {
  const params = new URLSearchParams(window.location.search)

  return {
    blogSlug: normalizeSlug(params.get('post') ?? ''),
    projectSlug: normalizeSlug(params.get('project') ?? ''),
  }
}

const syncAdminUrlState = (nextState: { blogSlug?: string | null; projectSlug?: string | null }) => {
  const url = new URL(window.location.href)

  if (nextState.blogSlug !== undefined) {
    const nextBlogSlug = normalizeSlug(nextState.blogSlug ?? '')
    if (nextBlogSlug) {
      url.searchParams.set('post', nextBlogSlug)
    } else {
      url.searchParams.delete('post')
    }
  }

  if (nextState.projectSlug !== undefined) {
    const nextProjectSlug = normalizeSlug(nextState.projectSlug ?? '')
    if (nextProjectSlug) {
      url.searchParams.set('project', nextProjectSlug)
    } else {
      url.searchParams.delete('project')
    }
  }

  const nextSearch = url.searchParams.toString()
  const nextUrl = `${url.pathname}${nextSearch ? `?${nextSearch}` : ''}${url.hash}`
  window.history.replaceState({}, document.title, nextUrl)
}

const getUnsavedChangesSummary = (dirty: boolean, blogDirty: boolean): string => {
  if (dirty && blogDirty) return 'Site content and blog edits'
  if (dirty) return 'Site content only'
  if (blogDirty) return 'Blog edits only'
  return 'No'
}

const getLogoutDiscardMessage = (dirty: boolean, blogDirty: boolean): string => {
  if (dirty && blogDirty) return 'You have unsaved site content and blog edits. Log out and discard them?'
  if (dirty) return 'You have unsaved site content changes. Log out and discard them?'
  return 'You have unsaved blog edits. Log out and discard them?'
}

export const App = () => {
  const initialAuthMessage = getAuthMessageFromUrl()
  const initialUrlState = getAdminUrlState()
  const [session, setSession] = useState<AdminSession>(DEFAULT_SESSION)
  const [siteContent, setSiteContent] = useState<SiteContentResponse | null>(null)
  const [workingCopy, setWorkingCopy] = useState<SiteContent | null>(null)
  const [blogList, setBlogList] = useState<BlogListResponse | null>(null)
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string>(initialUrlState.blogSlug)
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogDetailResponse | null>(null)
  const [selectedBlogBaseline, setSelectedBlogBaseline] = useState<BlogPostResponse | null>(null)
  const [selectedProjectSlug, setSelectedProjectSlug] = useState<string>(initialUrlState.projectSlug)
  const [selectedProjectGalleryIndex, setSelectedProjectGalleryIndex] = useState(0)
  const [selectedHomeStatIndex, setSelectedHomeStatIndex] = useState(0)
  const [selectedHomeHeroTitleLineIndex, setSelectedHomeHeroTitleLineIndex] = useState(0)
  const [selectedFeaturedProjectSlugIndex, setSelectedFeaturedProjectSlugIndex] = useState(0)
  const [selectedHomeBioTitleLineIndex, setSelectedHomeBioTitleLineIndex] = useState(0)
  const [selectedHomeSkillItemIndex, setSelectedHomeSkillItemIndex] = useState(0)
  const [selectedSocialIndex, setSelectedSocialIndex] = useState(0)
  const [selectedHeaderNavIndex, setSelectedHeaderNavIndex] = useState(0)
  const [selectedFooterGeneralLinkIndex, setSelectedFooterGeneralLinkIndex] = useState(0)
  const [selectedFooterMoreLinkIndex, setSelectedFooterMoreLinkIndex] = useState(0)
  const [selectedAboutBodyIndex, setSelectedAboutBodyIndex] = useState(0)
  const [selectedAboutPrincipleIndex, setSelectedAboutPrincipleIndex] = useState(0)
  const [selectedAboutToolIndex, setSelectedAboutToolIndex] = useState(0)
  const [selectedProcessIndex, setSelectedProcessIndex] = useState(0)
  const [selectedHighlightIndex, setSelectedHighlightIndex] = useState(0)
  const [selectedResumeSkillIndex, setSelectedResumeSkillIndex] = useState(0)
  const [selectedExperienceIndex, setSelectedExperienceIndex] = useState(0)
  const [selectedExperienceHighlightIndex, setSelectedExperienceHighlightIndex] = useState(0)
  const [selectedMethodIndex, setSelectedMethodIndex] = useState(0)
  const [selectedProjectStackIndex, setSelectedProjectStackIndex] = useState(0)
  const [selectedProjectApproachIndex, setSelectedProjectApproachIndex] = useState(0)
  const [selectedProjectOutcomeIndex, setSelectedProjectOutcomeIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingContent, setLoadingContent] = useState(false)
  const [loadingBlog, setLoadingBlog] = useState(false)
  const [loadingActivity, setLoadingActivity] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savingBlog, setSavingBlog] = useState(false)
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [mediaArea, setMediaArea] = useState(DEFAULT_MEDIA_AREA)
  const [mediaSlug, setMediaSlug] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaFileInputKey, setMediaFileInputKey] = useState(0)
  const [mediaResult, setMediaResult] = useState<MediaUploadResponse | null>(null)
  const [mediaTarget, setMediaTarget] = useState<MediaTargetSelection | null>(null)
  const [error, setError] = useState<string | null>(initialAuthMessage?.kind === 'error' ? initialAuthMessage.message : null)
  const [authStatus, setAuthStatus] = useState<string | null>(initialAuthMessage?.kind === 'success' ? initialAuthMessage.message : null)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [blogStatus, setBlogStatus] = useState<string | null>(null)
  const [mediaStatus, setMediaStatus] = useState<string | null>(null)
  const [siteConflict, setSiteConflict] = useState<ConflictState>(null)
  const [blogConflict, setBlogConflict] = useState<ConflictState>(null)
  const [blogActivity, setBlogActivity] = useState<BlogActivity>(null)
  const [activity, setActivity] = useState<AdminActivityResponse | null>(null)
  const [activityError, setActivityError] = useState<string | null>(null)
  const [activityLoadedAt, setActivityLoadedAt] = useState<string | null>(null)

  const resetAuthenticatedState = useCallback((nextError: string | null) => {
    setSession(DEFAULT_SESSION)
    setSiteContent(null)
    setWorkingCopy(null)
    setBlogList(null)
    setSelectedBlogSlug('')
    setSelectedBlogPost(null)
    setSelectedBlogBaseline(null)
    setMediaArea(DEFAULT_MEDIA_AREA)
    setMediaSlug('')
    setMediaFile(null)
    setMediaFileInputKey((current) => current + 1)
    setMediaResult(null)
    setMediaTarget(null)
    setSaveStatus(null)
    setBlogStatus(null)
    setMediaStatus(null)
    setSiteConflict(null)
    setBlogConflict(null)
    setBlogActivity(null)
    setActivity(null)
    setActivityError(null)
    setActivityLoadedAt(null)
    setAuthStatus(null)
    setError(nextError)
  }, [])

  const getApiErrorMessage = useCallback((error: unknown, fallback: string) => {
    return error instanceof Error && error.message ? error.message : fallback
  }, [])

  const handleUnauthorizedError = useCallback((error: unknown, fallback: string) => {
    const apiError = error as AdminApiError
    if (apiError.status !== 401) return false

    resetAuthenticatedState(apiError.message || fallback)
    return true
  }, [resetAuthenticatedState])

  const loadSiteContent = useCallback(async () => {
    setLoadingContent(true)

    try {
      const response = await adminApi.getSiteContent()
      const nextProjectSlug = getResetProjectSelectionSlug(response.content.projects, selectedProjectSlug)
      setSiteContent(response)
      setWorkingCopy(structuredClone(response.content))
      setSelectedProjectSlug(nextProjectSlug)
      setMediaSlug((current) => (
        nextProjectSlug
          ? syncActiveProjectMediaSlug(current, mediaArea, selectedProjectSlug, nextProjectSlug)
          : syncClearedProjectMediaSlug(current, mediaArea, selectedProjectSlug)
      ))
      setMediaTarget((current) => (
        syncResetProjectMediaTarget(current, response.content.projects, selectedProjectSlug, nextProjectSlug)
      ))
      setSelectedProjectGalleryIndex(0)
      setSelectedHomeStatIndex(0)
      setSelectedHomeHeroTitleLineIndex(0)
      setSelectedFeaturedProjectSlugIndex(0)
      setSelectedHomeBioTitleLineIndex(0)
      setSelectedHomeSkillItemIndex(0)
      setSelectedSocialIndex(0)
      setSelectedHeaderNavIndex(0)
      setSelectedFooterGeneralLinkIndex(0)
      setSelectedFooterMoreLinkIndex(0)
      setSelectedAboutBodyIndex(0)
      setSelectedAboutPrincipleIndex(0)
      setSelectedAboutToolIndex(0)
      setSelectedProcessIndex(0)
      setSelectedHighlightIndex(0)
      setSelectedResumeSkillIndex(0)
      setSelectedExperienceIndex(0)
      setSelectedExperienceHighlightIndex(0)
      setSelectedMethodIndex(0)
      setSelectedProjectStackIndex(0)
      setSelectedProjectApproachIndex(0)
      setSelectedProjectOutcomeIndex(0)
      setError(null)
      setAuthStatus(null)
      setSaveStatus(null)
      setSiteConflict(null)
    } catch (loadError) {
      if (handleUnauthorizedError(loadError, 'Your admin session expired. Sign in again.')) return
      setSiteContent(null)
      setWorkingCopy(null)
      setSelectedProjectSlug('')
      setMediaSlug((current) => syncClearedProjectMediaSlug(current, mediaArea, selectedProjectSlug))
      setMediaTarget((current) => syncResetProjectMediaTarget(current, [], selectedProjectSlug, ''))
      setAuthStatus(null)
      setSaveStatus(null)
      setSiteConflict(null)
      setError(getApiErrorMessage(loadError, 'Failed to load site content.'))
    } finally {
      setLoadingContent(false)
    }
  }, [getApiErrorMessage, handleUnauthorizedError, mediaArea, selectedProjectSlug])

  const loadActivity = useCallback(async () => {
    setLoadingActivity(true)
    setActivityError(null)

    try {
      const response = await adminApi.getActivity()
      setActivity(response)
      setActivityLoadedAt(new Date().toISOString())
      setActivityError(null)
    } catch (loadError) {
      if (handleUnauthorizedError(loadError, 'Your admin session expired. Sign in again.')) return
      setActivityError(getApiErrorMessage(loadError, 'Failed to load recent activity.'))
    } finally {
      setLoadingActivity(false)
    }
  }, [getApiErrorMessage, handleUnauthorizedError])

  const loadBlogPost = useCallback(async (slug: string) => {
    if (!slug) {
      setSelectedBlogSlug('')
      setSelectedBlogPost(null)
      setSelectedBlogBaseline(null)
      setMediaSlug((current) => syncClearedBlogMediaSlug(current, mediaArea, selectedBlogSlug))
      setMediaTarget((current) => (current && current.kind === 'blog' ? null : current))
      return
    }

    setLoadingBlog(true)

    try {
      const response = await adminApi.getBlogPost(slug)
      setSelectedBlogPost(response)
      setSelectedBlogBaseline(structuredClone(response.post))
      setSelectedBlogSlug(response.post.slug)
      setMediaArea('blog')
      setMediaSlug((current) => syncEnteredBlogMediaSlug(current, mediaArea, mediaTarget, selectedBlogSlug, response.post.slug))
      setMediaTarget((current) => (
        current && current.kind === 'blog'
          ? syncResetBlogMediaTarget(current, selectedBlogSlug, response.post)
          : null
      ))
      setBlogStatus(null)
      setBlogConflict(null)
      setError(null)
      setAuthStatus(null)
    } catch (loadError) {
      if (handleUnauthorizedError(loadError, 'Your admin session expired. Sign in again.')) return
      setSelectedBlogSlug('')
      setSelectedBlogPost(null)
      setSelectedBlogBaseline(null)
      setMediaSlug((current) => syncClearedBlogMediaSlug(current, mediaArea, selectedBlogSlug))
      setMediaTarget((current) => (current && current.kind === 'blog' ? null : current))
      setAuthStatus(null)
      setBlogStatus(null)
      setBlogConflict(null)
      setError(getApiErrorMessage(loadError, 'Failed to load blog post.'))
    } finally {
      setLoadingBlog(false)
    }
  }, [getApiErrorMessage, handleUnauthorizedError, mediaArea, mediaTarget, selectedBlogSlug])

  const loadBlogList = useCallback(async (preferredSlug?: string) => {
    try {
      const response = await adminApi.getBlogPosts()
      setBlogList(response)
      setAuthStatus(null)
      const requestedSlug = preferredSlug ?? selectedBlogSlug
      const nextSlug = (requestedSlug && response.posts.some((post) => post.slug === requestedSlug)
        ? requestedSlug
        : response.posts[0]?.slug) ?? ''
      if (nextSlug) {
        await loadBlogPost(nextSlug)
      } else {
        setSelectedBlogSlug('')
        setSelectedBlogPost(null)
        setSelectedBlogBaseline(null)
        setMediaSlug((current) => syncClearedBlogMediaSlug(current, mediaArea, selectedBlogSlug))
        setMediaTarget((current) => (current && current.kind === 'blog' ? null : current))
      }
    } catch (loadError) {
      if (handleUnauthorizedError(loadError, 'Your admin session expired. Sign in again.')) return
      setBlogList(null)
      setSelectedBlogSlug('')
      setSelectedBlogPost(null)
      setSelectedBlogBaseline(null)
      setMediaSlug((current) => syncClearedBlogMediaSlug(current, mediaArea, selectedBlogSlug))
      setMediaTarget((current) => (current && current.kind === 'blog' ? null : current))
      setAuthStatus(null)
      setBlogStatus(null)
      setBlogConflict(null)
      setError(getApiErrorMessage(loadError, 'Failed to load blog posts.'))
    }
  }, [getApiErrorMessage, handleUnauthorizedError, loadBlogPost, mediaArea, selectedBlogSlug])

  const loadSession = useCallback(async () => {
    setLoading(true)

    try {
      const currentSession = await adminApi.getSession()
      setSession(currentSession)

      if (currentSession.authenticated) {
        await Promise.all([loadSiteContent(), loadBlogList(), loadActivity()])
      } else {
        resetAuthenticatedState(null)
      }
    } catch (sessionError) {
      resetAuthenticatedState(getApiErrorMessage(sessionError, 'Failed to load session.'))
    } finally {
      setLoading(false)
    }
  }, [getApiErrorMessage, loadActivity, loadBlogList, loadSiteContent, resetAuthenticatedState])

  useEffect(() => {
    void loadSession()
  }, [loadSession])

  useEffect(() => {
    syncAdminUrlState({
      blogSlug: selectedBlogSlug || null,
      projectSlug: selectedProjectSlug || null,
    })
  }, [selectedBlogSlug, selectedProjectSlug])

  const confirmDiscardChanges = useCallback((message: string) => {
    return window.confirm(message)
  }, [])

  const handleLogin = () => {
    window.location.href = '/api/admin/auth/start'
  }

  const handleLogout = async () => {
    if ((dirty || blogDirty) && !confirmDiscardChanges(getLogoutDiscardMessage(dirty, blogDirty))) {
      return
    }

    try {
      await adminApi.logout()
      resetAuthenticatedState(null)
    } catch (logoutError) {
      setError(getApiErrorMessage(logoutError, 'Failed to log out.'))
    }
  }

  const handleFieldChange = useCallback((field: string, value: string) => {
    setWorkingCopy((current) => (current ? updateWorkingCopy(current, field, value) : current))
    setSaveStatus(null)
    setSiteConflict(null)
    setError(null)
    setAuthStatus(null)
  }, [])

  const handleDiscardSiteChanges = useCallback(() => {
    if (!siteContent) return
    if (!confirmDiscardChanges('Discard unsaved content changes and restore the last loaded site content?')) return

    const nextProjectSlug = getResetProjectSelectionSlug(siteContent.content.projects, selectedProjectSlug)
    setWorkingCopy(structuredClone(siteContent.content))
    setSelectedProjectSlug(nextProjectSlug)
    setMediaSlug((current) => (
      nextProjectSlug
        ? syncActiveProjectMediaSlug(current, mediaArea, selectedProjectSlug, nextProjectSlug)
        : syncClearedProjectMediaSlug(current, mediaArea, selectedProjectSlug)
    ))
    setMediaTarget((current) => (
      syncResetProjectMediaTarget(current, siteContent.content.projects, selectedProjectSlug, nextProjectSlug)
    ))
    setSelectedProjectGalleryIndex(0)
    setSelectedHomeStatIndex(0)
    setSelectedHomeHeroTitleLineIndex(0)
    setSelectedFeaturedProjectSlugIndex(0)
    setSelectedHomeBioTitleLineIndex(0)
    setSelectedHomeSkillItemIndex(0)
    setSelectedSocialIndex(0)
    setSelectedHeaderNavIndex(0)
    setSelectedFooterGeneralLinkIndex(0)
    setSelectedFooterMoreLinkIndex(0)
    setSelectedAboutBodyIndex(0)
    setSelectedAboutPrincipleIndex(0)
    setSelectedAboutToolIndex(0)
    setSelectedProcessIndex(0)
    setSelectedHighlightIndex(0)
    setSelectedResumeSkillIndex(0)
    setSelectedExperienceIndex(0)
    setSelectedExperienceHighlightIndex(0)
    setSelectedMethodIndex(0)
    setSelectedProjectStackIndex(0)
    setSelectedProjectApproachIndex(0)
    setSelectedProjectOutcomeIndex(0)
    setSaveStatus(null)
    setSiteConflict(null)
    setError(null)
    setAuthStatus(null)
  }, [confirmDiscardChanges, mediaArea, selectedProjectSlug, siteContent])

  const handleDiscardBlogChanges = useCallback(() => {
    if (!selectedBlogPost) return

    const isUnsavedLocalDraft = !selectedBlogPost.post.sha
    const message = isUnsavedLocalDraft
      ? 'Discard this unsaved local draft and return to saved blog posts?'
      : 'Discard unsaved blog edits and restore the last loaded post state?'
    if (!confirmDiscardChanges(message)) return

    if (isUnsavedLocalDraft) {
      const fallbackSlug = blogList?.posts[0]?.slug ?? ''
      setSelectedBlogSlug(fallbackSlug)
      setSelectedBlogPost(null)
      setSelectedBlogBaseline(null)
      setMediaSlug((current) => (
        fallbackSlug
          ? syncEnteredBlogMediaSlug(current, mediaArea, mediaTarget, selectedBlogSlug, fallbackSlug)
          : syncClearedBlogMediaSlug(current, mediaArea, selectedBlogSlug)
      ))
      setMediaTarget((current) => (current && current.kind === 'blog' && !fallbackSlug ? null : current))
      setBlogStatus(null)
      setBlogConflict(null)
      setError(null)
      setAuthStatus(null)
      if (fallbackSlug) {
        void loadBlogPost(fallbackSlug)
      }
      return
    }

    if (!selectedBlogBaseline) return

    setSelectedBlogPost((current) => (current ? { ...current, post: structuredClone(selectedBlogBaseline) } : current))
    setSelectedBlogSlug(selectedBlogBaseline.slug)
    setMediaSlug((current) => syncActiveBlogMediaSlug(current, mediaArea, selectedBlogSlug, selectedBlogBaseline.slug))
    setMediaTarget((current) => syncResetBlogMediaTarget(current, selectedBlogSlug, selectedBlogBaseline))
    setBlogStatus(null)
    setBlogConflict(null)
    setError(null)
    setAuthStatus(null)
  }, [blogList?.posts, confirmDiscardChanges, loadBlogPost, mediaArea, mediaTarget, selectedBlogBaseline, selectedBlogPost, selectedBlogSlug])

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
        case 'homeHeroTitleLine':
          if (index === undefined) return next
          next.home.hero.titleLines = updateRecordAtIndex(next.home.hero.titleLines, index, () => value)
          return next
        case 'featuredProjectSlug':
          if (index === undefined) return next
          next.home.featuredProjects.slugs = updateRecordAtIndex(next.home.featuredProjects.slugs, index, () => normalizeSlug(value))
          return next
        case 'homeBioTitleLine':
          if (index === undefined) return next
          next.home.bio.titleLines = updateRecordAtIndex(next.home.bio.titleLines, index, () => value)
          return next
        case 'homeSkillItem':
          if (index === undefined) return next
          next.home.skills.items = updateRecordAtIndex(next.home.skills.items, index, () => value)
          return next
        case 'headerNav':
          if (index === undefined || !next.siteChrome) return next
          next.siteChrome.headerNav = updateRecordAtIndex(next.siteChrome.headerNav, index, (item) => ({
            ...item,
            [field]: value,
          }))
          return next
        case 'footerGeneralLink':
          if (index === undefined || !next.siteChrome) return next
          next.siteChrome.footer.generalLinks = updateRecordAtIndex(next.siteChrome.footer.generalLinks, index, (item) => ({
            ...item,
            [field]: value,
          }))
          return next
        case 'footerMoreLink':
          if (index === undefined || !next.siteChrome) return next
          next.siteChrome.footer.moreLinks = updateRecordAtIndex(next.siteChrome.footer.moreLinks, index, (item) => ({
            ...item,
            [field]: value,
          }))
          return next
        case 'aboutBody':
          if (index === undefined) return next
          next.about.body = updateRecordAtIndex(next.about.body, index, () => value)
          return next
        case 'aboutPrinciple':
          if (index === undefined) return next
          next.about.principles = updateRecordAtIndex(next.about.principles, index, () => value)
          return next
        case 'aboutTool':
          if (index === undefined) return next
          next.about.tools = updateRecordAtIndex(next.about.tools, index, () => value)
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
        case 'resumeSkill':
          if (index === undefined) return next
          next.resume.skills = updateRecordAtIndex(next.resume.skills, index, () => value)
          return next
        case 'experienceHighlight':
          if (index === undefined) return next
          next.resume.experience = updateRecordAtIndex(next.resume.experience, selectedExperienceIndex, (item) => ({
            ...item,
            highlights: updateRecordAtIndex(item.highlights, index, () => value),
          }))
          return next
        case 'heroImage': {
          const target = field.split('.')[0] as 'about' | 'resume' | 'contact' | 'projectsPage' | 'blogPage'
          const property = field.split('.')[1] as 'src' | 'alt' | 'caption'
          if (target === 'projectsPage') {
            next.projectsPage = {
              eyebrow: next.projectsPage?.eyebrow ?? '',
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
              eyebrow: next.blogPage?.eyebrow ?? '',
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
          const currentProject = next.projects[projectIndex]
          const nextValue =
            field === 'slug'
              ? normalizeSlug(value) || currentProject.slug
              : field === 'stack' || field === 'approach' || field === 'outcome'
                ? splitLines(value)
                : value
          next.projects = updateRecordAtIndex(next.projects, projectIndex, (project) => ({
            ...project,
            [field]: nextValue,
          }))
          if (field === 'slug' && typeof nextValue === 'string' && nextValue !== currentProject.slug) {
            setSelectedProjectSlug(nextValue)
            setMediaSlug((current) => syncActiveProjectMediaSlug(current, mediaArea, currentProject.slug, nextValue))
            setMediaTarget((current) => (
              current && current.area === 'projects' && current.slug === currentProject.slug
                ? retargetProjectMediaSelection(current, nextValue, currentProject.title)
                : current
            ))
          }
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
              ...(field.startsWith('image.')
                ? {
                    image: {
                      ...(section.image ?? { src: '', alt: '' }),
                      [field.slice(6)]: value || (field.endsWith('caption') ? undefined : ''),
                    },
                  }
                : {
                    [field]: field === 'kind' ? normalizeProjectSectionKind(value) : value,
                  }),
            })),
          }))
          return next
        }
        case 'projectStack': {
          if (index === undefined || !selectedProjectSlug) return next
          const projectIndex = next.projects.findIndex((project) => project.slug === selectedProjectSlug)
          if (projectIndex === -1) return next
          next.projects = updateRecordAtIndex(next.projects, projectIndex, (project) => ({
            ...project,
            stack: updateRecordAtIndex(project.stack, index, () => value),
          }))
          return next
        }
        case 'projectApproach': {
          if (index === undefined || !selectedProjectSlug) return next
          const projectIndex = next.projects.findIndex((project) => project.slug === selectedProjectSlug)
          if (projectIndex === -1) return next
          next.projects = updateRecordAtIndex(next.projects, projectIndex, (project) => ({
            ...project,
            approach: updateRecordAtIndex(project.approach, index, () => value),
          }))
          return next
        }
        case 'projectOutcome': {
          if (index === undefined || !selectedProjectSlug) return next
          const projectIndex = next.projects.findIndex((project) => project.slug === selectedProjectSlug)
          if (projectIndex === -1) return next
          next.projects = updateRecordAtIndex(next.projects, projectIndex, (project) => ({
            ...project,
            outcome: updateRecordAtIndex(project.outcome, index, () => value),
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
  }, [mediaArea, selectedProjectSlug])

  const handleStructuredAdd = useCallback((scope: string) => {
    setWorkingCopy((current) => {
      if (!current) return current

      const next = structuredClone(current)

      switch (scope) {
        case 'social':
          next.site.socials.push({ label: 'New social', href: 'https://' })
          setSelectedSocialIndex(next.site.socials.length - 1)
          return next
        case 'homeHeroTitleLine':
          next.home.hero.titleLines.push('New title line')
          setSelectedHomeHeroTitleLineIndex(next.home.hero.titleLines.length - 1)
          return next
        case 'featuredProjectSlug':
          next.home.featuredProjects.slugs.push(next.projects[0]?.slug ?? 'project-slug')
          setSelectedFeaturedProjectSlugIndex(next.home.featuredProjects.slugs.length - 1)
          return next
        case 'homeBioTitleLine':
          next.home.bio.titleLines.push('New title line')
          setSelectedHomeBioTitleLineIndex(next.home.bio.titleLines.length - 1)
          return next
        case 'homeSkillItem':
          next.home.skills.items.push('New skill')
          setSelectedHomeSkillItemIndex(next.home.skills.items.length - 1)
          return next
        case 'headerNav':
          if (!next.siteChrome) return next
          next.siteChrome.headerNav.push({ to: '/', label: 'New nav link' })
          setSelectedHeaderNavIndex(next.siteChrome.headerNav.length - 1)
          return next
        case 'footerGeneralLink':
          if (!next.siteChrome) return next
          next.siteChrome.footer.generalLinks.push({ to: '/', label: 'New footer link' })
          setSelectedFooterGeneralLinkIndex(next.siteChrome.footer.generalLinks.length - 1)
          return next
        case 'footerMoreLink':
          if (!next.siteChrome) return next
          next.siteChrome.footer.moreLinks.push({ to: '/', label: 'New footer link' })
          setSelectedFooterMoreLinkIndex(next.siteChrome.footer.moreLinks.length - 1)
          return next
        case 'aboutBody':
          next.about.body.push('New paragraph')
          setSelectedAboutBodyIndex(next.about.body.length - 1)
          return next
        case 'aboutPrinciple':
          next.about.principles.push('New principle')
          setSelectedAboutPrincipleIndex(next.about.principles.length - 1)
          return next
        case 'aboutTool':
          next.about.tools.push('New tool')
          setSelectedAboutToolIndex(next.about.tools.length - 1)
          return next
        case 'process':
          next.about.process.push({ title: 'New step', description: '' })
          setSelectedProcessIndex(next.about.process.length - 1)
          return next
        case 'highlight':
          next.resume.highlights.push({ value: '0', label: 'New highlight' })
          setSelectedHighlightIndex(next.resume.highlights.length - 1)
          return next
        case 'resumeSkill':
          next.resume.skills.push('New skill')
          setSelectedResumeSkillIndex(next.resume.skills.length - 1)
          return next
        case 'experienceHighlight':
          if (!next.resume.experience[selectedExperienceIndex]) return next
          next.resume.experience[selectedExperienceIndex].highlights.push('New highlight')
          setSelectedExperienceHighlightIndex(next.resume.experience[selectedExperienceIndex].highlights.length - 1)
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
          const starterProject = createEmptyProject(next.projects)
          const nextProjectSlug = starterProject.slug
          next.projects.push(starterProject)
          setSelectedProjectSlug(nextProjectSlug)
          setSelectedProjectGalleryIndex(0)
          setMediaSlug((current) => (
            syncEnteredProjectMediaSlug(current, mediaArea, mediaTarget, selectedProjectSlug, nextProjectSlug)
          ))
          setMediaTarget((current) => (
            current && current.area === 'projects' && current.slug !== nextProjectSlug ? null : current
          ))
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
          next.projects[projectIndex].sections = [...(next.projects[projectIndex].sections ?? []), { kind: 'default', title: 'New section', body: '', image: { src: '', alt: '', caption: '' } }]
          return next
        }
        case 'projectStack': {
          if (!selectedProjectSlug) return next
          const projectIndex = next.projects.findIndex((project) => project.slug === selectedProjectSlug)
          if (projectIndex === -1) return next
          next.projects[projectIndex].stack.push('New stack item')
          setSelectedProjectStackIndex(next.projects[projectIndex].stack.length - 1)
          return next
        }
        case 'projectApproach': {
          if (!selectedProjectSlug) return next
          const projectIndex = next.projects.findIndex((project) => project.slug === selectedProjectSlug)
          if (projectIndex === -1) return next
          next.projects[projectIndex].approach.push('New approach bullet')
          setSelectedProjectApproachIndex(next.projects[projectIndex].approach.length - 1)
          return next
        }
        case 'projectOutcome': {
          if (!selectedProjectSlug) return next
          const projectIndex = next.projects.findIndex((project) => project.slug === selectedProjectSlug)
          if (projectIndex === -1) return next
          next.projects[projectIndex].outcome.push('New outcome bullet')
          setSelectedProjectOutcomeIndex(next.projects[projectIndex].outcome.length - 1)
          return next
        }
        default:
          return next
      }
    })
    setSaveStatus(null)
    setSiteConflict(null)
    setError(null)
  }, [mediaArea, mediaTarget, selectedProjectSlug])

  const handleStructuredDuplicate = useCallback((scope: string, index?: number) => {
    setWorkingCopy((current) => {
      if (!current) return current

      const next = structuredClone(current)

      switch (scope) {
        case 'social':
          if (index === undefined) return next
          next.site.socials.splice(index + 1, 0, structuredClone(next.site.socials[index]))
          setSelectedSocialIndex(index + 1)
          return next
        case 'homeHeroTitleLine':
          if (index === undefined) return next
          next.home.hero.titleLines.splice(index + 1, 0, structuredClone(next.home.hero.titleLines[index]))
          setSelectedHomeHeroTitleLineIndex(index + 1)
          return next
        case 'featuredProjectSlug':
          if (index === undefined) return next
          next.home.featuredProjects.slugs.splice(index + 1, 0, structuredClone(next.home.featuredProjects.slugs[index]))
          setSelectedFeaturedProjectSlugIndex(index + 1)
          return next
        case 'homeBioTitleLine':
          if (index === undefined) return next
          next.home.bio.titleLines.splice(index + 1, 0, structuredClone(next.home.bio.titleLines[index]))
          setSelectedHomeBioTitleLineIndex(index + 1)
          return next
        case 'homeSkillItem':
          if (index === undefined) return next
          next.home.skills.items.splice(index + 1, 0, structuredClone(next.home.skills.items[index]))
          setSelectedHomeSkillItemIndex(index + 1)
          return next
        case 'headerNav':
          if (index === undefined || !next.siteChrome?.headerNav[index]) return next
          next.siteChrome.headerNav.splice(index + 1, 0, structuredClone(next.siteChrome.headerNav[index]))
          setSelectedHeaderNavIndex(index + 1)
          return next
        case 'footerGeneralLink':
          if (index === undefined || !next.siteChrome?.footer.generalLinks[index]) return next
          next.siteChrome.footer.generalLinks.splice(index + 1, 0, structuredClone(next.siteChrome.footer.generalLinks[index]))
          setSelectedFooterGeneralLinkIndex(index + 1)
          return next
        case 'footerMoreLink':
          if (index === undefined || !next.siteChrome?.footer.moreLinks[index]) return next
          next.siteChrome.footer.moreLinks.splice(index + 1, 0, structuredClone(next.siteChrome.footer.moreLinks[index]))
          setSelectedFooterMoreLinkIndex(index + 1)
          return next
        case 'aboutBody':
          if (index === undefined) return next
          next.about.body.splice(index + 1, 0, structuredClone(next.about.body[index]))
          setSelectedAboutBodyIndex(index + 1)
          return next
        case 'aboutPrinciple':
          if (index === undefined) return next
          next.about.principles.splice(index + 1, 0, structuredClone(next.about.principles[index]))
          setSelectedAboutPrincipleIndex(index + 1)
          return next
        case 'aboutTool':
          if (index === undefined) return next
          next.about.tools.splice(index + 1, 0, structuredClone(next.about.tools[index]))
          setSelectedAboutToolIndex(index + 1)
          return next
        case 'process':
          if (index === undefined) return next
          next.about.process.splice(index + 1, 0, structuredClone(next.about.process[index]))
          setSelectedProcessIndex(index + 1)
          return next
        case 'highlight':
          if (index === undefined) return next
          next.resume.highlights.splice(index + 1, 0, structuredClone(next.resume.highlights[index]))
          setSelectedHighlightIndex(index + 1)
          return next
        case 'resumeSkill':
          if (index === undefined) return next
          next.resume.skills.splice(index + 1, 0, structuredClone(next.resume.skills[index]))
          setSelectedResumeSkillIndex(index + 1)
          return next
        case 'experienceHighlight':
          if (index === undefined || !next.resume.experience[selectedExperienceIndex]?.highlights[index]) return next
          next.resume.experience[selectedExperienceIndex].highlights.splice(index + 1, 0, structuredClone(next.resume.experience[selectedExperienceIndex].highlights[index]))
          setSelectedExperienceHighlightIndex(index + 1)
          return next
        case 'homeStat':
          if (index === undefined) return next
          next.home.stats.splice(index + 1, 0, structuredClone(next.home.stats[index]))
          setSelectedHomeStatIndex(index + 1)
          return next
        case 'experience':
          if (index === undefined) return next
          next.resume.experience.splice(index + 1, 0, structuredClone(next.resume.experience[index]))
          setSelectedExperienceIndex(index + 1)
          return next
        case 'method':
          if (index === undefined) return next
          next.contact.methods.splice(index + 1, 0, structuredClone(next.contact.methods[index]))
          setSelectedMethodIndex(index + 1)
          return next
        case 'projectGallery': {
          if (index === undefined || !selectedProjectSlug) return next
          const projectIndex = next.projects.findIndex((project) => project.slug === selectedProjectSlug)
          if (projectIndex === -1) return next
          const gallery = next.projects[projectIndex].gallery ?? []
          if (!gallery[index]) return next
          gallery.splice(index + 1, 0, structuredClone(gallery[index]))
          next.projects[projectIndex].gallery = gallery
          setSelectedProjectGalleryIndex(index + 1)
          return next
        }
        case 'projectSection': {
          if (index === undefined || !selectedProjectSlug) return next
          const projectIndex = next.projects.findIndex((project) => project.slug === selectedProjectSlug)
          if (projectIndex === -1) return next
          const sections = next.projects[projectIndex].sections ?? []
          if (!sections[index]) return next
          sections.splice(index + 1, 0, structuredClone(sections[index]))
          next.projects[projectIndex].sections = sections
          return next
        }
        case 'projectStack': {
          if (index === undefined || !selectedProjectSlug) return next
          const projectIndex = next.projects.findIndex((project) => project.slug === selectedProjectSlug)
          if (projectIndex === -1 || !next.projects[projectIndex].stack[index]) return next
          next.projects[projectIndex].stack.splice(index + 1, 0, structuredClone(next.projects[projectIndex].stack[index]))
          setSelectedProjectStackIndex(index + 1)
          return next
        }
        case 'projectApproach': {
          if (index === undefined || !selectedProjectSlug) return next
          const projectIndex = next.projects.findIndex((project) => project.slug === selectedProjectSlug)
          if (projectIndex === -1 || !next.projects[projectIndex].approach[index]) return next
          next.projects[projectIndex].approach.splice(index + 1, 0, structuredClone(next.projects[projectIndex].approach[index]))
          setSelectedProjectApproachIndex(index + 1)
          return next
        }
        case 'projectOutcome': {
          if (index === undefined || !selectedProjectSlug) return next
          const projectIndex = next.projects.findIndex((project) => project.slug === selectedProjectSlug)
          if (projectIndex === -1 || !next.projects[projectIndex].outcome[index]) return next
          next.projects[projectIndex].outcome.splice(index + 1, 0, structuredClone(next.projects[projectIndex].outcome[index]))
          setSelectedProjectOutcomeIndex(index + 1)
          return next
        }
        default:
          return next
      }
    })
    setSaveStatus(null)
    setSiteConflict(null)
    setError(null)
    setAuthStatus(null)
  }, [selectedProjectSlug])

  const handleStructuredRemove = useCallback((scope: string, index?: number) => {
    const confirmMessageByScope: Record<string, string> = {
      social: 'Remove this social link?',
      homeHeroTitleLine: 'Remove this home hero title line?',
      featuredProjectSlug: 'Remove this featured project slug?',
      homeBioTitleLine: 'Remove this home bio title line?',
      homeSkillItem: 'Remove this home skill item?',
      headerNav: 'Remove this header navigation link?',
      footerGeneralLink: 'Remove this footer general link?',
      footerMoreLink: 'Remove this footer more link?',
      aboutBody: 'Remove this about body paragraph?',
      aboutPrinciple: 'Remove this principle?',
      aboutTool: 'Remove this tool?',
      process: 'Remove this process step?',
      highlight: 'Remove this highlight card?',
      resumeSkill: 'Remove this resume skill?',
      experienceHighlight: 'Remove this experience highlight?',
      homeStat: 'Remove this home stat card?',
      experience: 'Remove this experience entry?',
      method: 'Remove this contact method?',
      project: 'Remove this project from site content?',
      projectGallery: 'Remove this gallery image?',
      projectSection: 'Remove this project section?',
      projectStack: 'Remove this stack item?',
      projectApproach: 'Remove this approach bullet?',
      projectOutcome: 'Remove this outcome bullet?',
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
        case 'homeHeroTitleLine':
          if (index === undefined || next.home.hero.titleLines.length <= 1) return next
          next.home.hero.titleLines.splice(index, 1)
          setSelectedHomeHeroTitleLineIndex(Math.max(0, Math.min(index, next.home.hero.titleLines.length - 1)))
          return next
        case 'featuredProjectSlug':
          if (index === undefined || next.home.featuredProjects.slugs.length <= 1) return next
          next.home.featuredProjects.slugs.splice(index, 1)
          setSelectedFeaturedProjectSlugIndex(Math.max(0, Math.min(index, next.home.featuredProjects.slugs.length - 1)))
          return next
        case 'homeBioTitleLine':
          if (index === undefined || next.home.bio.titleLines.length <= 1) return next
          next.home.bio.titleLines.splice(index, 1)
          setSelectedHomeBioTitleLineIndex(Math.max(0, Math.min(index, next.home.bio.titleLines.length - 1)))
          return next
        case 'homeSkillItem':
          if (index === undefined || next.home.skills.items.length <= 1) return next
          next.home.skills.items.splice(index, 1)
          setSelectedHomeSkillItemIndex(Math.max(0, Math.min(index, next.home.skills.items.length - 1)))
          return next
        case 'headerNav':
          if (index === undefined || (next.siteChrome?.headerNav.length ?? 0) <= 1) return next
          next.siteChrome?.headerNav.splice(index, 1)
          setSelectedHeaderNavIndex(Math.max(0, Math.min(index, (next.siteChrome?.headerNav.length ?? 1) - 1)))
          return next
        case 'footerGeneralLink':
          if (index === undefined || (next.siteChrome?.footer.generalLinks.length ?? 0) <= 1) return next
          next.siteChrome?.footer.generalLinks.splice(index, 1)
          setSelectedFooterGeneralLinkIndex(Math.max(0, Math.min(index, (next.siteChrome?.footer.generalLinks.length ?? 1) - 1)))
          return next
        case 'footerMoreLink':
          if (index === undefined || (next.siteChrome?.footer.moreLinks.length ?? 0) <= 1) return next
          next.siteChrome?.footer.moreLinks.splice(index, 1)
          setSelectedFooterMoreLinkIndex(Math.max(0, Math.min(index, (next.siteChrome?.footer.moreLinks.length ?? 1) - 1)))
          return next
        case 'aboutBody':
          if (index === undefined || next.about.body.length <= 1) return next
          next.about.body.splice(index, 1)
          setSelectedAboutBodyIndex(Math.max(0, Math.min(index, next.about.body.length - 1)))
          return next
        case 'aboutPrinciple':
          if (index === undefined || next.about.principles.length <= 1) return next
          next.about.principles.splice(index, 1)
          setSelectedAboutPrincipleIndex(Math.max(0, Math.min(index, next.about.principles.length - 1)))
          return next
        case 'aboutTool':
          if (index === undefined || next.about.tools.length <= 1) return next
          next.about.tools.splice(index, 1)
          setSelectedAboutToolIndex(Math.max(0, Math.min(index, next.about.tools.length - 1)))
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
        case 'resumeSkill':
          if (index === undefined || next.resume.skills.length <= 1) return next
          next.resume.skills.splice(index, 1)
          setSelectedResumeSkillIndex(Math.max(0, Math.min(index, next.resume.skills.length - 1)))
          return next
        case 'experienceHighlight':
          if (index === undefined || (next.resume.experience[selectedExperienceIndex]?.highlights.length ?? 0) <= 1) return next
          next.resume.experience[selectedExperienceIndex].highlights.splice(index, 1)
          setSelectedExperienceHighlightIndex(Math.max(0, Math.min(index, next.resume.experience[selectedExperienceIndex].highlights.length - 1)))
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
          const removedProjectSlug = next.projects[projectIndex].slug
          next.projects.splice(projectIndex, 1)
          const fallbackProjectSlug = next.projects[Math.max(0, Math.min(projectIndex, next.projects.length - 1))]?.slug ?? ''
          setSelectedProjectSlug(fallbackProjectSlug)
          setSelectedProjectGalleryIndex(0)
          setMediaSlug((current) => (
            fallbackProjectSlug
              ? syncEnteredProjectMediaSlug(current, mediaArea, mediaTarget, removedProjectSlug, fallbackProjectSlug)
              : syncClearedProjectMediaSlug(current, mediaArea, removedProjectSlug)
          ))
          setMediaTarget((current) => (
            syncResetProjectMediaTarget(current, next.projects, removedProjectSlug, fallbackProjectSlug)
          ))
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
        case 'projectStack': {
          if (index === undefined || !selectedProjectSlug) return next
          const projectIndex = next.projects.findIndex((project) => project.slug === selectedProjectSlug)
          if (projectIndex === -1 || next.projects[projectIndex].stack.length <= 1) return next
          next.projects[projectIndex].stack.splice(index, 1)
          setSelectedProjectStackIndex(Math.max(0, Math.min(index, next.projects[projectIndex].stack.length - 1)))
          return next
        }
        case 'projectApproach': {
          if (index === undefined || !selectedProjectSlug) return next
          const projectIndex = next.projects.findIndex((project) => project.slug === selectedProjectSlug)
          if (projectIndex === -1 || next.projects[projectIndex].approach.length <= 1) return next
          next.projects[projectIndex].approach.splice(index, 1)
          setSelectedProjectApproachIndex(Math.max(0, Math.min(index, next.projects[projectIndex].approach.length - 1)))
          return next
        }
        case 'projectOutcome': {
          if (index === undefined || !selectedProjectSlug) return next
          const projectIndex = next.projects.findIndex((project) => project.slug === selectedProjectSlug)
          if (projectIndex === -1 || next.projects[projectIndex].outcome.length <= 1) return next
          next.projects[projectIndex].outcome.splice(index, 1)
          setSelectedProjectOutcomeIndex(Math.max(0, Math.min(index, next.projects[projectIndex].outcome.length - 1)))
          return next
        }
        default:
          return next
      }
    })
    setSaveStatus(null)
    setSiteConflict(null)
    setError(null)
  }, [confirmDiscardChanges, mediaArea, mediaTarget, selectedProjectSlug])

  const handleStructuredMove = useCallback((scope: string, direction: 'up' | 'down', index?: number) => {
    setWorkingCopy((current) => {
      if (!current) return current

      const next = structuredClone(current)

      const resolveNextIndex = (length: number, currentIndex: number) => {
        if (length <= 1) return currentIndex
        if (direction === 'up') return Math.max(0, currentIndex - 1)
        return Math.min(length - 1, currentIndex + 1)
      }

      switch (scope) {
        case 'social': {
          if (index === undefined) return next
          const nextIndex = resolveNextIndex(next.site.socials.length, index)
          if (nextIndex === index) return next
          next.site.socials = moveArrayItem(next.site.socials, index, nextIndex)
          setSelectedSocialIndex(nextIndex)
          return next
        }
        case 'homeHeroTitleLine': {
          if (index === undefined) return next
          const nextIndex = resolveNextIndex(next.home.hero.titleLines.length, index)
          if (nextIndex === index) return next
          next.home.hero.titleLines = moveArrayItem(next.home.hero.titleLines, index, nextIndex)
          setSelectedHomeHeroTitleLineIndex(nextIndex)
          return next
        }
        case 'featuredProjectSlug': {
          if (index === undefined) return next
          const nextIndex = resolveNextIndex(next.home.featuredProjects.slugs.length, index)
          if (nextIndex === index) return next
          next.home.featuredProjects.slugs = moveArrayItem(next.home.featuredProjects.slugs, index, nextIndex)
          setSelectedFeaturedProjectSlugIndex(nextIndex)
          return next
        }
        case 'homeBioTitleLine': {
          if (index === undefined) return next
          const nextIndex = resolveNextIndex(next.home.bio.titleLines.length, index)
          if (nextIndex === index) return next
          next.home.bio.titleLines = moveArrayItem(next.home.bio.titleLines, index, nextIndex)
          setSelectedHomeBioTitleLineIndex(nextIndex)
          return next
        }
        case 'homeSkillItem': {
          if (index === undefined) return next
          const nextIndex = resolveNextIndex(next.home.skills.items.length, index)
          if (nextIndex === index) return next
          next.home.skills.items = moveArrayItem(next.home.skills.items, index, nextIndex)
          setSelectedHomeSkillItemIndex(nextIndex)
          return next
        }
        case 'headerNav': {
          if (index === undefined || !next.siteChrome) return next
          const nextIndex = resolveNextIndex(next.siteChrome.headerNav.length, index)
          if (nextIndex === index) return next
          next.siteChrome.headerNav = moveArrayItem(next.siteChrome.headerNav, index, nextIndex)
          setSelectedHeaderNavIndex(nextIndex)
          return next
        }
        case 'footerGeneralLink': {
          if (index === undefined || !next.siteChrome) return next
          const nextIndex = resolveNextIndex(next.siteChrome.footer.generalLinks.length, index)
          if (nextIndex === index) return next
          next.siteChrome.footer.generalLinks = moveArrayItem(next.siteChrome.footer.generalLinks, index, nextIndex)
          setSelectedFooterGeneralLinkIndex(nextIndex)
          return next
        }
        case 'footerMoreLink': {
          if (index === undefined || !next.siteChrome) return next
          const nextIndex = resolveNextIndex(next.siteChrome.footer.moreLinks.length, index)
          if (nextIndex === index) return next
          next.siteChrome.footer.moreLinks = moveArrayItem(next.siteChrome.footer.moreLinks, index, nextIndex)
          setSelectedFooterMoreLinkIndex(nextIndex)
          return next
        }
        case 'aboutBody': {
          if (index === undefined) return next
          const nextIndex = resolveNextIndex(next.about.body.length, index)
          if (nextIndex === index) return next
          next.about.body = moveArrayItem(next.about.body, index, nextIndex)
          setSelectedAboutBodyIndex(nextIndex)
          return next
        }
        case 'aboutPrinciple': {
          if (index === undefined) return next
          const nextIndex = resolveNextIndex(next.about.principles.length, index)
          if (nextIndex === index) return next
          next.about.principles = moveArrayItem(next.about.principles, index, nextIndex)
          setSelectedAboutPrincipleIndex(nextIndex)
          return next
        }
        case 'aboutTool': {
          if (index === undefined) return next
          const nextIndex = resolveNextIndex(next.about.tools.length, index)
          if (nextIndex === index) return next
          next.about.tools = moveArrayItem(next.about.tools, index, nextIndex)
          setSelectedAboutToolIndex(nextIndex)
          return next
        }
        case 'process': {
          if (index === undefined) return next
          const nextIndex = resolveNextIndex(next.about.process.length, index)
          if (nextIndex === index) return next
          next.about.process = moveArrayItem(next.about.process, index, nextIndex)
          setSelectedProcessIndex(nextIndex)
          return next
        }
        case 'highlight': {
          if (index === undefined) return next
          const nextIndex = resolveNextIndex(next.resume.highlights.length, index)
          if (nextIndex === index) return next
          next.resume.highlights = moveArrayItem(next.resume.highlights, index, nextIndex)
          setSelectedHighlightIndex(nextIndex)
          return next
        }
        case 'resumeSkill': {
          if (index === undefined) return next
          const nextIndex = resolveNextIndex(next.resume.skills.length, index)
          if (nextIndex === index) return next
          next.resume.skills = moveArrayItem(next.resume.skills, index, nextIndex)
          setSelectedResumeSkillIndex(nextIndex)
          return next
        }
        case 'experienceHighlight': {
          if (index === undefined) return next
          const highlights = next.resume.experience[selectedExperienceIndex]?.highlights ?? []
          const nextIndex = resolveNextIndex(highlights.length, index)
          if (nextIndex === index || !next.resume.experience[selectedExperienceIndex]) return next
          next.resume.experience[selectedExperienceIndex].highlights = moveArrayItem(highlights, index, nextIndex)
          setSelectedExperienceHighlightIndex(nextIndex)
          return next
        }
        case 'homeStat': {
          if (index === undefined) return next
          const nextIndex = resolveNextIndex(next.home.stats.length, index)
          if (nextIndex === index) return next
          next.home.stats = moveArrayItem(next.home.stats, index, nextIndex)
          setSelectedHomeStatIndex(nextIndex)
          return next
        }
        case 'experience': {
          if (index === undefined) return next
          const nextIndex = resolveNextIndex(next.resume.experience.length, index)
          if (nextIndex === index) return next
          next.resume.experience = moveArrayItem(next.resume.experience, index, nextIndex)
          setSelectedExperienceIndex(nextIndex)
          return next
        }
        case 'method': {
          if (index === undefined) return next
          const nextIndex = resolveNextIndex(next.contact.methods.length, index)
          if (nextIndex === index) return next
          next.contact.methods = moveArrayItem(next.contact.methods, index, nextIndex)
          setSelectedMethodIndex(nextIndex)
          return next
        }
        case 'project': {
          if (!selectedProjectSlug) return next
          const currentIndex = next.projects.findIndex((project) => project.slug === selectedProjectSlug)
          if (currentIndex === -1) return next
          const nextIndex = resolveNextIndex(next.projects.length, currentIndex)
          if (nextIndex === currentIndex) return next
          next.projects = moveArrayItem(next.projects, currentIndex, nextIndex)
          setSelectedProjectSlug(next.projects[nextIndex].slug)
          return next
        }
        case 'projectGallery': {
          if (index === undefined || !selectedProjectSlug) return next
          const projectIndex = next.projects.findIndex((project) => project.slug === selectedProjectSlug)
          if (projectIndex === -1) return next
          const gallery = next.projects[projectIndex].gallery ?? []
          const nextIndex = resolveNextIndex(gallery.length, index)
          if (nextIndex === index) return next
          next.projects[projectIndex].gallery = moveArrayItem(gallery, index, nextIndex)
          setSelectedProjectGalleryIndex(nextIndex)
          return next
        }
        case 'projectSection': {
          if (index === undefined || !selectedProjectSlug) return next
          const projectIndex = next.projects.findIndex((project) => project.slug === selectedProjectSlug)
          if (projectIndex === -1) return next
          const sections = next.projects[projectIndex].sections ?? []
          const nextIndex = resolveNextIndex(sections.length, index)
          if (nextIndex === index) return next
          next.projects[projectIndex].sections = moveArrayItem(sections, index, nextIndex)
          return next
        }
        case 'projectStack': {
          if (index === undefined || !selectedProjectSlug) return next
          const projectIndex = next.projects.findIndex((project) => project.slug === selectedProjectSlug)
          if (projectIndex === -1) return next
          const nextIndex = resolveNextIndex(next.projects[projectIndex].stack.length, index)
          if (nextIndex === index) return next
          next.projects[projectIndex].stack = moveArrayItem(next.projects[projectIndex].stack, index, nextIndex)
          setSelectedProjectStackIndex(nextIndex)
          return next
        }
        case 'projectApproach': {
          if (index === undefined || !selectedProjectSlug) return next
          const projectIndex = next.projects.findIndex((project) => project.slug === selectedProjectSlug)
          if (projectIndex === -1) return next
          const nextIndex = resolveNextIndex(next.projects[projectIndex].approach.length, index)
          if (nextIndex === index) return next
          next.projects[projectIndex].approach = moveArrayItem(next.projects[projectIndex].approach, index, nextIndex)
          setSelectedProjectApproachIndex(nextIndex)
          return next
        }
        case 'projectOutcome': {
          if (index === undefined || !selectedProjectSlug) return next
          const projectIndex = next.projects.findIndex((project) => project.slug === selectedProjectSlug)
          if (projectIndex === -1) return next
          const nextIndex = resolveNextIndex(next.projects[projectIndex].outcome.length, index)
          if (nextIndex === index) return next
          next.projects[projectIndex].outcome = moveArrayItem(next.projects[projectIndex].outcome, index, nextIndex)
          setSelectedProjectOutcomeIndex(nextIndex)
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

  const dirty = useMemo(() => {
    if (!siteContent || !workingCopy) return false
    return JSON.stringify(siteContent.content) !== JSON.stringify(workingCopy)
  }, [siteContent, workingCopy])

  const siteValidation = useMemo(() => getSiteValidationState(workingCopy, selectedProjectSlug), [selectedProjectSlug, workingCopy])
  const siteValidationError = siteValidation.selectedProject
    ?? siteValidation.featuredProjects
    ?? siteValidation.site
    ?? siteValidation.socials
    ?? siteValidation.siteChrome
    ?? siteValidation.homePage
    ?? siteValidation.homeContact
    ?? siteValidation.aboutPage
    ?? siteValidation.resumePage
    ?? siteValidation.contactPage
    ?? siteValidation.contactForm
    ?? siteValidation.contactMethods
    ?? siteValidation.projectsPage
    ?? siteValidation.blogPage
    ?? siteValidation.blogPostPage
    ?? siteValidation.projectDetailPage
    ?? siteValidation.notFoundPage
    ?? null

  const handleSave = useCallback(async () => {
    if (!siteContent || !workingCopy || siteValidationError) return

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

      const nextProjectSlug = getResetProjectSelectionSlug(response.content.projects, selectedProjectSlug)
      setSiteContent(response)
      setWorkingCopy(structuredClone(response.content))
      setSelectedProjectSlug(nextProjectSlug)
      setMediaSlug((current) => (
        nextProjectSlug
          ? syncActiveProjectMediaSlug(current, mediaArea, selectedProjectSlug, nextProjectSlug)
          : syncClearedProjectMediaSlug(current, mediaArea, selectedProjectSlug)
      ))
      setMediaTarget((current) => (
        syncResetProjectMediaTarget(current, response.content.projects, selectedProjectSlug, nextProjectSlug)
      ))
      void loadActivity()
      setSaveStatus(`Saved site content to ${response.branch} at ${response.latestCommitSha ?? response.sha}.`)
    } catch (saveError) {
      const apiError = saveError as AdminApiError
      if (handleUnauthorizedError(saveError, 'Your admin session expired. Sign in again.')) return
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
  }, [handleUnauthorizedError, loadActivity, mediaArea, selectedProjectSlug, siteContent, siteValidationError, workingCopy])

  const handleBlogFieldChange = useCallback((field: string, value: string) => {
    setSelectedBlogPost((current) => {
      if (!current) return current
      const post = updateBlogPost(current.post, field, value)
      if (field === 'slug') {
        setMediaSlug((currentSlug) => syncActiveBlogMediaSlug(currentSlug, mediaArea, current.post.slug, post.slug))
        setMediaTarget((activeTarget) => (
          activeTarget && activeTarget.kind === 'blog' && activeTarget.slug === current.post.slug
            ? retargetBlogMediaSelection(activeTarget, post.slug, post.title)
            : activeTarget
        ))
      }
      return { ...current, post }
    })
    setBlogStatus(null)
    setBlogConflict(null)
    setError(null)
    setAuthStatus(null)
  }, [mediaArea])

  const blogDirty = useMemo(() => {
    if (!selectedBlogPost) return false
    if (!selectedBlogPost.post.sha) return true
    if (!selectedBlogBaseline) return false
    return JSON.stringify(selectedBlogBaseline) !== JSON.stringify(selectedBlogPost.post)
  }, [selectedBlogBaseline, selectedBlogPost])

  const blogValidationError = useMemo(
    () => getBlogValidationError(selectedBlogPost?.post ?? null, blogList?.posts ?? []),
    [blogList?.posts, selectedBlogPost],
  )
  const mediaValidationError = useMemo(() => getMediaValidationError(mediaFile), [mediaFile])
  const normalizedMediaSlug = useMemo(() => normalizeSlug(mediaSlug), [mediaSlug])

  const handleBlogSave = useCallback(async () => {
    if (!blogList || !selectedBlogPost || blogValidationError) return

    setSavingBlog(true)
    setError(null)
    setBlogStatus(null)
    setBlogConflict(null)

    try {
      const requestSlug = selectedBlogPost.post.sha ? selectedBlogSlug : selectedBlogPost.post.slug
      const response = await adminApi.saveBlogPost(requestSlug, {
        branch: blogList.branch,
        commitMessage: `feat(blog): update ${selectedBlogPost.post.slug} from admin`,
        post: selectedBlogPost.post,
        sha: selectedBlogPost.post.sha,
      })

      setSelectedBlogSlug(response.post.slug)
      setSelectedBlogPost({ branch: response.branch, post: response.post, repo: response.repo })
      setSelectedBlogBaseline(structuredClone(response.post))
      setMediaSlug((current) => syncActiveBlogMediaSlug(current, mediaArea, selectedBlogSlug, response.post.slug))
      setMediaTarget((current) => syncResetBlogMediaTarget(current, selectedBlogSlug, response.post))
      setBlogActivity({
        latestCommitSha: response.latestCommitSha,
        path: response.post.path,
        repo: response.repo,
        summary: `Saved ${response.post.slug}`,
      })
      void loadActivity()
      setBlogStatus(`Saved blog post at ${response.latestCommitSha ?? response.post.sha}.`)
      await loadBlogList(response.post.slug)
    } catch (saveError) {
      const apiError = saveError as AdminApiError
      if (handleUnauthorizedError(saveError, 'Your admin session expired. Sign in again.')) return
      const isReloadConflict = apiError.status === 409 && Boolean(apiError.currentSha)
      setBlogConflict(
        isReloadConflict
          ? {
              currentSha: apiError.currentSha,
              latestCommitSha: apiError.latestCommitSha,
            }
          : null,
      )
      setError(
        isReloadConflict
          ? 'Blog save conflict: reload the post before saving again.'
          : apiError.message || 'Failed to save blog post.',
      )
    } finally {
      setSavingBlog(false)
    }
  }, [blogList, blogValidationError, handleUnauthorizedError, loadActivity, loadBlogList, mediaArea, selectedBlogPost, selectedBlogSlug])

  const handleBlogCreate = useCallback(() => {
    if (blogDirty && !confirmDiscardChanges('You have unsaved blog edits. Create a new draft and discard them?')) {
      return
    }

    const post = createEmptyBlogPost(blogList?.posts ?? [])
    setSelectedBlogSlug(post.slug)
    setSelectedBlogPost({
      branch: blogList?.branch ?? siteContent?.branch ?? 'main',
      post,
      repo: blogList?.repo ?? siteContent?.repo ?? { branchUrl: '', owner: '', repo: '', repoUrl: '' },
    })
    setSelectedBlogBaseline(structuredClone(post))
    setMediaArea('blog')
    setMediaSlug((current) => syncEnteredBlogMediaSlug(current, mediaArea, mediaTarget, selectedBlogSlug, post.slug))
    setMediaTarget((current) => (
      current && current.kind === 'blog'
        ? syncResetBlogMediaTarget(current, selectedBlogSlug, post)
        : null
    ))
    setBlogStatus('New draft created locally. Save it to create the markdown file.')
    setBlogConflict(null)
    setBlogActivity(null)
    setError(null)
  }, [blogDirty, blogList?.branch, blogList?.repo, confirmDiscardChanges, mediaArea, mediaTarget, selectedBlogSlug, siteContent?.branch, siteContent?.repo])

  const handleBlogDuplicate = useCallback(() => {
    if (!selectedBlogPost) return

    const post = createClonedBlogPost(selectedBlogPost.post, blogList?.posts ?? [])
    setSelectedBlogSlug(post.slug)
    setSelectedBlogPost({
      branch: blogList?.branch ?? selectedBlogPost.branch,
      post,
      repo: blogList?.repo ?? selectedBlogPost.repo,
    })
    setSelectedBlogBaseline(structuredClone(post))
    setMediaArea('blog')
    setMediaSlug((current) => syncEnteredBlogMediaSlug(current, mediaArea, mediaTarget, selectedBlogSlug, post.slug))
    setMediaTarget((current) => (
      current && current.kind === 'blog'
        ? syncResetBlogMediaTarget(current, selectedBlogSlug, post)
        : null
    ))
    setBlogStatus(`Duplicated ${selectedBlogPost.post.slug} into a new local draft. Save it to create the new markdown file.`)
    setBlogConflict(null)
    setBlogActivity(null)
    setError(null)
    setAuthStatus(null)
  }, [blogList?.branch, blogList?.posts, blogList?.repo, mediaArea, mediaTarget, selectedBlogPost, selectedBlogSlug])

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
      void loadActivity()
      setBlogStatus(`Deleted ${response.path} at ${response.latestCommitSha ?? 'latest commit'}.`)
      setSelectedBlogBaseline(null)
      await loadBlogList()
    } catch (deleteError) {
      const apiError = deleteError as AdminApiError
      if (handleUnauthorizedError(deleteError, 'Your admin session expired. Sign in again.')) return
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
  }, [blogList, confirmDiscardChanges, handleUnauthorizedError, loadActivity, loadBlogList, selectedBlogPost])

  const handleMediaAreaChange = useCallback((value: string) => {
    setMediaArea(value)
    setMediaSlug((current) => {
      if (value === mediaArea) return current
      return getPreferredMediaSlugForArea(value, current, selectedBlogSlug, selectedProjectSlug)
    })
    setMediaTarget((current) => (current && current.area === value ? current : null))
    setMediaResult(null)
    setMediaStatus(null)
  }, [mediaArea, selectedBlogSlug, selectedProjectSlug])

  const handleMediaSlugChange = useCallback((value: string) => {
    setMediaSlug(value)
    setMediaTarget((current) => (current && current.slug === normalizeSlug(value) ? current : null))
    setMediaResult(null)
    setMediaStatus(null)
  }, [])

  const handleMediaSlugCommit = useCallback(() => {
    setMediaSlug((current) => normalizeSlug(current))
  }, [])

  const handleMediaTargetClear = useCallback(() => {
    setMediaTarget(null)
    setMediaResult(null)
    setMediaStatus(null)
  }, [])

  const handleMediaResultClear = useCallback(() => {
    setMediaResult(null)
    setMediaStatus(null)
  }, [])

  const handleMediaFileClear = useCallback(() => {
    setMediaFile(null)
    setMediaFileInputKey((current) => current + 1)
    setMediaResult(null)
    setMediaStatus(null)
  }, [])

  const handleMediaFileChange = useCallback((file: File | null) => {
    setMediaFile(file)
    setMediaResult(null)
    setMediaStatus(null)
    setError(null)
  }, [])

  const handleMediaTargetSelect = useCallback((target: MediaTargetSelection) => {
    setMediaArea(target.area)
    setMediaSlug(target.slug)
    setMediaTarget(target)
    setMediaResult(null)
    setMediaStatus(null)
    setError(null)
  }, [])

  const handleProjectSelect = useCallback((slug: string) => {
    setSelectedProjectSlug(slug)
    setSelectedProjectGalleryIndex(0)
    setSelectedProjectStackIndex(0)
    setSelectedProjectApproachIndex(0)
    setSelectedProjectOutcomeIndex(0)
    setMediaSlug((current) => (
      syncEnteredProjectMediaSlug(current, mediaArea, mediaTarget, selectedProjectSlug, slug)
    ))
    setMediaTarget((current) => (
      syncResetProjectMediaTarget(
        current,
        workingCopy?.projects ?? siteContent?.content.projects ?? [],
        selectedProjectSlug,
        slug,
      )
    ))
  }, [mediaArea, mediaTarget, selectedProjectSlug, siteContent?.content.projects, workingCopy?.projects])

  const handleExperienceSelect = useCallback((value: number) => {
    setSelectedExperienceIndex(value)
    setSelectedExperienceHighlightIndex(0)
  }, [])

  const handleProjectDuplicate = useCallback(() => {
    setWorkingCopy((current) => {
      if (!current || !selectedProjectSlug) return current

      const sourceProject = current.projects.find((project) => project.slug === selectedProjectSlug)
      if (!sourceProject) return current

      const duplicatedProject = createClonedProject(sourceProject, current.projects)
      const next = structuredClone(current)
      next.projects.push(duplicatedProject)
      setSelectedProjectSlug(duplicatedProject.slug)
      setSelectedProjectGalleryIndex(0)
      setMediaArea('projects')
      setMediaSlug((activeSlug) => (
        syncEnteredProjectMediaSlug(activeSlug, mediaArea, mediaTarget, selectedProjectSlug, duplicatedProject.slug)
      ))
      setMediaTarget((activeTarget) => (
        activeTarget && activeTarget.area === 'projects'
          ? syncResetProjectMediaTarget(activeTarget, next.projects, selectedProjectSlug, duplicatedProject.slug)
          : null
      ))
      return next
    })
    setSaveStatus(null)
    setSiteConflict(null)
    setError(null)
    setAuthStatus(null)
  }, [mediaArea, mediaTarget, selectedProjectSlug])

  const handleMediaUpload = useCallback(async () => {
    if (!mediaFile || !mediaArea || !normalizedMediaSlug || mediaValidationError) return

    setUploadingMedia(true)
    setError(null)
    setMediaStatus(null)

    try {
      const response = await adminApi.uploadMedia({
        area: mediaArea,
        slug: normalizedMediaSlug,
        file: mediaFile,
      })

      if (mediaTarget && mediaTarget.area === mediaArea && mediaTarget.slug === normalizedMediaSlug) {
        if (mediaTarget.kind === 'blog') {
          handleBlogFieldChange(mediaTarget.field, response.path)
        } else if (mediaTarget.scope) {
          handleStructuredFieldChange(mediaTarget.scope, mediaTarget.field, response.path, mediaTarget.index)
        }
      }

      setMediaResult(response)
      void loadActivity()
      setMediaStatus(
        mediaTarget && mediaTarget.area === mediaArea && mediaTarget.slug === normalizedMediaSlug
          ? `Uploaded ${response.path} at ${response.latestCommitSha ?? response.sha} and applied it to ${mediaTarget.label}.`
          : `Uploaded ${response.path} at ${response.latestCommitSha ?? response.sha}.`,
      )
      setMediaFile(null)
      setMediaFileInputKey((current) => current + 1)
    } catch (uploadError) {
      const apiError = uploadError as AdminApiError
      if (handleUnauthorizedError(uploadError, 'Your admin session expired. Sign in again.')) return
      setError(apiError.message || 'Failed to upload media.')
    } finally {
      setUploadingMedia(false)
    }
  }, [handleBlogFieldChange, handleStructuredFieldChange, handleUnauthorizedError, loadActivity, mediaArea, mediaFile, mediaTarget, mediaValidationError, normalizedMediaSlug])

  const selectedBlogMeta = useMemo<BlogPostMeta | null>(() => {
    return blogList?.posts.find((post) => post.slug === selectedBlogSlug) ?? null
  }, [blogList, selectedBlogSlug])

  const selectedProject = useMemo(() => {
    return workingCopy?.projects.find((project) => project.slug === selectedProjectSlug) ?? workingCopy?.projects[0] ?? null
  }, [selectedProjectSlug, workingCopy])
  const selectedProjectGalleryItem = selectedProject?.gallery?.[selectedProjectGalleryIndex] ?? null

  const selectedSocial = workingCopy?.site.socials[selectedSocialIndex] ?? null
  const selectedHomeHeroTitleLine = workingCopy?.home.hero.titleLines[selectedHomeHeroTitleLineIndex] ?? null
  const selectedFeaturedProjectSlug = workingCopy?.home.featuredProjects.slugs[selectedFeaturedProjectSlugIndex] ?? null
  const selectedHomeBioTitleLine = workingCopy?.home.bio.titleLines[selectedHomeBioTitleLineIndex] ?? null
  const selectedHomeSkillItem = workingCopy?.home.skills.items[selectedHomeSkillItemIndex] ?? null
  const selectedHeaderNavLink = workingCopy?.siteChrome?.headerNav[selectedHeaderNavIndex] ?? null
  const selectedFooterGeneralLink = workingCopy?.siteChrome?.footer.generalLinks[selectedFooterGeneralLinkIndex] ?? null
  const selectedFooterMoreLink = workingCopy?.siteChrome?.footer.moreLinks[selectedFooterMoreLinkIndex] ?? null
  const selectedAboutBodyParagraph = workingCopy?.about.body[selectedAboutBodyIndex] ?? null
  const selectedAboutPrinciple = workingCopy?.about.principles[selectedAboutPrincipleIndex] ?? null
  const selectedAboutTool = workingCopy?.about.tools[selectedAboutToolIndex] ?? null
  const selectedProcess = workingCopy?.about.process[selectedProcessIndex] ?? null
  const selectedHomeStat = workingCopy?.home.stats[selectedHomeStatIndex] ?? null
  const selectedHighlight = workingCopy?.resume.highlights[selectedHighlightIndex] ?? null
  const selectedResumeSkill = workingCopy?.resume.skills[selectedResumeSkillIndex] ?? null
  const selectedExperience = workingCopy?.resume.experience[selectedExperienceIndex] ?? null
  const selectedExperienceHighlight = selectedExperience?.highlights[selectedExperienceHighlightIndex] ?? null
  const selectedMethod = workingCopy?.contact.methods[selectedMethodIndex] ?? null
  const selectedProjectStackItem = selectedProject?.stack[selectedProjectStackIndex] ?? null
  const selectedProjectApproachItem = selectedProject?.approach[selectedProjectApproachIndex] ?? null
  const selectedProjectOutcomeItem = selectedProject?.outcome[selectedProjectOutcomeIndex] ?? null

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
      activity: activity?.commits ?? [],
      activityError,
      activityLoadedAt,
      authStatus,
      blogActivity,
      blogDirty,
      blogList: blogList?.posts ?? [],
      blogRepo: selectedBlogPost?.repo ?? blogList?.repo ?? null,
      blogLoading: loadingBlog,
      blogMeta: selectedBlogMeta,
      blogPost: selectedBlogPost?.post ?? null,
      blogStatus,
      blogValidationError,
      blogConflict,
      dirty,
      error,
      siteValidation,
      siteValidationError,
      loading,
      loadingActivity,
      loadingContent,
      mediaArea,
      mediaFile,
      mediaFileInputKey,
      mediaPath: mediaResult?.path ?? '',
      mediaSlug,
      mediaStatus,
      mediaValidationError,
      mediaTargetKey: mediaTarget?.key ?? '',
      mediaTargetLabel: mediaTarget?.label ?? null,
      siteBranch: siteContent?.branch ?? selectedBlogPost?.branch ?? blogList?.branch ?? null,
      unsavedChangesSummary: getUnsavedChangesSummary(dirty, blogDirty),
      siteUrl: workingCopy?.site.siteUrl ?? siteContent?.content.site.siteUrl ?? '',
      siteConflict,
      onBlogFieldChange: handleBlogFieldChange,
      onBlogCreate: () => {
        handleBlogCreate()
      },
      onBlogDuplicate: () => {
        handleBlogDuplicate()
      },
      onBlogDelete: () => {
        void handleBlogDelete()
      },
      onBlogDiscard: handleDiscardBlogChanges,
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
      onStructuredDuplicate: handleStructuredDuplicate,
      onStructuredFieldChange: handleStructuredFieldChange,
      onStructuredMove: handleStructuredMove,
      onStructuredRemove: handleStructuredRemove,
      onLogin: handleLogin,
      onLogout: () => {
        void handleLogout()
      },
      onMediaAreaChange: handleMediaAreaChange,
      onMediaFileClear: handleMediaFileClear,
      onMediaFileChange: handleMediaFileChange,
      onMediaResultClear: handleMediaResultClear,
      onMediaSlugCommit: handleMediaSlugCommit,
      onMediaSlugChange: handleMediaSlugChange,
      onMediaTargetClear: handleMediaTargetClear,
      onMediaTargetSelect: handleMediaTargetSelect,
      onMediaUpload: () => {
        void handleMediaUpload()
      },
      onReloadActivity: () => {
        void loadActivity()
      },
      onProjectSelect: handleProjectSelect,
      onProjectDuplicate: handleProjectDuplicate,
      onHomeStatSelect: setSelectedHomeStatIndex,
      onHomeHeroTitleLineSelect: setSelectedHomeHeroTitleLineIndex,
      onFeaturedProjectSlugSelect: setSelectedFeaturedProjectSlugIndex,
      onHomeBioTitleLineSelect: setSelectedHomeBioTitleLineIndex,
      onHomeSkillItemSelect: setSelectedHomeSkillItemIndex,
      onSocialSelect: setSelectedSocialIndex,
      onHeaderNavSelect: setSelectedHeaderNavIndex,
      onFooterGeneralLinkSelect: setSelectedFooterGeneralLinkIndex,
      onFooterMoreLinkSelect: setSelectedFooterMoreLinkIndex,
      onAboutBodySelect: setSelectedAboutBodyIndex,
      onAboutPrincipleSelect: setSelectedAboutPrincipleIndex,
      onAboutToolSelect: setSelectedAboutToolIndex,
      onProcessSelect: setSelectedProcessIndex,
      onHighlightSelect: setSelectedHighlightIndex,
      onResumeSkillSelect: setSelectedResumeSkillIndex,
      onExperienceSelect: handleExperienceSelect,
      onExperienceHighlightSelect: setSelectedExperienceHighlightIndex,
      onMethodSelect: setSelectedMethodIndex,
      onProjectGallerySelect: setSelectedProjectGalleryIndex,
      onProjectStackSelect: setSelectedProjectStackIndex,
      onProjectApproachSelect: setSelectedProjectApproachIndex,
      onProjectOutcomeSelect: setSelectedProjectOutcomeIndex,
      projectOptions: workingCopy?.projects.map((project) => ({ slug: project.slug, title: project.title })) ?? [],
      selectedProject,
      selectedProjectGalleryIndex,
      selectedProjectGalleryItem,
      selectedProjectGalleryTotal: selectedProject?.gallery?.length ?? 0,
      selectedProjectSlug,
      selectedSocial,
      selectedSocialIndex,
      selectedSocialTotal: workingCopy?.site.socials.length ?? 0,
      selectedHomeHeroTitleLine,
      selectedHomeHeroTitleLineIndex,
      selectedHomeHeroTitleLineTotal: workingCopy?.home.hero.titleLines.length ?? 0,
      selectedFeaturedProjectSlug,
      selectedFeaturedProjectSlugIndex,
      selectedFeaturedProjectSlugTotal: workingCopy?.home.featuredProjects.slugs.length ?? 0,
      selectedHomeBioTitleLine,
      selectedHomeBioTitleLineIndex,
      selectedHomeBioTitleLineTotal: workingCopy?.home.bio.titleLines.length ?? 0,
      selectedHomeSkillItem,
      selectedHomeSkillItemIndex,
      selectedHomeSkillItemTotal: workingCopy?.home.skills.items.length ?? 0,
      selectedHeaderNavLink,
      selectedHeaderNavIndex,
      selectedHeaderNavTotal: workingCopy?.siteChrome?.headerNav.length ?? 0,
      selectedFooterGeneralLink,
      selectedFooterGeneralLinkIndex,
      selectedFooterGeneralLinkTotal: workingCopy?.siteChrome?.footer.generalLinks.length ?? 0,
      selectedFooterMoreLink,
      selectedFooterMoreLinkIndex,
      selectedFooterMoreLinkTotal: workingCopy?.siteChrome?.footer.moreLinks.length ?? 0,
      selectedAboutBodyParagraph,
      selectedAboutBodyIndex,
      selectedAboutBodyTotal: workingCopy?.about.body.length ?? 0,
      selectedAboutPrinciple,
      selectedAboutPrincipleIndex,
      selectedAboutPrincipleTotal: workingCopy?.about.principles.length ?? 0,
      selectedAboutTool,
      selectedAboutToolIndex,
      selectedAboutToolTotal: workingCopy?.about.tools.length ?? 0,
      selectedProcess,
      selectedProcessIndex,
      selectedProcessTotal: workingCopy?.about.process.length ?? 0,
      selectedHomeStat,
      selectedHomeStatIndex,
      selectedHomeStatTotal: workingCopy?.home.stats.length ?? 0,
      selectedHighlight,
      selectedHighlightIndex,
      selectedHighlightTotal: workingCopy?.resume.highlights.length ?? 0,
      selectedResumeSkill,
      selectedResumeSkillIndex,
      selectedResumeSkillTotal: workingCopy?.resume.skills.length ?? 0,
      selectedExperience,
      selectedExperienceIndex,
      selectedExperienceHighlight,
      selectedExperienceHighlightIndex,
      selectedExperienceHighlightTotal: selectedExperience?.highlights.length ?? 0,
      selectedExperienceTotal: workingCopy?.resume.experience.length ?? 0,
      selectedMethod,
      selectedMethodIndex,
      selectedMethodTotal: workingCopy?.contact.methods.length ?? 0,
      selectedProjectStackItem,
      selectedProjectStackIndex,
      selectedProjectStackTotal: selectedProject?.stack.length ?? 0,
      selectedProjectApproachItem,
      selectedProjectApproachIndex,
      selectedProjectApproachTotal: selectedProject?.approach.length ?? 0,
      selectedProjectOutcomeItem,
      selectedProjectOutcomeIndex,
      selectedProjectOutcomeTotal: selectedProject?.outcome.length ?? 0,
      onReload: () => {
        if (dirty && !confirmDiscardChanges('Discard unsaved content changes and reload from GitHub?')) return
        void loadSiteContent()
      },
      onDiscard: handleDiscardSiteChanges,
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
      activity,
      activityError,
      activityLoadedAt,
      authStatus,
      blogActivity,
      blogDirty,
      blogConflict,
      blogList,
      blogStatus,
      blogValidationError,
      confirmDiscardChanges,
      dirty,
      error,
      handleBlogFieldChange,
      handleBlogCreate,
      handleBlogDuplicate,
      handleDiscardBlogChanges,
      handleDiscardSiteChanges,
      handleBlogDelete,
      handleBlogSave,
      handleFieldChange,
      handleMediaAreaChange,
      handleMediaFileChange,
      handleMediaFileClear,
      handleMediaResultClear,
      handleMediaSlugCommit,
      handleMediaSlugChange,
      handleMediaTargetClear,
      handleMediaTargetSelect,
      handleMediaUpload,
      handleExperienceSelect,
      handleProjectSelect,
      handleProjectDuplicate,
      handleStructuredAdd,
      handleStructuredDuplicate,
      handleStructuredFieldChange,
      handleStructuredMove,
      handleStructuredRemove,
      handleSave,
      loadBlogPost,
      loadActivity,
      loadSiteContent,
      loading,
      loadingActivity,
      loadingBlog,
      siteValidation,
      siteValidationError,
      loadingContent,
      mediaArea,
      mediaFile,
      mediaFileInputKey,
      mediaResult,
      mediaSlug,
      mediaStatus,
      mediaValidationError,
      mediaTarget,
      siteContent,
      siteConflict,
      saveStatus,
      saving,
      savingBlog,
      selectedBlogMeta,
      selectedFeaturedProjectSlug,
      selectedFeaturedProjectSlugIndex,
      selectedExperience,
      selectedExperienceHighlight,
      selectedExperienceHighlightIndex,
      selectedExperienceIndex,
      selectedHomeBioTitleLine,
      selectedHomeBioTitleLineIndex,
      selectedHomeHeroTitleLine,
      selectedHomeHeroTitleLineIndex,
      selectedHomeSkillItem,
      selectedHomeSkillItemIndex,
      selectedFooterGeneralLink,
      selectedFooterGeneralLinkIndex,
      selectedFooterMoreLink,
      selectedFooterMoreLinkIndex,
      selectedAboutBodyIndex,
      selectedAboutBodyParagraph,
      selectedAboutPrinciple,
      selectedAboutPrincipleIndex,
      selectedAboutTool,
      selectedAboutToolIndex,
      selectedHeaderNavIndex,
      selectedHeaderNavLink,
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
      selectedProjectOutcomeIndex,
      selectedProjectOutcomeItem,
      selectedProjectApproachIndex,
      selectedProjectApproachItem,
      selectedProjectStackIndex,
      selectedProjectStackItem,
      selectedProjectSlug,
      selectedResumeSkill,
      selectedResumeSkillIndex,
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
