import { useRef } from 'react'
import { gsap, ScrollTrigger, SplitText, useGSAP } from './gsap'

type TextRevealGroup = HTMLElement & {
  dataset: DOMStringMap & {
    textRevealGroup?: 'entry' | 'scrub'
  }
}

const textRevealSelector = '[data-text-reveal="heading"], [data-text-reveal="copy"]'
let refreshFrame: number | undefined

function scheduleScrollTriggerRefresh() {
  if (refreshFrame !== undefined) return

  refreshFrame = requestAnimationFrame(() => {
    refreshFrame = undefined
    ScrollTrigger.refresh()
  })
}

function createTimeline(
  group: TextRevealGroup,
  words: Element[] | null,
  copyTargets: Element[],
) {
  const isEntry = group.dataset.textRevealGroup === 'entry'
  const timeline = gsap.timeline({
    defaults: { duration: isEntry ? 0.8 : 1, ease: 'power2.out' },
    scrollTrigger: {
      trigger: group,
      start: isEntry ? 'top 90%' : 'clamp(top 90%)',
      end: isEntry ? undefined : 'clamp(top 45%)',
      scrub: isEntry ? false : 0.6,
      toggleActions: isEntry ? 'play none none none' : undefined,
      invalidateOnRefresh: true,
    },
  })

  if (words?.length) {
    timeline.from(words, {
      yPercent: 110,
      autoAlpha: 0,
      stagger: { each: 0.035, from: 'start' },
    }, 0)
  }

  if (copyTargets.length) {
    timeline.from(copyTargets, {
      y: 24,
      autoAlpha: 0,
      stagger: { each: 0.08, from: 'start' },
    }, words?.length ? '<0.12' : 0)
  }

  return timeline
}

function setupTextGroup(group: TextRevealGroup) {
  const targets = Array.from(group.querySelectorAll<HTMLElement>(textRevealSelector))
  const heading = targets.find((target) => target.dataset.textReveal === 'heading')
  const copyTargets = targets.filter((target) => target.dataset.textReveal === 'copy')

  if (!heading && !copyTargets.length) return

  if (!heading) {
    createTimeline(group, null, copyTargets)
    return
  }

  SplitText.create(heading, {
    type: 'lines,words',
    mask: 'lines',
    aria: 'auto',
    autoSplit: true,
    linesClass: 'text-reveal-line',
    wordsClass: 'text-reveal-word',
    onSplit: (split) => {
      const timeline = createTimeline(group, split.words, copyTargets)
      scheduleScrollTriggerRefresh()
      return timeline
    },
  })
}

export function useScrollTextAnimations(routeKey: string) {
  const scope = useRef<HTMLElement>(null)

  useGSAP(() => {
    const root = scope.current
    if (!root) return

    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const groups = Array.from(root.querySelectorAll<TextRevealGroup>('[data-text-reveal-group]'))
      groups.forEach(setupTextGroup)
    })

    return () => media.revert()
  }, {
    scope,
    dependencies: [routeKey],
    revertOnUpdate: true,
  })

  return scope
}
