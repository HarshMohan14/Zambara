'use client'

import { ReactNode, useRef, useEffect } from 'react'
import { gsap, createTimeline, ScrollTrigger } from '@/lib/gsap'

interface TimelineAnimationProps {
  children: ReactNode
  className?: string
  timelineConfig?: gsap.TimelineVars
  scrollTrigger?: ScrollTrigger.Vars | false
  onComplete?: () => void
}

/**
 * TimelineAnimation component - A flexible GSAP timeline-based animation wrapper
 * 
 * @example
 * <TimelineAnimation
 *   timelineConfig={{ delay: 0.5 }}
 *   scrollTrigger={{ start: 'top 80%' }}
 * >
 *   <div>Animated content</div>
 * </TimelineAnimation>
 */
export function TimelineAnimation({ 
  children, 
  className = '',
  timelineConfig = {},
  scrollTrigger,
  onComplete
}: TimelineAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<gsap.core.Timeline>()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Create timeline
    const tl = createTimeline({
      ...timelineConfig,
      onComplete,
    })

    timelineRef.current = tl

    // Add ScrollTrigger if provided
    if (scrollTrigger !== false) {
      tl.scrollTrigger = {
        trigger: container,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
        ...scrollTrigger,
      }
    }

    // Animate the container
    tl.fromTo(
      container,
      { opacity: 0 },
      { 
        opacity: 1, 
        duration: 0.6, 
        ease: 'power2.out' 
      }
    )

    // Animate child elements with stagger
    const children = container.children
    if (children.length > 0) {
      tl.fromTo(
        Array.from(children),
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
        },
        '-=0.3'
      )
    }

    return () => {
      tl.kill()
    }
  }, [timelineConfig, scrollTrigger, onComplete])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}