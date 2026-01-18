'use client'

import { useEffect, useRef } from 'react'
import { gsap, createTimeline, ScrollTrigger } from '@/lib/gsap'

export function BattlePackSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      const tl = createTimeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
      })

      if (textRef.current) {
        tl.fromTo(
          textRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out',
          }
        )
      }
    }, sectionRef)

    return () => {
      ctx.revert()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-8 md:py-12 bg-black overflow-hidden"
    >
      <div className="container mx-auto px-4 text-center">
        <h2
          ref={textRef}
          className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase opacity-0"
          style={{
            fontFamily: "'TheWalkyrDemo', serif",
            color: '#d1a058',
            textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(209, 160, 88, 0.2)',
          }}
        >
          BATTLE PACK
        </h2>
      </div>
    </section>
  )
}
