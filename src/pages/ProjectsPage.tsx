import { InternalHero } from '../components/InternalHero'
import { ProjectCard } from '../components/ProjectCard'
import { siteContent, type Project } from '../content/siteContent'
import sty from './InternalPages.module.scss'

function getProjectGroups(): Array<{ title: string; description?: string; projects: Project[] }> {
  const configuredGroups = siteContent.projectsPage?.groups

  if (configuredGroups?.length) {
    return configuredGroups
      .map((group) => ({
        title: group.title,
        description: group.description,
        projects: siteContent.projects.filter((project) => group.kinds.includes(project.kind ?? 'case-study')),
      }))
      .filter((group) => group.projects.length)
  }

  return [{ title: 'Projects', projects: siteContent.projects }]
}

export function ProjectsPage() {
  const projectsHeroImage = siteContent.projectsPage?.heroImage
  const groups = getProjectGroups()

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
          <div className={sty.projectGroups}>
            {groups.map((group) => (
              <section key={group.title} className={sty.projectGroup} aria-labelledby={`project-group-${group.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                <header>
                  <p className="eyebrow" id={`project-group-${group.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>{group.title}</p>
                  {group.description ? <p>{group.description}</p> : null}
                </header>
                <div className={sty.projectGrid}>
                  {group.projects.map((project) => (
                    <ProjectCard key={project.slug} project={project} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
