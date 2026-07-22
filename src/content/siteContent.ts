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
}

export type HighlightStat = {
  value: string
  label: string
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
    title: string
    body: string
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
    title: string
    intro: string
    heroImage?: ImageAsset
  }
  blogPage?: {
    title: string
    intro: string
    heroImage?: ImageAsset
  }
  projects: Project[]
}

export const siteContent = rawContent as SiteContent

export function getLinktreeUrl() {
  return siteContent.site.socials.find((social) => /linktree/i.test(social.label) || /linktr\.ee/i.test(social.href))?.href
}
