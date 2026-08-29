export type ParsedBlogBlock =
  | { type: 'list'; items: string[] }
  | { type: 'section'; heading: string; paragraphs: string[] }
  | { type: 'paragraphs'; paragraphs: string[] }
  | { type: 'code'; language?: string; code: string }

export function parseBlogMarkdownBlocks(body: string): ParsedBlogBlock[] {
  const blocks: ParsedBlogBlock[] = []
  const lines = body.replace(/\r\n/g, '\n').split('\n')
  let proseLines: string[] = []
  let codeLines: string[] = []
  let codeLanguage: string | undefined
  let inCode = false

  const flushProse = () => {
    const prose = proseLines.join('\n').trim()
    proseLines = []
    if (!prose) return
    const parsed: Array<ParsedBlogBlock | null> = prose.split(/\n\s*\n/).map((block) => {
      const lines = block
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)

      if (!lines.length) return null

      if (lines.every((line) => line.startsWith('- '))) {
        return {
          type: 'list',
          items: lines.map((line) => line.slice(2)),
        } satisfies ParsedBlogBlock
      }

      if (lines[0].startsWith('## ')) {
        return {
          type: 'section',
          heading: lines[0].slice(3),
          paragraphs: lines.slice(1),
        } satisfies ParsedBlogBlock
      }

      return {
        type: 'paragraphs',
        paragraphs: lines,
      } satisfies ParsedBlogBlock
    })
    blocks.push(...parsed.filter((block): block is ParsedBlogBlock => block !== null))
  }

  lines.forEach((line) => {
    const fence = line.match(/^```\s*([\w+-]*)\s*$/)
    if (fence && !inCode) {
      flushProse()
      codeLanguage = fence[1] || undefined
      codeLines = []
      inCode = true
      return
    }
    if (line.trim() === '```' && inCode) {
      blocks.push({ type: 'code', language: codeLanguage, code: codeLines.join('\n').replace(/\n$/, '') })
      codeLines = []
      codeLanguage = undefined
      inCode = false
      return
    }
    if (codeLanguage !== undefined) codeLines.push(line)
    else proseLines.push(line)
  })

  if (inCode) proseLines.push('```' + (codeLanguage ? codeLanguage : ''), ...codeLines)
  flushProse()
  return blocks
}
