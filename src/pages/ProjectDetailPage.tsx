import { Link, useParams } from 'react-router-dom'
import { siteContent, type ImageAsset, type Project } from '../content/siteContent'
import sty from './ProjectDetailPage.module.scss'

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
  const projectIndex = siteContent.projects.findIndex((entry) => entry.slug === slug)
  const project = projectIndex >= 0 ? siteContent.projects[projectIndex] : undefined
  const detailCopy = siteContent.projectDetailPage

  if (!project) {
    return (
      <main className={sty.page}>
        <section className={sty.notFound}>
          <div className="lg-wrapper">
            <div>
              <p className={sty.kicker}>{detailCopy?.eyebrow ?? '[ PROJECTS ]'}</p>
              <h1>{detailCopy?.notFoundTitle ?? 'Project not found'}</h1>
              <p>{detailCopy?.notFoundIntro ?? 'That case study is missing or has not been published yet.'}</p>
              <Link className="button button--primary" to="/projects">{detailCopy?.backToProjectsLabel ?? 'Back to projects'}</Link>
            </div>
          </div>
        </section>
      </main>
    )
  }

  const projects = siteContent.projects
  const previousProject = projects[(projectIndex - 1 + projects.length) % projects.length]
  const nextProject = projects[(projectIndex + 1) % projects.length]
  const relatedProjects = getRelatedProjects(projects, projectIndex)
  const openingImage = getProjectImage(project)
  const imagePair = project.gallery.slice(0, 2)
  const detailImages = project.gallery.slice(2, 4)

  return (
    <main className={sty.page}>
      <section className={sty.hero} aria-labelledby="project-title">
        <div className="lg-wrapper">
          <div className={sty.heroInner}>
            <Link className={sty.backLink} to="/projects">← {detailCopy?.backToProjectsLabel ?? 'All Projects'}</Link>
            <div className={sty.heroCopy}>
              <p className={sty.kicker}>[ SELECTED CASE STUDY ]</p>
              <h1 id="project-title">{project.title}</h1>
              <p>{project.summary}</p>
            </div>
            <dl className={sty.metaTable} aria-label="Project metadata">
              <div><dt>{detailCopy?.clientLabel ?? 'Client'}</dt><dd>{project.client}</dd></div>
              <div><dt>{detailCopy?.yearLabel ?? 'Year'}</dt><dd>{project.year}</dd></div>
              <div><dt>{detailCopy?.roleLabel ?? 'Role'}</dt><dd>{project.role}</dd></div>
              {project.status ? <div><dt>Status</dt><dd>{project.status}</dd></div> : null}
            </dl>
          </div>
        </div>
      </section>

      <section className={sty.openingVisual} aria-label="Project opening visual">
        <div className="lg-wrapper">
          <ProjectVisual image={openingImage} className="full-width" loading="eager" />
        </div>
      </section>

      <section className={sty.paperSection} aria-labelledby="overview-title">
        <div className="lg-wrapper">
          <div className={sty.editorialBlock}>
            <p className={sty.lightLabel}>{sectionLabel('01', 'OVERVIEW')}</p>
            <div>
              <h2 id="overview-title" className={sty.statement}>{project.overview}</h2>
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

      <section className={sty.narrativeSection} aria-labelledby="challenge-title">
        <div className="lg-wrapper">
          <div className={sty.editorialBlock}>
            <p className={sty.kicker}>{sectionLabel('02', 'CHALLENGE')}</p>
            <div className={sty.prose}>
              <h2 id="challenge-title">Challenge</h2>
              <p>{project.challenge}</p>
              <p>{project.summary}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={sty.narrativeSection} aria-labelledby="approach-title">
        <div className="lg-wrapper">
          <div className={sty.editorialBlock}>
            <p className={sty.kicker}>{sectionLabel('03', 'APPROACH')}</p>
            <div className={sty.prose}>
              <h2 id="approach-title">Approach</h2>
              <p>{project.approachSummary}</p>
              <ul className={sty.noteList}>{project.approach.map((item) => <li key={item}>{item}</li>)}</ul>
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

      <section className={sty.narrativeSection} aria-labelledby="result-title">
        <div className="lg-wrapper">
          <div className={sty.editorialBlock}>
            <p className={sty.kicker}>{sectionLabel('04', 'RESULT')}</p>
            <div className={sty.prose}>
              <h2 id="result-title">Result</h2>
              <p>{project.resultSummary}</p>
              <ul className={sty.outcomes}>{project.outcome.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>
        </div>
      </section>

      <section className={sty.scopeSection} aria-labelledby="scope-title">
        <div className="lg-wrapper">
          <div className={sty.editorialBlock}>
            <p className={sty.kicker}>[ PROJECT SCOPE ]</p>
            <div>
              <h2 id="scope-title">Services / Role / Tools</h2>
              <ul className={sty.scopeList}>{project.scope.map((item) => <li key={item}>{item}</li>)}</ul>
              <ul className={sty.stackList} aria-label={detailCopy?.stackAriaTemplate?.replace('{title}', project.title) ?? `${project.title} tools`}>
                {project.stack.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className={sty.quoteBand} aria-label="Project reflection">
        <div className="lg-wrapper">
          <div>
            <p className={sty.quoteLabel}>Project Reflection</p>
            <blockquote>“{project.reflection}”</blockquote>
          </div>
        </div>
      </section>

      <nav className={sty.projectNav} aria-label="Adjacent projects">
        <div className="lg-wrapper">
          <div>
            <Link to={`/projects/${nextProject.slug}`}>
              <span>Next Project →</span>
              <strong>{nextProject.title}</strong>
            </Link>
            <Link to={`/projects/${previousProject.slug}`}>
              <span>← Previous Project</span>
              <strong>{previousProject.title}</strong>
            </Link>
          </div>
        </div>
      </nav>

      <section className={sty.relatedSection} aria-labelledby="related-title">
        <div className="lg-wrapper">
          <div className={sty.relatedHeader}>
            <div>
              <p className={sty.kicker}>[ MORE PROJECTS ]</p>
              <h2 id="related-title">More Selected Work</h2>
            </div>
            <Link className={sty.viewAll} to="/projects">View All Work</Link>
          </div>
          <div className={sty.relatedGrid}>
            {relatedProjects.map((entry) => (
              <article className={sty.relatedCard} key={entry.slug}>
                <Link to={`/projects/${entry.slug}`}>
                  <span>{entry.year} / {entry.kind === 'experiment' ? 'Experiment' : 'Case study'}</span>
                  <ProjectVisual image={getProjectImage(entry)} />
                  <h3>{entry.title}</h3>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
