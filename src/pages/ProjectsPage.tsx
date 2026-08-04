import { InternalHero } from '../components/InternalHero'
import { ProjectCard } from '../components/ProjectCard'
import { siteContent } from '../content/siteContent'
import sty from './InternalPages.module.scss'

export function ProjectsPage() {
  const projectsHeroImage = siteContent.projectsPage?.heroImage

  return (
    <div className={sty.page}>
      <InternalHero
        eyebrow={siteContent.projectsPage?.eyebrow ?? 'Projects'}
        title={siteContent.projectsPage?.title ?? 'Case studies with enough context to be useful.'}
        intro={siteContent.projectsPage?.intro ?? 'Selected frontend and design-to-code work presented as concise case studies.'}
        media={projectsHeroImage}
      />

      <section className={sty.archiveSection}>
        <div className="lg-wrapper">
          <div className={sty.projectGrid}>
            {siteContent.projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
