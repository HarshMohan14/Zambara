'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

interface BracketRound {
  name: string
  subtitle: string
  matches: number
  icon: string
  color: string
}

const rounds: BracketRound[] = [
  { name: 'Rising Tide', subtitle: 'Round 1', matches: 8, icon: '🌊', color: '#0891b2' },
  { name: 'Storm Clash', subtitle: 'Semi-Finals', matches: 4, icon: '⛈️', color: '#06b6d4' },
  { name: 'Final Wave', subtitle: 'The Finals', matches: 2, icon: '🌊', color: '#22d3ee' },
  { name: 'Zampion of the Tides', subtitle: 'Grand Champion', matches: 1, icon: '👑', color: '#fbbf24' },
]

export function BracketSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const bracketRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.fromTo(titleRef.current,
          { opacity: 0, y: 50, filter: 'blur(6px)' },
          {
            opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out',
            scrollTrigger: { trigger: titleRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        )
      }

      if (bracketRef.current) {
        const items = bracketRef.current.children
        gsap.fromTo(
          Array.from(items),
          { opacity: 0, x: -60, scale: 0.9 },
          {
            opacity: 1, x: 0, scale: 1,
            duration: 0.9, stagger: 0.2, ease: 'power3.out',
            scrollTrigger: {
              trigger: bracketRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }
    }, sectionRef)

    return () => { ctx.revert() }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-20 md:py-32 overflow-hidden"
      aria-label="Battle Bracket"
      style={{
        background: 'linear-gradient(180deg, #000 0%, #030c1a 30%, #091b30 50%, #030c1a 70%, #000 100%)',
      }}
    >
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 right-0 h-px opacity-20"
          style={{ background: 'linear-gradient(90deg, transparent 5%, rgba(6, 182, 212, 0.3) 50%, transparent 95%)' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <p
            className="text-xs sm:text-sm uppercase tracking-[0.35em] mb-4"
            style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(6, 182, 212, 0.6)' }}
          >
            Tournament Structure
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
            The Battle Bracket
          </h2>
          <div className="flex justify-center mt-6">
            <div className="w-24 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.5), transparent)' }} />
          </div>
        </div>

        {/* Bracket Flow */}
        <div ref={bracketRef} className="max-w-4xl mx-auto space-y-6">
          {rounds.map((round, index) => {
            const isChampion = index === rounds.length - 1
            const widthPercent = 100 - index * 15

            return (
              <div key={round.name} className="relative" style={{ opacity: 0 }}>
                {/* Connecting line */}
                {index > 0 && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-px h-6"
                    style={{ background: `linear-gradient(to bottom, transparent, ${round.color}50)` }} />
                )}

                <div
                  className="mx-auto rounded-xl p-6 md:p-8 relative overflow-hidden transition-all duration-500 group cursor-default"
                  style={{
                    maxWidth: `${widthPercent}%`,
                    minWidth: '280px',
                    background: isChampion
                      ? 'linear-gradient(145deg, rgba(251, 191, 36, 0.1) 0%, rgba(180, 120, 40, 0.05) 50%, rgba(0,0,0,0.8) 100%)'
                      : `linear-gradient(145deg, ${round.color}12 0%, rgba(0,0,0,0.7) 100%)`,
                    border: `1.5px solid ${isChampion ? 'rgba(251, 191, 36, 0.3)' : `${round.color}25`}`,
                    boxShadow: isChampion
                      ? '0 0 50px rgba(251, 191, 36, 0.1), inset 0 0 30px rgba(251, 191, 36, 0.03)'
                      : `0 0 30px ${round.color}08, inset 0 0 20px rgba(0,0,0,0.3)`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = isChampion ? 'rgba(251, 191, 36, 0.6)' : `${round.color}50`
                    e.currentTarget.style.boxShadow = isChampion
                      ? '0 0 70px rgba(251, 191, 36, 0.2), inset 0 0 40px rgba(251, 191, 36, 0.05)'
                      : `0 0 50px ${round.color}18, inset 0 0 30px ${round.color}05`
                    e.currentTarget.style.transform = 'scale(1.02)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isChampion ? 'rgba(251, 191, 36, 0.3)' : `${round.color}25`
                    e.currentTarget.style.boxShadow = isChampion
                      ? '0 0 50px rgba(251, 191, 36, 0.1), inset 0 0 30px rgba(251, 191, 36, 0.03)'
                      : `0 0 30px ${round.color}08, inset 0 0 20px rgba(0,0,0,0.3)`
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    {/* Icon */}
                    <div
                      className="text-4xl md:text-5xl transition-transform duration-500 group-hover:scale-110"
                      style={{ filter: `drop-shadow(0 0 15px ${round.color}40)` }}
                    >
                      {round.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left">
                      <p
                        className="text-xs uppercase tracking-[0.2em] mb-1"
                        style={{ fontFamily: "'BlinkerRegular', sans-serif", color: `${round.color}90` }}
                      >
                        {round.subtitle}
                      </p>
                      <h3
                        className="text-2xl md:text-3xl font-bold uppercase"
                        style={{
                          fontFamily: "'TheWalkyrDemo', serif",
                          color: isChampion ? '#fbbf24' : round.color,
                          textShadow: `0 0 20px ${round.color}30`,
                        }}
                      >
                        {round.name}
                      </h3>
                    </div>

                    {/* Match count */}
                    <div className="text-center">
                      <div
                        className="text-3xl md:text-4xl font-bold"
                        style={{
                          fontFamily: "'TheWalkyrDemo', serif",
                          color: round.color,
                          textShadow: `0 0 15px ${round.color}30`,
                        }}
                      >
                        {round.matches === 1 ? '👑' : round.matches}
                      </div>
                      {round.matches > 1 && (
                        <p className="text-xs uppercase tracking-wider mt-1"
                          style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(255,255,255,0.3)' }}>
                          matches
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom accent */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(90deg, transparent, ${round.color}, transparent)` }}
                  />

                  {/* Champion special glow */}
                  {isChampion && (
                    <div className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{ background: 'radial-gradient(ellipse at center, rgba(251, 191, 36, 0.05), transparent 70%)' }} />
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Prize callout */}
        <div className="text-center mt-16">
          <div
            className="inline-block px-8 py-4 rounded-xl"
            style={{
              background: 'linear-gradient(145deg, rgba(251, 191, 36, 0.08) 0%, rgba(0,0,0,0.6) 100%)',
              border: '1px solid rgba(251, 191, 36, 0.2)',
              boxShadow: '0 0 30px rgba(251, 191, 36, 0.08)',
            }}
          >
            <p
              className="text-xs uppercase tracking-[0.3em] mb-2"
              style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(251, 191, 36, 0.6)' }}
            >
              Grand Prize
            </p>
            <p
              className="text-lg md:text-xl"
              style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#fbbf24' }}
            >
              Ceremonial Robe + Ocean Bracelet + ₹1,000
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
