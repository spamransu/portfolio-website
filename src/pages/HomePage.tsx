import { Link } from 'react-router-dom'
import { ContactForm } from '../components/ContactForm'
import { ProjectCard } from '../components/ProjectCard'
import { siteContent, type HomeStatTone, type Project } from '../content/siteContent'
import sty from './HomePage.module.scss'

const statToneClassNames: Record<HomeStatTone, string> = {
  accent: sty.statAccent,
  'accent-2': sty.statAccent2,
  'accent-3': sty.statAccent3,
}

function getFeaturedProjects(): Project[] {
  const featuredSlugs = siteContent.home.featuredProjects.slugs
  const projects = featuredSlugs
    .map((slug) => siteContent.projects.find((project) => project.slug === slug))
    .filter((project): project is Project => Boolean(project))

  return projects.length ? projects : siteContent.projects.slice(0, 4)
}

function renderAccentedTitle(title: string, accentPhrase?: string) {
  if (!accentPhrase || !title.includes(accentPhrase)) return title
  const [before, after] = title.split(accentPhrase)

  return <>{before}<span>{accentPhrase}</span>{after}</>
}

export function HomePage() {
  const featuredProjects = getFeaturedProjects()
  const hero = siteContent.home.hero
  const title = hero.titleLines.join(' ')
  const skillGroups = siteContent.home.skills.groups

  return (
    <div className={sty.root}>
      <section className={sty.hero}>
        <div className="lg-wrapper">
          <div className={sty.heroInner}>
            <div className={sty.dateline}>
              <span>{hero.dateline?.left ?? hero.eyebrow}</span>
              <span>{hero.dateline?.right ?? siteContent.site.tagline}</span>
            </div>

            <div className={sty.heroGrid}>
              <h1>{renderAccentedTitle(title, hero.accentPhrase)}</h1>
              <div className={sty.heroSupport}>
                <p>{hero.description || siteContent.site.tagline}</p>
                {hero.index?.length ? (
                  <dl className={sty.index}>
                    {hero.index.map((item) => (
                      <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>
                    ))}
                  </dl>
                ) : null}
                <div className="button-row">
                  <a className="button button--primary" href="#contact">{siteContent.home.cta.primaryLabel}</a>
                  {siteContent.home.cta.secondaryLabel ? (
                    <Link className="button button--ghost" to="/resume">{siteContent.home.cta.secondaryLabel}</Link>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {featuredProjects.length ? (
        <section className={sty.featured}>
          <div className="lg-wrapper">
            <div className={sty.sectionInner}>
              <div className={sty.featuredHeading}>
                <div>
                  <p className="eyebrow">{siteContent.home.featuredProjects.title}</p>
                  {siteContent.home.featuredProjects.intro ? <p className={sty.featuredIntro}>{siteContent.home.featuredProjects.intro}</p> : null}
                </div>
                <p className={sty.meta}>{String(featuredProjects.length).padStart(2, '0')} projects</p>
              </div>
              <div className={sty.featuredCards}>
                {featuredProjects.map((project) => (
                  <ProjectCard key={project.slug} project={project} />
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className={sty.practice}>
        <div className="lg-wrapper">
          <div className={sty.sectionInner}>
            <div className={sty.practiceCopy}>
              <div>
                <p className="eyebrow">{siteContent.home.bio.eyebrow}</p>
                <h2>{siteContent.home.bio.titleLines.join(' ')}</h2>
              </div>
              <p>{siteContent.home.bio.description}</p>
            </div>
            <div className={sty.stats}>
              {siteContent.home.stats.map((stat) => (
                <div key={stat.label}>
                  <strong className={statToneClassNames[stat.tone]}>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={sty.skills}>
        <div className="lg-wrapper">
          <div className={sty.skillsGrid}>
            <div>
              <p className="eyebrow">Capabilities</p>
              <h2>{siteContent.home.skills.title}</h2>
              <p>{siteContent.home.skills.description}</p>
            </div>
            {skillGroups?.length ? (
              <div className={sty.skillGroups}>
                {skillGroups.map((group) => (
                  <article key={group.title}>
                    <h3>{group.title}</h3>
                    <ul aria-label={`${group.title} skills`}>
                      {group.items.map((skill, index) => (
                        <li className={index % 3 === 1 ? sty.skillFlare : index % 3 === 2 ? sty.skillIris : undefined} key={skill}>{skill}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            ) : (
              <ul aria-label={siteContent.home.skills.cloudAriaLabel ?? 'Skills cloud'}>
                {siteContent.home.skills.items.map((skill, index) => (
                  <li className={index % 3 === 1 ? sty.skillFlare : index % 3 === 2 ? sty.skillIris : undefined} key={skill}>{skill}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className={sty.contact} id="contact">
        <div className="lg-wrapper">
          <div className={sty.contactGrid}>
            <div className={sty.contactCopy}>
              <p className="eyebrow">Start a conversation</p>
              <h2>{siteContent.home.contact.title}</h2>
              <p>{siteContent.contact.availability}. Reach directly at <a href={`mailto:${siteContent.site.email}`}>{siteContent.site.email}</a>.</p>
            </div>
            <ContactForm contact={siteContent.home.contact} recipientEmail={siteContent.site.email} showIntro={false} />
          </div>
        </div>
      </section>
    </div>
  )
}
