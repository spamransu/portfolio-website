export type ParsedBlogBlock =
  | { type: 'list'; items: string[] }
  | { type: 'section'; heading: string; paragraphs: string[] }
  | { type: 'paragraphs'; paragraphs: string[] }

export function parseBlogMarkdownBlocks(body: string): ParsedBlogBlock[] {
  return body
    .split(/\n\s*\n/)
    .map((block) => {
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
    .filter((block): block is ParsedBlogBlock => block !== null)
}
