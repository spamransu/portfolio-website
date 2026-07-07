import type { ReactNode } from 'react'
import styles from './PageHeader.module.scss'

type PageHeaderProps = {
  eyebrow?: string
  title: string
  intro: string
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, intro, actions }: PageHeaderProps) {
  return (
    <header className={styles.root}>
      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      <h1>{title}</h1>
      <p className={styles.intro}>{intro}</p>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  )
}
