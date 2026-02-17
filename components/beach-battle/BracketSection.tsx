'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'

interface BracketRound {
  name: string
  subtitle: string
  playersIn: number
  playersOut: number
  icon: string
  color: string
  description: string
  bgAccent: string
}

const rounds: BracketRound[] = [
  {
    name: 'Rising Tide',
    subtitle: 'Round 1 \u2014 The Gauntlet',
    playersIn: 16,
    playersOut: 4,
    icon: '\uD83C\uDF0A',
    color: '#0891b2',
    bgAccent: 'rgba(8, 145, 178, 0.08)',
    description: '16 warriors enter the arena across 4 elemental tables. Battles rage simultaneously \u2014 only the strongest from each table survives. The rest fall to the tides.',
  },
  {
    name: 'Zampion Round',
    subtitle: 'The Final Showdown',
    playersIn: 4,
    playersOut: 1,
    icon: '\uD83D\uDC51',
    color: '#fbbf24',
    bgAccent: 'rgba(251, 191, 36, 0.06)',
    description: 'The 4 surviving warriors face off in an epic final clash. One will rise above all others to claim the ultimate title: Zampion of the Tides.',
  },
]

const hallOfFame = [
  { rank: 1, title: 'Zampion of the Tides', icon: '\uD83D\uDC51', color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.4)' },
  { rank: 2, title: 'Second Wave', icon: '\uD83E\uDD48', color: '#94a3b8', borderColor: 'rgba(148, 163, 184, 0.25)' },
  { rank: 3, title: 'Third Current', icon: '\uD83E\uDD49', color: '#d97706', borderColor: 'rgba(217, 119, 6, 0.25)' },
  { rank: 4, title: 'Fourth Shore', icon: '\u2726', color: '#64748b', borderColor: 'rgba(100, 116, 139, 0.2)' },
]

export function BracketSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const bracketRef = useRef<HTMLDivElement>(null)
  const fameRef = useRef<HTMLDivElement>(null)
  const [activeRound, setActiveRound] = useState<number | null>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.fromTo(titleRef.current,
          { opacity: 0, y: 40, filter: 'blur(6px)' },
          {
            opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out',
            scrollTrigger: { trigger: titleRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        )
      }

      if (bracketRef.current) {
        gsap.fromTo(Array.from(bracketRef.current.children),
          { opacity: 0, x: -40, scale: 0.95 },
          {
            opacity: 1, x: 0, scale: 1,
            duration: 0.8, stagger: 0.2, ease: 'power3.out',
            scrollTrigger: { trigger: bracketRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
          }
        )
      }

      if (fameRef.current) {
        gsap.fromTo(Array.from(fameRef.current.children),
          { opacity: 0, y: 40, scale: 0.9 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.7, stagger: 0.1, ease: 'back.out(1.4)',
            scrollTrigger: { trigger: fameRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        )
      }
    }, sectionRef)

    return () => { ctx.revert() }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-14 sm:py-20 md:py-28 overflow-hidden"
      aria-label="Battle Bracket"
      style={{ background: 'linear-gradient(180deg, #000 0%, #030c1a 30%, #091b30 50%, #030c1a 70%, #000 100%)' }}
    >
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 md:w-[500px] md:h-[500px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, rgba(6, 182, 212, 0.2), transparent 60%)', filter: 'blur(80px)' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.35em] mb-3"
            style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(6, 182, 212, 0.6)' }}>
            Tournament Structure
          </p>
          <h2 ref={titleRef}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase mb-3 opacity-0"
            style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#e2e8f0', textShadow: '0 0 40px rgba(6, 182, 212, 0.2), 2px 4px 8px rgba(0,0,0,0.6)' }}>
            The Battle Bracket
          </h2>
          <p className="text-xs sm:text-sm text-white/30 max-w-xs sm:max-w-md mx-auto"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
            16 warriors enter. Only 1 emerges as Zampion.
          </p>
          <div className="flex justify-center mt-4">
            <div className="w-16 sm:w-20 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.5), transparent)' }} />
          </div>
        </div>

        {/* Visual Flow: 16 -> 4 -> 1 */}
        <div className="flex justify-center items-center gap-2 sm:gap-3 mb-8 sm:mb-12">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#0891b2' }}>16</div>
            <div className="text-[8px] sm:text-[9px] uppercase tracking-wider" style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(255,255,255,0.3)' }}>Warriors</div>
          </div>
          <svg className="w-6 h-6 sm:w-8 sm:h-8 opacity-30" fill="none" stroke="#0891b2" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#06b6d4' }}>4</div>
            <div className="text-[8px] sm:text-[9px] uppercase tracking-wider" style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(255,255,255,0.3)' }}>Qualifiers</div>
          </div>
          <svg className="w-6 h-6 sm:w-8 sm:h-8 opacity-30" fill="none" stroke="#fbbf24" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#fbbf24' }}>1</div>
            <div className="text-[8px] sm:text-[9px] uppercase tracking-wider" style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(251, 191, 36, 0.5)' }}>Zampion</div>
          </div>
        </div>

        {/* Bracket Rounds */}
        <div ref={bracketRef} className="max-w-md sm:max-w-lg mx-auto space-y-4 sm:space-y-5 mb-12 sm:mb-16">
          {rounds.map((round, index) => {
            const isChampion = index === rounds.length - 1
            const isActive = activeRound === index
            return (
              <div key={round.name} style={{ opacity: 0 }}>
                {/* Connector line */}
                {index > 0 && (
                  <div className="flex justify-center mb-3 sm:mb-4">
                    <div className="flex flex-col items-center">
                      <div className="w-px h-6 sm:h-8" style={{ background: `linear-gradient(to bottom, ${rounds[index - 1].color}40, ${round.color}60)` }} />
                      <div className="text-[9px] sm:text-[10px] uppercase tracking-wider px-3 py-1 rounded-full"
                        style={{ fontFamily: "'BlinkerRegular', sans-serif", color: `${round.color}90`, border: `1px solid ${round.color}20`, background: 'rgba(0,0,0,0.6)' }}>
                        {rounds[index - 1].playersOut} Warriors Advance
                      </div>
                      <div className="w-px h-6 sm:h-8" style={{ background: `linear-gradient(to bottom, ${round.color}60, ${round.color}30)` }} />
                    </div>
                  </div>
                )}

                <div
                  className="rounded-xl p-4 sm:p-6 relative overflow-hidden cursor-pointer transition-all duration-500 active:scale-[0.98]"
                  onClick={() => setActiveRound(isActive ? null : index)}
                  style={{
                    background: isChampion
                      ? 'linear-gradient(145deg, rgba(251, 191, 36, 0.1) 0%, rgba(180, 120, 40, 0.04) 50%, rgba(0,0,0,0.85) 100%)'
                      : `linear-gradient(145deg, ${round.bgAccent} 0%, rgba(0,0,0,0.8) 100%)`,
                    border: `1.5px solid ${isActive ? (isChampion ? 'rgba(251, 191, 36, 0.55)' : `${round.color}50`) : (isChampion ? 'rgba(251, 191, 36, 0.2)' : `${round.color}18`)}`,
                    boxShadow: isActive
                      ? `0 0 40px ${isChampion ? 'rgba(251, 191, 36, 0.12)' : `${round.color}12`}, 0 10px 30px rgba(0,0,0,0.3)`
                      : '0 4px 20px rgba(0,0,0,0.3)',
                    transform: isActive ? 'scale(1.01)' : 'scale(1)',
                  }}>
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Icon */}
                    <div className="text-3xl sm:text-4xl flex-shrink-0 transition-transform duration-500"
                      style={{ filter: `drop-shadow(0 0 12px ${round.color}40)`, transform: isActive ? 'scale(1.15)' : 'scale(1)' }}>
                      {round.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] mb-0.5"
                        style={{ fontFamily: "'BlinkerRegular', sans-serif", color: `${round.color}80` }}>
                        {round.subtitle}
                      </p>
                      <h3 className="text-lg sm:text-2xl font-bold uppercase truncate"
                        style={{ fontFamily: "'TheWalkyrDemo', serif", color: isChampion ? '#fbbf24' : round.color, textShadow: `0 0 15px ${round.color}25` }}>
                        {round.name}
                      </h3>
                    </div>

                    {/* Player flow badge */}
                    <div className="flex-shrink-0 text-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg"
                      style={{ background: `${round.color}08`, border: `1px solid ${round.color}15` }}>
                      <div className="flex items-center gap-1">
                        <span className="text-xl sm:text-2xl font-bold"
                          style={{ fontFamily: "'TheWalkyrDemo', serif", color: round.color }}>
                          {round.playersIn}
                        </span>
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 opacity-40" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <span className="text-xl sm:text-2xl font-bold"
                          style={{ fontFamily: "'TheWalkyrDemo', serif", color: isChampion ? '#fbbf24' : '#e2e8f0' }}>
                          {round.playersOut}
                        </span>
                      </div>
                      <p className="text-[8px] uppercase tracking-wider mt-0.5"
                        style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(255,255,255,0.25)' }}>
                        players
                      </p>
                    </div>
                  </div>

                  {/* Expandable description */}
                  <div className="overflow-hidden transition-all duration-500"
                    style={{ maxHeight: isActive ? '120px' : '0px', opacity: isActive ? 1 : 0, marginTop: isActive ? '12px' : '0' }}>
                    <div className="w-full h-px mb-3" style={{ background: `linear-gradient(90deg, transparent, ${round.color}25, transparent)` }} />
                    <p className="text-xs sm:text-sm leading-relaxed"
                      style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(255,255,255,0.5)' }}>
                      {round.description}
                    </p>
                  </div>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-px transition-all duration-500"
                    style={{ background: isActive ? `linear-gradient(90deg, transparent, ${round.color}, transparent)` : 'transparent' }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Hall of Fame */}
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-2"
            style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(251, 191, 36, 0.55)' }}>
            \u2726 Hall of Fame \u2726
          </p>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold uppercase"
            style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#fbbf24', textShadow: '0 0 30px rgba(251, 191, 36, 0.15)' }}>
            Legends of the Tides
          </h3>
        </div>

        <div ref={fameRef} className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 max-w-sm sm:max-w-2xl mx-auto">
          {hallOfFame.map((player) => (
            <div key={player.rank}
              className="text-center p-3 sm:p-5 rounded-xl transition-all duration-300 group cursor-default"
              style={{
                opacity: 0,
                background: player.rank === 1
                  ? 'linear-gradient(145deg, rgba(251, 191, 36, 0.08) 0%, rgba(0,0,0,0.8) 100%)'
                  : 'linear-gradient(145deg, rgba(30, 41, 59, 0.2) 0%, rgba(0,0,0,0.8) 100%)',
                border: `1px solid ${player.borderColor}`,
                boxShadow: player.rank === 1 ? '0 0 25px rgba(251, 191, 36, 0.06)' : 'none',
              }}>
              <div className="text-xl sm:text-3xl mb-1.5 sm:mb-2 transition-transform duration-300 group-hover:scale-110"
                style={{ filter: `drop-shadow(0 0 8px ${player.color}35)` }}>
                {player.icon}
              </div>
              <div className="text-[9px] sm:text-xs uppercase tracking-wider mb-0.5 sm:mb-1"
                style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(255,255,255,0.25)' }}>
                #{player.rank}
              </div>
              <div className="text-[10px] sm:text-sm font-bold uppercase"
                style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: player.color, textShadow: `0 0 10px ${player.color}25` }}>
                {player.title}
              </div>
              {/* Empty slot indicator */}
              <div className="mt-2 sm:mt-3 h-8 sm:h-12 rounded-lg flex items-center justify-center"
                style={{ border: `1px dashed ${player.color}20`, background: 'rgba(0,0,0,0.3)' }}>
                <span className="text-[8px] sm:text-[9px] uppercase tracking-wider" style={{ fontFamily: "'BlinkerRegular', sans-serif", color: `${player.color}35` }}>
                  Awaiting Champion
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Prize callout */}
        <div className="text-center mt-8 sm:mt-12">
          <div className="inline-block px-5 py-3 sm:px-8 sm:py-4 rounded-xl"
            style={{ background: 'linear-gradient(145deg, rgba(251, 191, 36, 0.06) 0%, rgba(0,0,0,0.6) 100%)', border: '1px solid rgba(251, 191, 36, 0.18)', boxShadow: '0 0 25px rgba(251, 191, 36, 0.04)' }}>
            <p className="text-[9px] sm:text-xs uppercase tracking-[0.3em] mb-1"
              style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(251, 191, 36, 0.5)' }}>
              Grand Prize
            </p>
            <p className="text-sm sm:text-lg"
              style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#fbbf24' }}>
              Ceremonial Robe + Ocean Bracelet + \u20B91,000
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
