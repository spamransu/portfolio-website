import { NavLink } from 'react-router-dom'
import { siteContent } from '../content/siteContent'
import styles from './SiteFooter.module.scss'

export function SiteFooter() {
  return (
    <footer className={styles.root}>
      <div>
        <p className={styles.title}>{siteContent.site.name}</p>
        <p>{siteContent.site.tagline}</p>
      </div>
      <nav aria-label="Footer">
        <ul className={styles.navList}>
          <li><NavLink to="/about">About</NavLink></li>
          <li><NavLink to="/projects">Projects</NavLink></li>
          <li><NavLink to="/resume">Resume</NavLink></li>
          <li><NavLink to="/contact">Contact</NavLink></li>
        </ul>
      </nav>
    </footer>
  )
}
