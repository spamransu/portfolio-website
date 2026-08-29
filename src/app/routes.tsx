import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '../layouts/RootLayout'
import { AboutPage } from '../pages/AboutPage'
import { BlogPage } from '../pages/BlogPage'
import { BlogPostPage } from '../pages/BlogPostPage'
import { ContactPage } from '../pages/ContactPage'
import { DesignSystemPage } from '../pages/DesignSystemPage'
import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ProjectDetailPage } from '../pages/ProjectDetailPage'
import { ProjectsPage } from '../pages/ProjectsPage'
import { ResumePage } from '../pages/ResumePage'

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <RootLayout />,
      errorElement: <NotFoundPage />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'about', element: <AboutPage /> },
        { path: 'blog', element: <BlogPage /> },
        { path: 'blog/:slug', element: <BlogPostPage /> },
        { path: 'projects', element: <ProjectsPage /> },
        { path: 'projects/:slug', element: <ProjectDetailPage /> },
        { path: 'contact', element: <ContactPage /> },
        { path: 'design-system', element: <DesignSystemPage /> },
        { path: 'resume', element: <ResumePage /> },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
)
