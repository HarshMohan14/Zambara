import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, scrollTriggerDefaults } from '@/lib/gsap'

interface UseScrollAnimationOptions {
  animation: gsap.TweenVars
  trigger?: string | Element
  start?: string
  end?: string
  toggleActions?: string
  once?: boolean
  markers?: boolean
}

export function useScrollAnimation(
  options: UseScrollAnimationOptions
) {
  const elementRef = useRef<HTMLElement>(null)
  const { animation, once = true, ...scrollOptions } = options

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const scrollConfig = {
      trigger: element,
      start: scrollOptions.start || scrollTriggerDefaults.start,
      end: scrollOptions.end || scrollTriggerDefaults.end,
      toggleActions: scrollOptions.toggleActions || (once ? 'play none none none' : scrollTriggerDefaults.toggleActions),
      markers: scrollOptions.markers || false,
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        element,
        animation,
        {
          ...animation,
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: animation.duration || 0.6,
          ease: animation.ease || 'power2.out',
          scrollTrigger: scrollConfig,
        }
      )
    })

    return () => {
      ctx.revert()
    }
  }, [animation, once, scrollOptions])

  return elementRef
}