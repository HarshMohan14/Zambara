'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'

interface BattleStep {
  icon: string
  label: string
  value: string
  detail: string
  color: string
}

// SVG icon paths (cinematic battle-themed, not childish emojis)
const STEP_ICONS: Record<string, string> = {
  warriors: 'M12 2C8 2 4 4.5 4 8c0 2.5 2 5 8 12 6-7 8-9.5 8-12 0-3.5-4-6-8-6z', // shield entry
  swords: 'M6.5 2L1 7.5 3.5 10l5-5L12 8.5 15.5 5l5 5L23 7.5 17.5 2 12 7.5 6.5 2zM12 10l-5 5 2.5 2.5L12 15l2.5 2.5L17 15l-5-5zM12 17l-4 5h8l-4-5z', // crossed swords
  timer: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z', // clock
  bracelet: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 3a7 7 0 110 14 7 7 0 010-14zm0 2a5 5 0 100 10 5 5 0 000-10z', // ring
  flame: 'M12 2C8 6 4 10 4 14a8 8 0 0016 0c0-4-4-8-8-12zm0 16a4 4 0 01-4-4c0-2 2-5 4-8 2 3 4 6 4 8a4 4 0 01-4 4z', // flame
  crown: 'M2 20h20v2H2v-2zm1-7l4 3V8l5 6 5-6v8l4-3-1 7H4l-1-7zm9-11l3 4h-6l3-4z', // crown
  trophy: 'M18 2H6v6a6 6 0 005 5.91V18H8v2h8v-2h-3v-4.09A6 6 0 0018 8V2zM4 4V8a2 2 0 004 0V4H4zm16 0h-4v4a2 2 0 004 0V4z', // trophy
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', // star
}

const steps: BattleStep[] = [
  { icon: 'warriors', label: 'Warriors Enter', value: '16', detail: 'Players seated across 4 elemental tables', color: '#0891b2' },
  { icon: 'swords', label: 'Per Table', value: '4 vs 4', detail: 'Head-to-head tribal showdowns', color: '#06b6d4' },
  { icon: 'timer', label: 'Round Time', value: '3 min', detail: 'Fast-paced, high-stakes decisions', color: '#22d3ee' },
  { icon: 'bracelet', label: 'Bracelets', value: '4', detail: 'Collect 4 bracelets to advance', color: '#0e7490' },
  { icon: 'flame', label: 'Survivors', value: '4', detail: 'One warrior per table qualifies', color: '#ef4444' },
  { icon: 'crown', label: 'Zampion Clash', value: 'Top 4', detail: 'The ultimate final showdown', color: '#fbbf24' },
  { icon: 'trophy', label: 'Champion', value: '1', detail: 'The Zampion of the Tides is crowned', color: '#fbbf24' },
  { icon: 'star', label: 'Grand Prize', value: '₹1000+', detail: 'Robe + Ocean Bracelet + Cash', color: '#d1a058' },
]

export function BattleWorksSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const [activeStep, setActiveStep] = useState<number | null>(null)

  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.fromTo(titleRef.current,
          { opacity: 0, y: 40, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out',
            scrollTrigger: { trigger: titleRef.current, start: 'top 85%', toggleActions: 'play none none reverse' } }
        )
      }
      if (gridRef.current) {
        gsap.fromTo(Array.from(gridRef.current.children),
          { opacity: 0, y: 40, scale: 0.92 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.07, ease: 'power3.out',
            scrollTrigger: { trigger: gridRef.current, start: 'top 82%', toggleActions: 'play none none reverse' } }
        )
      }
    }, sectionRef)
    return () => { ctx.revert() }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="battle-works"
      className="relative w-full py-14 sm:py-20 md:py-28 lg:py-32 overflow-hidden"
      aria-label="How The Battle Works"
    >
      {/* Subtle section overlay — transparent, unified bg shows through */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.45]"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.5) 100%)' }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.15), transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.15), transparent)' }} />
        <div className="absolute top-1/2 left-0 w-full h-52 -translate-y-1/2 opacity-[0.04]"
          style={{ background: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.3), transparent 70%)', filter: 'blur(50px)' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <p className="text-sm sm:text-base uppercase tracking-[0.35em] mb-3"
            style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(6, 182, 212, 0.6)' }}>
            The Path to Glory
          </p>
          <h2 ref={titleRef}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold uppercase mb-3 opacity-0"
            style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#e2e8f0', textShadow: '0 0 40px rgba(6, 182, 212, 0.2), 2px 4px 8px rgba(0,0,0,0.6)' }}>
            How The Battle Works
          </h2>
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-white/50 max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl mx-auto"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
            From the opening horn to the final crown — every step is a battle.
          </p>
          <div className="flex justify-center mt-4">
            <div className="w-16 sm:w-20 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.5), transparent)' }} />
          </div>
        </div>

        {/* Cards Grid - 2x4 mobile, 4x2 desktop */}
        <div ref={gridRef} className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4 xl:gap-5 max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const isActive = activeStep === index
            return (
              <div key={index}
                className="relative group cursor-pointer active:scale-[0.97]"
                onClick={() => setActiveStep(isActive ? null : index)}
                style={{ opacity: 0 }}>
                <div className="relative rounded-xl p-3.5 sm:p-5 h-full transition-all duration-400 overflow-hidden"
                  style={{
                    background: isActive
                      ? `linear-gradient(145deg, ${step.color}10 0%, rgba(0,0,0,0.7) 100%)`
                      : 'linear-gradient(145deg, rgba(6, 30, 50, 0.4) 0%, rgba(0,0,0,0.65) 100%)',
                    border: `1px solid ${isActive ? `${step.color}35` : 'rgba(6, 182, 212, 0.08)'}`,
                    boxShadow: isActive ? `0 0 30px ${step.color}10, 0 8px 20px rgba(0,0,0,0.25)` : '0 4px 15px rgba(0,0,0,0.2)',
                    transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                  }}>
                  {/* Glassmorphism overlay on active */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(1px)' }} />
                  )}

                  {/* Step number */}
                  <div className="absolute top-2 right-2 text-[10px] sm:text-xs font-bold"
                    style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: isActive ? `${step.color}40` : 'rgba(6, 182, 212, 0.2)' }}>
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  {/* Icon */}
                  <div className="text-xl sm:text-2xl lg:text-3xl mb-2 transition-transform duration-300"
                    style={{ transform: isActive ? 'scale(1.15)' : 'scale(1)' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill={isActive ? step.color : '#06b6d4'} opacity={0.85}>
                      <path d={STEP_ICONS[step.icon] || STEP_ICONS.star} />
                    </svg>
                  </div>

                  {/* Value */}
                  <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-0.5"
                    style={{
                      fontFamily: "'TheWalkyrDemo', serif",
                      color: isActive ? step.color : '#06b6d4',
                      textShadow: isActive ? `0 0 12px ${step.color}30` : '0 0 10px rgba(6, 182, 212, 0.15)',
                    }}>
                    {step.value}
                  </div>

                  {/* Label */}
                  <h4 className="text-xs sm:text-sm lg:text-base xl:text-lg uppercase tracking-wider mb-0.5"
                    style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#e2e8f0' }}>
                    {step.label}
                  </h4>

                  {/* Detail - visible on active */}
                  <div className="overflow-hidden transition-all duration-300"
                    style={{ maxHeight: isActive ? '40px' : '0px', opacity: isActive ? 1 : 0 }}>
                    <p className="text-xs sm:text-sm leading-relaxed pt-1"
                      style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(255,255,255,0.35)' }}>
                      {step.detail}
                    </p>
                  </div>

                  {/* Bottom glow */}
                  <div className="absolute bottom-0 left-0 right-0 h-px transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${isActive ? step.color : 'rgba(6, 182, 212, 0.3)'}, transparent)`,
                      opacity: isActive ? 1 : 0,
                    }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
