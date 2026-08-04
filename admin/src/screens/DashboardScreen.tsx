import { AdminHeader } from './dashboard/AdminHeader'
import { ActivitySection } from './dashboard/ActivitySection'
import { BlogEditorSection } from './dashboard/BlogEditorSection'
import { ConflictNotice, StatusMessage } from './dashboard/AdminUi'
import { LoginScreen } from './dashboard/LoginScreen'
import { MediaUploaderSection } from './dashboard/MediaUploaderSection'
import { ProjectEditorSection } from './dashboard/ProjectEditorSection'
import type { DashboardScreenProps } from './dashboard/dashboardTypes'

export const DashboardScreen = ({ activity, blog, media, projects, session }: DashboardScreenProps) => {
  if (!session.session.authenticated) return <LoginScreen {...session} />

  return (
    <main className="admin-shell">
      <AdminHeader {...session} />

      <nav className="admin-tabs" aria-label="Admin sections">
        <a href="#admin-project-editor" aria-current="page">Projects</a>
        <a href="#admin-blog-editor">Blog posts</a>
        <a href="#admin-media-uploader">Media</a>
        <a href="#admin-recent-activity">Activity</a>
      </nav>

      <div className="admin-message-stack" aria-live="polite">
        <StatusMessage kind="error" message={session.error} />
        <StatusMessage message={session.authStatus} />
        <ConflictNotice conflict={projects.conflict} label="Projects" />
        <ConflictNotice conflict={blog.conflict} label="Blog post" />
      </div>

      <ProjectEditorSection {...projects} />
      <BlogEditorSection {...blog} />
      <MediaUploaderSection blogPost={blog.post} media={media} selectedProject={projects.selected} />
      <ActivitySection {...activity} />
    </main>
  )
}
