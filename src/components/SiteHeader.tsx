import { NavLink } from 'react-router-dom'
import { getLinktreeUrl, siteContent } from '../content/siteContent'
import sty from './SiteHeader.module.scss'

const navItems = [
  { to: '/projects', label: 'Projects' },
  { to: '/blog', label: 'Blog' },
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
    <header className={sty.root}>
      <div className="lg-wrapper">
        <div className={sty.inner}>
          <NavLink to="/" className={sty.brand} aria-label={`${siteContent.site.name} home`}>
            <span className={sty.brandPrimary}>{brand.primary}</span>
            {brand.secondary ? <span className={sty.brandSecondary}>{brand.secondary}</span> : null}
          </NavLink>

          <nav aria-label="Primary" className={sty.navWrap}>
            <ul className={sty.nav}>
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} className={({ isActive }) => (isActive ? sty.active : undefined)}>
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
      </div>
    </header>
  )
}
