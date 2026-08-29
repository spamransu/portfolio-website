import { useCallback, useRef } from 'react'
import { gsap, useGSAP } from '../animations/gsap'

type ScrollOpacityTextProps = {
  children: string
  className?: string
  as?: 'h2' | 'p' | 'div' | 'blockquote'
  id?: string
}

export function ScrollOpacityText({ children, className, as: Tag = 'div', id }: ScrollOpacityTextProps) {
  const triggerRef = useRef<HTMLElement>(null)
  const lettersRef = useRef<HTMLSpanElement[]>([])

  const setLettersRef = useCallback((ref: HTMLSpanElement | null) => {
    if (!ref) return

    // Callback refs can run more than once as React reconciles a route. Keep
    // one target per character so the scrub timeline never accumulates stale
    // nodes or duplicates.
    const index = Number(ref.dataset.letterIndex)
    lettersRef.current[index] = ref
  }, [])

  useGSAP(() => {
    const letters = lettersRef.current.filter(Boolean)
    const trigger = triggerRef.current
    if (!trigger || !letters.length) return

    gsap.set(letters, { opacity: 0.3 })
    gsap.to(letters, {
      opacity: 1,
      stagger: { each: 0.035, from: 'start' },
      scrollTrigger: {
        trigger,
        start: 'top 78%',
        end: 'bottom 42%',
        scrub: 0.9,
        invalidateOnRefresh: true,
      },
    })

    requestAnimationFrame(() => ScrollTrigger.refresh())
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
  }, { scope: triggerRef, dependencies: [children], revertOnUpdate: true })

  return (
    <Tag ref={triggerRef as never} id={id} className={className} aria-label={children}>
      {Array.from(children).map((letter, index) => (
        <span
          key={`${letter}-${index}`}
          ref={setLettersRef}
          data-letter-index={index}
          aria-hidden="true"
        >
          {letter}
        </span>
      ))}
    </Tag>
  )
}
