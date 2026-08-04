import { Link } from 'react-router-dom'
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
  const latest = blogPosts[0]
  const groups = blogPosts.slice(1).reduce<Array<{ year: string; posts: BlogPost[] }>>((result, post) => {
    const year = post.date.slice(0, 4)
    const group = result.find((entry) => entry.year === year)
    if (group) group.posts.push(post)
    else result.push({ year, posts: [post] })
    return result
  }, [])

  return (
    <div className={sty.page}>
      <InternalHero
        eyebrow={siteContent.blogPage?.eyebrow ?? 'Blog'}
        title={siteContent.blogPage?.title ?? 'Build notes and frontend delivery posts.'}
        intro={siteContent.blogPage?.intro ?? 'Short posts about implementation, content systems, and frontend delivery work.'}
      />

      <section className={sty.blogArchive}>
        <div className="lg-wrapper">
          <div className={sty.archiveMeta}>
            <span>Writing archive</span>
            <span>{String(blogPosts.length).padStart(2, '0')} entries</span>
          </div>

          {latest ? (
            <Link className={sty.latestPost} to={`/blog/${latest.slug}`}>
              <span className="eyebrow">Latest</span>
              <div>
                <h2>{latest.title}</h2>
                <p>{latest.excerpt ?? latest.body.split('\n')[0]}</p>
                <strong>Read post</strong>
              </div>
              <div className={sty.postMeta}>
                <span>{formatDate(latest.date)}</span>
                <span>{getReadingTime(latest)}</span>
              </div>
            </Link>
          ) : null}

          {groups.map((group) => (
            <div className={sty.yearGroup} key={group.year}>
              <div className={sty.yearHeading}><span>{group.year}</span><span>{String(group.posts.length).padStart(2, '0')} entries</span></div>
              {group.posts.map((post) => (
                <Link className={sty.postRow} key={post.slug} to={`/blog/${post.slug}`}>
                  <div className={sty.postMeta}><span>{formatDate(post.date)}</span><span>{getReadingTime(post)}</span></div>
                  <div><h2>{post.title}</h2><p>{post.excerpt ?? post.body.split('\n')[0]}</p></div>
                  <span aria-hidden="true">Read</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
