interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>
  }
  ADMIN_ALLOWED_GITHUB_LOGIN?: string
  ADMIN_SESSION_SECRET?: string
  CMS_TARGET_BRANCH?: string
  GITHUB_CLIENT_ID?: string
  GITHUB_CLIENT_SECRET?: string
  GITHUB_OWNER?: string
  GITHUB_REPO?: string
}

type PagesContext = {
  request: Request
  env: Env
}

type AdminSession = {
  accessToken: string
  expiresAt: number
  login: string
}

type GitHubContentResponse = {
  content: string
  path: string
  sha: string
}

type GitHubDirEntry = {
  name: string
  path: string
  sha: string
  type: 'file' | 'dir'
}

type GitHubUpdateContentRequest = {
  message: string
  content: string
  branch: string
  sha?: string
}

type GitHubUpdateContentResponse = {
  content?: {
    sha?: string
    path?: string
  }
  commit?: {
    sha?: string
  }
}

type GitHubDeleteContentRequest = {
  message: string
  branch: string
  sha: string
}

type GitHubOAuthTokenResponse = {
  access_token?: string
}

type GitHubUserResponse = {
  login: string
}

type GitHubBranchResponse = {
  commit?: {
    sha?: string
  }
}

type SiteContentWriteRequest = {
  branch?: unknown
  commitMessage?: unknown
  content?: unknown
  sha?: unknown
}

type BlogStatus = 'draft' | 'published'

type BlogPost = {
  title: string
  slug: string
  date: string
  status: BlogStatus
  coverImage?: string
  coverAlt?: string
  excerpt?: string
  body: string
}

type BlogPostMeta = Omit<BlogPost, 'body'> & {
  path: string
  sha: string
}

type BlogPostResponse = BlogPostMeta & {
  body: string
}

type BlogPostWriteRequest = {
  branch?: unknown
  commitMessage?: unknown
  post?: unknown
  sha?: unknown
}

type BlogPostDeleteRequest = {
  branch?: unknown
  commitMessage?: unknown
  sha?: unknown
}

type MediaUploadResponse = {
  branch: string
  latestCommitSha: string | null
  path: string
  repo: AdminRepoInfo
  sha: string
}

type AdminRepoInfo = {
  branchUrl: string
  owner: string
  repo: string
  repoUrl: string
}

const ADMIN_SESSION_COOKIE = 'admin_session'
const ADMIN_STATE_COOKIE = 'admin_oauth_state'
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8
const ADMIN_PREFIX = '/api/admin'
const GITHUB_API_BASE = 'https://api.github.com'
const GITHUB_OAUTH_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize'
const GITHUB_OAUTH_TOKEN_URL = 'https://github.com/login/oauth/access_token'
const SITE_CONTENT_PATH = 'content/site-content.json'
const BLOG_CONTENT_DIR = 'content/blog'
const DEFAULT_SITE_CONTENT_COMMIT_MESSAGE = 'chore(content): update site content from admin'
const DEFAULT_BLOG_COMMIT_MESSAGE = 'chore(blog): update blog post from admin'
const DEFAULT_BLOG_DELETE_COMMIT_MESSAGE = 'chore(blog): delete blog post from admin'
const DEFAULT_MEDIA_COMMIT_MESSAGE = 'chore(media): upload asset from admin'
const MAX_ADMIN_BODY_BYTES = 1024 * 512
const MAX_MEDIA_FILE_BYTES = 5 * 1024 * 1024
const ALLOWED_MEDIA_AREAS = ['about', 'blog', 'contact', 'home', 'projects', 'resume'] as const
const ALLOWED_MEDIA_TYPES = ['image/gif', 'image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'] as const

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

const adminHeaders = () => {
  const headers = new Headers()
  headers.set('Cache-Control', 'no-store')
  headers.set('X-Robots-Tag', 'noindex, nofollow')
  return headers
}

const appendHeaders = (target: Headers, source: HeadersInit): void => {
  if (source instanceof Headers) {
    source.forEach((value, key) => target.append(key, value))
    return
  }

  if (Array.isArray(source)) {
    source.forEach(([key, value]) => target.append(key, value))
    return
  }

  Object.entries(source).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => target.append(key, entry))
      return
    }

    if (value !== undefined) {
      target.append(key, value)
    }
  })
}

const jsonResponse = (body: unknown, init: ResponseInit = {}): Response => {
  const headers = adminHeaders()
  headers.set('Content-Type', 'application/json; charset=utf-8')

  if (init.headers) {
    appendHeaders(headers, init.headers)
  }

  return new Response(JSON.stringify(body), {
    ...init,
    headers,
  })
}

const redirectResponse = (location: string, init: ResponseInit = {}): Response => {
  const headers = adminHeaders()
  headers.set('Location', location)

  if (init.headers) {
    appendHeaders(headers, init.headers)
  }

  return new Response(null, {
    status: init.status ?? 302,
    ...init,
    headers,
  })
}

const toBase64Url = (bytes: Uint8Array): string => {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

const fromBase64Url = (value: string): Uint8Array => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
  const binary = atob(padded)
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

const fromBase64 = (value: string): Uint8Array => {
  const padded = value + '='.repeat((4 - (value.length % 4)) % 4)
  const binary = atob(padded)
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

const toBase64 = (value: string): string => {
  let binary = ''
  for (const byte of textEncoder.encode(value)) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
}

const toBase64FromBytes = (bytes: Uint8Array): string => {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

const getAesKey = async (secret: string): Promise<CryptoKey> => {
  const secretBytes = textEncoder.encode(secret)
  const hash = await crypto.subtle.digest('SHA-256', secretBytes)
  return crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
}

const sealSession = async (session: AdminSession, secret: string): Promise<string> => {
  const key = await getAesKey(secret)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const payload = textEncoder.encode(JSON.stringify(session))
  const cipherBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, payload)
  return `${toBase64Url(iv)}.${toBase64Url(new Uint8Array(cipherBuffer))}`
}

const openSession = async (token: string, secret: string): Promise<AdminSession | null> => {
  const [ivPart, cipherPart] = token.split('.')
  if (!ivPart || !cipherPart) return null

  try {
    const key = await getAesKey(secret)
    const iv = fromBase64Url(ivPart)
    const cipher = fromBase64Url(cipherPart)
    const payload = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher)
    const session = JSON.parse(textDecoder.decode(payload)) as AdminSession

    if (!session.login || !session.accessToken || !session.expiresAt || session.expiresAt <= Date.now()) {
      return null
    }

    return session
  } catch {
    return null
  }
}

const getCookie = (request: Request, name: string): string | null => {
  const header = request.headers.get('cookie')
  if (!header) return null

  for (const part of header.split(';')) {
    const [rawName, ...rawValue] = part.trim().split('=')
    if (rawName === name) {
      return decodeURIComponent(rawValue.join('='))
    }
  }

  return null
}

const getCookieAttributes = (request: Request): string => {
  const url = new URL(request.url)
  const secure = url.protocol === 'https:' ? 'Secure; ' : ''
  return `${secure}HttpOnly; SameSite=Lax; Path=/`
}

const serializeCookie = (request: Request, name: string, value: string, maxAge: number): string =>
  `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; ${getCookieAttributes(request)}`

const clearCookie = (request: Request, name: string): string =>
  `${name}=; Max-Age=0; ${getCookieAttributes(request)}`

const toMarkdownPath = (pathname: string): string | null => {
  if (pathname === '/') return '/index.md'
  if (pathname.endsWith('.md')) return pathname
  if (pathname === '/about') return '/about.md'
  if (pathname === '/blog') return '/blog.md'
  if (pathname === '/projects') return '/projects.md'
  if (pathname === '/contact') return '/contact.md'
  if (pathname === '/resume') return '/resume.md'
  if (pathname.startsWith('/projects/')) return `${pathname}.md`
  if (pathname.startsWith('/blog/')) return `${pathname}.md`
  return null
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'string')

const isStringRecordArray = (value: unknown, keys: string[]): value is Array<Record<string, unknown>> =>
  Array.isArray(value) && value.every((entry) => isRecord(entry) && keys.every((key) => typeof entry[key] === 'string'))

const isImageAsset = (value: unknown): boolean =>
  isRecord(value) && typeof value.src === 'string' && typeof value.alt === 'string' && (value.caption === undefined || typeof value.caption === 'string')

const validateSiteContent = (value: unknown): value is Record<string, unknown> => {
  if (!isRecord(value)) return false

  const site = value.site
  const siteChrome = value.siteChrome
  const home = value.home
  const about = value.about
  const resume = value.resume
  const contact = value.contact
  const projects = value.projects

  if (!isRecord(site) || !isRecord(home) || !isRecord(about) || !isRecord(resume) || !isRecord(contact) || !Array.isArray(projects)) {
    return false
  }

  if (!['name', 'tagline', 'description', 'email', 'location', 'siteUrl'].every((key) => typeof site[key] === 'string')) {
    return false
  }

  if (!isStringRecordArray(site.socials, ['label', 'href'])) return false
  if (
    siteChrome !== undefined
    && (
      !isRecord(siteChrome)
      || typeof siteChrome.skipToContentLabel !== 'string'
      || typeof siteChrome.headerNavAriaLabel !== 'string'
      || typeof siteChrome.footerSocialsAriaLabel !== 'string'
      || (siteChrome.headerLinktreeLabel !== undefined && typeof siteChrome.headerLinktreeLabel !== 'string')
      || !isStringRecordArray(siteChrome.headerNav, ['to', 'label'])
      || !isRecord(siteChrome.footer)
      || typeof siteChrome.footer.copyrightTemplate !== 'string'
      || typeof siteChrome.footer.generalHeading !== 'string'
      || typeof siteChrome.footer.moreHeading !== 'string'
      || (siteChrome.footer.linktreeLabel !== undefined && typeof siteChrome.footer.linktreeLabel !== 'string')
      || !isStringRecordArray(siteChrome.footer.generalLinks, ['to', 'label'])
      || !isStringRecordArray(siteChrome.footer.moreLinks, ['to', 'label'])
    )
  ) return false

  const homeHero = home.hero
  if (!isRecord(homeHero) || !['eyebrow', 'description'].every((key) => typeof homeHero[key] === 'string') || !isStringArray(homeHero.titleLines)) {
    return false
  }

  const homeCta = home.cta
  const featuredProjects = home.featuredProjects
  const homeBio = home.bio
  const homeSkills = home.skills
  const homeContact = home.contact
  const homeStats = home.stats

  if (!isRecord(homeCta) || typeof homeCta.primaryLabel !== 'string' || typeof homeCta.secondaryLabel !== 'string') return false
  if (!isRecord(featuredProjects) || !['title', 'intro', 'fallbackLabel', 'fallbackDescription'].every((key) => typeof featuredProjects[key] === 'string') || !isStringArray(featuredProjects.slugs)) return false
  if (!isRecord(homeBio) || typeof homeBio.eyebrow !== 'string' || typeof homeBio.description !== 'string' || !isStringArray(homeBio.titleLines)) return false
  if (!Array.isArray(homeStats) || !homeStats.every((entry) => isRecord(entry) && typeof entry.value === 'string' && typeof entry.label === 'string' && ['accent', 'accent-2', 'accent-3'].includes(`${entry.tone}`))) return false
  if (!isRecord(homeSkills) || typeof homeSkills.title !== 'string' || typeof homeSkills.description !== 'string' || !isStringArray(homeSkills.items)) return false
  if (!isRecord(homeContact) || !['title', 'intro', 'submitLabel', 'nameLabel', 'emailLabel', 'messageLabel', 'namePlaceholder', 'emailPlaceholder', 'messagePlaceholder', 'nameRequiredError', 'emailRequiredError', 'emailInvalidError', 'messageRequiredError', 'messageTooLongError', 'messageCountTemplate'].every((key) => typeof homeContact[key] === 'string') || typeof homeContact.messageLimit !== 'number') return false

  if (!['title', 'intro', 'bodySectionTitle', 'processSectionTitle', 'processSectionIntro', 'principlesSectionTitle', 'toolsSectionTitle'].every((key) => typeof about[key] === 'string') || (about.eyebrow !== undefined && typeof about.eyebrow !== 'string') || !isStringArray(about.body) || !isStringArray(about.principles) || !Array.isArray(about.process) || !about.process.every((entry) => isRecord(entry) && typeof entry.title === 'string' && typeof entry.description === 'string') || !isStringArray(about.tools)) {
    return false
  }
  if (about.heroImage !== undefined && !isImageAsset(about.heroImage)) return false

  if (!['headline', 'summary', 'highlightsSectionTitle', 'skillsSectionTitle', 'experienceSectionTitle'].every((key) => typeof resume[key] === 'string') || (resume.eyebrow !== undefined && typeof resume.eyebrow !== 'string') || !isStringArray(resume.skills) || !Array.isArray(resume.experience) || !resume.experience.every((entry) => isRecord(entry) && typeof entry.role === 'string' && typeof entry.company === 'string' && typeof entry.period === 'string' && isStringArray(entry.highlights)) || !Array.isArray(resume.highlights) || !resume.highlights.every((entry) => isRecord(entry) && typeof entry.value === 'string' && typeof entry.label === 'string')) {
    return false
  }
  if (resume.heroImage !== undefined && !isImageAsset(resume.heroImage)) return false

  if (!['title', 'body', 'availability', 'availabilityTitle', 'availabilityStatusLabel', 'availabilityLocationLabel', 'formSectionTitle', 'formSectionIntro', 'methodsSectionTitle', 'methodsSectionIntro'].every((key) => typeof contact[key] === 'string') || (contact.eyebrow !== undefined && typeof contact.eyebrow !== 'string') || (contact.emailCtaPrefix !== undefined && typeof contact.emailCtaPrefix !== 'string')) return false
  const contactForm = contact.form
  if (!isRecord(contactForm) || !['title', 'intro', 'submitLabel', 'nameLabel', 'emailLabel', 'messageLabel', 'namePlaceholder', 'emailPlaceholder', 'messagePlaceholder', 'nameRequiredError', 'emailRequiredError', 'emailInvalidError', 'messageRequiredError', 'messageTooLongError', 'messageCountTemplate'].every((key) => typeof contactForm[key] === 'string') || typeof contactForm.messageLimit !== 'number') return false
  if (!Array.isArray(contact.methods) || !contact.methods.every((entry) => isRecord(entry) && ['title', 'label', 'href', 'description'].every((key) => typeof entry[key] === 'string'))) return false
  if (contact.heroImage !== undefined && !isImageAsset(contact.heroImage)) return false

  if (
    value.projectsPage !== undefined
    && (
      !isRecord(value.projectsPage)
      || (value.projectsPage.eyebrow !== undefined && typeof value.projectsPage.eyebrow !== 'string')
      || typeof value.projectsPage.title !== 'string'
      || typeof value.projectsPage.intro !== 'string'
      || (value.projectsPage.heroImage !== undefined && !isImageAsset(value.projectsPage.heroImage))
    )
  ) return false
  if (
    value.blogPage !== undefined
    && (
      !isRecord(value.blogPage)
      || (value.blogPage.eyebrow !== undefined && typeof value.blogPage.eyebrow !== 'string')
      || typeof value.blogPage.title !== 'string'
      || typeof value.blogPage.intro !== 'string'
      || (value.blogPage.heroImage !== undefined && !isImageAsset(value.blogPage.heroImage))
    )
  ) return false
  const blogPostPage = value.blogPostPage
  if (
    blogPostPage !== undefined
    && (
      !isRecord(blogPostPage)
      || !(['eyebrowPrefix', 'notFoundTitle', 'notFoundIntro', 'backToBlogLabel', 'startProjectLabel', 'articleSectionTitle'] as const).every((key) => typeof blogPostPage[key] === 'string')
    )
  ) return false
  const projectDetailPage = value.projectDetailPage
  if (
    projectDetailPage !== undefined
    && (
      !isRecord(projectDetailPage)
      || (projectDetailPage.eyebrow !== undefined && typeof projectDetailPage.eyebrow !== 'string')
      || !(['notFoundTitle', 'notFoundIntro', 'backToProjectsLabel', 'startProjectLabel', 'snapshotTitle', 'galleryTitle', 'galleryIntro', 'nextProjectEyebrow', 'nextProjectLabel', 'similarWorkEyebrow', 'similarWorkTitle', 'similarWorkIntro', 'similarWorkLabel'] as const).every((key) => typeof projectDetailPage[key] === 'string')
    )
  ) return false
  const notFoundPage = value.notFoundPage
  if (
    notFoundPage !== undefined
    && (
      !isRecord(notFoundPage)
      || !(['eyebrow', 'title', 'intro', 'suggestionsEyebrow', 'viewProjectsLabel', 'backHomeLabel'] as const).every((key) => typeof notFoundPage[key] === 'string')
    )
  ) return false

  return projects.every((entry) => {
    if (!isRecord(entry)) return false
    if (!['slug', 'title', 'year', 'client', 'summary', 'role', 'challenge'].every((key) => typeof entry[key] === 'string')) return false
    if (!isStringArray(entry.stack) || !isStringArray(entry.approach) || !isStringArray(entry.outcome)) return false
    if (entry.image !== undefined && !isImageAsset(entry.image)) return false
    if (entry.gallery !== undefined && (!Array.isArray(entry.gallery) || !entry.gallery.every(isImageAsset))) return false
    if (entry.sections !== undefined && (!Array.isArray(entry.sections) || !entry.sections.every((section) => isRecord(section) && typeof section.title === 'string' && typeof section.body === 'string' && (section.image === undefined || isImageAsset(section.image))))) return false
    return true
  })
}

const isBlogStatus = (value: unknown): value is BlogStatus => value === 'draft' || value === 'published'
const isAllowedMediaArea = (value: string): value is (typeof ALLOWED_MEDIA_AREAS)[number] =>
  (ALLOWED_MEDIA_AREAS as readonly string[]).includes(value)

const isAllowedMediaType = (value: string): value is (typeof ALLOWED_MEDIA_TYPES)[number] =>
  (ALLOWED_MEDIA_TYPES as readonly string[]).includes(value)


const validateBlogPost = (value: unknown): value is BlogPost => {
  if (!isRecord(value)) return false
  if (typeof value.title !== 'string' || typeof value.slug !== 'string' || typeof value.date !== 'string' || typeof value.body !== 'string') return false
  if (!isBlogStatus(value.status)) return false
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.date)) return false
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug)) return false
  if (value.coverImage !== undefined && typeof value.coverImage !== 'string') return false
  if (value.coverAlt !== undefined && typeof value.coverAlt !== 'string') return false
  if (value.excerpt !== undefined && typeof value.excerpt !== 'string') return false
  return true
}

const sanitizePathSegment = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')

const sanitizeFilename = (value: string): string => {
  const normalized = value.toLowerCase().trim()
  const dotIndex = normalized.lastIndexOf('.')
  const name = dotIndex === -1 ? normalized : normalized.slice(0, dotIndex)
  const extension = dotIndex === -1 ? '' : normalized.slice(dotIndex + 1)
  const safeName = sanitizePathSegment(name) || 'upload'
  const safeExtension = extension.replace(/[^a-z0-9]+/g, '')
  return safeExtension ? `${safeName}.${safeExtension}` : safeName
}

const extensionForMimeType = (mimeType: string): string => {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    case 'image/gif':
      return 'gif'
    case 'image/svg+xml':
      return 'svg'
    default:
      return 'bin'
  }
}

const resolveMediaFilename = (originalName: string, mimeType: string): string => {
  const filename = sanitizeFilename(originalName)
  if (filename.includes('.')) return filename
  return `${filename}.${extensionForMimeType(mimeType)}`
}

const sanitizeCommitMessage = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string') return fallback
  const normalized = value.replace(/\s+/g, ' ').trim()
  if (!normalized) return fallback
  return normalized.slice(0, 120)
}

const getRequiredEnv = (env: Env, keys: Array<keyof Env>): string | Response => {
  for (const key of keys) {
    if (!env[key]) {
      return jsonResponse({ error: `Missing required admin environment variable: ${String(key)}` }, { status: 500 })
    }
  }

  return 'ok'
}

const getAllowedCmsBranch = (env: Env): string => env.CMS_TARGET_BRANCH || 'main'

const resolveRequestedBranch = (request: Request, env: Env): string | Response => {
  const requested = new URL(request.url).searchParams.get('branch')
  const allowed = getAllowedCmsBranch(env)

  if (requested && requested !== allowed) {
    return jsonResponse({ error: `Only the ${allowed} branch is allowed for admin CMS operations.` }, { status: 403 })
  }

  return allowed
}

const requireSameOrigin = (request: Request): Response | null => {
  const expectedOrigin = new URL(request.url).origin
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const actualOrigin = origin || (referer ? new URL(referer).origin : null)

  if (!actualOrigin || actualOrigin !== expectedOrigin) {
    return jsonResponse({ error: 'Same-origin admin request required.' }, { status: 403 })
  }

  return null
}

const readJsonBody = async <T>(request: Request): Promise<T | Response> => {
  const contentLengthHeader = request.headers.get('content-length')
  if (contentLengthHeader && Number(contentLengthHeader) > MAX_ADMIN_BODY_BYTES) {
    return jsonResponse({ error: 'Admin request body is too large.' }, { status: 413 })
  }

  try {
    return (await request.json()) as T
  } catch {
    return jsonResponse({ error: 'Expected a JSON request body.' }, { status: 400 })
  }
}

const getGitHubHeaders = (token: string): HeadersInit => ({
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${token}`,
  'User-Agent': 'portfolio-admin',
  'X-GitHub-Api-Version': '2022-11-28',
})

const getRepoBase = (env: Env): string => `${GITHUB_API_BASE}/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}`

const getRepoHtmlBase = (env: Env): string => `https://github.com/${env.GITHUB_OWNER}/${env.GITHUB_REPO}`

const getAdminRepoInfo = (env: Env, branch: string): AdminRepoInfo => ({
  branchUrl: `${getRepoHtmlBase(env)}/tree/${encodeURIComponent(branch)}`,
  owner: env.GITHUB_OWNER ?? '',
  repo: env.GITHUB_REPO ?? '',
  repoUrl: getRepoHtmlBase(env),
})

const fetchGitHubJson = async <T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> => {
  const response = await fetch(input, init)
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `GitHub request failed (${response.status})`)
  }

  return (await response.json()) as T
}

const readSession = async (request: Request, env: Env): Promise<AdminSession | null> => {
  if (!env.ADMIN_SESSION_SECRET) return null
  const token = getCookie(request, ADMIN_SESSION_COOKIE)
  if (!token) return null
  return openSession(token, env.ADMIN_SESSION_SECRET)
}

const buildGitHubCallbackUrl = (request: Request): string => {
  const url = new URL(request.url)
  url.pathname = `${ADMIN_PREFIX}/auth/callback`
  url.search = ''
  url.hash = ''
  return url.toString()
}

const createState = (): string => toBase64Url(crypto.getRandomValues(new Uint8Array(24)))

const loadGitHubSiteContent = async (env: Env, accessToken: string, branch: string) => {
  const repoBase = getRepoBase(env)
  const fileResponse = await fetchGitHubJson<GitHubContentResponse>(
    `${repoBase}/contents/${SITE_CONTENT_PATH}?ref=${encodeURIComponent(branch)}`,
    { headers: getGitHubHeaders(accessToken) },
  )
  const branchResponse = await fetchGitHubJson<GitHubBranchResponse>(
    `${repoBase}/branches/${encodeURIComponent(branch)}`,
    { headers: getGitHubHeaders(accessToken) },
  )
  const decodedContent = textDecoder.decode(fromBase64(fileResponse.content.replace(/\n/g, '')))

  return {
    branch,
    content: JSON.parse(decodedContent),
    latestCommitSha: branchResponse.commit?.sha ?? null,
    path: fileResponse.path,
    repo: getAdminRepoInfo(env, branch),
    sha: fileResponse.sha,
  }
}

const listGitHubBlogEntries = async (env: Env, accessToken: string, branch: string): Promise<GitHubDirEntry[]> => {
  const entries = await fetchGitHubJson<GitHubDirEntry[]>(
    `${getRepoBase(env)}/contents/${BLOG_CONTENT_DIR}?ref=${encodeURIComponent(branch)}`,
    { headers: getGitHubHeaders(accessToken) },
  )

  return entries.filter((entry) => entry.type === 'file' && entry.name.endsWith('.md'))
}

const parseFrontmatter = (markdown: string): { frontmatter: Record<string, string>; body: string } => {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) {
    throw new Error('Markdown file is missing frontmatter.')
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
        const value = rawValue.replace(/^"|"$/g, '')
        return [key, value]
      }),
  )

  return {
    frontmatter,
    body: match[2].trim(),
  }
}

const parseBlogMarkdown = (markdown: string, path: string, sha: string): BlogPostResponse => {
  const { frontmatter, body } = parseFrontmatter(markdown)
  const post: BlogPostResponse = {
    title: frontmatter.title ?? '',
    slug: frontmatter.slug ?? '',
    date: frontmatter.date ?? '',
    status: frontmatter.status === 'draft' ? 'draft' : 'published',
    coverImage: frontmatter.coverImage || undefined,
    coverAlt: frontmatter.coverAlt || undefined,
    excerpt: frontmatter.excerpt || undefined,
    body,
    path,
    sha,
  }

  if (!validateBlogPost(post)) {
    throw new Error(`Invalid blog post frontmatter for ${path}.`)
  }

  return post
}

const serializeBlogPost = (post: BlogPost): string => {
  const frontmatterEntries = [
    ['title', post.title],
    ['slug', post.slug],
    ['date', post.date],
    ['status', post.status],
    ['coverImage', post.coverImage ?? ''],
    ['coverAlt', post.coverAlt ?? ''],
    ['excerpt', post.excerpt ?? ''],
  ]

  const frontmatter = frontmatterEntries
    .map(([key, value]) => `${key}: "${String(value).replace(/"/g, '\\"')}"`)
    .join('\n')

  return `---\n${frontmatter}\n---\n\n${post.body.trim()}\n`
}

const slugFromBlogFilename = (filename: string): string | null => {
  const match = filename.match(/^\d{4}-\d{2}-\d{2}-(.+)\.md$/)
  return match?.[1] ?? null
}

const loadGitHubBlogPostBySlug = async (env: Env, accessToken: string, branch: string, slug: string): Promise<BlogPostResponse | null> => {
  const entries = await listGitHubBlogEntries(env, accessToken, branch)
  const entry = entries.find((candidate) => slugFromBlogFilename(candidate.name) === slug)
  if (!entry) return null

  const fileResponse = await fetchGitHubJson<GitHubContentResponse>(
    `${getRepoBase(env)}/contents/${entry.path}?ref=${encodeURIComponent(branch)}`,
    { headers: getGitHubHeaders(accessToken) },
  )

  const markdown = textDecoder.decode(fromBase64(fileResponse.content.replace(/\n/g, '')))
  return parseBlogMarkdown(markdown, fileResponse.path, fileResponse.sha)
}

const readGitHubFileIfExists = async (env: Env, accessToken: string, branch: string, repoPath: string): Promise<GitHubContentResponse | null> => {
  const response = await fetch(`${getRepoBase(env)}/contents/${repoPath}?ref=${encodeURIComponent(branch)}`, {
    headers: getGitHubHeaders(accessToken),
  })

  if (response.status === 404) return null
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `GitHub request failed (${response.status})`)
  }

  return (await response.json()) as GitHubContentResponse
}

const loadGitHubBlogPostList = async (env: Env, accessToken: string, branch: string): Promise<BlogPostMeta[]> => {
  const entries = await listGitHubBlogEntries(env, accessToken, branch)
  const posts = await Promise.all(
    entries.map(async (entry) => {
      const fileResponse = await fetchGitHubJson<GitHubContentResponse>(
        `${getRepoBase(env)}/contents/${entry.path}?ref=${encodeURIComponent(branch)}`,
        { headers: getGitHubHeaders(accessToken) },
      )
      const markdown = textDecoder.decode(fromBase64(fileResponse.content.replace(/\n/g, '')))
      const post = parseBlogMarkdown(markdown, fileResponse.path, fileResponse.sha)
      const { body: _body, ...meta } = post
      return meta
    }),
  )

  return posts.sort((left, right) => right.date.localeCompare(left.date))
}

const handleAdminAuthStart = async ({ request, env }: PagesContext): Promise<Response> => {
  const envCheck = getRequiredEnv(env, ['GITHUB_CLIENT_ID'])
  if (envCheck instanceof Response) return envCheck

  const state = createState()
  const callbackUrl = buildGitHubCallbackUrl(request)
  const authorizeUrl = new URL(GITHUB_OAUTH_AUTHORIZE_URL)
  authorizeUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID as string)
  authorizeUrl.searchParams.set('redirect_uri', callbackUrl)
  authorizeUrl.searchParams.set('scope', 'read:user repo')
  authorizeUrl.searchParams.set('state', state)

  return redirectResponse(authorizeUrl.toString(), {
    headers: {
      'Set-Cookie': serializeCookie(request, ADMIN_STATE_COOKIE, state, 60 * 10),
    },
  })
}

const handleAdminAuthCallback = async ({ request, env }: PagesContext): Promise<Response> => {
  const envCheck = getRequiredEnv(env, ['ADMIN_ALLOWED_GITHUB_LOGIN', 'ADMIN_SESSION_SECRET', 'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'])
  if (envCheck instanceof Response) return envCheck

  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const savedState = getCookie(request, ADMIN_STATE_COOKIE)

  if (!code || !state || !savedState || state !== savedState) {
    return redirectResponse('/admin/#/?auth=error', {
      headers: [
        ['Set-Cookie', clearCookie(request, ADMIN_STATE_COOKIE)],
        ['Set-Cookie', clearCookie(request, ADMIN_SESSION_COOKIE)],
      ],
    })
  }

  const tokenResponse = await fetchGitHubJson<GitHubOAuthTokenResponse>(GITHUB_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: buildGitHubCallbackUrl(request),
      state,
    }),
  })

  if (!tokenResponse.access_token) {
    return redirectResponse('/admin/#/?auth=error', {
      headers: [
        ['Set-Cookie', clearCookie(request, ADMIN_STATE_COOKIE)],
        ['Set-Cookie', clearCookie(request, ADMIN_SESSION_COOKIE)],
      ],
    })
  }

  const user = await fetchGitHubJson<GitHubUserResponse>(`${GITHUB_API_BASE}/user`, {
    headers: getGitHubHeaders(tokenResponse.access_token),
  })

  if (user.login !== env.ADMIN_ALLOWED_GITHUB_LOGIN) {
    return redirectResponse('/admin/#/?auth=error', {
      headers: [
        ['Set-Cookie', clearCookie(request, ADMIN_STATE_COOKIE)],
        ['Set-Cookie', clearCookie(request, ADMIN_SESSION_COOKIE)],
      ],
    })
  }

  const sealedSession = await sealSession(
    {
      accessToken: tokenResponse.access_token,
      expiresAt: Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000,
      login: user.login,
    },
    env.ADMIN_SESSION_SECRET as string,
  )

  return redirectResponse('/admin/#/?auth=success', {
    headers: [
      ['Set-Cookie', clearCookie(request, ADMIN_STATE_COOKIE)],
      ['Set-Cookie', serializeCookie(request, ADMIN_SESSION_COOKIE, sealedSession, ADMIN_SESSION_TTL_SECONDS)],
    ],
  })
}

const handleAdminAuthMe = async ({ request, env }: PagesContext): Promise<Response> => {
  const session = await readSession(request, env)

  return jsonResponse({
    authenticated: Boolean(session),
    login: session?.login ?? null,
    expiresAt: session ? new Date(session.expiresAt).toISOString() : null,
  })
}

const handleAdminAuthLogout = async ({ request }: PagesContext): Promise<Response> =>
  jsonResponse(
    { ok: true },
    {
      headers: {
        'Set-Cookie': clearCookie(request, ADMIN_SESSION_COOKIE),
      },
    },
  )

const handleAdminContentSite = async ({ request, env }: PagesContext): Promise<Response> => {
  const envCheck = getRequiredEnv(env, ['ADMIN_SESSION_SECRET', 'GITHUB_OWNER', 'GITHUB_REPO'])
  if (envCheck instanceof Response) return envCheck

  const session = await readSession(request, env)
  if (!session) return jsonResponse({ error: 'Admin session required.' }, { status: 401 })

  const branch = resolveRequestedBranch(request, env)
  if (branch instanceof Response) return branch

  return jsonResponse(await loadGitHubSiteContent(env, session.accessToken, branch))
}

const handleAdminContentSiteUpdate = async ({ request, env }: PagesContext): Promise<Response> => {
  const sameOriginError = requireSameOrigin(request)
  if (sameOriginError) return sameOriginError

  const envCheck = getRequiredEnv(env, ['ADMIN_SESSION_SECRET', 'GITHUB_OWNER', 'GITHUB_REPO'])
  if (envCheck instanceof Response) return envCheck

  const session = await readSession(request, env)
  if (!session) return jsonResponse({ error: 'Admin session required.' }, { status: 401 })

  const body = await readJsonBody<SiteContentWriteRequest>(request)
  if (body instanceof Response) return body

  const branch = getAllowedCmsBranch(env)
  if (body.branch !== undefined && body.branch !== branch) {
    return jsonResponse({ error: `Only the ${branch} branch is allowed for admin CMS writes.` }, { status: 403 })
  }
  if (typeof body.sha !== 'string' || !body.sha.trim()) {
    return jsonResponse({ error: 'A base file SHA is required before saving.' }, { status: 400 })
  }
  if (!validateSiteContent(body.content)) {
    return jsonResponse({ error: 'site-content.json failed validation.' }, { status: 400 })
  }

  const current = await loadGitHubSiteContent(env, session.accessToken, branch)
  if (current.sha !== body.sha) {
    return jsonResponse(
      {
        error: 'Content changed since you opened it. Reload before saving again.',
        currentSha: current.sha,
        latestCommitSha: current.latestCommitSha,
      },
      { status: 409 },
    )
  }

  const updatePayload: GitHubUpdateContentRequest = {
    branch,
    content: toBase64(`${JSON.stringify(body.content, null, 2)}\n`),
    message: sanitizeCommitMessage(body.commitMessage, DEFAULT_SITE_CONTENT_COMMIT_MESSAGE),
    sha: current.sha,
  }

  const updateResponse = await fetchGitHubJson<GitHubUpdateContentResponse>(
    `${getRepoBase(env)}/contents/${SITE_CONTENT_PATH}`,
    {
      method: 'PUT',
      headers: {
        ...getGitHubHeaders(session.accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    },
  )

  return jsonResponse({
    branch,
    content: body.content,
    latestCommitSha: updateResponse.commit?.sha ?? null,
    path: updateResponse.content?.path ?? SITE_CONTENT_PATH,
    repo: getAdminRepoInfo(env, branch),
    sha: updateResponse.content?.sha ?? current.sha,
  })
}

const handleAdminBlogList = async ({ request, env }: PagesContext): Promise<Response> => {
  const envCheck = getRequiredEnv(env, ['ADMIN_SESSION_SECRET', 'GITHUB_OWNER', 'GITHUB_REPO'])
  if (envCheck instanceof Response) return envCheck

  const session = await readSession(request, env)
  if (!session) return jsonResponse({ error: 'Admin session required.' }, { status: 401 })

  const branch = resolveRequestedBranch(request, env)
  if (branch instanceof Response) return branch

  return jsonResponse({
    branch,
    posts: await loadGitHubBlogPostList(env, session.accessToken, branch),
    repo: getAdminRepoInfo(env, branch),
  })
}

const handleAdminBlogDetail = async (context: PagesContext, slug: string): Promise<Response> => {
  const { request, env } = context
  const envCheck = getRequiredEnv(env, ['ADMIN_SESSION_SECRET', 'GITHUB_OWNER', 'GITHUB_REPO'])
  if (envCheck instanceof Response) return envCheck

  const session = await readSession(request, env)
  if (!session) return jsonResponse({ error: 'Admin session required.' }, { status: 401 })

  const branch = resolveRequestedBranch(request, env)
  if (branch instanceof Response) return branch

  const post = await loadGitHubBlogPostBySlug(env, session.accessToken, branch, slug)
  if (!post) {
    return jsonResponse({ error: 'Blog post not found.' }, { status: 404 })
  }

  return jsonResponse({ branch, post, repo: getAdminRepoInfo(env, branch) })
}

const handleAdminMediaUpload = async ({ request, env }: PagesContext): Promise<Response> => {
  const sameOriginError = requireSameOrigin(request)
  if (sameOriginError) return sameOriginError

  const envCheck = getRequiredEnv(env, ['ADMIN_SESSION_SECRET', 'GITHUB_OWNER', 'GITHUB_REPO'])
  if (envCheck instanceof Response) return envCheck

  const session = await readSession(request, env)
  if (!session) return jsonResponse({ error: 'Admin session required.' }, { status: 401 })

  const formData = await request.formData()
  const area = `${formData.get('area') ?? ''}`
  const slug = sanitizePathSegment(`${formData.get('slug') ?? ''}`)
  const file = formData.get('file')

  if (!area || !isAllowedMediaArea(area)) {
    return jsonResponse({ error: 'Media area must be one of: about, blog, contact, home, projects, resume.' }, { status: 400 })
  }

  if (!slug) {
    return jsonResponse({ error: 'Media slug is required.' }, { status: 400 })
  }

  if (!(file instanceof File)) {
    return jsonResponse({ error: 'A media file is required.' }, { status: 400 })
  }

  if (!isAllowedMediaType(file.type)) {
    return jsonResponse({ error: 'Unsupported media type. Use png, jpg, webp, gif, or svg.' }, { status: 400 })
  }

  if (file.size > MAX_MEDIA_FILE_BYTES) {
    return jsonResponse({ error: 'Media file is too large. Maximum size is 5 MB.' }, { status: 413 })
  }

  const branch = getAllowedCmsBranch(env)
  const filename = resolveMediaFilename(file.name, file.type)
  const repoPath = `public/images/${area}/${slug}/${filename}`
  const existing = await readGitHubFileIfExists(env, session.accessToken, branch, repoPath)
  const content = toBase64FromBytes(new Uint8Array(await file.arrayBuffer()))

  const updatePayload: GitHubUpdateContentRequest = {
    branch,
    content,
    message: `${DEFAULT_MEDIA_COMMIT_MESSAGE}: ${area}/${slug}/${filename}`.slice(0, 120),
    ...(existing ? { sha: existing.sha } : {}),
  }

  const updateResponse = await fetchGitHubJson<GitHubUpdateContentResponse>(
    `${getRepoBase(env)}/contents/${repoPath}`,
    {
      method: 'PUT',
      headers: {
        ...getGitHubHeaders(session.accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    },
  )

  const response: MediaUploadResponse = {
    branch,
    latestCommitSha: updateResponse.commit?.sha ?? null,
    path: `/${repoPath.replace(/^public\//, '')}`,
    repo: getAdminRepoInfo(env, branch),
    sha: updateResponse.content?.sha ?? existing?.sha ?? '',
  }

  return jsonResponse(response)
}

const handleAdminBlogUpdate = async (context: PagesContext, slug: string): Promise<Response> => {
  const { request, env } = context
  const sameOriginError = requireSameOrigin(request)
  if (sameOriginError) return sameOriginError

  const envCheck = getRequiredEnv(env, ['ADMIN_SESSION_SECRET', 'GITHUB_OWNER', 'GITHUB_REPO'])
  if (envCheck instanceof Response) return envCheck

  const session = await readSession(request, env)
  if (!session) return jsonResponse({ error: 'Admin session required.' }, { status: 401 })

  const body = await readJsonBody<BlogPostWriteRequest>(request)
  if (body instanceof Response) return body

  const branch = getAllowedCmsBranch(env)
  if (body.branch !== undefined && body.branch !== branch) {
    return jsonResponse({ error: `Only the ${branch} branch is allowed for admin CMS writes.` }, { status: 403 })
  }
  if (!validateBlogPost(body.post)) {
    return jsonResponse({ error: 'Blog post payload failed validation.' }, { status: 400 })
  }
  if (body.post.slug !== slug) {
    return jsonResponse({ error: 'Slug renames are not supported yet.' }, { status: 400 })
  }

  const existingPost = await loadGitHubBlogPostBySlug(env, session.accessToken, branch, slug)
  if (existingPost && typeof body.sha !== 'string') {
    return jsonResponse({ error: 'A base file SHA is required before updating an existing blog post.' }, { status: 400 })
  }
  if (existingPost && body.sha !== existingPost.sha) {
    return jsonResponse(
      {
        error: 'Blog post changed since you opened it. Reload before saving again.',
        currentSha: existingPost.sha,
      },
      { status: 409 },
    )
  }

  const targetPath = existingPost?.path ?? `${BLOG_CONTENT_DIR}/${body.post.date}-${body.post.slug}.md`
  const updatePayload: GitHubUpdateContentRequest = {
    branch,
    content: toBase64(serializeBlogPost(body.post)),
    message: sanitizeCommitMessage(body.commitMessage, DEFAULT_BLOG_COMMIT_MESSAGE),
    ...(existingPost ? { sha: existingPost.sha } : {}),
  }

  const updateResponse = await fetchGitHubJson<GitHubUpdateContentResponse>(
    `${getRepoBase(env)}/contents/${targetPath}`,
    {
      method: 'PUT',
      headers: {
        ...getGitHubHeaders(session.accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    },
  )

  return jsonResponse({
    branch,
    post: {
      ...body.post,
      path: updateResponse.content?.path ?? targetPath,
      sha: updateResponse.content?.sha ?? existingPost?.sha ?? '',
    },
    latestCommitSha: updateResponse.commit?.sha ?? null,
    repo: getAdminRepoInfo(env, branch),
  })
}

const handleAdminBlogDelete = async (context: PagesContext, slug: string): Promise<Response> => {
  const { request, env } = context
  const sameOriginError = requireSameOrigin(request)
  if (sameOriginError) return sameOriginError

  const envCheck = getRequiredEnv(env, ['ADMIN_SESSION_SECRET', 'GITHUB_OWNER', 'GITHUB_REPO'])
  if (envCheck instanceof Response) return envCheck

  const session = await readSession(request, env)
  if (!session) return jsonResponse({ error: 'Admin session required.' }, { status: 401 })

  const body = await readJsonBody<BlogPostDeleteRequest>(request)
  if (body instanceof Response) return body

  const branch = getAllowedCmsBranch(env)
  if (body.branch !== undefined && body.branch !== branch) {
    return jsonResponse({ error: `Only the ${branch} branch is allowed for admin CMS writes.` }, { status: 403 })
  }

  const existingPost = await loadGitHubBlogPostBySlug(env, session.accessToken, branch, slug)
  if (!existingPost) {
    return jsonResponse({ error: 'Blog post not found.' }, { status: 404 })
  }

  if (typeof body.sha !== 'string' || !body.sha.trim()) {
    return jsonResponse({ error: 'A base file SHA is required before deleting a blog post.' }, { status: 400 })
  }

  if (body.sha !== existingPost.sha) {
    return jsonResponse(
      {
        error: 'Blog post changed since you opened it. Reload before deleting.',
        currentSha: existingPost.sha,
      },
      { status: 409 },
    )
  }

  const deletePayload: GitHubDeleteContentRequest = {
    branch,
    message: sanitizeCommitMessage(body.commitMessage, DEFAULT_BLOG_DELETE_COMMIT_MESSAGE),
    sha: existingPost.sha,
  }

  const updateResponse = await fetchGitHubJson<GitHubUpdateContentResponse>(
    `${getRepoBase(env)}/contents/${existingPost.path}`,
    {
      method: 'DELETE',
      headers: {
        ...getGitHubHeaders(session.accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deletePayload),
    },
  )

  return jsonResponse({
    branch,
    latestCommitSha: updateResponse.commit?.sha ?? null,
    path: existingPost.path,
    repo: getAdminRepoInfo(env, branch),
  })
}

const handleAdminRequest = async (context: PagesContext, pathname: string): Promise<Response | null> => {
  const adminPath = pathname.slice(ADMIN_PREFIX.length)

  if (adminPath === '/auth/start' && context.request.method === 'GET') return handleAdminAuthStart(context)
  if (adminPath === '/auth/callback' && context.request.method === 'GET') return handleAdminAuthCallback(context)
  if (adminPath === '/auth/me' && context.request.method === 'GET') return handleAdminAuthMe(context)
  if (adminPath === '/auth/logout' && context.request.method === 'POST') return handleAdminAuthLogout(context)
  if (adminPath === '/content/site' && context.request.method === 'GET') return handleAdminContentSite(context)
  if (adminPath === '/content/site' && context.request.method === 'PUT') return handleAdminContentSiteUpdate(context)
  if (adminPath === '/media' && context.request.method === 'POST') return handleAdminMediaUpload(context)
  if (adminPath === '/blog' && context.request.method === 'GET') return handleAdminBlogList(context)

  const blogDetailMatch = adminPath.match(/^\/blog\/([a-z0-9-]+)$/)
  if (blogDetailMatch && context.request.method === 'GET') return handleAdminBlogDetail(context, blogDetailMatch[1])
  if (blogDetailMatch && context.request.method === 'PUT') return handleAdminBlogUpdate(context, blogDetailMatch[1])
  if (blogDetailMatch && context.request.method === 'DELETE') return handleAdminBlogDelete(context, blogDetailMatch[1])

  if (adminPath.startsWith('/')) {
    return jsonResponse({ error: 'Admin endpoint not implemented yet.' }, { status: 501 })
  }

  return null
}

export const onRequest = async (context: PagesContext): Promise<Response> => {
  const { request, env } = context
  const accept = request.headers.get('accept') ?? ''
  const url = new URL(request.url)

  if (url.pathname.startsWith(ADMIN_PREFIX)) {
    const response = await handleAdminRequest(context, url.pathname)
    if (response) return response
  }

  if ((request.method === 'GET' || request.method === 'HEAD') && accept.includes('text/markdown')) {
    const markdownPath = toMarkdownPath(url.pathname)

    if (markdownPath) {
      const markdownUrl = new URL(markdownPath, url)
      const assetResponse = await env.ASSETS.fetch(new Request(markdownUrl, request))

      if (assetResponse.ok) {
        const headers = new Headers(assetResponse.headers)
        headers.set('content-type', 'text/markdown; charset=utf-8')
        headers.set('vary', 'Accept')
        return new Response(request.method === 'HEAD' ? null : await assetResponse.text(), {
          status: assetResponse.status,
          statusText: assetResponse.statusText,
          headers,
        })
      }
    }
  }

  const response = await env.ASSETS.fetch(request)
  const headers = new Headers(response.headers)
  headers.append('Link', '</llms.txt>; rel="alternate"; type="text/markdown"')
  headers.append('Link', '</.well-known/agent-skills/index.json>; rel="agent-skills"')
  headers.set('Vary', 'Accept')
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}
