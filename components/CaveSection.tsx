'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { gsap, createTimeline, ScrollTrigger } from '@/lib/gsap'

export function CaveSection() {
  const [activeTab, setActiveTab] = useState<'2-4' | '5-8'>('2-4')
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const priceRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !contentRef.current) return

    const ctx = gsap.context(() => {
      // Create timeline for scroll-triggered animations
      const tl = createTimeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
      })

      // Fade in content container
      tl.fromTo(
        contentRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out',
        }
      )

      // Tabs animation
      if (tabsRef.current) {
        tl.fromTo(
          tabsRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
          },
          '-=0.5'
        )
      }

      // Description animation
      if (descriptionRef.current) {
        tl.fromTo(
          descriptionRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
          },
          '-=0.4'
        )
      }

      // Price animation
      if (priceRef.current) {
        tl.fromTo(
          priceRef.current,
          { opacity: 0, scale: 0.9 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: 'back.out(1.7)',
          },
          '-=0.3'
        )
      }

      // Buttons animation
      if (buttonsRef.current) {
        tl.fromTo(
          buttonsRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
          },
          '-=0.2'
        )
      }
    }, sectionRef)

    return () => {
      ctx.revert()
    }
  }, [])

  // Animate description when tab changes
  useEffect(() => {
    if (!descriptionRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        descriptionRef.current,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
        }
      )
    })

    return () => {
      ctx.revert()
    }
  }, [activeTab])

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex flex-col items-center overflow-hidden bg-black"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Cave.jpg"
          alt="Cave background"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 container mx-auto px-4 py-24 text-center mt-[50vh]"
      >
        {/* Player Count Tabs */}
        <div
          ref={tabsRef}
          className="flex justify-center gap-4 mb-6 opacity-0"
        >
          <button
            onClick={() => setActiveTab('2-4')}
            className="px-6 py-3 rounded-lg font-bold uppercase tracking-wide transition-all"
            style={{
              fontFamily: "'TheWalkyrDemo', serif",
              backgroundColor: activeTab === '2-4' ? '#D4AF37' : 'transparent',
              border: activeTab === '2-4' ? 'none' : '2px solid #D4AF37',
              color: activeTab === '2-4' ? '#000' : '#D4AF37',
              textShadow: activeTab === '2-4' ? 'none' : '1px 1px 4px rgba(0, 0, 0, 0.8)',
              boxShadow: activeTab === '2-4' ? '0 4px 15px rgba(212, 175, 55, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== '2-4') {
                e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== '2-4') {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            2-4 PLAYERS
          </button>
          <button
            onClick={() => setActiveTab('5-8')}
            className="px-6 py-3 rounded-lg font-bold uppercase tracking-wide transition-all"
            style={{
              fontFamily: "'TheWalkyrDemo', serif",
              backgroundColor: activeTab === '5-8' ? '#FFFFFF' : 'transparent',
              border: '2px solid #D4AF37',
              color: activeTab === '5-8' ? '#000' : '#D4AF37',
              textShadow: activeTab === '5-8' ? 'none' : '1px 1px 4px rgba(0, 0, 0, 0.8)',
              boxShadow: activeTab === '5-8' ? '0 4px 15px rgba(255, 255, 255, 0.3)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== '5-8') {
                e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== '5-8') {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            5-8 PLAYERS
          </button>
        </div>

        {/* Description */}
        <p
          ref={descriptionRef}
          className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8 opacity-0 leading-relaxed"
          style={{
            fontFamily: "'BalginLightExpanded', sans-serif",
            textShadow: '1px 1px 4px rgba(0, 0, 0, 0.8)',
          }}
        >
          {activeTab === '2-4'
            ? 'Perfect for intimate gaming sessions. Experience the thrill of elemental mastery with a smaller group of players.'
            : 'Ideal for larger gatherings. Battle with more players and unlock the full potential of the Zambaara experience.'}
        </p>

        {/* Price */}
        <div
          ref={priceRef}
          className="mb-8 opacity-0"
        >
          <p
            className="text-5xl md:text-6xl font-bold"
            style={{
              fontFamily: "'TheWalkyrDemo', serif",
              color: '#D4AF37',
              textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.3)',
            }}
          >
            ₹799
          </p>
        </div>

        {/* Action Buttons */}
        <div
          ref={buttonsRef}
          className="flex flex-col sm:flex-row justify-center gap-4 opacity-0"
        >
          <button 
            className="px-8 py-4 font-bold rounded-lg transition-all uppercase tracking-wide"
            style={{
              fontFamily: "'TheWalkyrDemo', serif",
              backgroundColor: '#000000',
              border: '2px solid #D4AF37',
              color: '#FFFFFF',
              textShadow: '1px 1px 4px rgba(0, 0, 0, 0.8)',
              boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
              letterSpacing: '1px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.3)'
            }}
          >
            HOW TO PLAY
          </button>
          <button 
            className="px-8 py-4 font-bold rounded-lg transition-all uppercase tracking-wide"
            style={{
              fontFamily: "'TheWalkyrDemo', serif",
              background: 'linear-gradient(180deg, #f4d03f 0%, #d4af37 100%)',
              border: 'none',
              color: '#000000',
              boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              letterSpacing: '1px',
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
      </div>
    </section>
  )
}