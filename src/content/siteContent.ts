import rawContent from '../../content/site-content.json'

export type SocialLink = {
  label: string
  href: string
}

export type Job = {
  role: string
  company: string
  period: string
  highlights: string[]
}

export type EducationItem = {
  program: string
  school: string
  period: string
  highlights: string[]
}

export type ImageAsset = {
  src: string
  alt: string
  caption?: string
}

export type ProcessStep = {
  title: string
  description: string
}

export type ContactMethod = {
  title: string
  label: string
  href: string
  description: string
}

export type ContactFormContent = {
  title: string
  intro: string
  submitLabel: string
  messageLimit: number
  nameLabel: string
  emailLabel: string
  messageLabel: string
  namePlaceholder: string
  emailPlaceholder: string
  messagePlaceholder: string
  nameRequiredError: string
  emailRequiredError: string
  emailInvalidError: string
  messageRequiredError: string
  messageTooLongError: string
  messageCountTemplate: string
  mailtoSubjectTemplate: string
  mailtoNameLabel: string
  mailtoEmailLabel: string
  mailtoMessageLabel: string
}

export type HighlightStat = {
  value: string
  label: string
}

export type ProjectKind = 'case-study' | 'experiment'

export type ProjectLink = {
  label: string
  href: string
}

export type Project = {
  slug: string
  title: string
  year: string
  client: string
  kind?: ProjectKind
  status?: string
  summary: string
  role: string
  stack: string[]
  links?: ProjectLink[]
  challenge: string
  approach: string[]
  outcome: string[]
  overview: string
  approachSummary: string
  resultSummary: string
  scope: string[]
  reflection: string
  image?: ImageAsset
  gallery: ImageAsset[]
}

export type HomeStatTone = 'accent' | 'accent-2' | 'accent-3'

export type HomeStat = {
  value: string
  label: string
  tone: HomeStatTone
}

export type SiteContent = {
  site: {
    name: string
    tagline: string
    description: string
    email: string
    location: string
    siteUrl: string
    socials: SocialLink[]
  }
  siteChrome?: {
    skipToContentLabel: string
    headerNavAriaLabel: string
    footerSocialsAriaLabel: string
    headerNav: Array<{
      to: string
      label: string
    }>
    headerLinktreeLabel?: string
    footer: {
      copyrightTemplate: string
      generalHeading: string
      moreHeading: string
      generalLinks: Array<{
        to: string
        label: string
      }>
      moreLinks: Array<{
        to: string
        label: string
      }>
      linktreeLabel?: string
    }
  }
  home: {
    hero: {
      eyebrow: string
      titleLines: string[]
      description: string
      accentPhrase?: string
      dateline?: {
        left: string
        right: string
      }
      index?: Array<{
        label: string
        value: string
      }>
    }
    cta: {
      primaryLabel: string
      secondaryLabel: string
    }
    featuredProjects: {
      title: string
      intro: string
      slugs: string[]
      fallbackLabel: string
      fallbackDescription: string
      stackAriaTemplate?: string
    }
    bio: {
      eyebrow: string
      titleLines: string[]
      description: string
    }
    stats: HomeStat[]
    skills: {
      title: string
      description: string
      items: string[]
      groups?: Array<{
        title: string
        items: string[]
      }>
      cloudAriaLabel?: string
    }
    contact: ContactFormContent
  }
  about: {
    eyebrow?: string
    title: string
    intro: string
    bodySectionTitle: string
    processSectionTitle: string
    processSectionIntro: string
    principlesSectionTitle: string
    toolsSectionTitle: string
    body: string[]
    principles: string[]
    process: ProcessStep[]
    tools: string[]
    heroImage?: ImageAsset
  }
  resume: {
    eyebrow?: string
    headline: string
    summary: string
    highlightsSectionTitle: string
    skillsSectionTitle: string
    experienceSectionTitle: string
    skills: string[]
    highlights: HighlightStat[]
    educationSectionTitle?: string
    education?: EducationItem[]
    heroImage?: ImageAsset
    experience: Job[]
  }
  contact: {
    eyebrow?: string
    title: string
    body: string
    emailCtaPrefix?: string
    availability: string
    availabilityTitle: string
    availabilityStatusLabel: string
    availabilityLocationLabel: string
    form: ContactFormContent
    formSectionTitle: string
    formSectionIntro: string
    methods: ContactMethod[]
    methodsSectionTitle: string
    methodsSectionIntro: string
    heroImage?: ImageAsset
  }
  projectsPage?: {
    eyebrow?: string
    title: string
    intro: string
    roleLabelPrefix?: string
    stackAriaTemplate?: string
    groups?: Array<{
      title: string
      description?: string
      kinds: ProjectKind[]
    }>
    heroImage?: ImageAsset
  }
  blogPage?: {
    eyebrow?: string
    title: string
    intro: string
    heroImage?: ImageAsset
  }
  blogPostPage?: {
    eyebrowPrefix: string
    notFoundTitle: string
    notFoundIntro: string
    backToBlogLabel: string
    startProjectLabel: string
    articleSectionTitle: string
    articleCtaEyebrow?: string
    articleCtaTitle?: string
    articleCtaLabel?: string
  }
  designSystemPage?: {
    eyebrow: string
    title: string
    intro: string
    sections: Array<{
      id: string
      title: string
      description: string
    }>
  }
  projectDetailPage?: {
    eyebrow?: string
    notFoundTitle: string
    notFoundIntro: string
    backToProjectsLabel: string
    startProjectLabel: string
    snapshotTitle: string
    roleLabel: string
    clientLabel: string
    yearLabel: string
    statusLabel?: string
    stackLabel: string
    linksTitle?: string
    stackAriaTemplate: string
    galleryTitle: string
    galleryIntro: string
    nextProjectEyebrow: string
    nextProjectLabel: string
    similarWorkEyebrow: string
    similarWorkTitle: string
    similarWorkIntro: string
    similarWorkLabel: string
  }
  notFoundPage?: {
    eyebrow: string
    title: string
    intro: string
    suggestionsEyebrow: string
    viewProjectsLabel: string
    backHomeLabel: string
  }
  projects: Project[]
}

export const siteContent = rawContent as SiteContent

export function getLinktreeUrl() {
  return siteContent.site.socials.find((social) => /linktree/i.test(social.label) || /linktr\.ee/i.test(social.href))?.href
}
