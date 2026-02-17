'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

interface BattleStep {
  icon: string
  label: string
  value: string
  detail: string
}

const steps: BattleStep[] = [
  { icon: '⚔️', label: 'Players Per Table', value: '4', detail: 'Seated in elemental order' },
  { icon: '🏟️', label: 'Live Tables', value: '2', detail: 'Running simultaneously' },
  { icon: '⏱️', label: 'Match Window', value: '30 min', detail: 'Per round of battle' },
  { icon: '🔥', label: 'Round Timer', value: '3 min', detail: 'Fast-paced decisions' },
  { icon: '💎', label: 'Bracelets to Win', value: '4', detail: 'First to collect advances' },
  { icon: '🏆', label: 'Winners Only', value: 'Advance', detail: 'The rest fall behind' },
  { icon: '👑', label: 'Final Showdown', value: 'Top 4', detail: 'Battle for the crown' },
  { icon: '🌊', label: 'Grand Prize', value: '₹1000', detail: 'Robe + Ocean Bracelet' },
]

export function BattleWorksSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // Title
      if (titleRef.current) {
        gsap.fromTo(titleRef.current,
          { opacity: 0, y: 50, filter: 'blur(6px)' },
          {
            opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out',
            scrollTrigger: { trigger: titleRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        )
      }

      // Timeline cards stagger
      if (timelineRef.current) {
        const cards = timelineRef.current.children
        gsap.fromTo(
          Array.from(cards),
          { opacity: 0, y: 60, scale: 0.9 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.8, stagger: 0.1, ease: 'power3.out',
            scrollTrigger: {
              trigger: timelineRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }

      // Horizontal scroll animation for mobile indicator
      if (scrollContainerRef.current) {
        const scrollWidth = scrollContainerRef.current.scrollWidth
        const viewportWidth = scrollContainerRef.current.offsetWidth

        if (scrollWidth > viewportWidth) {
          // Subtle auto-scroll hint
          gsap.fromTo(scrollContainerRef.current,
            { scrollLeft: 0 },
            {
              scrollLeft: 80,
              duration: 1.5,
              ease: 'power2.inOut',
              scrollTrigger: {
                trigger: scrollContainerRef.current,
                start: 'top 75%',
                toggleActions: 'play none none none',
              },
              onComplete: () => {
                gsap.to(scrollContainerRef.current, { scrollLeft: 0, duration: 1, ease: 'power2.out' })
              }
            }
          )
        }
      }
    }, sectionRef)

    return () => { ctx.revert() }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-20 md:py-32 overflow-hidden"
      aria-label="How The Battle Works"
      style={{
        background: 'linear-gradient(180deg, #000 0%, #020a14 40%, #071524 60%, #020a14 80%, #000 100%)',
      }}
    >
      {/* Ocean depth ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.2), transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.2), transparent)' }} />
        <div className="absolute top-1/2 left-0 w-full h-80 -translate-y-1/2 opacity-5"
          style={{ background: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.4), transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <p
            className="text-xs sm:text-sm uppercase tracking-[0.35em] mb-4"
            style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(6, 182, 212, 0.6)' }}
          >
            The Path to Glory
          </p>
          <h2
            ref={titleRef}
            className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase mb-6 opacity-0"
            style={{
              fontFamily: "'TheWalkyrDemo', serif",
              color: '#e2e8f0',
              textShadow: '0 0 40px rgba(6, 182, 212, 0.2), 2px 4px 8px rgba(0,0,0,0.6)',
            }}
          >
            How The Battle Works
          </h2>
          <div className="flex justify-center mt-6">
            <div className="w-24 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.5), transparent)' }} />
          </div>
        </div>

        {/* Scrollable Timeline */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div
            ref={timelineRef}
            className="flex gap-4 md:gap-6 min-w-max lg:min-w-0 lg:grid lg:grid-cols-4 lg:gap-6"
          >
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative flex-shrink-0 w-[240px] sm:w-[260px] lg:w-auto group"
              >
                {/* Connecting line (desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-6 h-px z-20"
                    style={{ background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.4), rgba(6, 182, 212, 0.1))' }} />
                )}

                <div
                  className="relative rounded-xl p-6 h-full transition-all duration-500 overflow-hidden"
                  style={{
                    background: 'linear-gradient(145deg, rgba(6, 30, 50, 0.6) 0%, rgba(0,0,0,0.7) 100%)',
                    border: '1px solid rgba(6, 182, 212, 0.15)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)'
                    e.currentTarget.style.boxShadow = '0 0 40px rgba(6, 182, 212, 0.15), 0 8px 30px rgba(0,0,0,0.4)'
                    e.currentTarget.style.transform = 'translateY(-4px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.15)'
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  {/* Step number */}
                  <div
                    className="absolute top-3 right-3 text-xs font-bold"
                    style={{
                      fontFamily: "'BlinkerSemiBold', sans-serif",
                      color: 'rgba(6, 182, 212, 0.3)',
                    }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  {/* Icon */}
                  <div className="text-3xl md:text-4xl mb-4">{step.icon}</div>

                  {/* Value */}
                  <div
                    className="text-3xl md:text-4xl font-bold mb-2"
                    style={{
                      fontFamily: "'TheWalkyrDemo', serif",
                      color: '#06b6d4',
                      textShadow: '0 0 20px rgba(6, 182, 212, 0.3)',
                    }}
                  >
                    {step.value}
                  </div>

                  {/* Label */}
                  <h4
                    className="text-sm uppercase tracking-wider mb-2"
                    style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#e2e8f0' }}
                  >
                    {step.label}
                  </h4>

                  {/* Detail */}
                  <p
                    className="text-xs"
                    style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(255,255,255,0.4)' }}
                  >
                    {step.detail}
                  </p>

                  {/* Bottom glow */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.5), transparent)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile scroll hint */}
        <div className="flex lg:hidden justify-center mt-6">
          <p className="text-xs uppercase tracking-wider" style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(6, 182, 212, 0.4)' }}>
            ← Swipe to explore →
          </p>
        </div>
      </div>

      {/* CSS to hide scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}
