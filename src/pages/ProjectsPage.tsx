import { InternalHero } from '../components/InternalHero'
import { ProjectCard } from '../components/ProjectCard'
import { siteContent } from '../content/siteContent'
import sty from './InternalPages.module.scss'

export function ProjectsPage() {
  return (
    <div className={`lg-wrapper ${sty.page}`}>
      <InternalHero
        eyebrow="Projects"
        title="Case studies with enough context to be useful."
        intro={siteContent.projectsPage?.intro ?? 'Selected frontend and design-to-code work presented as concise case studies.'}
        media={{
          src: 'https://picsum.photos/seed/portfolio-projects-grid/1600/1100.jpg',
          alt: 'Mock overview board showing portfolio project cards and visual case-study panels.',
          caption: 'Mock overview for the internal projects archive.',
        }}
      />

      <div className="project-grid">
        {siteContent.projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  )
}
