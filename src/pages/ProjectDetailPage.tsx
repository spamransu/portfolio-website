import { Link, useParams } from 'react-router-dom'
import { InternalHero } from '../components/InternalHero'
import { Section } from '../components/Section'
import { siteContent } from '../content/siteContent'
import sty from './InternalPages.module.scss'

export function ProjectDetailPage() {
  const { slug } = useParams()
  const projectIndex = siteContent.projects.findIndex((entry) => entry.slug === slug)
  const project = projectIndex >= 0 ? siteContent.projects[projectIndex] : undefined
  const detailCopy = siteContent.projectDetailPage

  if (!project) {
    return (
      <div className={sty.page}>
        <InternalHero eyebrow={detailCopy?.eyebrow ?? 'Projects'} title={detailCopy?.notFoundTitle ?? 'Project not found'} intro={detailCopy?.notFoundIntro ?? 'That case study is missing or has not been published yet.'} actions={<Link className="button button--primary" to="/projects">{detailCopy?.backToProjectsLabel ?? 'Back to projects'}</Link>} />
      </div>
    )
  }

  const nextProject = siteContent.projects[(projectIndex + 1) % siteContent.projects.length]

  return (
    <div className={sty.page}>
      <InternalHero
        eyebrow={`${project.year} · ${project.client}`}
        title={project.title}
        intro={project.summary}
        media={project.image ?? project.gallery?.[0]}
        actions={
          <div className="button-row">
            <Link className="button button--primary" to="/contact">{detailCopy?.startProjectLabel ?? 'Start a project'}</Link>
            <Link className="button button--ghost" to="/projects">{detailCopy?.backToProjectsLabel ?? 'Back to projects'}</Link>
          </div>
        }
      />

      <section className={sty.snapshotSection} aria-labelledby="project-snapshot-title">
        <div className="lg-wrapper">
          <h2 className="sr-only" id="project-snapshot-title">{detailCopy?.snapshotTitle ?? 'Project snapshot'}</h2>
          <dl className={sty.snapshotGrid}>
            <div><dt>{detailCopy?.roleLabel ?? 'Role'}</dt><dd>{project.role}</dd></div>
            <div><dt>{detailCopy?.clientLabel ?? 'Client'}</dt><dd>{project.client}</dd></div>
            <div><dt>{detailCopy?.yearLabel ?? 'Year'}</dt><dd>{project.year}</dd></div>
            <div><dt>{detailCopy?.stackLabel ?? 'Stack'}</dt><dd>{project.stack.join(', ')}</dd></div>
          </dl>
        </div>
      </section>

      {project.sections?.map((section, index) => {
        const sectionImage = section.image ?? project.gallery?.[index]
        return (
          <Section key={section.title} title={section.title}>
            <div className={sty.caseStudySection}>
              <div className={sty.proseLead}>
                <p>{section.body}</p>
                {section.kind === 'approach' ? <ul className="check-list">{project.approach.map((item) => <li key={item}>{item}</li>)}</ul> : null}
                {section.kind === 'outcome' ? <ul className="check-list">{project.outcome.map((item) => <li key={item}>{item}</li>)}</ul> : null}
              </div>
              {sectionImage ? (
                <figure className={sty.galleryCard}>
                  <img className={sty.mediaImage} src={sectionImage.src} alt={sectionImage.alt} />
                  {sectionImage.caption ? <figcaption className={sty.mediaCaption}>{sectionImage.caption}</figcaption> : null}
                </figure>
              ) : null}
            </div>
          </Section>
        )
      })}

      {project.gallery?.length ? (
        <Section title={detailCopy?.galleryTitle ?? 'Project gallery'} intro={detailCopy?.galleryIntro ?? 'Mock visuals used to support the case-study narrative.'}>
          <div className={sty.gallery}>
            {project.gallery.map((item) => (
              <figure className={sty.galleryCard} key={`${item.src}-${item.alt}`}>
                <img className={sty.mediaImage} src={item.src} alt={item.alt} />
                {item.caption ? <figcaption className={sty.mediaCaption}>{item.caption}</figcaption> : null}
              </figure>
            ))}
          </div>
        </Section>
      ) : null}

      <section className={sty.nextProject}>
        <div className="lg-wrapper">
          <Link to={`/projects/${nextProject.slug}`}>
            <span>{detailCopy?.nextProjectEyebrow ?? 'Next project'}</span>
            <strong>{nextProject.title}</strong>
            <span>{nextProject.year} →</span>
          </Link>
        </div>
      </section>

      <section className={sty.projectCta}>
        <div className="lg-wrapper">
          <div>
            <p className="eyebrow">{detailCopy?.similarWorkEyebrow ?? 'Have a project in mind?'}</p>
            <h2>{detailCopy?.similarWorkTitle ?? 'Let’s make something deliberate.'}</h2>
            <Link className="button" to="/contact">{detailCopy?.similarWorkLabel ?? 'Get in touch'}</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
