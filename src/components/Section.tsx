import type { ReactNode } from 'react'
import styles from './Section.module.scss'

type SectionProps = {
  title: string
  intro?: string
  children: ReactNode
}

export function Section({ title, intro, children }: SectionProps) {
  return (
    <section className={styles.root}>
      <div className={styles.heading}>
        <h2>{title}</h2>
        {intro ? <p>{intro}</p> : null}
      </div>
      <div>{children}</div>
    </section>
  )
}
