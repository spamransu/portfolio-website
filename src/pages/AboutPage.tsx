import { InternalHero } from '../components/InternalHero'
import { Section } from '../components/Section'
import { siteContent } from '../content/siteContent'
import sty from './InternalPages.module.scss'

export function AboutPage() {
  return (
    <div className={sty.page}>
      <InternalHero
        eyebrow={siteContent.about.eyebrow ?? 'About'}
        title={siteContent.about.title}
        intro={siteContent.about.intro}
        media={siteContent.about.heroImage}
      />

      <Section title={siteContent.about.bodySectionTitle}>
        <div className={sty.proseLead}>
          {siteContent.about.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </Section>

      <Section title={siteContent.about.processSectionTitle} intro={siteContent.about.processSectionIntro}>
        <div className={sty.cardGrid}>
          {siteContent.about.process.map((step, index) => (
            <article className={sty.numberedCard} key={step.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title={siteContent.about.principlesSectionTitle}>
        <div className={sty.cardGrid}>
          {siteContent.about.principles.map((principle) => (
            <article className={sty.card} key={principle}>
              <h3>{principle}</h3>
            </article>
          ))}
        </div>
      </Section>

      <Section title={siteContent.about.toolsSectionTitle}>
        <div className={sty.toolCloud}>
          {siteContent.about.tools.map((tool) => (
            <span key={tool}>{tool}</span>
          ))}
        </div>
      </Section>
    </div>
  )
}
