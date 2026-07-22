import { Link, useParams } from 'react-router-dom'
import { InternalHero } from '../components/InternalHero'
import { Section } from '../components/Section'
import { parseBlogMarkdownBlocks } from '../content/blogMarkdown'
import { getBlogPostBySlug } from '../content/blogContent'
import sty from './InternalPages.module.scss'

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

  const blocks = parseBlogMarkdownBlocks(post.body)

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
        <div className={sty.sectionStack}>
          {blocks.map((block, index) => {
            if (block.type === 'list') {
              return (
                <ul key={`${post.slug}-${index}`} className="check-list">
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )
            }

            if (block.type === 'section') {
              return (
                <div key={`${post.slug}-${index}`} className={sty.copyStack}>
                  <h3>{block.heading}</h3>
                  {block.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              )
            }

            return (
              <div key={`${post.slug}-${index}`} className={sty.copyStack}>
                {block.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            )
          })}
        </div>
      </Section>
    </div>
  )
}
