import { useRef, useState, type RefObject } from 'react'
import { gsap, useGSAP } from './gsap'

export type Direction = -1 | 1
/** Alias retained for call sites that describe the value as a navigation direction. */
export type SwapDirection = Direction

type ElementRef = RefObject<HTMLElement | null>

export interface DirectionalContentSwapOptions {
  /** The element that scopes this hook's GSAP context. */
  scope: ElementRef
  /** The copy element to move during a swap. */
  copy?: ElementRef
  /** Alias for `copy`, useful when matching component ref naming. */
  copyRef?: ElementRef
  /** The media element to move during a swap. */
  media?: ElementRef
  /** Alias for `media`, useful when matching component ref naming. */
  mediaRef?: ElementRef
}

export interface DirectionalContentSwap {
  /**
   * Animate out the current content, commit the next state, and animate it in.
   * Calls made while a swap is in progress are ignored and resolve immediately.
   */
  swap: (direction: Direction, commit: () => void) => Promise<void>
  isAnimating: boolean
}

const EXIT_DURATION = 0.18
const ENTER_DURATION = 0.28
const COPY_OFFSET = 24
const MEDIA_OFFSET = 32

function isElement(value: HTMLElement | null): value is HTMLElement {
  return value !== null
}

/**
 * Reusable directional content transition for a copy/media pair.
 *
 * `commit` is called after the outgoing content has finished its exit. The
 * incoming transition is scheduled on the next animation frame so React has
 * applied the committed content before GSAP reads the new DOM state.
 */
export function useDirectionalContentSwap({
  scope,
  copy,
  copyRef,
  media,
  mediaRef,
}: DirectionalContentSwapOptions): DirectionalContentSwap {
  const copyTargetRef = copy ?? copyRef
  const mediaTargetRef = media ?? mediaRef
  const [isAnimating, setIsAnimating] = useState(false)
  const animatingRef = useRef(false)
  const reducedMotionRef = useRef(false)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const pendingResolveRef = useRef<(() => void) | null>(null)

  const { contextSafe } = useGSAP(() => {
    const matchMedia = gsap.matchMedia()

    matchMedia.add(
      { reduceMotion: '(prefers-reduced-motion: reduce)' },
      (context) => {
        reducedMotionRef.current = Boolean(context.conditions?.reduceMotion)

        return () => {
          reducedMotionRef.current = false
        }
      },
    )

    return () => {
      matchMedia.revert()
      timelineRef.current?.kill()
      timelineRef.current = null
      animatingRef.current = false
      setIsAnimating(false)
      pendingResolveRef.current?.()
      pendingResolveRef.current = null
    }
  }, { scope })

  const swap = contextSafe((direction: Direction, commit: () => void) => {
    if (animatingRef.current) return Promise.resolve()

    const normalizedDirection: Direction = direction === -1 ? -1 : 1
    const copyTarget = copyTargetRef?.current ?? null
    const mediaTarget = mediaTargetRef?.current ?? null
    const scopeTarget = scope.current

    if (
      reducedMotionRef.current
      || !scopeTarget
      || (!copyTarget && !mediaTarget)
    ) {
      commit()
      return Promise.resolve()
    }

    animatingRef.current = true
    setIsAnimating(true)

    return new Promise<void>((resolve) => {
      pendingResolveRef.current = resolve

      const finish = contextSafe(() => {
        timelineRef.current = null
        animatingRef.current = false
        setIsAnimating(false)
        pendingResolveRef.current = null
        resolve()
      })

      const enter = contextSafe(() => {
        const nextCopy = copyTargetRef?.current ?? null
        const nextMedia = mediaTargetRef?.current ?? null
        const copyTargets = [nextCopy].filter(isElement)
        const mediaTargets = [nextMedia].filter(isElement)

        if (!copyTargets.length && !mediaTargets.length) {
          finish()
          return
        }

        const incomingCopyX = normalizedDirection * COPY_OFFSET
        const incomingMediaX = normalizedDirection * MEDIA_OFFSET
        const entrance = gsap.timeline({
          defaults: { ease: 'power2.out' },
          onComplete: finish,
        })

        if (copyTargets.length) {
          entrance.fromTo(copyTargets, {
            x: incomingCopyX,
            autoAlpha: 0,
          }, {
            x: 0,
            autoAlpha: 1,
            duration: ENTER_DURATION,
            clearProps: 'transform,visibility,opacity',
          }, 0)
        }

        if (mediaTargets.length) {
          entrance.fromTo(mediaTargets, {
            x: incomingMediaX,
            scale: 0.985,
            autoAlpha: 0,
          }, {
            x: 0,
            scale: 1,
            autoAlpha: 1,
            duration: ENTER_DURATION,
            clearProps: 'transform,visibility,opacity',
          }, 0)
        }

        timelineRef.current = entrance
      })

      const exit = gsap.timeline({
        defaults: { ease: 'power2.in' },
        onComplete: contextSafe(() => {
          timelineRef.current = null
          commit()

          if (!globalThis.window) {
            enter()
            return
          }

          window.requestAnimationFrame(() => enter())
        }),
      })

      if (copyTarget) {
        exit.to(copyTarget, {
          x: normalizedDirection * -COPY_OFFSET,
          autoAlpha: 0,
          duration: EXIT_DURATION,
        }, 0)
      }

      if (mediaTarget) {
        exit.to(mediaTarget, {
          x: normalizedDirection * -MEDIA_OFFSET,
          scale: 0.985,
          autoAlpha: 0,
          duration: EXIT_DURATION,
        }, 0)
      }

      timelineRef.current = exit
    })
  })

  return { swap, isAnimating }
}
