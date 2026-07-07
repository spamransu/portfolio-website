import { PageHeader } from '../components/PageHeader'
import { Section } from '../components/Section'
import { siteContent } from '../content/siteContent'

export function ResumePage() {
  return (
    <div className="page-stack">
      <PageHeader eyebrow="CV / Resume" title={siteContent.resume.headline} intro={siteContent.resume.summary} />

      <Section title="Core skills">
        <ul className="tag-list tag-list--large">
          {siteContent.resume.skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      </Section>

      <Section title="Experience">
        <div className="timeline">
          {siteContent.resume.experience.map((item) => (
            <article className="timeline__item" key={`${item.company}-${item.role}`}>
              <div className="timeline__meta">
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
