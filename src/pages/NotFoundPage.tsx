import { Link } from 'react-router-dom'
import { InternalHero } from '../components/InternalHero'
import sty from './InternalPages.module.scss'

export function NotFoundPage() {
  return (
    <div className={`md-wrapper ${sty.page}`}>
      <InternalHero eyebrow="404" title="Page not found" intro="That route does not exist yet, but the rest of the portfolio is still intact." />
      <div className={sty.ctaPanel}>
        <p className="eyebrow">Try these instead</p>
        <div className="button-row">
          <Link className="button button--primary" to="/projects">
            View projects
          </Link>
          <Link className="button button--ghost" to="/">
            Back home
          </Link>
        </div>
      </div>
    </div>
  )
}
