import { Link } from 'react-router-dom'
import { ContactForm } from '../components/ContactForm'
import { siteContent, type HomeStatTone, type Project } from '../content/siteContent'
import sty from './HomePage.module.scss'

const statToneClassNames: Record<HomeStatTone, string> = {
  accent: sty.statAccent,
  'accent-2': sty.statAccent2,
  'accent-3': sty.statAccent3,
}

function getFeaturedProject(): Project | undefined {
  const featuredSlug = siteContent.home.featuredProjects.slugs[0]
  return siteContent.projects.find((project) => project.slug === featuredSlug) ?? siteContent.projects[0]
}

function renderAccentedTitle(title: string, accentPhrase?: string) {
  if (!accentPhrase || !title.includes(accentPhrase)) return title
  const [before, after] = title.split(accentPhrase)

  return <>{before}<span>{accentPhrase}</span>{after}</>
}

export function HomePage() {
  const featured = getFeaturedProject()
  const hero = siteContent.home.hero
  const title = hero.titleLines.join(' ')
  const totalFeatured = Math.max(siteContent.home.featuredProjects.slugs.length, 1)

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

      {featured ? (
        <section className={sty.featured}>
          <div className="lg-wrapper">
            <div className={sty.sectionInner}>
              <div className={sty.featuredHeading}>
                <p className="eyebrow">{siteContent.home.featuredProjects.title}</p>
                <p className={sty.meta}>01 / {String(totalFeatured).padStart(2, '0')}</p>
              </div>
              <div className={sty.featuredGrid}>
                <div className={sty.featuredCopy}>
                  <span className={sty.featuredIndex}>01</span>
                  <h2>{featured.title}</h2>
                  <p>{featured.summary}</p>
                  <dl className={sty.projectMeta}>
                    <div><dt>Client</dt><dd>{featured.client}</dd></div>
                    <div><dt>Role</dt><dd>{featured.role}</dd></div>
                    <div><dt>Year</dt><dd>{featured.year}</dd></div>
                    <div><dt>Discipline</dt><dd>{featured.stack[0]}</dd></div>
                  </dl>
                  <ul className="tag-list" aria-label={(siteContent.home.featuredProjects.stackAriaTemplate ?? '{title} stack').replace('{title}', featured.title)}>
                    {featured.stack.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                  <div className={sty.featuredLinks}>
                    <Link to={`/projects/${featured.slug}`}>Read the case study ↗</Link>
                    <Link to="/projects">All projects →</Link>
                  </div>
                </div>
                <figure className={sty.featuredMedia}>
                  {featured.image ? <img src={featured.image.src} alt={featured.image.alt} /> : null}
                  <figcaption>Fig. 01 — {featured.title}, {featured.year}</figcaption>
                </figure>
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
            <ul aria-label={siteContent.home.skills.cloudAriaLabel ?? 'Skills cloud'}>
              {siteContent.home.skills.items.map((skill, index) => (
                <li className={index % 3 === 1 ? sty.skillFlare : index % 3 === 2 ? sty.skillIris : undefined} key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={sty.contact} id="contact">
        <div className="lg-wrapper">
          <div className={sty.contactGrid}>
            <div className={sty.contactCopy}>
              <p className="eyebrow">Start a conversation</p>
              <h2>{siteContent.home.contact.title}</h2>
              <p>{siteContent.site.location}. Reach directly at <a href={`mailto:${siteContent.site.email}`}>{siteContent.site.email}</a>.</p>
            </div>
            <ContactForm contact={siteContent.home.contact} recipientEmail={siteContent.site.email} showIntro={false} />
          </div>
        </div>
      </section>
    </div>
  )
}
