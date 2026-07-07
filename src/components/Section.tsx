import type { ReactNode } from 'react'

type SectionProps = {
  title: string
  intro?: string
  children: ReactNode
}

export function Section({ title, intro, children }: SectionProps) {
  return (
    <section className="section-block">
      <div className="section-block__heading">
        <h2>{title}</h2>
        {intro ? <p>{intro}</p> : null}
      </div>
      <div className="section-block__body">{children}</div>
    </section>
  )
}
