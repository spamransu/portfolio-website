import type { IconType } from 'react-icons'
import { FaLinkedinIn } from 'react-icons/fa6'
import { LuLink } from 'react-icons/lu'
import { SiFigma, SiGithub, SiLinktree, SiX } from 'react-icons/si'

type BrandIconProps = {
  label: string
  className?: string
}

const brandIcons: Record<string, IconType> = {
  figma: SiFigma,
  github: SiGithub,
  linkedin: FaLinkedinIn,
  linktree: SiLinktree,
  x: SiX,
}

export function BrandIcon({ className, label }: BrandIconProps) {
  const Icon = brandIcons[label.trim().toLowerCase()] ?? LuLink

  return <Icon aria-hidden="true" className={className} focusable="false" />
}
