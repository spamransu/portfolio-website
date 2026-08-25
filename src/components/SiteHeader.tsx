import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LuMenu, LuX } from 'react-icons/lu'
import { siteContent } from '../content/siteContent'
import sty from './SiteHeader.module.scss'

function getBrandParts(name: string) {
  const [primary, ...rest] = name.trim().split(/\s+/)
  return {
    primary: primary?.toUpperCase() ?? '',
    secondary: rest.join(' ').toUpperCase(),
  }
}

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const brand = getBrandParts(siteContent.site.name)
  const navItems = siteContent.siteChrome?.headerNav ?? [
    { to: '/projects', label: 'Projects' },
    { to: '/blog', label: 'Blog' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
    { to: '/resume', label: 'CV' },
  ]
  const navAriaLabel = siteContent.siteChrome?.headerNavAriaLabel ?? 'Primary'

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  return (
    <header className={sty.root}>
      <div className="lg-wrapper">
        <div className={sty.inner}>
          <NavLink to="/" className={sty.brand} aria-label={`${siteContent.site.name} home`}>
            <span className={sty.brandPrimary}>{brand.primary}</span>
            {brand.secondary ? <span className={sty.brandSecondary}>{brand.secondary}</span> : null}
          </NavLink>

          <nav aria-label={navAriaLabel} className={sty.navWrap}>
            <ul className={sty.nav}>
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} className={({ isActive }) => (isActive ? sty.active : undefined)}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <button
            type="button"
            className={sty.menuButton}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            {isMenuOpen ? <LuX aria-hidden="true" className={sty.menuIcon} focusable="false" /> : <LuMenu aria-hidden="true" className={sty.menuIcon} focusable="false" />}
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <nav id="mobile-navigation" aria-label="Mobile" className={sty.mobileNav}>
          <div className="lg-wrapper">
            <ul>
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} className={({ isActive }) => (isActive ? sty.active : undefined)}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      ) : null}
    </header>
  )
}
