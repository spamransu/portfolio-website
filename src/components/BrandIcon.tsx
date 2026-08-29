import type { IconType } from 'react-icons'
import { FaLinkedinIn } from 'react-icons/fa6'
import { LuLink } from 'react-icons/lu'
import { SiFigma, SiGithub, SiLinktree, SiX } from 'react-icons/si'

type BrandIconProps = {
  label: string
  className?: string
}

const brandIcons = {
  figma: SiFigma,
  github: SiGithub,
  linkedin: FaLinkedinIn,
  linktree: SiLinktree,
  x: SiX,
} satisfies Record<string, IconType>

export function BrandIcon({ className, label }: BrandIconProps) {
  const normalizedLabel = label.trim().toLowerCase()
  const Icon = Object.entries(brandIcons).find(([key]) => key === normalizedLabel)?.[1] ?? LuLink

  return <Icon aria-hidden="true" className={className} focusable="false" />
}
