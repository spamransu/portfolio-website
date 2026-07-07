import { NavLink } from 'react-router-dom'
import { siteContent } from '../content/siteContent'
import styles from './SiteHeader.module.scss'

const navItems = [
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/contact', label: 'Contact' },
  { to: '/resume', label: 'CV / Resume' },
]

export function SiteHeader() {
  return (
    <header className={styles.root}>
      <NavLink to="/" className={styles.brand}>
        <span className={styles.brandMark}>R</span>
        <span>
          <strong>{siteContent.site.name}</strong>
          <small>{siteContent.site.tagline}</small>
        </span>
      </NavLink>

      <nav aria-label="Primary">
        <ul className={styles.nav}>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className={({ isActive }) => (isActive ? styles['is-active'] : undefined)}>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
