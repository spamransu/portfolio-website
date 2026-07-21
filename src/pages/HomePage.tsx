import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { siteContent, type HomeStatTone, type Project } from '../content/siteContent'
import sty from './HomePage.module.scss'

type ContactFormState = {
  name: string
  email: string
  message: string
}

type ContactFormErrors = Partial<Record<keyof ContactFormState, string>>

const initialFormState: ContactFormState = {
  name: '',
  email: '',
  message: '',
}

const statToneClassNames: Record<HomeStatTone, string> = {
  accent: sty.statAccent,
  'accent-2': sty.statAccent2,
  'accent-3': sty.statAccent3,
}

function getFeaturedProjects() {
  const ordered = siteContent.home.featuredProjects.slugs
    .map((slug) => siteContent.projects.find((project) => project.slug === slug))
    .filter(Boolean) as Project[]

  return ordered.length ? ordered : siteContent.projects.slice(0, 4)
}

function buildMailtoHref(values: ContactFormState) {
  const subject = `Portfolio inquiry from ${values.name}`
  const body = [
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    '',
    'Message:',
    values.message,
  ].join('\n')

  return `mailto:${siteContent.site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

function validateForm(values: ContactFormState, messageLimit: number) {
  const errors: ContactFormErrors = {}

  if (!values.name.trim()) {
    errors.name = 'Please enter your name.'
  }

  if (!values.email.trim()) {
    errors.email = 'Please enter your email.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.'
  }

  if (!values.message.trim()) {
    errors.message = 'Please add a short message.'
  } else if (values.message.length > messageLimit) {
    errors.message = `Please keep the message under ${messageLimit} characters.`
  }

  return errors
}

export function HomePage() {
  const featuredProjects = useMemo(getFeaturedProjects, [])
  const [formValues, setFormValues] = useState(initialFormState)
  const [formErrors, setFormErrors] = useState<ContactFormErrors>({})
  const messageLimit = siteContent.home.contact.messageLimit

  const handleFieldChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    const nextValue = name === 'message' ? value.slice(0, messageLimit) : value

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: nextValue,
    }))

    setFormErrors((currentErrors) => ({
      ...currentErrors,
      [name]: undefined,
    }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const errors = validateForm(formValues, messageLimit)

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    window.location.href = buildMailtoHref({
      name: formValues.name.trim(),
      email: formValues.email.trim(),
      message: formValues.message.trim(),
    })
  }

  return (
    <div className={sty.root}>
      <section className={sty.hero}>
        <div className="lg-wrapper">
          <div className={sty.heroCopy}>
            <p className={sty.heroEyebrow}>{siteContent.home.hero.eyebrow}</p>
            <h1 className={sty.heroTitle}>
              {siteContent.home.hero.titleLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h1>
            {siteContent.home.hero.description ? <p className={sty.heroDescription}>{siteContent.home.hero.description}</p> : null}
            <div className={sty.heroActions}>
              <a className={sty.primaryButton} href="#contact">
                {siteContent.home.cta.primaryLabel}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className={sty.section}>
        <div className="lg-wrapper">
          <div className={sty.sectionHeadingCentered}>
            <h2>{siteContent.home.featuredProjects.title}</h2>
          </div>

          <div className={sty.projectGrid}>
            {featuredProjects.map((project) => (
              <article key={project.slug} className={sty.projectCard}>
                <a href={`/projects/${project.slug}`} className={sty.projectImageLink}>
                  {project.image ? <img src={project.image.src} alt={project.image.alt} className={sty.projectImage} /> : null}
                </a>
                <div className={sty.projectBody}>
                  <div className={sty.projectMeta}>
                    <p className={sty.projectTitle}>
                      <a href={`/projects/${project.slug}`}>{project.title}</a>
                    </p>
                    <p className={sty.projectSummary}>{project.summary}</p>
                  </div>
                  <ul className={sty.stackList} aria-label={`${project.title} stack`}>
                    {project.stack.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={sty.section}>
        <div className={`md-wrapper ${sty.bioSection}`}>
          <div className={sty.bioCopy}>
            <p className={sty.heroEyebrow}>{siteContent.home.bio.eyebrow}</p>
            <div className={sty.bioColumns}>
              <h2 className={sty.bioTitle}>
                {siteContent.home.bio.titleLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h2>
              <p className={sty.bioDescription}>{siteContent.home.bio.description}</p>
            </div>
          </div>

          <div className={sty.statsGrid}>
            {siteContent.home.stats.map((stat) => (
              <article key={stat.label} className={sty.statCard}>
                <p className={`${sty.statValue} ${statToneClassNames[stat.tone]}`}>{stat.value}</p>
                <p className={sty.statLabel}>{stat.label}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={sty.section}>
        <div className={`md-wrapper ${sty.skillsSection}`}>
          <div className={sty.skillsCloud}>
            {siteContent.home.skills.items.map((skill) => (
              <span key={skill} className={sty.skillPill}>
                {skill}
              </span>
            ))}
          </div>

          <div className={sty.skillsCopy}>
            <h2>{siteContent.home.skills.title}</h2>
            <p>{siteContent.home.skills.description}</p>
          </div>
        </div>
      </section>

      <section className={sty.contactSection} id="contact">
        <div className="md-wrapper">
          <div className={sty.contactFormWrap}>
          <div className={sty.contactIntro}>
            <h2>{siteContent.home.contact.title}</h2>
            {siteContent.home.contact.intro ? <p>{siteContent.home.contact.intro}</p> : null}
          </div>

          <form className={sty.contactForm} onSubmit={handleSubmit} noValidate>
            <div className={sty.formField}>
              <label htmlFor="contact-name">Name *</label>
              <input
                id="contact-name"
                name="name"
                type="text"
                placeholder="Your full name"
                value={formValues.name}
                onChange={handleFieldChange}
                aria-invalid={Boolean(formErrors.name)}
                aria-describedby={formErrors.name ? 'contact-name-error' : undefined}
                required
              />
              {formErrors.name ? <p className={sty.formError} id="contact-name-error">{formErrors.name}</p> : null}
            </div>

            <div className={sty.formField}>
              <label htmlFor="contact-email">Email *</label>
              <input
                id="contact-email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                value={formValues.email}
                onChange={handleFieldChange}
                aria-invalid={Boolean(formErrors.email)}
                aria-describedby={formErrors.email ? 'contact-email-error' : undefined}
                required
              />
              {formErrors.email ? <p className={sty.formError} id="contact-email-error">{formErrors.email}</p> : null}
            </div>

            <div className={sty.formField}>
              <label htmlFor="contact-message">Message *</label>
              <textarea
                id="contact-message"
                name="message"
                placeholder="Tell me about your project or just say hello..."
                value={formValues.message}
                onChange={handleFieldChange}
                aria-invalid={Boolean(formErrors.message)}
                aria-describedby={formErrors.message ? 'contact-message-error' : 'contact-message-count'}
                rows={5}
                required
              />
              <div className={sty.formMetaRow}>
                <p className={sty.formCount} id="contact-message-count">
                  {formValues.message.length}/{messageLimit} characters
                </p>
                {formErrors.message ? <p className={sty.formError} id="contact-message-error">{formErrors.message}</p> : null}
              </div>
            </div>

            <button type="submit" className={sty.submitButton}>
              {siteContent.home.contact.submitLabel}
            </button>
          </form>
        </div>
        </div>
      </section>
    </div>
  )
}
