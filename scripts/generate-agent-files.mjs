import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import siteContent from '../content/site-content.json' with { type: 'json' }

const root = path.resolve(import.meta.dirname, '..')
const publicDir = path.join(root, 'public')
const skillDir = path.join(publicDir, '.well-known', 'agent-skills', 'site-navigation')
const siteUrl = (process.env.SITE_URL || siteContent.site.siteUrl || 'https://example.com').replace(/\/$/, '')
const email = process.env.CONTACT_EMAIL || siteContent.site.email
const location = process.env.CONTACT_LOCATION || siteContent.site.location
const featuredProjectSlugs = new Set(siteContent.home.featuredProjects.slugs)
const featuredProjects = siteContent.projects.filter((project) => featuredProjectSlugs.has(project.slug))

const routes = [
  { path: '/', md: '/index.md', title: 'Home', description: siteContent.site.description },
  { path: '/about', md: '/about.md', title: 'About', description: siteContent.about.intro },
  { path: '/projects', md: '/projects.md', title: 'Projects', description: 'Project index and case-study summaries.' },
  { path: '/contact', md: '/contact.md', title: 'Contact', description: siteContent.contact.body },
  { path: '/resume', md: '/resume.md', title: 'Resume', description: siteContent.resume.summary },
  ...siteContent.projects.map((project) => ({
    path: `/projects/${project.slug}`,
    md: `/projects/${project.slug}.md`,
    title: project.title,
    description: project.summary,
  })),
]

const lines = (value) => `${value}`.trim().split('\n')
const bullets = (items) => items.map((item) => `- ${item}`).join('\n')

const homeMd = `# ${siteContent.site.name}

${siteContent.site.tagline}

${siteContent.home.hero.eyebrow}

## Homepage hero
${siteContent.home.hero.titleLines.join(' ')}

${siteContent.home.hero.description}

## Main pages
${routes
  .filter((route) => ['/', '/about', '/projects', '/contact', '/resume'].includes(route.path))
  .map((route) => `- [${route.title}](${siteUrl}${route.md}) — ${route.description}`)
  .join('\n')}

## Featured case studies
${featuredProjects.map((project) => `- [${project.title}](${siteUrl}/projects/${project.slug}.md) — ${project.summary}`).join('\n')}

## Homepage stats
${siteContent.home.stats.map((stat) => `- ${stat.value} — ${stat.label}`).join('\n')}

## Highlighted skills
${bullets(siteContent.home.skills.items)}
`

const aboutMd = `# About

${siteContent.about.intro}

${siteContent.about.body.join('\n\n')}

## Working principles
${bullets(siteContent.about.principles)}
`

const projectsIndexMd = `# Projects

Case-study style project archive.

${siteContent.projects
  .map(
    (project) => `## [${project.title}](${siteUrl}/projects/${project.slug}.md)\n
- Year: ${project.year}\n- Client: ${project.client}\n- Role: ${project.role}\n- Stack: ${project.stack.join(', ')}\n\n${project.summary}`,
  )
  .join('\n\n')}
`

const resumeMd = `# Resume

## ${siteContent.resume.headline}

${siteContent.resume.summary}

## Skills
${bullets(siteContent.resume.skills)}

## Experience
${siteContent.resume.experience
  .map(
    (job) => `### ${job.role} — ${job.company} (${job.period})\n${bullets(job.highlights)}`,
  )
  .join('\n\n')}
`

const contactMd = `# Contact

${siteContent.contact.title}

${siteContent.contact.body}

- Email: ${email}
- Location: ${location}
- Availability: ${siteContent.contact.availability}
`

const projectMarkdown = Object.fromEntries(
  siteContent.projects.map((project) => [
    `/projects/${project.slug}.md`,
    `# ${project.title}

- Year: ${project.year}
- Client: ${project.client}
- Role: ${project.role}
- Stack: ${project.stack.join(', ')}
${project.image ? `- Homepage image: ${siteUrl}${project.image.src}` : ''}

## Summary
${project.summary}

## Challenge
${project.challenge}

## Approach
${bullets(project.approach)}

## Outcome
${bullets(project.outcome)}
`,
  ]),
)

const pageMarkdown = {
  '/index.md': homeMd,
  '/about.md': aboutMd,
  '/projects.md': projectsIndexMd,
  '/resume.md': resumeMd,
  '/contact.md': contactMd,
  ...projectMarkdown,
}

const llms = `# ${siteContent.site.name}

> ${siteContent.site.tagline}

${siteContent.site.description}

## Preferred machine-readable entry points
- [Site index](${siteUrl}/index.md)
- [Full site content](${siteUrl}/llms-full.txt)
- [Project archive](${siteUrl}/projects.md)
- [Resume](${siteUrl}/resume.md)
- [Contact](${siteUrl}/contact.md)

## Core pages
${routes.map((route) => `- [${route.title}](${siteUrl}${route.md})`).join('\n')}
`

const llmsFull = `# ${siteContent.site.name} — full machine-readable content

## Site summary
- Name: ${siteContent.site.name}
- Tagline: ${siteContent.site.tagline}
- Description: ${siteContent.site.description}
- Contact email: ${email}
- Location: ${location}

## Home
${lines(homeMd).join('\n')}

## About
${lines(aboutMd).join('\n')}

## Resume
${lines(resumeMd).join('\n')}

## Projects
${Object.values(projectMarkdown)
  .map((entry) => lines(entry).join('\n'))
  .join('\n\n')}

## Contact
${lines(contactMd).join('\n')}
`

const skillMd = `---
name: site-navigation
description: Navigate this portfolio website quickly, prefer markdown mirrors, and understand where case studies, resume details, and contact information live.
---

# Site navigation

Use this skill when you need to inspect or summarize this portfolio site efficiently.

## Prefer markdown sources

Read these machine-friendly pages first:

- \`/llms.txt\` for the site index
- \`/llms-full.txt\` for the complete machine-readable snapshot
- \`/projects.md\` for the case-study archive
- \`/resume.md\` for CV/resume content
- Project pages under \`/projects/<slug>.md\`

## Human page mapping

- \`/\` — homepage and overview
- \`/about\` — background, principles, and positioning
- \`/projects\` — project archive
- \`/projects/<slug>\` — individual case study
- \`/resume\` — resume summary and experience
- \`/contact\` — contact and availability

## Notes

- The site is content-first and meant to stay understandable even without visual interpretation.
- If both HTML and markdown are available, prefer markdown first.
- The blog is planned but not launched yet.
`

const digest = (value) => `sha256:${createHash('sha256').update(value).digest('hex')}`
const agentIndex = {
  $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
  skills: [
    {
      name: 'site-navigation',
      type: 'skill-md',
      description:
        'Navigate this portfolio website quickly, prefer markdown mirrors, and understand where case studies, resume details, and contact information live.',
      url: '/.well-known/agent-skills/site-navigation/SKILL.md',
      digest: digest(skillMd),
    },
  ],
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>\n    <loc>${siteUrl}${route.path}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${route.path === '/' ? '1.0' : route.path === '/projects' ? '0.9' : '0.8'}</priority>\n  </url>`,
  )
  .join('\n')}
</urlset>
`

await fs.mkdir(path.join(publicDir, 'projects'), { recursive: true })
await fs.mkdir(skillDir, { recursive: true })

for (const [relativePath, content] of Object.entries(pageMarkdown)) {
  const filePath = path.join(publicDir, relativePath)
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, content.replace(/\n\n\n+/g, '\n\n'), 'utf8')
}

await fs.writeFile(path.join(publicDir, 'llms.txt'), llms, 'utf8')
await fs.writeFile(path.join(publicDir, 'llms-full.txt'), llmsFull, 'utf8')
await fs.writeFile(path.join(publicDir, 'sitemap.xml'), sitemap, 'utf8')
await fs.writeFile(path.join(skillDir, 'SKILL.md'), skillMd, 'utf8')
await fs.writeFile(
  path.join(publicDir, '.well-known', 'agent-skills', 'index.json'),
  `${JSON.stringify(agentIndex, null, 2)}\n`,
  'utf8',
)

const robots = `User-agent: *\nAllow: /\n\n# Content Signals preference\nContent-Signal: search=yes, ai-input=yes, ai-train=no\n\nSitemap: ${siteUrl}/sitemap.xml\n`
await fs.writeFile(path.join(publicDir, 'robots.txt'), robots, 'utf8')
