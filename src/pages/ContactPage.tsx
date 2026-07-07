import { PageHeader } from '../components/PageHeader'
import { Section } from '../components/Section'
import { siteContent } from '../content/siteContent'

export function ContactPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Contact"
        title={siteContent.contact.title}
        intro={siteContent.contact.body}
        actions={
          <a className="button button--primary" href={`mailto:${siteContent.site.email}`}>
            Email {siteContent.site.email}
          </a>
        }
      />

      <Section title="Availability">
        <div className="contact-grid">
          <div className="contact-card">
            <h3>Status</h3>
            <p>{siteContent.contact.availability}</p>
          </div>
          <div className="contact-card">
            <h3>Location</h3>
            <p>{siteContent.site.location}</p>
          </div>
          <div className="contact-card">
            <h3>Profiles</h3>
            <ul className="inline-links">
              {siteContent.site.socials.map((social) => (
                <li key={social.label}>
                  <a href={social.href} target="_blank" rel="noreferrer">
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </div>
  )
}
