import { PageHeader } from '../components/PageHeader'
import { ProjectCard } from '../components/ProjectCard'
import { siteContent } from '../content/siteContent'

export function ProjectsPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Projects"
        title="Case studies with enough context to be useful."
        intro="Each project is written as a short case study so the work is understandable beyond the final mockup."
      />

      <div className="project-grid">
        {siteContent.projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  )
}
