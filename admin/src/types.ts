export type SocialLink = {
  label: string
  href: string
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

export type HomeStatTone = 'accent' | 'accent-2' | 'accent-3'

export type HomeStat = {
  value: string
  label: string
  tone: HomeStatTone
}

export type HighlightStat = {
  value: string
  label: string
}

export type ImageAsset = {
  src: string
  alt: string
  caption?: string
}

export type Job = {
  role: string
  company: string
  period: string
  highlights: string[]
}

export type ProjectSection = {
  title: string
  body: string
  image?: ImageAsset
}

export type Project = {
  slug: string
  title: string
  year: string
  client: string
  summary: string
  role: string
  stack: string[]
  challenge: string
  approach: string[]
  outcome: string[]
  image?: ImageAsset
  gallery?: ImageAsset[]
  sections?: ProjectSection[]
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
    stackLabel: string
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

export type BlogStatus = 'draft' | 'published'

export type BlogPost = {
  title: string
  slug: string
  date: string
  status: BlogStatus
  coverImage?: string
  coverAlt?: string
  excerpt?: string
  body: string
}

export type BlogPostMeta = Omit<BlogPost, 'body'> & {
  path: string
  sha: string
}

export type BlogPostResponse = BlogPostMeta & {
  body: string
}
