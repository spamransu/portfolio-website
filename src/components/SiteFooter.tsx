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
            <p className={sty.copyright}>© {year} {siteContent.site.name}. All rights reserved.</p>
          </div>

          <div className={sty.linksWrap}>
            <div className={sty.linkColumns}>
              <div>
                <p className={sty.heading}>General</p>
                <ul className={sty.linkList}>
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/about">About</Link></li>
                  <li><Link to="/projects">Projects</Link></li>
                </ul>
              </div>
              <div>
                <p className={sty.heading}>More</p>
                <ul className={sty.linkList}>
                  <li><a href="/#contact">Book a call</a></li>
                  <li><Link to="/resume">View CV</Link></li>
                  {linktreeUrl ? (
                    <li>
                      <a href={linktreeUrl} target="_blank" rel="noreferrer">
                        Linktree
                      </a>
                    </li>
                  ) : null}
                </ul>
              </div>
            </div>

            <ul className={sty.socials} aria-label="Social links">
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
      </div>
    </footer>
  )
}
