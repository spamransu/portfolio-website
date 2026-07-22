import { Outlet, useLocation } from 'react-router-dom'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { siteContent } from '../content/siteContent'

export function RootLayout() {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">{siteContent.siteChrome?.skipToContentLabel ?? 'Skip to main content'}</a>
      <SiteHeader />
      <main id="main-content" className={isHomePage ? 'site-main site-main--home' : 'site-main site-main--inner'}>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
