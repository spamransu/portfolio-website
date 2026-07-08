import { Link } from 'react-router-dom'
import { getLinktreeUrl, siteContent } from '../content/siteContent'
import styles from './SiteFooter.module.scss'

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
    <footer className={styles.root}>
      <div className={`md-wrapper ${styles.inner}`}>
        <div className={styles.info}>
          <p className={styles.brand}>
            <span>{brand.primary}</span>
            {brand.secondary ? <span className={styles.brandSecondary}>{brand.secondary}</span> : null}
          </p>
          <p className={styles.description}>{siteContent.site.description}</p>
          <p className={styles.copyright}>© {year} {siteContent.site.name}. All rights reserved.</p>
        </div>

        <div className={styles.linksWrap}>
          <div className={styles.linkColumns}>
            <div>
              <p className={styles.heading}>General</p>
              <ul className={styles.linkList}>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/projects">Projects</Link></li>
              </ul>
            </div>
            <div>
              <p className={styles.heading}>More</p>
              <ul className={styles.linkList}>
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

          <ul className={styles.socials} aria-label="Social links">
            {visibleSocials.map((social) => (
              <li key={social.href}>
                <a href={social.href} target="_blank" rel="noreferrer" aria-label={social.label} title={social.label}>
                  <span aria-hidden="true" className={styles.socialIcon}>{getSocialGlyph(social.label)}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
