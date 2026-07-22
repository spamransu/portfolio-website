import { Link, useParams } from 'react-router-dom'
import { InternalHero } from '../components/InternalHero'
import { Section } from '../components/Section'
import { siteContent } from '../content/siteContent'
import sty from './InternalPages.module.scss'

export function ProjectDetailPage() {
  const { slug } = useParams()
  const projectIndex = siteContent.projects.findIndex((entry) => entry.slug === slug)
  const project = projectIndex >= 0 ? siteContent.projects[projectIndex] : undefined

  if (!project) {
    return (
      <div className={`md-wrapper ${sty.page}`}>
        <InternalHero eyebrow="Projects" title="Project not found" intro="That case study is missing or has not been published yet." />
        <Link className="button button--primary" to="/projects">
          Back to projects
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
              Start a project
            </Link>
            <Link className="button button--ghost" to="/projects">
              Back to projects
            </Link>
          </div>
        }
      />

      <Section title="Project snapshot">
        <dl className={sty.metaList}>
          <div>
            <dt>Role</dt>
            <dd>{project.role}</dd>
          </div>
          <div>
            <dt>Client</dt>
            <dd>{project.client}</dd>
          </div>
          <div>
            <dt>Year</dt>
            <dd>{project.year}</dd>
          </div>
          <div>
            <dt>Stack</dt>
            <dd>{project.stack.join(', ')}</dd>
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
        <Section title="Project gallery" intro="Mock visuals used to support the case-study narrative.">
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
          <p className="eyebrow">Next up</p>
          <h2>{nextProject.title}</h2>
          <p>{nextProject.summary}</p>
          <Link className="button button--primary" to={`/projects/${nextProject.slug}`}>
            View next project
          </Link>
        </div>

        <div className={sty.ctaPanel}>
          <p className="eyebrow">Need something similar?</p>
          <h2>Open for frontend and design-to-code work.</h2>
          <p>Available for portfolio sites, landing pages, responsive cleanup, and interface implementation.</p>
          <Link className="button button--ghost" to="/contact">
            Contact me
          </Link>
        </div>
      </section>
    </div>
  )
}
