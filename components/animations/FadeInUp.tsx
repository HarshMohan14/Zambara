'use client'

import { ReactNode, useRef, useEffect } from 'react'
import { gsap, ScrollTrigger, scrollTriggerDefaults } from '@/lib/gsap'

interface FadeInUpProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function FadeInUp({ 
  children, 
  delay = 0, 
  duration = 0.5,
  className = '' 
}: FadeInUpProps) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        element,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: duration,
          delay: delay,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: scrollTriggerDefaults.start,
            toggleActions: scrollTriggerDefaults.toggleActions,
          },
        }
      )
    })

    return () => {
      ctx.revert()
    }
  }, [delay, duration])

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  )
}