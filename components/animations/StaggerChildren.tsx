'use client'

import { ReactNode, useRef, useEffect } from 'react'
import { gsap, createTimeline, ScrollTrigger, scrollTriggerDefaults } from '@/lib/gsap'

interface StaggerChildrenProps {
  children: ReactNode
  className?: string
  stagger?: number | gsap.StaggerVars
  animation?: gsap.TweenVars
  timelineConfig?: gsap.TimelineVars
  scrollTrigger?: ScrollTrigger.Vars | false
}

/**
 * StaggerChildren component - Animates children with stagger effect using GSAP timeline
 * 
 * @example
 * <StaggerChildren stagger={0.1} animation={{ x: 50, opacity: 0 }}>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </StaggerChildren>
 */
export function StaggerChildren({
  children,
  className = '',
  stagger = 0.1,
  animation = { opacity: 0, y: 30 },
  timelineConfig = {},
  scrollTrigger,
}: StaggerChildrenProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const children = Array.from(container.children) as HTMLElement[]
    if (children.length === 0) return

    // Merge scrollTrigger into timeline config if provided
    const finalTimelineConfig = {
      ...timelineConfig,
      ...(scrollTrigger !== false && {
        scrollTrigger: {
          trigger: container,
          start: scrollTriggerDefaults.start,
          toggleActions: scrollTriggerDefaults.toggleActions,
          ...scrollTrigger,
        },
      }),
    }

    const tl = createTimeline(finalTimelineConfig)

    // Animate children with stagger
    tl.fromTo(
      children,
      animation,
      {
        ...animation,
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration: animation.duration || 0.6,
        ease: animation.ease || 'power2.out',
        stagger: typeof stagger === 'number' 
          ? stagger 
          : { amount: 0.3, ...stagger },
      }
    )

    return () => {
      tl.kill()
    }
  }, [stagger, animation, timelineConfig, scrollTrigger])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}