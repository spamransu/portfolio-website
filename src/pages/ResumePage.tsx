import { InternalHero } from '../components/InternalHero'
import { Section } from '../components/Section'
import { siteContent } from '../content/siteContent'
import sty from './InternalPages.module.scss'

export function ResumePage() {
  return (
    <div className={`lg-wrapper ${sty.page}`}>
      <InternalHero eyebrow="CV / Resume" title={siteContent.resume.headline} intro={siteContent.resume.summary} media={siteContent.resume.heroImage} />

      <Section title={siteContent.resume.highlightsSectionTitle}>
        <div className={sty.statGrid}>
          {siteContent.resume.highlights.map((item) => (
            <article className={sty.statCard} key={item.label}>
              <p className={sty.statValue}>{item.value}</p>
              <p>{item.label}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title={siteContent.resume.skillsSectionTitle}>
        <ul className="tag-list tag-list--large">
          {siteContent.resume.skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      </Section>

      <Section title={siteContent.resume.experienceSectionTitle}>
        <div className={sty.timeline}>
          {siteContent.resume.experience.map((item) => (
            <article className={sty.timelineCard} key={`${item.company}-${item.role}`}>
              <div className={sty.timelineMeta}>
                <h3>{item.role}</h3>
                <p>
                  {item.company} · {item.period}
                </p>
              </div>
              <ul className="check-list">
                {item.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>
    </div>
  )
}
