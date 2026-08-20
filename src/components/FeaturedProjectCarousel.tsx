import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { LuArrowLeft, LuArrowRight, LuExternalLink } from 'react-icons/lu'
import { useDirectionalContentSwap, type SwapDirection } from '../animations/useDirectionalContentSwap'
import type { Project } from '../content/siteContent'
import sty from './FeaturedProjectCarousel.module.scss'

type FeaturedProjectCarouselProps = {
  projects: Project[]
  slugs: string[]
  title: string
  stackAriaTemplate?: string
}

const imagePreparation = new Map<string, Promise<void>>()

function prepareImage(src: string) {
  const cached = imagePreparation.get(src)
  if (cached) return cached

  const promise = new Promise<void>((resolve) => {
    const image = new Image()
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      resolve()
    }

    image.onload = () => {
      if ('decode' in image) {
        image.decode().catch(() => undefined).finally(finish)
      } else {
        finish()
      }
    }
    image.onerror = finish
    image.src = src

    if (image.complete) {
      image.decode?.().catch(() => undefined).finally(finish)
    }
  })

  imagePreparation.set(src, promise)
  return promise
}

function getWrappedIndex(index: number, length: number) {
  return (index + length) % length
}

export function FeaturedProjectCarousel({
  projects,
  slugs,
  title,
  stackAriaTemplate,
}: FeaturedProjectCarouselProps) {
  const featuredProjects = useMemo(
    () => slugs.map((slug) => projects.find((project) => project.slug === slug)).filter((project): project is Project => Boolean(project)),
    [projects, slugs],
  )
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPreparing, setIsPreparing] = useState(false)
  const interactionLock = useRef(false)
  const scopeRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const mediaRef = useRef<HTMLElement>(null)
  const { swap, isAnimating } = useDirectionalContentSwap({
    scope: scopeRef,
    copy: copyRef,
    media: mediaRef,
  })

  const activeProject = featuredProjects[activeIndex]
  const totalProjects = featuredProjects.length
  const isBusy = isPreparing || isAnimating

  useEffect(() => {
    if (!totalProjects) return

    const adjacentIndices = [
      getWrappedIndex(activeIndex - 1, totalProjects),
      getWrappedIndex(activeIndex + 1, totalProjects),
    ]

    adjacentIndices.forEach((index) => {
      const src = featuredProjects[index]?.image?.src
      if (src) void prepareImage(src)
    })
  }, [activeIndex, featuredProjects, totalProjects])

  const handleNavigate = useCallback(async (direction: SwapDirection) => {
    if (!activeProject || totalProjects < 2 || interactionLock.current || isBusy) return

    const nextIndex = getWrappedIndex(activeIndex + direction, totalProjects)
    const nextProject = featuredProjects[nextIndex]
    if (!nextProject) return

    interactionLock.current = true
    setIsPreparing(true)
    if (nextProject.image?.src) await prepareImage(nextProject.image.src)
    setIsPreparing(false)

    try {
      await swap(direction, () => setActiveIndex(nextIndex))
    } finally {
      interactionLock.current = false
    }
  }, [activeIndex, activeProject, featuredProjects, isBusy, swap, totalProjects])

  if (!activeProject || !totalProjects) return null

  const previousProject = featuredProjects[getWrappedIndex(activeIndex - 1, totalProjects)]
  const nextProject = featuredProjects[getWrappedIndex(activeIndex + 1, totalProjects)]
  const position = String(activeIndex + 1).padStart(2, '0')
  const total = String(totalProjects).padStart(2, '0')
  const stackLabel = (stackAriaTemplate ?? '{title} tools').replace('{title}', activeProject.title)

  return (
    <div
      className={sty.featuredCarousel}
      data-text-reveal="copy"
      aria-busy={isBusy}
    >
      <div className={sty.featuredHeading}>
        <p className="eyebrow">{title}</p>
        <div className={sty.featuredHeaderActions}>
          <p className={sty.meta}>{position} / {total}</p>
          <nav className={sty.carouselControls} aria-label="Featured project navigation">
            <button
              type="button"
              className={sty.carouselButton}
              aria-label={`Previous project: ${previousProject.title}`}
              aria-disabled={isBusy}
              onClick={() => void handleNavigate(-1)}
            >
              <LuArrowLeft aria-hidden="true" focusable="false" />
            </button>
            <button
              type="button"
              className={sty.carouselButton}
              aria-label={`Next project: ${nextProject.title}`}
              aria-disabled={isBusy}
              onClick={() => void handleNavigate(1)}
            >
              <LuArrowRight aria-hidden="true" focusable="false" />
            </button>
          </nav>
        </div>
      </div>

      <div ref={scopeRef} className={sty.featuredGrid}>
        <div ref={copyRef} className={sty.featuredCopy}>
          <span className={sty.featuredIndex}>{position}</span>
        
            <h2>{activeProject.title}</h2>
            <p>{activeProject.summary}</p>
            <ul className="tag-list" aria-label={stackLabel}>
              {activeProject.stack.map((item) => <li key={item}>{item}</li>)}
            </ul>
          

          <dl className={sty.projectMeta}>
            <div><dt>Client</dt><dd>{activeProject.client}</dd></div>
            <div><dt>Role</dt><dd>{activeProject.role}</dd></div>
            <div><dt>Year</dt><dd>{activeProject.year}</dd></div>
            <div><dt>Discipline</dt><dd>{activeProject.stack[0]}</dd></div>
          </dl>
          
          <div className={sty.featuredLinks}>
            <Link to={`/projects/${activeProject.slug}`}>
              Read the case study
              <LuExternalLink aria-hidden="true" focusable="false" />
            </Link>
            <Link to="/projects">
              All projects
              <LuArrowRight aria-hidden="true" focusable="false" />
            </Link>
          </div>
        </div>

        <figure ref={mediaRef} className={sty.featuredMedia}>
          {activeProject.image ? <img src={activeProject.image.src} alt={activeProject.image.alt} /> : null}
          <figcaption>Fig. {position} — {activeProject.title}, {activeProject.year}</figcaption>
        </figure>
      </div>

      <p className={sty.visuallyHidden} aria-live="polite">
        Project {activeIndex + 1} of {totalProjects}: {activeProject.title}
      </p>
    </div>
  )
}
