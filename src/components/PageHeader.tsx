import type { ReactNode } from 'react'
import sty from './PageHeader.module.scss'

type PageHeaderProps = {
  title: string
  intro: string
  actions?: ReactNode
}

export function PageHeader({ title, intro, actions }: PageHeaderProps) {
  return (
    <header className={sty.root} data-text-reveal-group="entry">
      <h1 data-text-reveal="heading">{title}</h1>
      <p className={sty.intro} data-text-reveal="copy">{intro}</p>
      {actions ? <div className={sty.actions}>{actions}</div> : null}
    </header>
  )
}
