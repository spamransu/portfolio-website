import { Outlet, useLocation } from 'react-router-dom'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'

export function RootLayout() {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  return (
    <div className="site-shell">
      <SiteHeader />
      <main className={isHomePage ? 'site-main site-main--home' : 'site-main site-main--inner'}>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
