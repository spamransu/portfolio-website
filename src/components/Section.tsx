import type { ReactNode } from 'react'
import sty from './Section.module.scss'

type SectionProps = {
  title: string
  intro?: string
  children: ReactNode
}

export function Section({ title, intro, children }: SectionProps) {
  return (
    <section className={sty.root}>
      <div className="lg-wrapper">
        <div className={sty.inner}>
          <div className={sty.heading}>
            <h2>{title}</h2>
            {intro ? <p>{intro}</p> : null}
          </div>
          <div className={sty.content}>{children}</div>
        </div>
      </div>
    </section>
  )
}
