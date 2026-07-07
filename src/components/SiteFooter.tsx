import { NavLink } from 'react-router-dom'
import { siteContent } from '../content/siteContent'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <p className="site-footer__title">{siteContent.site.name}</p>
        <p>{siteContent.site.tagline}</p>
      </div>
      <nav aria-label="Footer">
        <ul>
          <li><NavLink to="/about">About</NavLink></li>
          <li><NavLink to="/projects">Projects</NavLink></li>
          <li><NavLink to="/resume">Resume</NavLink></li>
          <li><NavLink to="/contact">Contact</NavLink></li>
        </ul>
      </nav>
    </footer>
  )
}
