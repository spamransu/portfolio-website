import type { CSSProperties } from 'react'
import type { IconType } from 'react-icons'
import {
  SiAlpinedotjs, SiBootstrap, SiCloudflare, SiCpanel, SiFigma, SiGithubactions,
  SiGreensock, SiHostinger, SiJson, SiLaravel, SiMarkdown, SiReact,
  SiTailwindcss, SiTypescript, SiVite, SiWordpress,
} from 'react-icons/si'
import { FaCss3Alt, FaCode, FaHtml5, FaJs, FaPhp, FaSass } from 'react-icons/fa'
import sty from './ProjectStack.module.scss'

type ProjectStackProps = { items: string[]; ariaLabel: string; reverseFlow?: boolean }

const iconColors: Record<string, string> = {
  WordPress: '#21759b', Elementor: '#92003b', PHP: '#777bb4', HTML: '#e34f26', CSS: '#1572b6',
  React: '#61dafb', TypeScript: '#3178c6', JavaScript: '#f7df1e', Figma: '#f24e1e',
  'GitHub Actions': '#2088ff', Cloudflare: '#f38020', 'Laravel 12': '#ff2d20', Bootstrap: '#7952b3',
  'Tailwind CSS': '#06b6d4', 'Alpine.js': '#8bc0d0', Markdown: '#ffffff', Vite: '#646cff', GSAP: '#88ce02', SCSS: '#cf649a',
  cPanel: '#ff6c2c', Hostinger: '#673de6',
}

const icons: Record<string, IconType> = {
  WordPress: SiWordpress, Elementor: FaCode, PHP: FaPhp, HTML: FaHtml5, CSS: FaCss3Alt,
  ACF: FaCode, 'Code Snippets': FaCode, cPanel: SiCpanel, Hostinger: SiHostinger, React: SiReact,
  TypeScript: SiTypescript, JavaScript: FaJs, Figma: SiFigma, 'GitHub Actions': SiGithubactions,
  Cloudflare: SiCloudflare, 'Laravel 12': SiLaravel, Blade: FaCode, Bootstrap: SiBootstrap,
  'Tailwind CSS': SiTailwindcss, 'Alpine.js': SiAlpinedotjs, 'Spatie Media Library': FaCode,
  'JSON content': SiJson, Markdown: SiMarkdown, 'Cloudflare Pages': SiCloudflare, Vite: SiVite,
  GSAP: SiGreensock, SCSS: FaSass,
}

export function ProjectStack({ items, ariaLabel, reverseFlow = false }: ProjectStackProps) {
  const orderedItems = reverseFlow ? [...items].reverse() : items
  return (
    <ul className={`${sty.root}`} aria-label={ariaLabel}>
      {orderedItems.map((item) => {
        const Icon = icons[item] ?? FaCode
        return (
          <li key={item} title={item} aria-label={item}>
            <div className={sty.iconBox} style={{ '--icon-color': iconColors[item] ?? 'currentColor' } as CSSProperties}>
              <Icon aria-hidden="true" focusable="false" />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
