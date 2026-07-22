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
  homeContact?: string
  contactForm?: string
  contactMethods?: string
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

const createEmptyBlogPost = (slug = `draft-${todayDate()}`): BlogPostResponse => ({
  title: 'Untitled draft',
  slug,
  date: todayDate(),
  status: 'draft',
  body: '',
  coverAlt: '',
  coverImage: '',
  excerpt: '',
  path: buildBlogPostPath(todayDate(), slug),
  sha: '',
})

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

  const slugCounts = new Map<string, number>()
  for (const project of content.projects) {
    slugCounts.set(project.slug, (slugCounts.get(project.slug) ?? 0) + 1)
  }

  const selectedProject = content.projects.find((project) => project.slug === selectedProjectSlug) ?? content.projects[0] ?? null
  const duplicateSlugs = [...slugCounts.entries()].filter(([, count]) => count > 1).map(([slug]) => slug)
  const missingFeatured = content.home.featuredProjects.slugs.filter((slug) => !slugCounts.has(slug))

  const invalidSocial = content.site.socials.find((entry) => !entry.label.trim() || !isHttpUrl(entry.href.trim()))
  const invalidHeaderNav = content.siteChrome?.headerNav.find((entry) => !entry.label.trim() || !isInternalPath(entry.to.trim()))
  const invalidGeneralLink = content.siteChrome?.footer.generalLinks.find((entry) => !entry.label.trim() || !isInternalPath(entry.to.trim()))
  const invalidMoreLink = content.siteChrome?.footer.moreLinks.find((entry) => !entry.label.trim() || !isInternalPath(entry.to.trim()))
  const invalidMethod = content.contact.methods.find((entry) => !entry.title.trim() || !entry.label.trim() || !entry.description.trim() || !isContactHref(entry.href.trim()))

  const homeMessageLimit = content.home.contact.messageLimit
  const contactMessageLimit = content.contact.form.messageLimit

  return {
    selectedProject: selectedProject
      ? !selectedProject.slug || !PROJECT_SLUG_PATTERN.test(selectedProject.slug)
        ? 'Project slug must use lowercase letters, numbers, and hyphens only.'
        : duplicateSlugs.includes(selectedProject.slug)
          ? `Project slug must be unique. Duplicate slug: ${selectedProject.slug}.`
          : undefined
      : undefined,
    featuredProjects: missingFeatured.length
      ? `Featured project slugs must match existing projects. Missing: ${missingFeatured.join(', ')}.`
      : undefined,
    site: !EMAIL_PATTERN.test(content.site.email.trim())
      ? 'Site email must use a valid email address.'
      : !isHttpUrl(content.site.siteUrl.trim())
        ? 'Site URL must use a full http or https URL.'
        : undefined,
    socials: invalidSocial
      ? `Social links must have a label and a full http or https URL. Check: ${invalidSocial.label || invalidSocial.href}.`
      : undefined,
    siteChrome: invalidHeaderNav
      ? `Header nav links must use internal paths that start with /. Check: ${invalidHeaderNav.to || invalidHeaderNav.label}.`
      : invalidGeneralLink
        ? `Footer general links must use internal paths that start with /. Check: ${invalidGeneralLink.to || invalidGeneralLink.label}.`
        : invalidMoreLink
          ? `Footer more links must use internal paths that start with /. Check: ${invalidMoreLink.to || invalidMoreLink.label}.`
          : undefined,
    homeContact: !Number.isInteger(homeMessageLimit) || homeMessageLimit <= 0
      ? 'Home contact message limit must be a whole number greater than 0.'
      : !content.home.contact.messageCountTemplate.includes('{count}') || !content.home.contact.messageCountTemplate.includes('{limit}')
        ? 'Home contact count template must include both {count} and {limit}.'
        : !content.home.contact.messageTooLongError.includes('{limit}')
          ? 'Home contact message-too-long error must include {limit}.'
          : undefined,
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
  }
}

const BLOG_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const getBlogValidationError = (post: BlogPostResponse | null): string | null => {
  if (!post) return null
  if (!post.slug || !BLOG_SLUG_PATTERN.test(post.slug)) {
    return 'Blog slug must use lowercase letters, numbers, and hyphens only.'
  }
  if (!BLOG_DATE_PATTERN.test(post.date)) {
    return 'Blog date must use the YYYY-MM-DD format.'
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
      if (!next.sha) next.path = buildBlogPostPath(next.date, normalizedSlug || 'draft')
      return next
    }
    case 'date':
      next.date = value
      if (!next.sha) next.path = buildBlogPostPath(value, next.slug || 'draft')
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
  const [selectedBlogBaseline, setSelectedBlogBaseline] = useState<BlogPostResponse | null>(null)
  const [selectedProjectSlug, setSelectedProjectSlug] = useState<string>('')
  const [selectedProjectGalleryIndex, setSelectedProjectGalleryIndex] = useState(0)
  const [selectedHomeStatIndex, setSelectedHomeStatIndex] = useState(0)
  const [selectedSocialIndex, setSelectedSocialIndex] = useState(0)
  const [selectedProcessIndex, setSelectedProcessIndex] = useState(0)
  const [selectedHighlightIndex, setSelectedHighlightIndex] = useState(0)
  const [selectedExperienceIndex, setSelectedExperienceIndex] = useState(0)
  const [selectedMethodIndex, setSelectedMethodIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingContent, setLoadingContent] = useState(false)
  const [loadingBlog, setLoadingBlog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savingBlog, setSavingBlog] = useState(false)
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [mediaArea, setMediaArea] = useState(DEFAULT_MEDIA_AREA)
  const [mediaSlug, setMediaSlug] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaResult, setMediaResult] = useState<MediaUploadResponse | null>(null)
  const [mediaTarget, setMediaTarget] = useState<MediaTargetSelection | null>(null)
  const [error, setError] = useState<string | null>(getAuthMessageFromUrl())
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [blogStatus, setBlogStatus] = useState<string | null>(null)
  const [mediaStatus, setMediaStatus] = useState<string | null>(null)
  const [siteConflict, setSiteConflict] = useState<ConflictState>(null)
  const [blogConflict, setBlogConflict] = useState<ConflictState>(null)
  const [blogActivity, setBlogActivity] = useState<BlogActivity>(null)
  const [activity, setActivity] = useState<AdminActivityResponse | null>(null)

  const loadSiteContent = useCallback(async () => {
    setLoadingContent(true)

    try {
      const response = await adminApi.getSiteContent()
      setSiteContent(response)
      setWorkingCopy(structuredClone(response.content))
      setSelectedProjectSlug(response.content.projects[0]?.slug ?? '')
      setSelectedProjectGalleryIndex(0)
      setSelectedHomeStatIndex(0)
      setSelectedSocialIndex(0)
      setSelectedProcessIndex(0)
      setSelectedHighlightIndex(0)
      setSelectedExperienceIndex(0)
      setSelectedMethodIndex(0)
      setError(null)
      setSaveStatus(null)
      setSiteConflict(null)
    } catch (loadError) {
      setSiteContent(null)
      setWorkingCopy(null)
      setError(loadError instanceof Error ? loadError.message : 'Failed to load site content.')
    } finally {
      setLoadingContent(false)
    }
  }, [])

  const loadActivity = useCallback(async () => {
    try {
      const response = await adminApi.getActivity()
      setActivity(response)
    } catch (loadError) {
      setActivity(null)
      setError(loadError instanceof Error ? loadError.message : 'Failed to load recent activity.')
    }
  }, [])

  const loadBlogPost = useCallback(async (slug: string) => {
    if (!slug) {
      setSelectedBlogPost(null)
      setSelectedBlogBaseline(null)
      return
    }

    setLoadingBlog(true)

    try {
      const response = await adminApi.getBlogPost(slug)
      setSelectedBlogPost(response)
      setSelectedBlogBaseline(structuredClone(response.post))
      setSelectedBlogSlug(slug)
      setMediaArea('blog')
      setMediaSlug(slug)
      setBlogStatus(null)
      setBlogConflict(null)
      setError(null)
    } catch (loadError) {
      setSelectedBlogPost(null)
      setSelectedBlogBaseline(null)
      setError(loadError instanceof Error ? loadError.message : 'Failed to load blog post.')
    } finally {
      setLoadingBlog(false)
    }
  }, [])

  const loadBlogList = useCallback(async (preferredSlug?: string) => {
    try {
      const response = await adminApi.getBlogPosts()
      setBlogList(response)
      const nextSlug = (preferredSlug && response.posts.some((post) => post.slug === preferredSlug)
        ? preferredSlug
        : response.posts[0]?.slug) ?? ''
      if (nextSlug) {
        await loadBlogPost(nextSlug)
      } else {
        setSelectedBlogSlug('')
        setSelectedBlogPost(null)
        setSelectedBlogBaseline(null)
      }
    } catch (loadError) {
      setBlogList(null)
      setSelectedBlogSlug('')
      setSelectedBlogPost(null)
      setSelectedBlogBaseline(null)
      setError(loadError instanceof Error ? loadError.message : 'Failed to load blog posts.')
    }
  }, [loadBlogPost])

  const loadSession = useCallback(async () => {
    setLoading(true)

    try {
      const currentSession = await adminApi.getSession()
      setSession(currentSession)

      if (currentSession.authenticated) {
        await Promise.all([loadSiteContent(), loadBlogList(), loadActivity()])
      } else {
        setSiteContent(null)
        setWorkingCopy(null)
        setBlogList(null)
        setSelectedBlogSlug('')
        setSelectedBlogPost(null)
        setSelectedBlogBaseline(null)
        setActivity(null)
      }
    } catch (sessionError) {
      setSession(DEFAULT_SESSION)
      setSiteContent(null)
      setWorkingCopy(null)
      setBlogList(null)
      setSelectedBlogSlug('')
      setSelectedBlogPost(null)
      setSelectedBlogBaseline(null)
      setActivity(null)
      setError(sessionError instanceof Error ? sessionError.message : 'Failed to load session.')
    } finally {
      setLoading(false)
    }
  }, [loadActivity, loadBlogList, loadSiteContent])

  useEffect(() => {
    void loadSession()
  }, [loadSession])

  const confirmDiscardChanges = useCallback((message: string) => {
    return window.confirm(message)
  }, [])

  const handleLogin = () => {
    window.location.href = '/api/admin/auth/start'
  }

  const handleLogout = async () => {
    if ((dirty || blogDirty) && !confirmDiscardChanges('You have unsaved content changes. Log out and discard them?')) {
      return
    }

    try {
      await adminApi.logout()
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
      setMediaResult(null)
      setMediaTarget(null)
      setError(null)
      setSaveStatus(null)
      setBlogStatus(null)
      setMediaStatus(null)
      setSiteConflict(null)
      setBlogConflict(null)
      setBlogActivity(null)
      setActivity(null)
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : 'Failed to log out.')
    }
  }

  const handleFieldChange = useCallback((field: string, value: string) => {
    setWorkingCopy((current) => (current ? updateWorkingCopy(current, field, value) : current))
    setSaveStatus(null)
    setSiteConflict(null)
    setError(null)
  }, [])

  const handleDiscardSiteChanges = useCallback(() => {
    if (!siteContent) return
    if (!confirmDiscardChanges('Discard unsaved content changes and restore the last loaded site content?')) return

    setWorkingCopy(structuredClone(siteContent.content))
    setSelectedProjectSlug((current) => {
      if (current && siteContent.content.projects.some((project) => project.slug === current)) return current
      return siteContent.content.projects[0]?.slug ?? ''
    })
    setSelectedProjectGalleryIndex(0)
    setSelectedHomeStatIndex(0)
    setSelectedSocialIndex(0)
    setSelectedProcessIndex(0)
    setSelectedHighlightIndex(0)
    setSelectedExperienceIndex(0)
    setSelectedMethodIndex(0)
    setSaveStatus(null)
    setSiteConflict(null)
    setError(null)
  }, [confirmDiscardChanges, siteContent])

  const handleDiscardBlogChanges = useCallback(() => {
    if (!selectedBlogPost || !selectedBlogBaseline) return
    if (!confirmDiscardChanges('Discard unsaved blog edits and restore the last loaded post state?')) return

    setSelectedBlogPost((current) => (current ? { ...current, post: structuredClone(selectedBlogBaseline) } : current))
    setSelectedBlogSlug(selectedBlogBaseline.slug)
    setMediaSlug(selectedBlogBaseline.slug)
    setBlogStatus(null)
    setBlogConflict(null)
    setError(null)
  }, [confirmDiscardChanges, selectedBlogBaseline, selectedBlogPost])

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
            setMediaSlug((current) => (current === currentProject.slug ? nextValue : current))
            setMediaTarget((current) => (current && current.area === 'projects' && current.slug === currentProject.slug ? null : current))
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
        default:
          return next
      }
    })
    setSaveStatus(null)
    setSiteConflict(null)
    setError(null)
  }, [selectedProjectSlug])

  const handleStructuredAdd = useCallback((scope: string) => {
    setWorkingCopy((current) => {
      if (!current) return current

      const next = structuredClone(current)

      switch (scope) {
        case 'social':
          next.site.socials.push({ label: 'New social', href: 'https://' })
          setSelectedSocialIndex(next.site.socials.length - 1)
          return next
        case 'process':
          next.about.process.push({ title: 'New step', description: '' })
          setSelectedProcessIndex(next.about.process.length - 1)
          return next
        case 'highlight':
          next.resume.highlights.push({ value: '0', label: 'New highlight' })
          setSelectedHighlightIndex(next.resume.highlights.length - 1)
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
          next.projects.push({
            slug: `new-project-${next.projects.length + 1}`,
            title: 'New project',
            year: todayDate().slice(0, 4),
            client: 'Client',
            summary: '',
            role: '',
            stack: [],
            challenge: '',
            approach: [],
            outcome: [],
            sections: [{ kind: 'default', title: 'Overview', body: '' }],
          })
          setSelectedProjectSlug(next.projects[next.projects.length - 1].slug)
          setSelectedProjectGalleryIndex(0)
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
        default:
          return next
      }
    })
    setSaveStatus(null)
    setSiteConflict(null)
    setError(null)
  }, [selectedProjectSlug])

  const handleStructuredRemove = useCallback((scope: string, index?: number) => {
    const confirmMessageByScope: Record<string, string> = {
      social: 'Remove this social link?',
      process: 'Remove this process step?',
      highlight: 'Remove this highlight card?',
      homeStat: 'Remove this home stat card?',
      experience: 'Remove this experience entry?',
      method: 'Remove this contact method?',
      project: 'Remove this project from site content?',
      projectGallery: 'Remove this gallery image?',
      projectSection: 'Remove this project section?',
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
          next.projects.splice(projectIndex, 1)
          setSelectedProjectSlug(next.projects[Math.max(0, Math.min(projectIndex, next.projects.length - 1))]?.slug ?? '')
          setSelectedProjectGalleryIndex(0)
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
        default:
          return next
      }
    })
    setSaveStatus(null)
    setSiteConflict(null)
    setError(null)
  }, [confirmDiscardChanges, selectedProjectSlug])

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
    ?? siteValidation.homeContact
    ?? siteValidation.contactForm
    ?? siteValidation.contactMethods
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

      setSiteContent(response)
      setWorkingCopy(structuredClone(response.content))
      void loadActivity()
      setSaveStatus(`Saved site content to ${response.branch} at ${response.latestCommitSha ?? response.sha}.`)
    } catch (saveError) {
      const apiError = saveError as AdminApiError
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
  }, [loadActivity, siteContent, siteValidationError, workingCopy])

  const handleBlogFieldChange = useCallback((field: string, value: string) => {
    setSelectedBlogPost((current) => {
      if (!current) return current
      const post = updateBlogPost(current.post, field, value)
      if (field === 'slug') {
        setMediaSlug(post.slug)
      }
      return { ...current, post }
    })
    setBlogStatus(null)
    setBlogConflict(null)
    setError(null)
  }, [])

  const blogDirty = useMemo(() => {
    if (!selectedBlogPost || !selectedBlogBaseline) return false
    return JSON.stringify(selectedBlogBaseline) !== JSON.stringify(selectedBlogPost.post)
  }, [selectedBlogBaseline, selectedBlogPost])

  const blogValidationError = useMemo(() => getBlogValidationError(selectedBlogPost?.post ?? null), [selectedBlogPost])

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
      setMediaSlug(response.post.slug)
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
          ? 'Blog save conflict: reload the post before saving again.'
          : apiError.message || 'Failed to save blog post.',
      )
    } finally {
      setSavingBlog(false)
    }
  }, [blogList, blogValidationError, loadActivity, loadBlogList, selectedBlogPost])

  const handleBlogCreate = useCallback(() => {
    if (blogDirty && !confirmDiscardChanges('You have unsaved blog edits. Create a new draft and discard them?')) {
      return
    }

    const slug = `draft-${Date.now()}`
    const post = createEmptyBlogPost(slug)
    setSelectedBlogSlug(slug)
    setSelectedBlogPost({
      branch: blogList?.branch ?? siteContent?.branch ?? 'main',
      post,
      repo: blogList?.repo ?? siteContent?.repo ?? { branchUrl: '', owner: '', repo: '', repoUrl: '' },
    })
    setSelectedBlogBaseline(structuredClone(post))
    setMediaArea('blog')
    setMediaSlug(slug)
    setBlogStatus('New draft created locally. Save it to create the markdown file.')
    setBlogConflict(null)
    setBlogActivity(null)
    setError(null)
  }, [blogDirty, blogList?.branch, blogList?.repo, confirmDiscardChanges, siteContent?.branch, siteContent?.repo])

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
  }, [blogList, confirmDiscardChanges, loadActivity, loadBlogList, selectedBlogPost])

  const handleMediaAreaChange = useCallback((value: string) => {
    setMediaArea(value)
    setMediaTarget((current) => (current && current.area === value ? current : null))
    setMediaStatus(null)
  }, [])

  const handleMediaSlugChange = useCallback((value: string) => {
    setMediaSlug(value)
    setMediaTarget((current) => (current && current.slug === value ? current : null))
    setMediaStatus(null)
  }, [])

  const handleMediaTargetClear = useCallback(() => {
    setMediaTarget(null)
    setMediaStatus(null)
  }, [])

  const handleMediaTargetSelect = useCallback((target: MediaTargetSelection) => {
    setMediaArea(target.area)
    setMediaSlug(target.slug)
    setMediaTarget(target)
    setMediaStatus(null)
    setError(null)
  }, [])

  const handleMediaUpload = useCallback(async () => {
    if (!mediaFile || !mediaArea || !mediaSlug.trim()) return

    setUploadingMedia(true)
    setError(null)
    setMediaStatus(null)

    try {
      const response = await adminApi.uploadMedia({
        area: mediaArea,
        slug: mediaSlug,
        file: mediaFile,
      })

      if (mediaTarget && mediaTarget.area === mediaArea && mediaTarget.slug === mediaSlug) {
        if (mediaTarget.kind === 'blog') {
          handleBlogFieldChange(mediaTarget.field, response.path)
        } else if (mediaTarget.scope) {
          handleStructuredFieldChange(mediaTarget.scope, mediaTarget.field, response.path, mediaTarget.index)
        }
      }

      setMediaResult(response)
      void loadActivity()
      setMediaStatus(
        mediaTarget && mediaTarget.area === mediaArea && mediaTarget.slug === mediaSlug
          ? `Uploaded ${response.path} at ${response.latestCommitSha ?? response.sha} and applied it to ${mediaTarget.label}.`
          : `Uploaded ${response.path} at ${response.latestCommitSha ?? response.sha}.`,
      )
      setMediaFile(null)
    } catch (uploadError) {
      const apiError = uploadError as AdminApiError
      setError(apiError.message || 'Failed to upload media.')
    } finally {
      setUploadingMedia(false)
    }
  }, [handleBlogFieldChange, handleStructuredFieldChange, loadActivity, mediaArea, mediaFile, mediaSlug, mediaTarget])

  const selectedBlogMeta = useMemo<BlogPostMeta | null>(() => {
    return blogList?.posts.find((post) => post.slug === selectedBlogSlug) ?? null
  }, [blogList, selectedBlogSlug])

  const selectedProject = useMemo(() => {
    return workingCopy?.projects.find((project) => project.slug === selectedProjectSlug) ?? workingCopy?.projects[0] ?? null
  }, [selectedProjectSlug, workingCopy])
  const selectedProjectGalleryItem = selectedProject?.gallery?.[selectedProjectGalleryIndex] ?? null

  const selectedSocial = workingCopy?.site.socials[selectedSocialIndex] ?? null
  const selectedProcess = workingCopy?.about.process[selectedProcessIndex] ?? null
  const selectedHomeStat = workingCopy?.home.stats[selectedHomeStatIndex] ?? null
  const selectedHighlight = workingCopy?.resume.highlights[selectedHighlightIndex] ?? null
  const selectedExperience = workingCopy?.resume.experience[selectedExperienceIndex] ?? null
  const selectedMethod = workingCopy?.contact.methods[selectedMethodIndex] ?? null

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
      loadingContent,
      mediaArea,
      mediaFile,
      mediaPath: mediaResult?.path ?? '',
      mediaSlug,
      mediaStatus,
      mediaTargetKey: mediaTarget?.key ?? '',
      mediaTargetLabel: mediaTarget?.label ?? null,
      siteUrl: workingCopy?.site.siteUrl ?? siteContent?.content.site.siteUrl ?? '',
      siteConflict,
      onBlogFieldChange: handleBlogFieldChange,
      onBlogCreate: () => {
        handleBlogCreate()
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
      onStructuredFieldChange: handleStructuredFieldChange,
      onStructuredRemove: handleStructuredRemove,
      onLogin: handleLogin,
      onLogout: () => {
        void handleLogout()
      },
      onMediaAreaChange: handleMediaAreaChange,
      onMediaFileClear: () => {
        setMediaFile(null)
      },
      onMediaFileChange: setMediaFile,
      onMediaSlugChange: handleMediaSlugChange,
      onMediaTargetClear: handleMediaTargetClear,
      onMediaTargetSelect: handleMediaTargetSelect,
      onMediaUpload: () => {
        void handleMediaUpload()
      },
      onProjectSelect: setSelectedProjectSlug,
      onHomeStatSelect: setSelectedHomeStatIndex,
      onSocialSelect: setSelectedSocialIndex,
      onProcessSelect: setSelectedProcessIndex,
      onHighlightSelect: setSelectedHighlightIndex,
      onExperienceSelect: setSelectedExperienceIndex,
      onMethodSelect: setSelectedMethodIndex,
      onProjectGallerySelect: setSelectedProjectGalleryIndex,
      projectOptions: workingCopy?.projects.map((project) => ({ slug: project.slug, title: project.title })) ?? [],
      selectedProject,
      selectedProjectGalleryIndex,
      selectedProjectGalleryItem,
      selectedProjectGalleryTotal: selectedProject?.gallery?.length ?? 0,
      selectedProjectSlug,
      selectedSocial,
      selectedSocialIndex,
      selectedSocialTotal: workingCopy?.site.socials.length ?? 0,
      selectedProcess,
      selectedProcessIndex,
      selectedProcessTotal: workingCopy?.about.process.length ?? 0,
      selectedHomeStat,
      selectedHomeStatIndex,
      selectedHomeStatTotal: workingCopy?.home.stats.length ?? 0,
      selectedHighlight,
      selectedHighlightIndex,
      selectedHighlightTotal: workingCopy?.resume.highlights.length ?? 0,
      selectedExperience,
      selectedExperienceIndex,
      selectedExperienceTotal: workingCopy?.resume.experience.length ?? 0,
      selectedMethod,
      selectedMethodIndex,
      selectedMethodTotal: workingCopy?.contact.methods.length ?? 0,
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
      handleDiscardBlogChanges,
      handleDiscardSiteChanges,
      handleBlogDelete,
      handleBlogSave,
      handleFieldChange,
      handleMediaAreaChange,
      handleMediaSlugChange,
      handleMediaTargetClear,
      handleMediaTargetSelect,
      handleMediaUpload,
      handleStructuredAdd,
      handleStructuredFieldChange,
      handleStructuredRemove,
      handleSave,
      loadBlogPost,
      loadSiteContent,
      loading,
      loadingBlog,
      siteValidation,
      siteValidationError,
      loadingContent,
      mediaArea,
      mediaResult,
      mediaSlug,
      mediaStatus,
      mediaTarget,
      siteContent,
      siteConflict,
      saveStatus,
      saving,
      savingBlog,
      selectedBlogMeta,
      selectedExperience,
      selectedExperienceIndex,
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
      selectedProjectSlug,
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
