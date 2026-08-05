import { Link, useParams } from 'react-router-dom'
import { LuArrowLeft, LuArrowRight } from 'react-icons/lu'
import { InternalHero } from '../components/InternalHero'
import { parseBlogMarkdownBlocks } from '../content/blogMarkdown'
import { getBlogPostBySlug } from '../content/blogContent'
import { siteContent } from '../content/siteContent'
import sty from './InternalPages.module.scss'

function getReadingTime(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.ceil(words / 220))} min read`
}

export function BlogPostPage() {
  const { slug } = useParams()
  const post = slug ? getBlogPostBySlug(slug) : undefined
  const blogPostCopy = siteContent.blogPostPage

  if (!post) {
    return (
      <div className={sty.page}>
        <InternalHero eyebrow={blogPostCopy?.eyebrowPrefix ?? 'Blog'} title={blogPostCopy?.notFoundTitle ?? 'Post not found'} intro={blogPostCopy?.notFoundIntro ?? 'That post is missing, unpublished, or still in draft.'} actions={<Link className="button button--primary" to="/blog"><LuArrowLeft aria-hidden="true" focusable="false" />{blogPostCopy?.backToBlogLabel ?? 'Back to blog'}</Link>} />
      </div>
    )
  }

  const blocks = parseBlogMarkdownBlocks(post.body)

  return (
    <div className={sty.page}>
      <InternalHero
        eyebrow={`${blogPostCopy?.eyebrowPrefix ?? 'Blog'} · ${post.date} · ${getReadingTime(post.body)}`}
        title={post.title}
        intro={post.excerpt ?? post.body.split('\n')[0]}
        actions={<Link className="button button--ghost" to="/blog"><LuArrowLeft aria-hidden="true" focusable="false" />{blogPostCopy?.backToBlogLabel ?? 'Back to blog'}</Link>}
      />

      {post.coverImage ? (
        <section className={sty.articleCover}>
          <div className="lg-wrapper"><figure><img src={post.coverImage} alt={post.coverAlt ?? post.title} /><figcaption>Cover image: {post.title}</figcaption></figure></div>
        </section>
      ) : null}

      <article className={sty.article}>
        <div className="sm-wrapper">
          <div className={sty.articleBody}>
            {blocks.map((block, index) => {
              if (block.type === 'list') return <ul key={`${post.slug}-${index}`}>{block.items.map((item) => <li key={item}>{item}</li>)}</ul>
              if (block.type === 'section') return <section key={`${post.slug}-${index}`}><h2>{block.heading}</h2>{block.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>
              return <div key={`${post.slug}-${index}`}>{block.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
            })}
          </div>
        </div>
      </article>

      <section className={sty.articleCta}>
        <div className="lg-wrapper">
          <div><p className="eyebrow">{blogPostCopy?.articleCtaEyebrow ?? 'Related work'}</p><h2>{blogPostCopy?.articleCtaTitle ?? 'Read the project archive.'}</h2></div>
          <Link className="button button--ghost" to="/projects">{blogPostCopy?.articleCtaLabel ?? 'View projects'}<LuArrowRight aria-hidden="true" focusable="false" /></Link>
        </div>
      </section>
    </div>
  )
}
