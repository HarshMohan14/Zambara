'use client'

/**
 * Example component demonstrating GSAP Timeline usage
 * This shows how to create complex animation sequences with timelines
 */
import { useEffect, useRef } from 'react'
import { gsap, createTimeline, ScrollTrigger } from '@/lib/gsap'
import { StaggerChildren } from '@/components/animations/StaggerChildren'

export function TimelineExample() {
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Create a master timeline with ScrollTrigger
    const masterTl = createTimeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    })

    // Sequence 1: Title animation
    masterTl.fromTo(
      titleRef.current,
      { opacity: 0, y: -50, scale: 0.8 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        duration: 0.8, 
        ease: 'back.out(1.7)' 
      }
    )

    // Sequence 2: Subtitle animation (starts before title finishes)
    masterTl.fromTo(
      subtitleRef.current,
      { opacity: 0, x: -30 },
      { 
        opacity: 1, 
        x: 0, 
        duration: 0.6, 
        ease: 'power2.out' 
      },
      '-=0.4' // Start 0.4 seconds before previous animation ends
    )

    // Sequence 3: Button animation
    masterTl.fromTo(
      buttonRef.current,
      { opacity: 0, scale: 0.5 },
      { 
        opacity: 1, 
        scale: 1, 
        duration: 0.5, 
        ease: 'elastic.out(1, 0.3)' 
      },
      '-=0.2'
    )

    return () => {
      masterTl.kill()
    }
  }, [])

  return (
    <div ref={containerRef} className="container mx-auto px-4 py-16">
      <h2 ref={titleRef} className="text-4xl font-bold mb-4">
        Timeline Example
      </h2>
      <p ref={subtitleRef} className="text-xl text-gray-600 mb-8">
        This demonstrates GSAP Timeline with staggered animations
      </p>
      <button
        ref={buttonRef}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Animated Button
      </button>

      {/* Stagger example */}
      <div className="mt-16">
        <StaggerChildren
          stagger={0.15}
          animation={{ opacity: 0, y: 50, rotation: -5 }}
          className="grid grid-cols-3 gap-4"
        >
          <div className="p-6 bg-gray-100 rounded-lg">Card 1</div>
          <div className="p-6 bg-gray-100 rounded-lg">Card 2</div>
          <div className="p-6 bg-gray-100 rounded-lg">Card 3</div>
        </StaggerChildren>
      </div>
    </div>
  )
}