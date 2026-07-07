import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { ProjectCard } from '../components/ProjectCard'
import { Section } from '../components/Section'
import { StatList } from '../components/StatList'
import { siteContent } from '../content/siteContent'

export function HomePage() {
  const featuredProjects = siteContent.projects.slice(0, 2)

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Portfolio"
        title="Case studies, experience, and a future home for writing."
        intro={siteContent.site.tagline}
        actions={
          <div className="button-row">
            <Link className="button button--primary" to="/projects">
              Browse projects
            </Link>
            <Link className="button button--ghost" to="/resume">
              View CV / Resume
            </Link>
          </div>
        }
      />

      <StatList
        items={[
          { label: 'Focus', value: 'Frontend + design' },
          { label: 'Structure', value: 'Case-study driven' },
          { label: 'Next up', value: 'Blog / notes section' },
        ]}
      />

      <Section title="Selected projects" intro="A few representative projects with context, tradeoffs, and outcomes.">
        <div className="project-grid">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </Section>

      <Section title="Built for humans first, readable by agents too.">
        <div className="callout-card">
          <p>
            This starter includes machine-readable site maps, markdown mirrors, llms.txt resources, and a small agent-skills
            index so the content stays easy to discover and parse.
          </p>
          <a href="/llms.txt">Open llms.txt</a>
        </div>
      </Section>
    </div>
  )
}
