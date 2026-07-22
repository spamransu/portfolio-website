import { Link } from 'react-router-dom'
import { InternalHero } from '../components/InternalHero'
import { blogPosts } from '../content/blogContent'
import { siteContent } from '../content/siteContent'
import sty from './InternalPages.module.scss'

export function BlogPage() {
  return (
    <div className={`lg-wrapper ${sty.page}`}>
      <InternalHero
        eyebrow="Blog"
        title={siteContent.blogPage?.title ?? 'Build notes and frontend delivery posts.'}
        intro={siteContent.blogPage?.intro ?? 'Short posts about implementation, content systems, and frontend delivery work.'}
        media={{
          src: 'https://picsum.photos/seed/portfolio-blog-index/1600/1100.jpg',
          alt: 'Mock editorial collage showing article cards, a content editor, and development notes.',
          caption: 'Published notes pulled from content/blog markdown files.',
        }}
      />

      <div className={sty.cardGrid}>
        {blogPosts.map((post) => (
          <Link key={post.slug} to={`/blog/${post.slug}`} className={sty.projectLead}>
            <p className="eyebrow">{post.date}</p>
            <h2>{post.title}</h2>
            <p>{post.excerpt ?? post.body.split('\n')[0]}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
