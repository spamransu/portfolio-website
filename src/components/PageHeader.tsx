import type { ReactNode } from 'react'
import sty from './PageHeader.module.scss'

type PageHeaderProps = {
  eyebrow?: string
  title: string
  intro: string
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, intro, actions }: PageHeaderProps) {
  return (
    <header className={sty.root} data-text-reveal-group="entry">
      {eyebrow ? <p className={sty.eyebrow} data-text-reveal="copy">{eyebrow}</p> : null}
      <h1 data-text-reveal="heading">{title}</h1>
      <p className={sty.intro} data-text-reveal="copy">{intro}</p>
      {actions ? <div className={sty.actions}>{actions}</div> : null}
    </header>
  )
}
