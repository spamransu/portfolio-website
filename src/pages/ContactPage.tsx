import { InternalHero } from '../components/InternalHero'
import { ContactForm } from '../components/ContactForm'
import { Section } from '../components/Section'
import { siteContent } from '../content/siteContent'
import sty from './InternalPages.module.scss'

export function ContactPage() {
  return (
    <div className={`lg-wrapper ${sty.page}`}>
      <InternalHero
        eyebrow="Contact"
        title={siteContent.contact.title}
        intro={siteContent.contact.body}
        media={siteContent.contact.heroImage}
        actions={
          <a className="button button--primary" href={`mailto:${siteContent.site.email}`}>
            Email {siteContent.site.email}
          </a>
        }
      />

      <Section title="Availability">
        <div className={sty.infoGrid}>
          <article className={sty.card}>
            <h3>Status</h3>
            <p>{siteContent.contact.availability}</p>
          </article>
          <article className={sty.card}>
            <h3>Location</h3>
            <p>{siteContent.site.location}</p>
          </article>
        </div>
      </Section>

      <Section title="Send a project brief" intro="Use the form if you want to draft the email with the main details already filled in.">
        <div className="md-wrapper">
          <ContactForm contact={siteContent.contact.form} recipientEmail={siteContent.site.email} />
        </div>
      </Section>

      <Section title="Preferred contact methods" intro="Pick the channel that fits the kind of conversation you want to have.">
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
