import { useId, useState, type ChangeEvent, type FormEvent } from 'react'
import type { SiteContent } from '../content/siteContent'
import sty from './ContactForm.module.scss'

type ContactFormProps = {
  contact: SiteContent['home']['contact']
  recipientEmail: string
}

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

function buildMailtoHref(values: ContactFormState, recipientEmail: string) {
  const subject = `Portfolio inquiry from ${values.name}`
  const body = [
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    '',
    'Message:',
    values.message,
  ].join('\n')

  return `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
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

export function ContactForm({ contact, recipientEmail }: ContactFormProps) {
  const [formValues, setFormValues] = useState(initialFormState)
  const [formErrors, setFormErrors] = useState<ContactFormErrors>({})
  const formId = useId()
  const messageLimit = contact.messageLimit

  const nameInputId = `${formId}-name`
  const nameErrorId = `${formId}-name-error`
  const emailInputId = `${formId}-email`
  const emailErrorId = `${formId}-email-error`
  const messageInputId = `${formId}-message`
  const messageErrorId = `${formId}-message-error`
  const messageCountId = `${formId}-message-count`

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

    window.location.href = buildMailtoHref(
      {
        name: formValues.name.trim(),
        email: formValues.email.trim(),
        message: formValues.message.trim(),
      },
      recipientEmail,
    )
  }

  return (
    <div className={sty.root}>
      <div className={sty.intro}>
        <h2>{contact.title}</h2>
        {contact.intro ? <p>{contact.intro}</p> : null}
      </div>

      <form className={sty.form} onSubmit={handleSubmit} noValidate>
        <div className={sty.field}>
          <label htmlFor={nameInputId}>Name *</label>
          <input
            id={nameInputId}
            name="name"
            type="text"
            placeholder="Your full name"
            value={formValues.name}
            onChange={handleFieldChange}
            aria-invalid={Boolean(formErrors.name)}
            aria-describedby={formErrors.name ? nameErrorId : undefined}
            required
          />
          {formErrors.name ? (
            <p className={sty.error} id={nameErrorId}>
              {formErrors.name}
            </p>
          ) : null}
        </div>

        <div className={sty.field}>
          <label htmlFor={emailInputId}>Email *</label>
          <input
            id={emailInputId}
            name="email"
            type="email"
            placeholder="your.email@example.com"
            value={formValues.email}
            onChange={handleFieldChange}
            aria-invalid={Boolean(formErrors.email)}
            aria-describedby={formErrors.email ? emailErrorId : undefined}
            required
          />
          {formErrors.email ? (
            <p className={sty.error} id={emailErrorId}>
              {formErrors.email}
            </p>
          ) : null}
        </div>

        <div className={sty.field}>
          <label htmlFor={messageInputId}>Message *</label>
          <textarea
            id={messageInputId}
            name="message"
            placeholder="Tell me about your project or just say hello..."
            value={formValues.message}
            onChange={handleFieldChange}
            aria-invalid={Boolean(formErrors.message)}
            aria-describedby={formErrors.message ? messageErrorId : messageCountId}
            rows={5}
            required
          />
          <div className={sty.metaRow}>
            <p className={sty.count} id={messageCountId}>
              {formValues.message.length}/{messageLimit} characters
            </p>
            {formErrors.message ? (
              <p className={sty.error} id={messageErrorId}>
                {formErrors.message}
              </p>
            ) : null}
          </div>
        </div>

        <button type="submit" className={sty.submitButton}>
          {contact.submitLabel}
        </button>
      </form>
    </div>
  )
}
