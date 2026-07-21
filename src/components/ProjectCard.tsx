import { Link } from 'react-router-dom'
import type { Project } from '../content/siteContent'
import sty from './ProjectCard.module.scss'

type ProjectCardProps = {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className={sty.root}>
      <div className={sty.meta}>
        <span>{project.year}</span>
        <span>{project.client}</span>
      </div>
      <h2>
        <Link to={`/projects/${project.slug}`}>{project.title}</Link>
      </h2>
      <p>{project.summary}</p>
      <p className={sty.role}>Role: {project.role}</p>
      <ul className="tag-list" aria-label={`${project.title} technologies`}>
        {project.stack.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  )
}
