'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap, createTimeline } from '@/lib/gsap'

export function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const meteorImageRef = useRef<HTMLDivElement>(null)
  const natureImageRef = useRef<HTMLDivElement>(null)
  const welcomeTextRef = useRef<HTMLHeadingElement>(null)
  const titleTextRef = useRef<HTMLHeadingElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (!heroRef.current) return

    // Video will loop automatically via HTML video loop attribute
    // No additional animation needed for video

    // Create a master timeline for the hero animations
    const tl = createTimeline()

    // Sequence 1: Nature image fades in (if available)
    if (natureImageRef.current) {
      tl.fromTo(
        natureImageRef.current,
        { opacity: 0, scale: 0.95 },
        { 
          opacity: 1, 
          scale: 1, 
          duration: 1.2, 
          ease: 'power2.out' 
        }
      )
    }

    // Sequence 2: "WELCOME TO" text fades in
    if (welcomeTextRef.current) {
      tl.fromTo(
        welcomeTextRef.current,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          ease: 'power2.out' 
        },
        natureImageRef.current ? '-=0.4' : '0'
      )
    }

    // Sequence 3: "ZAMBAARA" title fades in
    if (titleTextRef.current) {
      tl.fromTo(
        titleTextRef.current,
        { opacity: 0, y: 30, scale: 0.9 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 1, 
          ease: 'back.out(1.7)' 
        },
        welcomeTextRef.current ? '-=0.5' : '0'
      )
    }

    // Sequence 4: Taglines fade in with stagger
    const taglines = taglineRef.current?.children
    if (taglines && taglines.length > 0) {
      tl.fromTo(
        Array.from(taglines),
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.15,
        },
        titleTextRef.current ? '-=0.3' : '0'
      )
    }


    return () => {
      tl.kill()
    }
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative flex items-center justify-center overflow-hidden bg-black"
      style={{
        width: '100vw',
        height: '100vh',
      }}
    >
      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center justify-center w-full h-full">
        {/* Images Container - Positioned to overlap */}
        <div className="relative mb-8 w-full max-w-4xl flex justify-center items-center">
          {/* Hero Video (hero.mp4) - Infinite loop */}
          <div
            ref={meteorImageRef}
            className="absolute inset-0 flex items-center justify-center z-20"
          >
            <video
              src="/hero.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="object-contain"
              style={{
                width: '480px',
                height: '848px',
              }}
            />
          </div>

          {/* Nature Image (Nature.png) - Higher z-index, on top */}
          <div
            ref={natureImageRef}
            className="relative flex justify-center items-center opacity-0 z-30"
          >
            <Image
              src="/Nature.png"
              alt="Nature"
              width={2122}
              height={2144}
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center w-full max-w-5xl relative z-40">
          {/* Welcome Text */}
          <h2
            ref={welcomeTextRef}
            className="text-lg md:text-xl uppercase tracking-wider opacity-0 mb-2"
            style={{
              fontFamily: "'BalginLightExpanded', sans-serif",
              color: '#D4AF37',
            }}
          >
            WELCOME TO
          </h2>

          {/* Main Title */}
          <h1
            ref={titleTextRef}
            className="text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tight opacity-0 mb-12"
            style={{
              fontFamily: "'TheWalkyrDemo', serif",
              color: '#D4AF37',
              textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.3)',
            }}
          >
            ZAMBAARA
          </h1>

          {/* Taglines */}
          <div 
            ref={taglineRef} 
            className="space-y-4"
            style={{
              fontFamily: "'BalginLightExpanded', sans-serif",
            }}
          >
            {/* Line above first tagline */}
            <div className="w-full border-t border-yellow-400 mb-4" style={{ borderColor: '#D4AF37' }}></div>
            
            <div className="opacity-0">
              <p className="text-base md:text-lg uppercase font-semibold inline-block" style={{ color: '#FFFFFF' }}>
                MASTER THE ELEMENTS
              </p>
              <div className="w-full border-b border-yellow-400 mt-2" style={{ borderColor: '#D4AF37' }}></div>
            </div>
            <div className="opacity-0">
              <p className="text-base md:text-lg uppercase font-semibold inline-block" style={{ color: '#FFFFFF' }}>
                WIN THE BRACELETS
              </p>
              <div className="w-full border-b border-yellow-400 mt-2" style={{ borderColor: '#D4AF37' }}></div>
            </div>
            <div className="opacity-0">
              <p className="text-base md:text-lg uppercase font-semibold inline-block" style={{ color: '#FFFFFF' }}>
                BECOME THE ZAMPION
              </p>
              <div className="w-full border-b border-yellow-400 mt-2" style={{ borderColor: '#D4AF37' }}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}