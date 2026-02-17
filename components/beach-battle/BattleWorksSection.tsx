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

const steps: BattleStep[] = [
  { icon: '🌊', label: 'Warriors Enter', value: '16', detail: 'Players seated across 4 elemental tables', color: '#0891b2' },
  { icon: '⚔️', label: 'Per Table', value: '4 vs 4', detail: 'Head-to-head tribal showdowns', color: '#06b6d4' },
  { icon: '⏱️', label: 'Round Time', value: '3 min', detail: 'Fast-paced, high-stakes decisions', color: '#22d3ee' },
  { icon: '💎', label: 'Bracelets', value: '4', detail: 'Collect 4 bracelets to advance', color: '#0e7490' },
  { icon: '🔥', label: 'Survivors', value: '4', detail: 'One warrior per table qualifies', color: '#ef4444' },
  { icon: '👑', label: 'Zampion Clash', value: 'Top 4', detail: 'The ultimate final showdown', color: '#fbbf24' },
  { icon: '🏆', label: 'Champion', value: '1', detail: 'The Zampion of the Tides is crowned', color: '#fbbf24' },
  { icon: '🌟', label: 'Grand Prize', value: '₹1000+', detail: 'Robe + Ocean Bracelet + Cash', color: '#d1a058' },
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
      className="relative w-full py-14 sm:py-20 md:py-28 overflow-hidden"
      aria-label="How The Battle Works"
      style={{ background: 'linear-gradient(180deg, #000 0%, #020a14 40%, #071524 60%, #020a14 80%, #000 100%)' }}
    >
      {/* Ocean-war ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.15), transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.15), transparent)' }} />
        <div className="absolute top-1/2 left-0 w-full h-52 -translate-y-1/2 opacity-[0.04]"
          style={{ background: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.3), transparent 70%)', filter: 'blur(50px)' }} />
        {/* Wet-sand texture */}
        <div className="absolute inset-0 opacity-[0.01]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2394d8f0' fill-opacity='0.3'%3E%3Ccircle cx='1' cy='1' r='1'/%3E%3Ccircle cx='31' cy='31' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.35em] mb-3"
            style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(6, 182, 212, 0.6)' }}>
            The Path to Glory
          </p>
          <h2 ref={titleRef}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase mb-3 opacity-0"
            style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#e2e8f0', textShadow: '0 0 40px rgba(6, 182, 212, 0.2), 2px 4px 8px rgba(0,0,0,0.6)' }}>
            How The Battle Works
          </h2>
          <p className="text-xs sm:text-sm text-white/30 max-w-xs sm:max-w-md mx-auto"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
            From 16 warriors to 1 Zampion — the path demands everything
          </p>
          <div className="flex justify-center mt-4">
            <div className="w-16 sm:w-20 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.5), transparent)' }} />
          </div>
        </div>

        {/* Cards Grid - 2x4 mobile, 4x2 desktop */}
        <div ref={gridRef} className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 max-w-4xl mx-auto">
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
                  <div className="absolute top-2 right-2 text-[8px] sm:text-[9px] font-bold"
                    style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: isActive ? `${step.color}40` : 'rgba(6, 182, 212, 0.2)' }}>
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  {/* Icon */}
                  <div className="text-xl sm:text-2xl mb-2 transition-transform duration-300"
                    style={{ transform: isActive ? 'scale(1.15)' : 'scale(1)' }}>
                    {step.icon}
                  </div>

                  {/* Value */}
                  <div className="text-lg sm:text-xl font-bold mb-0.5"
                    style={{
                      fontFamily: "'TheWalkyrDemo', serif",
                      color: isActive ? step.color : '#06b6d4',
                      textShadow: isActive ? `0 0 12px ${step.color}30` : '0 0 10px rgba(6, 182, 212, 0.15)',
                    }}>
                    {step.value}
                  </div>

                  {/* Label */}
                  <h4 className="text-[9px] sm:text-[10px] uppercase tracking-wider mb-0.5"
                    style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#e2e8f0' }}>
                    {step.label}
                  </h4>

                  {/* Detail - visible on active */}
                  <div className="overflow-hidden transition-all duration-300"
                    style={{ maxHeight: isActive ? '40px' : '0px', opacity: isActive ? 1 : 0 }}>
                    <p className="text-[8px] sm:text-[9px] leading-relaxed pt-1"
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
