export type BlogStatus = 'draft' | 'published'

export type BlogPostMeta = {
  title: string
  slug: string
  date: string
  status: BlogStatus
  coverImage?: string
  coverAlt?: string
  excerpt?: string
}

export type BlogPost = BlogPostMeta & {
  body: string
}

const parseFrontmatter = (markdown: string) => {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) {
    throw new Error('Blog markdown is missing frontmatter.')
  }

  const frontmatter = Object.fromEntries(
    match[1]
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const separatorIndex = line.indexOf(':')
        const key = line.slice(0, separatorIndex).trim()
        const rawValue = line.slice(separatorIndex + 1).trim()
        return [key, rawValue.replace(/^"|"$/g, '')]
      }),
  )

  return {
    frontmatter,
    body: match[2].trim(),
  }
}

const modules = import.meta.glob<string>('../../content/blog/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
})

const allPosts = Object.values(modules)
  .map((markdown) => {
    const { frontmatter, body } = parseFrontmatter(markdown)
    return {
      title: frontmatter.title ?? '',
      slug: frontmatter.slug ?? '',
      date: frontmatter.date ?? '',
// SAFETY: This assertion is safe after the surrounding boundary validation.
      status: (frontmatter.status ?? 'draft') as BlogStatus,
      coverImage: frontmatter.coverImage || undefined,
      coverAlt: frontmatter.coverAlt || undefined,
      excerpt: frontmatter.excerpt || undefined,
      body,
    } satisfies BlogPost
  })
  .sort((left, right) => right.date.localeCompare(left.date))

export const blogPosts = allPosts.filter((post) => post.status === 'published')

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug)
}
