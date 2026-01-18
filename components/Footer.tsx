'use client'

import { useEffect, useRef } from 'react'
import { gsap, createTimeline, ScrollTrigger } from '@/lib/gsap'

export function Footer() {
  const footerRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!footerRef.current) return

    const ctx = gsap.context(() => {
      const tl = createTimeline({
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 90%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
      })

      // Animate text
      if (textRef.current) {
        const lines = textRef.current.children
        tl.fromTo(
          Array.from(lines),
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            stagger: 0.2,
          }
        )
      }

      // Animate button
      if (buttonRef.current) {
        tl.fromTo(
          buttonRef.current,
          { opacity: 0, scale: 0.9 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: 'back.out(1.7)',
          },
          '-=0.4'
        )
      }
    }, footerRef)

    return () => {
      ctx.revert()
    }
  }, [])

  return (
    <footer
      ref={footerRef}
      className="relative w-full py-16 md:py-24 overflow-hidden bg-black"
    >
      <div className="container mx-auto px-4 text-center">
        {/* Text Content */}
        <div
          ref={textRef}
          className="mb-12 space-y-4"
          style={{
            fontFamily: "'TheWalkyrDemo', serif",
          }}
        >
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold uppercase text-white leading-tight"
            style={{
              textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8)',
            }}
          >
            MASTER THE FORCES AND
          </h2>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold uppercase text-white leading-tight"
            style={{
              textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8)',
            }}
          >
            BECOME THE ZAMPION
          </h2>
        </div>

        {/* Buy Now Button */}
        <button
          ref={buttonRef}
          className="px-12 py-4 md:px-16 md:py-5 font-bold uppercase tracking-wide rounded-lg transition-all duration-300 opacity-0"
          style={{
            background: 'linear-gradient(180deg, #f4d03f 0%, #d4af37 100%)',
            color: '#000000',
            fontSize: '18px',
            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          }}
        >
          BUY NOW
        </button>
      </div>
    </footer>
  )
}
