import { PageHeader } from '../components/PageHeader'
import { Section } from '../components/Section'
import { siteContent } from '../content/siteContent'

export function AboutPage() {
  return (
    <div className="page-stack">
      <PageHeader eyebrow="About" title="A designer-minded frontend practice." intro={siteContent.about.intro} />

      <Section title="How I work">
        <div className="prose-flow">
          {siteContent.about.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </Section>

      <Section title="Working principles">
        <ul className="check-list">
          {siteContent.about.principles.map((principle) => (
            <li key={principle}>{principle}</li>
          ))}
        </ul>
      </Section>
    </div>
  )
}
