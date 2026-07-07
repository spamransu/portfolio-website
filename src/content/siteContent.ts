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
