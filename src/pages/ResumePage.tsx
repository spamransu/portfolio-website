import { InternalHero } from '../components/InternalHero'
import { Section } from '../components/Section'
import { siteContent } from '../content/siteContent'
import sty from './InternalPages.module.scss'

export function ResumePage() {
  return (
    <div className={sty.page}>
      <InternalHero title={siteContent.resume.headline} intro={siteContent.resume.summary} />

      <section className={sty.resumeStats} data-text-reveal-group="scrub" aria-label={siteContent.resume.highlightsSectionTitle}>
        <div className="lg-wrapper">
          <div>
            {siteContent.resume.highlights.map((item, index) => (
              <article key={item.label} data-text-reveal="copy"><strong className={index === 1 ? sty.textFlare : index === 2 ? sty.textIris : undefined}>{item.value}</strong><span>{item.label}</span></article>
            ))}
          </div>
        </div>
      </section>

      <Section title={siteContent.resume.skillsSectionTitle}>
        <ul className={sty.capabilityList} data-text-reveal="copy">
          {siteContent.resume.skills.map((skill, index) => <li className={index % 3 === 1 ? sty.skillFlare : index % 3 === 2 ? sty.skillIris : undefined} key={skill}>{skill}</li>)}
        </ul>
      </Section>



      {siteContent.resume.education?.length ? (
        <Section title={siteContent.resume.educationSectionTitle ?? 'Education and training'}>
          <ol className={sty.experienceList} data-text-reveal="copy">
            {siteContent.resume.education.map((item) => (
              <li key={`${item.school}-${item.program}`}>
                <div><h3>{item.program}</h3><p>{item.school}</p></div>
                <span>{item.period}</span>
                <ul>{item.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
              </li>
            ))}
          </ol>
        </Section>
      ) : null}

      <Section title={siteContent.resume.experienceSectionTitle}>
        <ol className={sty.experienceList} data-text-reveal="copy">
          {siteContent.resume.experience.map((item) => (
            <li key={`${item.company}-${item.role}`}>
              <div><h3>{item.role}</h3><p>{item.company}</p></div>
              <span>{item.period}</span>
              <ul>{item.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
            </li>
          ))}
        </ol>
      </Section>
    </div>
  )
}
