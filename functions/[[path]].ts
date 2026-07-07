interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>
  }
}

type PagesContext = {
  request: Request
  env: Env
}

const toMarkdownPath = (pathname: string): string | null => {
  if (pathname === '/') return '/index.md'
  if (pathname.endsWith('.md')) return pathname
  if (pathname === '/about') return '/about.md'
  if (pathname === '/projects') return '/projects.md'
  if (pathname === '/contact') return '/contact.md'
  if (pathname === '/resume') return '/resume.md'
  if (pathname.startsWith('/projects/')) return `${pathname}.md`
  return null
}

export const onRequest = async ({ request, env }: PagesContext): Promise<Response> => {
  const accept = request.headers.get('accept') ?? ''
  const url = new URL(request.url)

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
