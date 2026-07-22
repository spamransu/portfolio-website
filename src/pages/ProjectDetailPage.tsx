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
      <div className={`md-wrapper ${sty.page}`}>
        <InternalHero eyebrow={detailCopy?.eyebrow ?? 'Projects'} title={detailCopy?.notFoundTitle ?? 'Project not found'} intro={detailCopy?.notFoundIntro ?? 'That case study is missing or has not been published yet.'} />
        <Link className="button button--primary" to="/projects">
          {detailCopy?.backToProjectsLabel ?? 'Back to projects'}
        </Link>
      </div>
    )
  }

  const nextProject = siteContent.projects[(projectIndex + 1) % siteContent.projects.length]

  return (
    <div className={`lg-wrapper ${sty.page}`}>
      <InternalHero
        eyebrow={`${project.year} · ${project.client}`}
        title={project.title}
        intro={project.summary}
        media={project.gallery?.[0] ?? project.image}
        actions={
          <div className="button-row">
            <Link className="button button--primary" to="/contact">
              {detailCopy?.startProjectLabel ?? 'Start a project'}
            </Link>
            <Link className="button button--ghost" to="/projects">
              {detailCopy?.backToProjectsLabel ?? 'Back to projects'}
            </Link>
          </div>
        }
      />

      <Section title={detailCopy?.snapshotTitle ?? 'Project snapshot'} intro={project.challenge}>
        <dl className={sty.snapshotGrid}>
          <div className={sty.snapshotCard}>
            <dt>{detailCopy?.roleLabel ?? 'Role'}</dt>
            <dd>{project.role}</dd>
          </div>
          <div className={sty.snapshotCard}>
            <dt>{detailCopy?.clientLabel ?? 'Client'}</dt>
            <dd>{project.client}</dd>
          </div>
          <div className={sty.snapshotCard}>
            <dt>{detailCopy?.yearLabel ?? 'Year'}</dt>
            <dd>{project.year}</dd>
          </div>
          <div className={sty.snapshotCard}>
            <dt>{detailCopy?.stackLabel ?? 'Stack'}</dt>
            <dd>
              <ul className={sty.snapshotStack} aria-label={(detailCopy?.stackAriaTemplate ?? '{title} stack').replace('{title}', project.title)}>
                {project.stack.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
      </Section>

      {project.sections?.map((section, index) => {
        const reverse = index % 2 === 1
        const sectionImage = section.image ?? project.gallery?.[index]

        return (
          <Section key={section.title} title={section.title}>
            <div className={`${sty.mediaSplit} ${reverse ? sty.mediaSplitReverse : ''}`}>
              {sectionImage ? (
                <figure className={sty.galleryCard}>
                  <img className={sty.mediaImage} src={sectionImage.src} alt={sectionImage.alt} />
                  {sectionImage.caption ? <p className={sty.mediaCaption}>{sectionImage.caption}</p> : null}
                </figure>
              ) : null}

              <div className={sty.copyStack}>
                <p>{section.body}</p>
                {section.title === 'Approach' ? (
                  <ul className="check-list">
                    {project.approach.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
                {section.title === 'Outcome' ? (
                  <ul className="check-list">
                    {project.outcome.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
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
                {item.caption ? <p className={sty.mediaCaption}>{item.caption}</p> : null}
              </figure>
            ))}
          </div>
        </Section>
      ) : null}

      <section className={sty.infoGrid}>
        <div className={sty.ctaPanel}>
          <p className="eyebrow">{detailCopy?.nextProjectEyebrow ?? 'Next up'}</p>
          <h2>{nextProject.title}</h2>
          <p>{nextProject.summary}</p>
          <Link className="button button--primary" to={`/projects/${nextProject.slug}`}>
            {detailCopy?.nextProjectLabel ?? 'View next project'}
          </Link>
        </div>

        <div className={sty.ctaPanel}>
          <p className="eyebrow">{detailCopy?.similarWorkEyebrow ?? 'Need something similar?'}</p>
          <h2>{detailCopy?.similarWorkTitle ?? 'Open for frontend and design-to-code work.'}</h2>
          <p>{detailCopy?.similarWorkIntro ?? 'Available for portfolio sites, landing pages, responsive cleanup, and interface implementation.'}</p>
          <Link className="button button--ghost" to="/contact">
            {detailCopy?.similarWorkLabel ?? 'Contact me'}
          </Link>
        </div>
      </section>
    </div>
  )
}
