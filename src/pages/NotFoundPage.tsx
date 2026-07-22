import { Link } from 'react-router-dom'
import { InternalHero } from '../components/InternalHero'
import { siteContent } from '../content/siteContent'
import sty from './InternalPages.module.scss'

export function NotFoundPage() {
  const notFoundCopy = siteContent.notFoundPage

  return (
    <div className={`md-wrapper ${sty.page}`}>
      <InternalHero
        eyebrow={notFoundCopy?.eyebrow ?? '404'}
        title={notFoundCopy?.title ?? 'Page not found'}
        intro={notFoundCopy?.intro ?? 'That route does not exist yet, but the rest of the portfolio is still intact.'}
      />
      <div className={sty.ctaPanel}>
        <p className="eyebrow">{notFoundCopy?.suggestionsEyebrow ?? 'Try these instead'}</p>
        <div className="button-row">
          <Link className="button button--primary" to="/projects">
            {notFoundCopy?.viewProjectsLabel ?? 'View projects'}
          </Link>
          <Link className="button button--ghost" to="/">
            {notFoundCopy?.backHomeLabel ?? 'Back home'}
          </Link>
        </div>
      </div>
    </div>
  )
}
