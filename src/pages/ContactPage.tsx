import { InternalHero } from '../components/InternalHero'
import { ContactForm } from '../components/ContactForm'
import { Section } from '../components/Section'
import { siteContent } from '../content/siteContent'
import sty from './InternalPages.module.scss'

export function ContactPage() {
  return (
    <div className={`lg-wrapper ${sty.page}`}>
      <InternalHero
        eyebrow={siteContent.contact.eyebrow ?? 'Contact'}
        title={siteContent.contact.title}
        intro={siteContent.contact.body}
        media={siteContent.contact.heroImage}
        actions={
          <a className="button button--primary" href={`mailto:${siteContent.site.email}`}>
            {siteContent.contact.emailCtaPrefix ?? 'Email'} {siteContent.site.email}
          </a>
        }
      />

      <Section title={siteContent.contact.availabilityTitle}>
        <div className={sty.infoGrid}>
          <article className={sty.card}>
            <h3>{siteContent.contact.availabilityStatusLabel}</h3>
            <p>{siteContent.contact.availability}</p>
          </article>
          <article className={sty.card}>
            <h3>{siteContent.contact.availabilityLocationLabel}</h3>
            <p>{siteContent.site.location}</p>
          </article>
        </div>
      </Section>

      <Section title={siteContent.contact.formSectionTitle} intro={siteContent.contact.formSectionIntro}>
        <div className="md-wrapper">
          <ContactForm contact={siteContent.contact.form} recipientEmail={siteContent.site.email} />
        </div>
      </Section>

      <Section title={siteContent.contact.methodsSectionTitle} intro={siteContent.contact.methodsSectionIntro}>
        <div className={sty.cardGrid}>
          {siteContent.contact.methods.map((method) => (
            <article className={sty.methodCard} key={method.title}>
              <h3>{method.title}</h3>
              <p>{method.description}</p>
              <a className="button button--ghost" href={method.href} target={method.href.startsWith('http') ? '_blank' : undefined} rel={method.href.startsWith('http') ? 'noreferrer' : undefined}>
                {method.label}
              </a>
            </article>
          ))}
        </div>
      </Section>
    </div>
  )
}
