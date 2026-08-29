import { Link } from 'react-router-dom'
import { LuArrowRight } from 'react-icons/lu'
import { InternalHero } from '../components/InternalHero'
import { blogPosts, type BlogPost } from '../content/blogContent'
import { siteContent } from '../content/siteContent'
import sty from './InternalPages.module.scss'

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${date}T00:00:00`))
}

function getReadingTime(post: BlogPost) {
  const words = post.body.trim().split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.ceil(words / 220))} min read`
}

export function BlogPage() {
  const groups = blogPosts.reduce<Array<{ year: string; posts: BlogPost[] }>>((result, post) => {
    const year = post.date.slice(0, 4)
    const group = result.find((entry) => entry.year === year)
    if (group) group.posts.push(post)
    else result.push({ year, posts: [post] })
    return result
  }, [])

  return (
    <div className={sty.page}>
      <InternalHero
        title={siteContent.blogPage?.title ?? 'Build notes and frontend delivery posts.'}
        intro={siteContent.blogPage?.intro ?? 'Short posts about implementation, content systems, and frontend delivery work.'}
      />

      <section className={sty.blogArchive}>
        <div className="lg-wrapper">
          {groups.map((group) => (
            <div className={sty.yearGroup} key={group.year}>
              {group.posts.map((post) => (
                <Link className={sty.postRow} data-text-reveal-group="scrub" key={post.slug} to={`/blog/${post.slug}`} state={{ from: '/blog' }}>
                  <div className={sty.postMeta} data-text-reveal="copy"><span>{formatDate(post.date)}</span><span>{getReadingTime(post)}</span></div>
                  <div><h2 data-text-reveal="copy">{post.title}</h2><p data-text-reveal="copy">{post.excerpt ?? post.body.split('\n')[0]}</p></div>
                  <span aria-hidden="true"><LuArrowRight focusable="false" /></span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
