import { NavLink } from 'react-router-dom'
import { siteContent } from '../content/siteContent'

const navItems = [
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/contact', label: 'Contact' },
  { to: '/resume', label: 'CV / Resume' },
]

export function SiteHeader() {
  return (
    <header className="site-header">
      <NavLink to="/" className="site-header__brand">
        <span className="site-header__brand-mark">R</span>
        <span>
          <strong>{siteContent.site.name}</strong>
          <small>{siteContent.site.tagline}</small>
        </span>
      </NavLink>

      <nav aria-label="Primary">
        <ul className="site-header__nav">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
