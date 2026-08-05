import { Link } from 'react-router-dom'
import { LuArrowLeft, LuFolderOpen } from 'react-icons/lu'
import { InternalHero } from '../components/InternalHero'
import { siteContent } from '../content/siteContent'
import sty from './InternalPages.module.scss'

export function NotFoundPage() {
  const notFoundCopy = siteContent.notFoundPage

  return (
    <div className={sty.page}>
      <InternalHero
        eyebrow={notFoundCopy?.eyebrow ?? '404'}
        title={notFoundCopy?.title ?? 'Page not found'}
        intro={notFoundCopy?.intro ?? 'That route does not exist yet, but the rest of the portfolio is still intact.'}
      />
      <section className={sty.notFoundActions}>
        <div className="lg-wrapper">
          <div>
            <p className="eyebrow">{notFoundCopy?.suggestionsEyebrow ?? 'Try these instead'}</p>
            <div className="button-row">
              <Link className="button button--primary" to="/projects">{notFoundCopy?.viewProjectsLabel ?? 'View projects'}<LuFolderOpen aria-hidden="true" focusable="false" /></Link>
              <Link className="button button--ghost" to="/"><LuArrowLeft aria-hidden="true" focusable="false" />{notFoundCopy?.backHomeLabel ?? 'Back home'}</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
