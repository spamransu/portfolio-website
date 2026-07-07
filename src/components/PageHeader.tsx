import type { ReactNode } from 'react'

type PageHeaderProps = {
  eyebrow?: string
  title: string
  intro: string
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, intro, actions }: PageHeaderProps) {
  return (
    <header className="page-header">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      <p className="page-header__intro">{intro}</p>
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </header>
  )
}
