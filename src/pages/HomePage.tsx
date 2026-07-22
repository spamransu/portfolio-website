import { useMemo } from 'react'
import { ContactForm } from '../components/ContactForm'
import { siteContent, type HomeStatTone, type Project } from '../content/siteContent'
import sty from './HomePage.module.scss'

const statToneClassNames: Record<HomeStatTone, string> = {
  accent: sty.statAccent,
  'accent-2': sty.statAccent2,
  'accent-3': sty.statAccent3,
}

function getFeaturedProjects() {
  const ordered = siteContent.home.featuredProjects.slugs
    .map((slug) => siteContent.projects.find((project) => project.slug === slug))
    .filter(Boolean) as Project[]

  return ordered.length ? ordered : siteContent.projects.slice(0, 4)
}

export function HomePage() {
  const featuredProjects = useMemo(getFeaturedProjects, [])

  return (
    <div className={sty.root}>
      <section className={sty.hero}>
        <div className="lg-wrapper">
          <div className={sty.heroCopy}>
            <p className={sty.heroEyebrow}>{siteContent.home.hero.eyebrow}</p>
            <h1 className={sty.heroTitle}>{siteContent.home.hero.titleLines.join(' ')}</h1>
            {siteContent.home.hero.description ? <p className={sty.heroDescription}>{siteContent.home.hero.description}</p> : null}
            <div className={sty.heroActions}>
              <a className={sty.primaryButton} href="#contact">
                {siteContent.home.cta.primaryLabel}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className={sty.section}>
        <div className="lg-wrapper">
          <div className={sty.sectionHeadingCentered}>
            <h2>{siteContent.home.featuredProjects.title}</h2>
          </div>

          <div className={sty.projectGrid}>
            {featuredProjects.map((project) => (
              <article key={project.slug} className={sty.projectCard}>
                <a href={`/projects/${project.slug}`} className={sty.projectImageLink}>
                  {project.image ? <img src={project.image.src} alt={project.image.alt} className={sty.projectImage} /> : null}
                </a>
                <div className={sty.projectBody}>
                  <div className={sty.projectMeta}>
                    <p className={sty.projectTitle}>
                      <a href={`/projects/${project.slug}`}>{project.title}</a>
                    </p>
                    <p className={sty.projectSummary}>{project.summary}</p>
                  </div>
                  <ul className={sty.stackList} aria-label={`${project.title} stack`}>
                    {project.stack.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={sty.section}>
        <div className={`md-wrapper ${sty.bioSection}`}>
          <div className={sty.bioCopy}>
            <p className={sty.heroEyebrow}>{siteContent.home.bio.eyebrow}</p>
            <div className={sty.bioColumns}>
              <h2 className={sty.bioTitle}>{siteContent.home.bio.titleLines.join(' ')}</h2>
              <p className={sty.bioDescription}>{siteContent.home.bio.description}</p>
            </div>
          </div>

          <div className={sty.statsGrid}>
            {siteContent.home.stats.map((stat) => (
              <article key={stat.label} className={sty.statCard}>
                <p className={`${sty.statValue} ${statToneClassNames[stat.tone]}`}>{stat.value}</p>
                <p className={sty.statLabel}>{stat.label}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={sty.section}>
        <div className={`md-wrapper ${sty.skillsSection}`}>
          <div className={sty.skillsCloud}>
            {siteContent.home.skills.items.map((skill) => (
              <span key={skill} className={sty.skillPill}>
                {skill}
              </span>
            ))}
          </div>

          <div className={sty.skillsCopy}>
            <h2>{siteContent.home.skills.title}</h2>
            <p>{siteContent.home.skills.description}</p>
          </div>
        </div>
      </section>

      <section className={sty.contactSection} id="contact">
        <div className="md-wrapper">
          <ContactForm contact={siteContent.home.contact} recipientEmail={siteContent.site.email} />
        </div>
      </section>
    </div>
  )
}
