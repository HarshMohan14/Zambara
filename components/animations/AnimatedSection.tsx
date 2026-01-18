'use client'

import { ReactNode, useRef, useEffect } from 'react'
import { gsap, ScrollTrigger, scrollTriggerDefaults } from '@/lib/gsap'

interface AnimatedSectionProps {
  children: ReactNode
  delay?: number
  className?: string
  animation?: gsap.TweenVars
}

export function AnimatedSection({ 
  children, 
  delay = 0,
  className = '',
  animation = { opacity: 0, y: 20 }
}: AnimatedSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        section,
        animation,
        {
          ...animation,
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: animation.duration || 0.6,
          delay: delay,
          ease: animation.ease || 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: scrollTriggerDefaults.start,
            toggleActions: scrollTriggerDefaults.toggleActions,
          },
        }
      )
    })

    return () => {
      ctx.revert()
    }
  }, [delay, animation])

  return (
    <section ref={sectionRef} className={className}>
      {children}
    </section>
  )
}