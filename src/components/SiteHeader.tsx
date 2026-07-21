import { NavLink } from 'react-router-dom'
import { getLinktreeUrl, siteContent } from '../content/siteContent'
import styles from './SiteHeader.module.scss'

const navItems = [
  { to: '/projects', label: 'Projects' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/resume', label: 'CV' },
]

function getBrandParts(name: string) {
  const [primary, ...rest] = name.trim().split(/\s+/)
  return {
    primary: primary?.toUpperCase() ?? '',
    secondary: rest.join(' ').toUpperCase(),
  }
}

export function SiteHeader() {
  const brand = getBrandParts(siteContent.site.name)
  const linktreeUrl = getLinktreeUrl()

  return (
    <header className={styles.root}>
      <div className={`md-wrapper ${styles.inner}`}>
        <NavLink to="/" className={styles.brand} aria-label={`${siteContent.site.name} home`}>
          <span className={styles.brandPrimary}>{brand.primary}</span>
          {brand.secondary ? <span className={styles.brandSecondary}>{brand.secondary}</span> : null}
        </NavLink>

        <nav aria-label="Primary" className={styles.navWrap}>
          <ul className={styles.nav}>
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={({ isActive }) => (isActive ? styles.active : undefined)}>
                  {item.label}
                </NavLink>
              </li>
            ))}
            {linktreeUrl ? (
              <li>
                <a href={linktreeUrl} target="_blank" rel="noreferrer">
                  Linktree
                </a>
              </li>
            ) : null}
          </ul>
        </nav>
      </div>
    </header>
  )
}
