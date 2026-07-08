import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="sm-wrapper">
      <div className="not-found">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p>That route does not exist yet.</p>
        <Link className="button button--primary" to="/">
          Back home
        </Link>
      </div>
    </main>
  )
}
