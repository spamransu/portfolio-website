import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { Section } from '../components/Section'
import { siteContent } from '../content/siteContent'

export function ProjectDetailPage() {
  const { slug } = useParams()
  const project = siteContent.projects.find((entry) => entry.slug === slug)

  if (!project) {
    return (
      <div className="page-stack">
        <PageHeader eyebrow="Projects" title="Project not found" intro="That case study is missing or has not been published yet." />
        <Link className="button button--primary" to="/projects">
          Back to projects
        </Link>
      </div>
    )
  }

  return (
    <div className="page-stack">
      <PageHeader eyebrow={`${project.year} · ${project.client}`} title={project.title} intro={project.summary} />

      <Section title="Project snapshot">
        <dl className="detail-grid">
          <div>
            <dt>Role</dt>
            <dd>{project.role}</dd>
          </div>
          <div>
            <dt>Stack</dt>
            <dd>{project.stack.join(', ')}</dd>
          </div>
        </dl>
      </Section>

      <Section title="Challenge">
        <p>{project.challenge}</p>
      </Section>

      <Section title="Approach">
        <ul className="check-list">
          {project.approach.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section title="Outcome">
        <ul className="check-list">
          {project.outcome.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>
    </div>
  )
}
