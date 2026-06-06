'use client'

import React, { useRef, useEffect } from 'react'
import Link from 'next/link'
import { gsap, createTimeline } from '@/lib/gsap'

export function HowToPlaySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const videoWrapperRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      const tl = createTimeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        }
      })

      if (titleRef.current) {
        tl.fromTo(
          titleRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out'
          }
        )
      }

      if (textRef.current) {
        tl.fromTo(
          textRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out'
          },
          '-=0.4'
        )
      }

      if (videoWrapperRef.current) {
        tl.fromTo(
          videoWrapperRef.current,
          { opacity: 0, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: 'back.out(1.2)'
          },
          '-=0.4'
        )
      }

      if (ctaRef.current) {
        tl.fromTo(
          ctaRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out'
          },
          '-=0.3'
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
      className="relative w-full py-16 md:py-24 bg-black overflow-hidden border-t border-[#d1a058]/20"
      style={{
        background: 'radial-gradient(circle at center, rgba(20, 20, 20, 0.8) 0%, rgba(0, 0, 0, 1) 100%)'
      }}
    >
      {/* Background glowing ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#d1a058]/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <div className="container mx-auto px-4 text-center relative z-10">
        <h2
          ref={titleRef}
          className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-widest mb-6 opacity-0"
          style={{
            fontFamily: "'TheWalkyrDemo', serif",
            color: '#d1a058',
            textShadow: '2px 2px 8px rgba(0, 0, 0, 0.9), 0 0 30px rgba(209, 160, 88, 0.35)',
          }}
        >
          HOW TO PLAY
        </h2>

        <p 
          ref={textRef}
          className="text-white/70 max-w-xl mx-auto mb-12 text-sm sm:text-base leading-relaxed opacity-0" 
          style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
        >
          Watch our official video tutorial and learn how to master the elements, strategically deploy special cards, and become the Zampion.
        </p>

        {/* Video Wrapper */}
        <div 
          ref={videoWrapperRef}
          className="w-full max-w-4xl mx-auto opacity-0 mb-12 rounded-2xl p-2 bg-black border-2 border-[#d1a058]/40"
          style={{
            boxShadow: '0 0 30px rgba(0, 0, 0, 0.9), 0 0 20px rgba(209, 160, 88, 0.12)'
          }}
        >
          <div className="relative aspect-video w-full rounded-xl overflow-hidden">
            <iframe
              className="absolute top-0 left-0 w-full h-full border-0"
              src="https://www.youtube.com/embed/nxtyDh9SD-Q"
              title="How to Play Zambaara"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>

        {/* Call to action button */}
        <div ref={ctaRef} className="opacity-0 flex justify-center">
          <Link
            href="/how-to-play"
            className="px-10 py-4 font-semibold rounded-lg transition-all uppercase tracking-widest border-2 border-[#d1a058] text-[#d1a058] shadow-lg"
            style={{
              fontFamily: "'BlinkerSemiBold', sans-serif",
              background: 'rgba(209, 160, 88, 0.03)',
              boxShadow: '0 4px 15px rgba(209, 160, 88, 0.1)',
              letterSpacing: '2px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.background = 'rgba(209, 160, 88, 0.12)'
              e.currentTarget.style.boxShadow = '0 6px 25px rgba(209, 160, 88, 0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.background = 'rgba(209, 160, 88, 0.03)'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(209, 160, 88, 0.1)'
            }}
          >
            Read Full Rules & Rulebook
          </Link>
        </div>
      </div>
    </section>
  )
}
