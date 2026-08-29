import { Link, useLocation, useNavigate } from 'react-router-dom'
import { siteContent, type Project } from '../content/siteContent'
import sty from './ProjectCard.module.scss'
import { ProjectStack } from './ProjectStack'

type ProjectCardProps = {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const roleLabelPrefix = siteContent.projectsPage?.roleLabelPrefix ?? 'Role'
  const stackAriaLabel = (siteContent.projectsPage?.stackAriaTemplate ?? '{title} technologies').replace('{title}', project.title)
  const projectPath = `/projects/${project.slug}`

  const handleCardClick = (event: React.MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('a, button')) return
    navigate(projectPath, { state: { from: location.pathname } })
  }

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    navigate(projectPath, { state: { from: location.pathname } })
  }

  return (
    <article
      className={sty.root}
      role="link"
      tabIndex={0}
      aria-label={`Open ${project.title} case study`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
    >
      <Link to={`/projects/${project.slug}`} state={{ from: location.pathname }} className={sty.imageLink}>
        {project.image ? <img src={project.image.src} alt={project.image.alt} className={sty.image} /> : null}
      </Link>

      <div className={sty.content} data-text-reveal="copy">
        <div className={sty.titleRow}>
          <h2><Link to={`/projects/${project.slug}`} state={{ from: location.pathname }}>{project.title}</Link></h2>
          <span className={sty.year}>{project.year}</span>
        </div>
        <p>{project.summary}</p>
        <div className={sty.meta}>
          <span>{project.client}</span>
          {project.status ? <span>{project.status}</span> : null}
          <span>{roleLabelPrefix}: {project.role}</span>
        </div>
        <div className={sty.stackRow}>
         {/* / {project.kind ? <span className={sty.kind}>{project.kind === 'case-study' ? 'Case study' : 'Experiment'}</span> : null} */}
          <ProjectStack items={project.stack} ariaLabel={stackAriaLabel} />
        </div>
      </div>
    </article>
  )
}
