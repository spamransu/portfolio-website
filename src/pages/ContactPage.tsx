import { LuCircleDot, LuGithub, LuLinkedin, LuMail, LuMapPin } from 'react-icons/lu'
import { ContactForm } from '../components/ContactForm'
import { InternalHero } from '../components/InternalHero'
import { siteContent } from '../content/siteContent'
import sty from './InternalPages.module.scss'

function getContactIcon(title: string) {
  const normalized = title.toLowerCase()

  if (normalized.includes('linkedin')) return LuLinkedin
  if (normalized.includes('github')) return LuGithub

  return LuMail
}

export function ContactPage() {
  return (
    <div className={sty.page}>
      <InternalHero
        title={siteContent.contact.title}
        intro={siteContent.contact.body}
        actions={
          <div className={sty.availabilityMeta}>
            <span><LuCircleDot aria-hidden="true" focusable="false" />{siteContent.contact.availability}</span>
            <span><LuMapPin aria-hidden="true" focusable="false" />{siteContent.site.location}</span>
          </div>
        }
      />

      <section className={sty.contactSection}>
        <div className="lg-wrapper">
          <div className={sty.contactGrid} data-text-reveal-group="scrub">
            <aside>
              <h2 data-text-reveal="heading">{siteContent.contact.methodsSectionTitle}</h2>
              <div className={sty.contactMethods} data-text-reveal="copy">
                {siteContent.contact.methods.map((method) => {
                  const Icon = getContactIcon(method.title)

                  return (
                    <a key={method.title} href={method.href} target={method.href.startsWith('http') ? '_blank' : undefined} rel={method.href.startsWith('http') ? 'noreferrer' : undefined}>
                      <span><Icon aria-hidden="true" focusable="false" /></span>
                      <div><strong>{method.title}</strong><small>{method.label}</small></div>
                    </a>
                  )
                })}
              </div>
            </aside>
            <div className={sty.contactFormWrap}>
              <h2 data-text-reveal="heading">{siteContent.contact.formSectionTitle}</h2>
              <p data-text-reveal="copy">{siteContent.contact.formSectionIntro}</p>
              <ContactForm contact={siteContent.contact.form} recipientEmail={siteContent.site.email} showIntro={false} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
