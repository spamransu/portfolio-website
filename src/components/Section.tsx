import type { ReactNode } from 'react'
import sty from './Section.module.scss'

type SectionProps = {
  title: string
  intro?: string
  children: ReactNode
}

export function Section({ title, intro, children }: SectionProps) {
  return (
    <section className={sty.root} data-text-reveal-group="scrub">
      <div className="lg-wrapper">
        <div className={sty.inner}>
          <div className={sty.heading}>
            <h2 data-text-reveal="heading">{title}</h2>
            {intro ? <p data-text-reveal="copy">{intro}</p> : null}
          </div>
          <div className={sty.content}>{children}</div>
        </div>
      </div>
    </section>
  )
}
