import { ContactForm } from '../components/ContactForm'
import { InternalHero } from '../components/InternalHero'
import { siteContent } from '../content/siteContent'
import sty from './InternalPages.module.scss'

export function ContactPage() {
  return (
    <div className={sty.page}>
      <InternalHero
        eyebrow={siteContent.contact.eyebrow ?? 'Contact'}
        title={siteContent.contact.title}
        intro={siteContent.contact.body}
        actions={
          <div className={sty.availabilityMeta}>
            <span><i aria-hidden="true" />{siteContent.contact.availability}</span>
            <span>{siteContent.site.location}</span>
          </div>
        }
      />

      <section className={sty.contactSection}>
        <div className="lg-wrapper">
          <div className={sty.contactGrid}>
            <aside>
              <p className="eyebrow">{siteContent.contact.methodsSectionTitle}</p>
              <div className={sty.contactMethods}>
                {siteContent.contact.methods.map((method, index) => (
                  <a key={method.title} href={method.href} target={method.href.startsWith('http') ? '_blank' : undefined} rel={method.href.startsWith('http') ? 'noreferrer' : undefined}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <div><strong>{method.title}</strong><small>{method.label}</small></div>
                  </a>
                ))}
              </div>
            </aside>
            <div className={sty.contactFormWrap}>
              <p className="eyebrow">{siteContent.contact.formSectionTitle}</p>
              <p>{siteContent.contact.formSectionIntro}</p>
              <ContactForm contact={siteContent.contact.form} recipientEmail={siteContent.site.email} showIntro={false} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
