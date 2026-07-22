import { Link } from 'react-router-dom'
import { siteContent, type Project } from '../content/siteContent'
import sty from './ProjectCard.module.scss'

type ProjectCardProps = {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const roleLabelPrefix = siteContent.projectsPage?.roleLabelPrefix ?? 'Role'
  const stackAriaLabel = (siteContent.projectsPage?.stackAriaTemplate ?? '{title} technologies').replace('{title}', project.title)

  return (
    <article className={sty.root}>
      <Link to={`/projects/${project.slug}`} className={sty.imageLink}>
        {project.image ? <img src={project.image.src} alt={project.image.alt} className={sty.image} /> : null}
      </Link>

      <div className={sty.content}>
        <div className={sty.meta}>
          <span>{project.year}</span>
          <span>{project.client}</span>
        </div>
        <h2>
          <Link to={`/projects/${project.slug}`}>{project.title}</Link>
        </h2>
        <p>{project.summary}</p>
        <p className={sty.role}>{roleLabelPrefix}: {project.role}</p>
        <ul className="tag-list" aria-label={stackAriaLabel}>
          {project.stack.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </article>
  )
}
