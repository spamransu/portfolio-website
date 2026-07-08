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

export type ProjectImage = {
  src: string
  alt: string
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
  image?: ProjectImage
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
    contact: {
      title: string
      intro: string
      submitLabel: string
      messageLimit: number
    }
  }
  about: {
    intro: string
    body: string[]
    principles: string[]
  }
  resume: {
    headline: string
    summary: string
    skills: string[]
    experience: Job[]
  }
  contact: {
    title: string
    body: string
    availability: string
  }
  projects: Project[]
}

export const siteContent = rawContent as SiteContent

export function getLinktreeUrl() {
  return siteContent.site.socials.find((social) => /linktree/i.test(social.label) || /linktr\.ee/i.test(social.href))?.href
}
