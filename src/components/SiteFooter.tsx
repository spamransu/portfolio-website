import { Link } from 'react-router-dom'
import { getLinktreeUrl, siteContent } from '../content/siteContent'
import sty from './SiteFooter.module.scss'

function getBrandParts(name: string) {
  const [primary, ...rest] = name.trim().split(/\s+/)
  return {
    primary: primary?.toUpperCase() ?? '',
    secondary: rest.join(' ').toUpperCase(),
  }
}

function getSocialGlyph(label: string) {
  const normalized = label.toLowerCase()

  if (normalized === 'linkedin') return 'in'
  if (normalized === 'github') return 'gh'
  if (normalized === 'x') return 'x'
  if (normalized === 'figma') return 'fg'

  return label.slice(0, 2).toLowerCase()
}

export function SiteFooter() {
  const brand = getBrandParts(siteContent.site.name)
  const linktreeUrl = getLinktreeUrl()
  const year = new Date().getFullYear()
  const visibleSocials = siteContent.site.socials.filter((social) => social.label !== 'Linktree')
  const footerCopy = siteContent.siteChrome?.footer
  const generalLinks = footerCopy?.generalLinks ?? [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/projects', label: 'Projects' },
  ]
  const moreLinks = footerCopy?.moreLinks ?? [
    { to: '/#contact', label: 'Book a call' },
    { to: '/resume', label: 'View CV' },
  ]
  const copyrightTemplate = footerCopy?.copyrightTemplate ?? '© {year} {siteName}. All rights reserved.'
  const copyright = copyrightTemplate
    .replace('{year}', String(year))
    .replace('{siteName}', siteContent.site.name)

  return (
    <footer className={sty.root}>
      <div className="lg-wrapper">
        <div className={sty.inner}>
          <div className={sty.info}>
            <p className={sty.brand}>
              <span>{brand.primary}</span>
              {brand.secondary ? <span className={sty.brandSecondary}>{brand.secondary}</span> : null}
            </p>
            <p className={sty.description}>{siteContent.site.description}</p>
          </div>

          <nav className={sty.navigation} aria-label="Footer">
            <p className={sty.heading}>{footerCopy?.generalHeading ?? 'General'}</p>
            <ul className={sty.linkList}>
              {generalLinks.map((link) => (
                <li key={`${link.to}-${link.label}`}><Link to={link.to}>{link.label}</Link></li>
              ))}
              {moreLinks.map((link) => (
                <li key={`${link.to}-${link.label}`}>
                  {link.to.startsWith('/#') || link.to.startsWith('#') || link.to.startsWith('http')
                    ? <a href={link.to}>{link.label}</a>
                    : <Link to={link.to}>{link.label}</Link>}
                </li>
              ))}
              {linktreeUrl ? (
                <li><a href={linktreeUrl} target="_blank" rel="noreferrer">{footerCopy?.linktreeLabel ?? 'Linktree'}</a></li>
              ) : null}
            </ul>
          </nav>

          <div className={sty.contact}>
            <p className={sty.heading}>Contact</p>
            <a href={`mailto:${siteContent.site.email}`}>{siteContent.site.email}</a>
            <a href={siteContent.site.siteUrl}>{siteContent.site.siteUrl.replace(/^https?:\/\//, '')}</a>
            <p>{siteContent.site.location}</p>
          </div>
        </div>

        <div className={sty.bottom}>
          <p className={sty.copyright}>{copyright}</p>
          <ul className={sty.socials} aria-label={siteContent.siteChrome?.footerSocialsAriaLabel ?? 'Social links'}>
            {visibleSocials.map((social) => (
              <li key={social.href}>
                <a href={social.href} target="_blank" rel="noreferrer" aria-label={social.label} title={social.label}>
                  <span aria-hidden="true" className={sty.socialIcon}>{getSocialGlyph(social.label)}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
