import { Link } from 'react-router-dom'
import { LuArrowDown, LuArrowRight, LuArrowUpRight, LuCalendarCheck } from 'react-icons/lu'
import { ContactForm } from '../components/ContactForm'
import { FeaturedProjectCarousel } from '../components/FeaturedProjectCarousel'
import { blogPosts } from '../content/blogContent'
import { siteContent, type HomeStatTone } from '../content/siteContent'
import sty from './HomePage.module.scss'

const statToneClassNames = {
  accent: sty.statAccent,
  'accent-2': sty.statAccent2,
  'accent-3': sty.statAccent3,
} satisfies Record<HomeStatTone, string>

function renderAccentedTitle(title: string, accentPhrase?: string) {
  if (!accentPhrase || !title.includes(accentPhrase)) return title
  const [before, after] = title.split(accentPhrase)

  return <>{before}<span>{accentPhrase}</span>{after}</>
}

export function HomePage() {
  const hero = siteContent.home.hero
  const title = hero.titleLines.join(' ')
  const skillGroups = siteContent.home.skills.groups

  return (
    <div className={sty.root}>
      <section className={sty.hero} data-text-reveal-group="entry">
        <div className="lg-wrapper">
          <div className={sty.heroInner}>
            <div className={sty.dateline}>
              <span data-text-reveal="copy">{hero.dateline?.left ?? hero.eyebrow}</span>
              <span data-text-reveal="copy">{hero.dateline?.right ?? siteContent.site.tagline}</span>
            </div>

            <div className={sty.heroGrid}>
              <h1 data-text-reveal="heading">{renderAccentedTitle(title, hero.accentPhrase)}</h1>
              <div className={sty.heroSupport}>
                <p data-text-reveal="copy">{hero.description || siteContent.site.tagline}</p>
                {hero.index?.length ? (
                  <dl className={sty.index} data-text-reveal="copy">
                    {hero.index.map((item) => (
                      <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>
                    ))}
                  </dl>
                ) : null}
                <div className="button-row">
                  <a className="button button--primary" href="#selected-work">{siteContent.home.cta.primaryLabel}<LuArrowDown aria-hidden="true" focusable="false" /></a>
                  {siteContent.home.cta.secondaryLabel ? (
                    <Link className="button button--ghost" to="/resume">{siteContent.home.cta.secondaryLabel}<LuArrowRight aria-hidden="true" focusable="false" /></Link>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {siteContent.home.featuredProjects.slugs.length ? (
        <section className={sty.featured} id="selected-work">
          <div className="lg-wrapper">
            <div className={sty.sectionInner} data-text-reveal-group="scrub">
              <FeaturedProjectCarousel
                projects={siteContent.projects}
                slugs={siteContent.home.featuredProjects.slugs}
                title={siteContent.home.featuredProjects.title}
                stackAriaTemplate={siteContent.home.featuredProjects.stackAriaTemplate}
              />
            </div>
          </div>
        </section>
      ) : null}

      <section className={sty.practice}>
        <div className="lg-wrapper">
          <div className={sty.sectionInner} data-text-reveal-group="scrub">
            <div className={sty.practiceCopy}>
              <div>
                                <h2 data-text-reveal="heading">{siteContent.home.bio.titleLines.join(' ')}</h2>
              </div>
              <p data-text-reveal="copy">{siteContent.home.bio.description}</p>
            </div>
            <div className={sty.stats} data-text-reveal="copy">
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
          <div className={sty.skillsGrid} data-text-reveal-group="scrub">
            <div>
              <h2 data-text-reveal="heading">{siteContent.home.skills.title}</h2>
              <p data-text-reveal="copy">{siteContent.home.skills.description}</p>
            </div>
            {skillGroups?.length ? (
              <div className={sty.skillGroups} data-text-reveal="copy">
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
              <ul data-text-reveal="copy" aria-label={siteContent.home.skills.cloudAriaLabel ?? 'Skills cloud'}>
                {siteContent.home.skills.items.map((skill, index) => (
                  <li className={index % 3 === 1 ? sty.skillFlare : index % 3 === 2 ? sty.skillIris : undefined} key={skill}>{skill}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {blogPosts.length ? (
        <section className={sty.notes}>
          <div className="lg-wrapper">
            <div className={sty.notesInner} data-text-reveal-group="scrub">
              <div className={sty.notesHeader}>
                <span data-text-reveal="copy">Latest articles</span>
                <h2 data-text-reveal="heading">Fresh from the blog</h2>
              </div>
              <div className={sty.notesGrid} data-text-reveal="copy">
                {blogPosts.slice(0, 3).map((post) => (
                  <Link className={sty.noteCard} key={post.slug} to={`/blog/${post.slug}`} state={{ from: '/' }}>
                    <div className={sty.noteMeta}>{post.date} <span aria-hidden="true">·</span> 1 min</div>
                    <h3>{post.title}</h3>
                    <p>{post.excerpt ?? post.body.split('\n')[0]}</p>
                    <span className={sty.noteRead}>Read article<LuArrowUpRight className={sty.noteArrow} aria-hidden="true" focusable="false" /></span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className={sty.contact} id="contact">
        <div className="lg-wrapper">
          <div className={sty.contactGrid} data-text-reveal-group="scrub">
            <div className={sty.contactCopy}>
              <h2 data-text-reveal="heading">{siteContent.home.contact.title}</h2>
              <p data-text-reveal="copy"><LuCalendarCheck aria-hidden="true" className={sty.inlineIcon} focusable="false" />
                {siteContent.contact.availability}. Reach directly at 
                <a href={`mailto:${siteContent.site.email}`}>
                  {siteContent.site.email}
                </a>.
              </p>
            </div>
            <ContactForm contact={siteContent.home.contact} recipientEmail={siteContent.site.email} showIntro={false} />
          </div>
        </div>
      </section>
    </div>
  )
}
