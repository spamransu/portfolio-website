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
    <header className={sty.root}>
      {eyebrow ? <p className={sty.eyebrow}>{eyebrow}</p> : null}
      <h1>{title}</h1>
      <p className={sty.intro}>{intro}</p>
      {actions ? <div className={sty.actions}>{actions}</div> : null}
    </header>
  )
}
