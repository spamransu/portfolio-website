import { InternalHero } from '../components/InternalHero'
import { Section } from '../components/Section'
import { siteContent } from '../content/siteContent'
import sty from './InternalPages.module.scss'

export function AboutPage() {
  return (
    <div className={`lg-wrapper ${sty.page}`}>
      <InternalHero
        eyebrow="About"
        title="A designer-minded frontend practice."
        intro={siteContent.about.intro}
        media={siteContent.about.heroImage}
      />

      <Section title="How I work">
        <div className={sty.mediaSplit}>
          <div className="prose-flow">
            {siteContent.about.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {siteContent.about.heroImage ? (
            <figure className={sty.galleryCard}>
              <img className={sty.mediaImage} src={siteContent.about.heroImage.src} alt={siteContent.about.heroImage.alt} />
              <p className={sty.mediaCaption}>A mock workspace view showing the kind of design-to-code system thinking behind the work.</p>
            </figure>
          ) : null}
        </div>
      </Section>

      <Section title="Process" intro="A simple working rhythm that keeps pages readable and maintainable.">
        <div className={sty.cardGrid}>
          {siteContent.about.process.map((step) => (
            <article className={sty.card} key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Working principles">
        <div className={sty.cardGrid}>
          {siteContent.about.principles.map((principle) => (
            <article className={sty.card} key={principle}>
              <h3>{principle}</h3>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Tools and delivery stack">
        <div className={sty.toolCloud}>
          {siteContent.about.tools.map((tool) => (
            <span key={tool}>{tool}</span>
          ))}
        </div>
      </Section>
    </div>
  )
}
