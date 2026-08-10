import type { ReactNode } from 'react'
import sty from './InternalHero.module.scss'

type InternalHeroProps = {
  eyebrow?: string
  title: string
  intro: string
  media?: {
    src: string
    alt: string
    caption?: string
  }
  actions?: ReactNode
}

export function InternalHero({ eyebrow, title, intro, media, actions }: InternalHeroProps) {
  return (
    <section className={sty.root} data-text-reveal-group="entry">
      <div className="lg-wrapper">
        <div className={sty.inner}>
          <div className={sty.copy}>
            {eyebrow ? <p className="eyebrow" data-text-reveal="copy">{eyebrow}</p> : null}
            <h1 data-text-reveal="heading">{title}</h1>
            <p className={sty.intro} data-text-reveal="copy">{intro}</p>
            {actions ? <div className={sty.actions}>{actions}</div> : null}
          </div>

          {media ? (
            <figure className={sty.media}>
              <img src={media.src} alt={media.alt} />
              {media.caption ? <figcaption>{media.caption}</figcaption> : null}
            </figure>
          ) : null}
        </div>
      </div>
    </section>
  )
}
