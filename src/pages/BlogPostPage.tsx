import { Link, useParams } from 'react-router-dom'
import { InternalHero } from '../components/InternalHero'
import { Section } from '../components/Section'
import { getBlogPostBySlug } from '../content/blogContent'
import sty from './InternalPages.module.scss'

function renderMarkdownBlock(block: string, key: string) {
  const lines = block.split('\n').map((line) => line.trim()).filter(Boolean)
  if (!lines.length) return null

  if (lines.every((line) => line.startsWith('- '))) {
    return (
      <ul key={key} className="check-list">
        {lines.map((line) => (
          <li key={line}>{line.slice(2)}</li>
        ))}
      </ul>
    )
  }

  if (lines[0].startsWith('## ')) {
    return (
      <div key={key} className={sty.copyStack}>
        <h3>{lines[0].slice(3)}</h3>
        {lines.slice(1).map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    )
  }

  return (
    <div key={key} className={sty.copyStack}>
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  )
}

export function BlogPostPage() {
  const { slug } = useParams()
  const post = slug ? getBlogPostBySlug(slug) : undefined

  if (!post) {
    return (
      <div className={`md-wrapper ${sty.page}`}>
        <InternalHero eyebrow="Blog" title="Post not found" intro="That post is missing, unpublished, or still in draft." />
        <Link className="button button--primary" to="/blog">
          Back to blog
        </Link>
      </div>
    )
  }

  const blocks = post.body.split(/\n\s*\n/).filter(Boolean)

  return (
    <div className={`lg-wrapper ${sty.page}`}>
      <InternalHero
        eyebrow={`Blog · ${post.date}`}
        title={post.title}
        intro={post.excerpt ?? post.body.split('\n')[0]}
        media={post.coverImage ? { src: post.coverImage, alt: post.coverAlt ?? post.title } : undefined}
        actions={
          <div className="button-row">
            <Link className="button button--ghost" to="/blog">
              Back to blog
            </Link>
            <Link className="button button--primary" to="/contact">
              Start a project
            </Link>
          </div>
        }
      />

      <Section title="Article">
        <div className={sty.sectionStack}>{blocks.map((block, index) => renderMarkdownBlock(block, `${post.slug}-${index}`))}</div>
      </Section>
    </div>
  )
}
