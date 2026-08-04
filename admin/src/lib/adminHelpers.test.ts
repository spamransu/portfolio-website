import { describe, expect, it } from 'vitest'
import type { BlogPostMeta, BlogPostResponse, Project } from '../types'
import {
  buildBlogPostPath,
  canReloadBlogPost,
  createClonedBlogPost,
  createClonedProject,
  createEmptyBlogPost,
  createProjectJsonDrafts,
  getBlogValidationError,
  getMediaValidationError,
  getProjectValidationError,
  normalizeSlug,
  parseProjectJsonField,
  splitLines,
} from './adminHelpers'

const project = (overrides: Partial<Project> = {}): Project => ({
  slug: 'portfolio-admin',
  title: 'Portfolio Admin',
  year: '2026',
  client: 'Personal project',
  summary: 'Admin editor',
  role: 'Frontend developer',
  stack: ['React'],
  challenge: 'Make content editing focused.',
  approach: ['Keep admin scoped.'],
  outcome: ['Projects and blog stay editable.'],
  overview: 'A Git-backed admin editor for portfolio content.',
  approachSummary: 'The editor keeps project updates focused and content-first.',
  resultSummary: 'Projects and blog content stay editable from the CMS.',
  scope: ['Admin UI', 'Git CMS', 'Content Structure'],
  reflection: 'Good admin tools make the correct content shape easy to maintain.',
  image: { src: '', alt: '', caption: '' },
  gallery: [
    { src: '/gallery-1.png', alt: 'Gallery 1' },
    { src: '/gallery-2.png', alt: 'Gallery 2' },
    { src: '/gallery-3.png', alt: 'Gallery 3' },
  ],
  ...overrides,
})

const blogMeta = (overrides: Partial<BlogPostMeta> = {}): BlogPostMeta => ({
  title: 'Existing post',
  slug: 'existing-post',
  date: '2026-08-04',
  status: 'draft',
  coverImage: '',
  coverAlt: '',
  excerpt: 'Excerpt',
  path: 'content/blog/2026-08-04-existing-post.md',
  sha: 'abc123',
  ...overrides,
})

const blogPost = (overrides: Partial<BlogPostResponse> = {}): BlogPostResponse => ({
  ...blogMeta(),
  body: 'Body copy',
  ...overrides,
})

describe('admin helper functions', () => {
  it('normalizes slugs and textarea line lists', () => {
    expect(normalizeSlug('  React + TypeScript Admin!  ')).toBe('react-typescript-admin')
    expect(splitLines(' React \n\n TypeScript \n ')).toEqual(['React', 'TypeScript'])
  })

  it('creates unique blog draft paths from existing slugs and paths', () => {
    const existing = [
      blogMeta({ slug: 'new-post', path: buildBlogPostPath('2026-08-04', 'new-post') }),
      blogMeta({ slug: 'new-post-2', path: buildBlogPostPath('2026-08-04', 'new-post-2') }),
    ]

    expect(createEmptyBlogPost(existing, '2026-08-04')).toMatchObject({
      slug: 'new-post-3',
      path: 'content/blog/2026-08-04-new-post-3.md',
      sha: '',
      status: 'draft',
    })
  })

  it('clones blog posts and projects without reusing persisted identity', () => {
    const clonedPost = createClonedBlogPost(blogPost(), [blogMeta({ slug: 'existing-post-copy' })], '2026-08-04')
    const clonedProject = createClonedProject(project(), [project(), project({ slug: 'portfolio-admin-copy' })])

    expect(clonedPost).toMatchObject({
      title: 'Existing post (Copy)',
      slug: 'existing-post-copy-2',
      path: 'content/blog/2026-08-04-existing-post-copy-2.md',
      sha: '',
      status: 'draft',
    })
    expect(clonedProject).toMatchObject({
      title: 'Portfolio Admin (Copy)',
      slug: 'portfolio-admin-copy-2',
    })
  })

  it('validates project and blog save requirements', () => {
    expect(getProjectValidationError([project()], 'portfolio-admin')).toBeNull()
    expect(getProjectValidationError([project({ image: { src: '/image.png', alt: '' } })], 'portfolio-admin')).toBe('Portfolio Admin hero image alt text is required.')
    expect(getProjectValidationError([project({ gallery: [{ src: '/one.png', alt: 'One' }] })], 'portfolio-admin')).toBe('Portfolio Admin needs at least three gallery images.')
    expect(getProjectValidationError([project({ gallery: [{ src: '/one.png', alt: 'One' }, { src: '/two.png', alt: '' }, { src: '/three.png', alt: 'Three' }] })], 'portfolio-admin')).toBe('Portfolio Admin gallery images need both src and alt text.')
    expect(getProjectValidationError([project(), project({ title: 'Duplicate', slug: 'portfolio-admin' })], 'portfolio-admin')).toBe('Project slug must be unique. Duplicate slug: portfolio-admin.')

    expect(getBlogValidationError(blogPost({ status: 'published', excerpt: '' }))).toBe('Published blog posts require an excerpt.')
    expect(getBlogValidationError(blogPost({ coverImage: '/cover.png', coverAlt: '' }))).toBe('Cover alt text is required when a blog cover image is set.')
  })

  it('keeps invalid project JSON drafts separate from parsed project data', () => {
    const drafts = createProjectJsonDrafts(project({ image: { src: '/hero.png', alt: 'Hero' } }))
    expect(drafts.image).toContain('/hero.png')

    expect(parseProjectJsonField('image', '{')).toEqual({
      ok: false,
      error: 'Hero image JSON is invalid. Fix the JSON before saving.',
    })
    expect(parseProjectJsonField('gallery', '[{"src":"/a.png","alt":"A"}]')).toEqual({
      ok: true,
      parsedValue: [{ src: '/a.png', alt: 'A' }],
    })
  })

  it('validates media uploads and blocks reload for unsaved blog drafts', () => {
    expect(getMediaValidationError({ area: 'blog', file: { type: 'image/png', size: 1024 } as File, selectedProject: null, slug: 'post' })).toBeNull()
    expect(getMediaValidationError({ area: 'projects', file: { type: 'application/pdf', size: 1024 } as File, selectedProject: project(), slug: 'project' })).toBe('Unsupported media type. Use png, jpg, webp, gif, or svg.')
    expect(getMediaValidationError({ area: 'projects', file: { type: 'image/png', size: 6 * 1024 * 1024 } as File, selectedProject: project(), slug: 'project' })).toBe('Media file is too large. Maximum size is 5 MB.')
    expect(getMediaValidationError({ area: 'projects', file: { type: 'image/png', size: 1024 } as File, selectedProject: null, slug: 'project' })).toBe('Select a project before uploading project media.')

    expect(canReloadBlogPost(blogPost({ sha: '' }), 'new-post')).toBe(false)
    expect(canReloadBlogPost(blogPost({ sha: 'abc123' }), 'existing-post')).toBe(true)
  })
})
