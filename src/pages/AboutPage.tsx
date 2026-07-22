import { InternalHero } from '../components/InternalHero'
import { Section } from '../components/Section'
import { siteContent } from '../content/siteContent'
import sty from './InternalPages.module.scss'

export function AboutPage() {
  return (
    <div className={`lg-wrapper ${sty.page}`}>
      <InternalHero
        eyebrow="About"
        title={siteContent.about.title}
        intro={siteContent.about.intro}
        media={siteContent.about.heroImage}
      />

      <Section title={siteContent.about.bodySectionTitle}>
        <div className={sty.mediaSplit}>
          <div className="prose-flow">
            {siteContent.about.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {siteContent.about.heroImage ? (
            <figure className={sty.galleryCard}>
              <img className={sty.mediaImage} src={siteContent.about.heroImage.src} alt={siteContent.about.heroImage.alt} />
              {siteContent.about.heroImage.caption ? <p className={sty.mediaCaption}>{siteContent.about.heroImage.caption}</p> : null}
            </figure>
          ) : null}
        </div>
      </Section>

      <Section title={siteContent.about.processSectionTitle} intro={siteContent.about.processSectionIntro}>
        <div className={sty.cardGrid}>
          {siteContent.about.process.map((step) => (
            <article className={sty.card} key={step.title}>
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
