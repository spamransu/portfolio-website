import { Link, useLocation, useParams } from 'react-router-dom'
import { LuArrowLeft, LuArrowRight } from 'react-icons/lu'
import { siteContent, type ImageAsset, type Project } from '../content/siteContent'
import sty from './ProjectDetailPage.module.scss'
import { ScrollOpacityText } from '../components/ScrollOpacityText'
import { ProjectStack } from '../components/ProjectStack'

const sectionLabel = (index: string, label: string) => `[ ${index} / ${label} ]`

const getProjectImage = (project: Project): ImageAsset | undefined => project.image ?? project.gallery[0]

const getRelatedProjects = (projects: Project[], currentIndex: number): Project[] =>
  projects
    .filter((_, index) => index !== currentIndex)
    .slice(0, 2)

function ProjectVisual({ image, className = '', loading = 'lazy' }: { image?: ImageAsset; className?: string; loading?: 'eager' | 'lazy' }) {
  if (!image) return <div className={`${sty.visualPlaceholder} ${className}`} aria-label="Project visual placeholder" />

  return (
    <figure className={`${sty.visual} ${className}`}>
      <img src={image.src} alt={image.alt} loading={loading} />
      {image.caption ? <figcaption>{image.caption}</figcaption> : null}
    </figure>
  )
}

export function ProjectDetailPage() {
  const { slug } = useParams()
  const location = useLocation()
  const backPath = typeof location.state?.from === 'string' && location.state.from.startsWith('/') ? location.state.from : '/projects'
  const projectIndex = siteContent.projects.findIndex((entry) => entry.slug === slug)
  const project = projectIndex >= 0 ? siteContent.projects[projectIndex] : undefined
  const detailCopy = siteContent.projectDetailPage

  if (!project) {
    return (
      <main className={sty.page}>
        <section className={sty.notFound} data-text-reveal-group="entry">
          <div className="lg-wrapper">
            <div>
              <h1 data-text-reveal="heading">{detailCopy?.notFoundTitle ?? 'Project not found'}</h1>
              <p data-text-reveal="copy">{detailCopy?.notFoundIntro ?? 'That case study is missing or has not been published yet.'}</p>
              <Link className="button button--primary" to={backPath}><LuArrowLeft aria-hidden="true" focusable="false" />{detailCopy?.backToProjectsLabel ?? 'Back to projects'}</Link>
            </div>
          </div>
        </section>
      </main>
    )
  }

  const projects = siteContent.projects
  const relatedProjects = getRelatedProjects(projects, projectIndex)
  const openingImage = getProjectImage(project)
  const imagePair = project.gallery.slice(0, 2)
  const detailImages = project.gallery.slice(2, 4)

  return (
    <main className={sty.page}>
      <section className={sty.hero} data-text-reveal-group="entry" aria-labelledby="project-title">
        <div className="lg-wrapper">
          <div className={sty.heroInner}>
            <Link className={sty.backLink} to={backPath}><LuArrowLeft aria-hidden="true" focusable="false" />{detailCopy?.backToProjectsLabel ?? 'All Projects'}</Link>
            <div className={sty.heroCopy}>
              <h1 id="project-title" data-text-reveal="heading">{project.title}</h1>
              <p data-text-reveal="copy">{project.summary}</p>

            </div>
            <div className={sty.heroAside}>
              <ProjectStack items={project.stack} reverseFlow ariaLabel={`${project.title} technologies`} />
              <dl className={sty.metaTable} data-text-reveal="copy" aria-label="Project metadata">
                <div><dt>{detailCopy?.clientLabel ?? 'Client'}</dt><dd>{project.client}</dd></div>
                <div><dt>{detailCopy?.yearLabel ?? 'Year'}</dt><dd>{project.year}</dd></div>
                <div><dt>{detailCopy?.roleLabel ?? 'Role'}</dt><dd>{project.role}</dd></div>
                {project.status ? <div><dt>Status</dt><dd>{project.status}</dd></div> : null}
              </dl>
            </div>

          </div>
        </div>
      </section>

      <section className={sty.openingVisual} aria-label="Project opening visual">
        <div className="lg-wrapper">
          <ProjectVisual image={openingImage} className="full-width" loading="eager" />
        </div>
      </section>

      <section className={sty.paperSection} data-text-reveal-group="scrub" aria-labelledby="overview-title">
        <div className="lg-wrapper">
          <div className={sty.editorialBlock}>
            <p className={sty.lightLabel} data-text-reveal="copy">{sectionLabel('01', 'OVERVIEW')}</p>
            <div>
              <ScrollOpacityText id="overview-title" as="h2" className={sty.statement}>{project.overview}</ScrollOpacityText>
            </div>
          </div>
        </div>
      </section>

      <section className={sty.imageRhythm} aria-label="Project visual pair">
        <div className="lg-wrapper">
          <div className={sty.imagePair}>
            <ProjectVisual image={imagePair[0]} />
            <ProjectVisual image={imagePair[1]} />
          </div>
        </div>
      </section>

      <section className={sty.narrativeSection} data-text-reveal-group="scrub" aria-labelledby="challenge-title">
        <div className="lg-wrapper">
          <div className={sty.editorialBlock}>
            <p className={sty.kicker} data-text-reveal="copy">{sectionLabel('02', 'CHALLENGE')}</p>
            <div className={sty.prose}>
              <h2 id="challenge-title" data-text-reveal="heading">Challenge</h2>
              <p data-text-reveal="copy">{project.challenge}</p>
              <p data-text-reveal="copy">{project.summary}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={sty.narrativeSection} data-text-reveal-group="scrub" aria-labelledby="approach-title">
        <div className="lg-wrapper">
          <div className={sty.editorialBlock}>
            <p className={sty.kicker} data-text-reveal="copy">{sectionLabel('03', 'APPROACH')}</p>
            <div className={sty.prose}>
              <h2 id="approach-title" data-text-reveal="heading">Approach</h2>
              <p data-text-reveal="copy">{project.approachSummary}</p>
              <ol className={sty.cardGrid} data-text-reveal="copy">
                {project.approach.map((item, index) => (
                  <li className={sty.numberedCard} key={item}>
                    <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                    <p>{item}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className={sty.imageRhythm} aria-label="Project detail visuals">
        <div className="lg-wrapper">
          <div className={sty.asymPair}>
            <ProjectVisual image={detailImages[0] ?? project.gallery[0]} />
            <ProjectVisual image={detailImages[1] ?? project.gallery[1]} />
          </div>
        </div>
      </section>

      <section className={sty.narrativeSection} data-text-reveal-group="scrub" aria-labelledby="result-title">
        <div className="lg-wrapper">
          <div className={sty.editorialBlock}>
            <p className={sty.kicker} data-text-reveal="copy">{sectionLabel('04', 'RESULT')}</p>
            <div className={sty.prose}>
              <h2 id="result-title" data-text-reveal="heading">Result</h2>
              <p data-text-reveal="copy">{project.resultSummary}</p>
              <ol className={sty.cardGrid} data-text-reveal="copy">
                {project.outcome.map((item, index) => (
                  <li className={sty.numberedCard} key={item}>
                    <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                    <p>{item}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className={sty.scopeSection} data-text-reveal-group="scrub" aria-labelledby="scope-title">
        <div className="lg-wrapper">
          <div className={sty.editorialBlock}>
            <p className={sty.kicker} data-text-reveal="copy">[ PROJECT SCOPE ]</p>
            <div>
              <h2 id="scope-title" data-text-reveal="heading">Services / Role / Tools</h2>
              <ul className={sty.scopeList} data-text-reveal="copy">{project.scope.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>
        </div>
      </section>

      <section className={sty.quoteBand} data-text-reveal-group="scrub" aria-label="Project reflection">
        <div className="lg-wrapper">
          <div>
            <p className={sty.quoteLabel} data-text-reveal="copy">Project Reflection</p>
            <ScrollOpacityText as="blockquote">{`“${project.reflection}”`}</ScrollOpacityText>
          </div>
        </div>
      </section>

      {/* <nav className={sty.projectNav} aria-label="Adjacent projects">
        <div className="lg-wrapper">
          <div>
              <Link to={`/projects/${previousProject.slug}`}>
              <span><LuArrowLeft aria-hidden="true" focusable="false" />Previous Project</span>
              <strong>{previousProject.title}</strong>
            </Link>
            <Link to={`/projects/${nextProject.slug}`}>
              <span>Next Project<LuArrowRight aria-hidden="true" focusable="false" /></span>
              <strong>{nextProject.title}</strong>
            </Link>
          
          </div>
        </div>
      </nav> */}

      <section className={sty.relatedSection} data-text-reveal-group="scrub" aria-labelledby="related-title">
        <div className="lg-wrapper">
          <div className={sty.relatedHeader}>
            <div>
              <p className={sty.kicker} data-text-reveal="copy">[ MORE PROJECTS ]</p>
              <h2 id="related-title" data-text-reveal="heading">More Selected Work</h2>
            </div>
            <Link className={sty.viewAll} to="/projects">View All Work<LuArrowRight aria-hidden="true" focusable="false" /></Link>
          </div>
          <div className={sty.relatedGrid}>
            {relatedProjects.map((entry) => (
              <article className={sty.relatedCard} key={entry.slug}>
                <Link to={`/projects/${entry.slug}`}>
                  <span>{entry.year} / {entry.kind === 'experiment' ? 'Experiment' : 'Case study'}</span>
                  <ProjectVisual image={getProjectImage(entry)} />
                  <h3 data-text-reveal="copy">{entry.title}</h3>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
