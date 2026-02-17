'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap, createTimeline } from '@/lib/gsap'

interface BracketRound {
  name: string
  subtitle: string
  playersIn: number
  playersOut: number
  icon: string
  color: string
  description: string
  bgAccent: string
  details: string[]
}

const rounds: BracketRound[] = [
  {
    name: 'Rising Tide',
    subtitle: 'Round 1 — The Gauntlet',
    playersIn: 16,
    playersOut: 4,
    icon: '🌊',
    color: '#0891b2',
    bgAccent: 'rgba(8, 145, 178, 0.1)',
    description: '16 warriors enter the arena across 4 elemental tables. Battles rage simultaneously — only the strongest from each table survives.',
    details: ['4 Tables × 4 Players', '3-Minute Rounds', 'Collect 4 Bracelets to Win', '1 Survivor Per Table'],
  },
  {
    name: 'Zampion Round',
    subtitle: 'The Final Showdown',
    playersIn: 4,
    playersOut: 1,
    icon: '👑',
    color: '#fbbf24',
    bgAccent: 'rgba(251, 191, 36, 0.08)',
    description: 'The 4 surviving warriors face off in the ultimate clash. One will rise above all to claim the title: Zampion of the Tides.',
    details: ['1 Final Table', 'All-Out Battle', 'Ceremonial Robe Awarded', 'Hall of Fame Entry'],
  },
]

interface HallOfFameEntry {
  rank: number
  title: string
  name: string
  tribe: string
  icon: string
  color: string
  borderColor: string
  tribeColor: string
}

const hallOfFame: HallOfFameEntry[] = [
  { rank: 1, title: 'Zampion of the Tides', name: 'To Be Crowned', tribe: '—', icon: '👑', color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.4)', tribeColor: '#fbbf24' },
  { rank: 2, title: 'Second Wave', name: 'Awaiting', tribe: '—', icon: '🥈', color: '#94a3b8', borderColor: 'rgba(148, 163, 184, 0.25)', tribeColor: '#94a3b8' },
  { rank: 3, title: 'Third Current', name: 'Awaiting', tribe: '—', icon: '🥉', color: '#d97706', borderColor: 'rgba(217, 119, 6, 0.25)', tribeColor: '#d97706' },
  { rank: 4, title: 'Fourth Shore', name: 'Awaiting', tribe: '—', icon: '✦', color: '#64748b', borderColor: 'rgba(100, 116, 139, 0.2)', tribeColor: '#64748b' },
]

export function BracketSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const flowRef = useRef<HTMLDivElement>(null)
  const fameRef = useRef<HTMLDivElement>(null)
  const [activeRound, setActiveRound] = useState<number | null>(null)
  const [fameIndex, setFameIndex] = useState(0)
  const [fameTouchStart, setFameTouchStart] = useState<number | null>(null)
  const [fameTouchEnd, setFameTouchEnd] = useState<number | null>(null)

  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      // Title
      if (titleRef.current) {
        gsap.fromTo(titleRef.current,
          { opacity: 0, y: 40, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out',
            scrollTrigger: { trigger: titleRef.current, start: 'top 85%', toggleActions: 'play none none reverse' } }
        )
      }

      // Flow numbers: 16 → 4 → 1 animate in
      if (flowRef.current) {
        const flowElements = flowRef.current.querySelectorAll('.flow-item')
        gsap.fromTo(flowElements,
          { opacity: 0, scale: 0.5, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.2, ease: 'back.out(1.5)',
            scrollTrigger: { trigger: flowRef.current, start: 'top 82%', toggleActions: 'play none none reverse' } }
        )
      }

      // Timeline round cards
      if (timelineRef.current) {
        const roundCards = timelineRef.current.querySelectorAll('.round-card')
        gsap.fromTo(roundCards,
          { opacity: 0, x: -50, scale: 0.95 },
          { opacity: 1, x: 0, scale: 1, duration: 0.8, stagger: 0.25, ease: 'power3.out',
            scrollTrigger: { trigger: timelineRef.current, start: 'top 78%', toggleActions: 'play none none reverse' } }
        )
      }

      // Hall of Fame
      if (fameRef.current) {
        gsap.fromTo(fameRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: fameRef.current, start: 'top 85%', toggleActions: 'play none none reverse' } }
        )
      }
    }, sectionRef)
    return () => { ctx.revert() }
  }, [])

  // Hall of Fame touch handlers
  const handleFameTouchStart = (e: React.TouchEvent) => {
    setFameTouchEnd(null)
    setFameTouchStart(e.targetTouches[0].clientX)
  }
  const handleFameTouchMove = (e: React.TouchEvent) => {
    setFameTouchEnd(e.targetTouches[0].clientX)
  }
  const handleFameTouchEnd = () => {
    if (!fameTouchStart || !fameTouchEnd) return
    const dist = fameTouchStart - fameTouchEnd
    if (Math.abs(dist) > 50) {
      if (dist > 0) setFameIndex(p => Math.min(p + 1, hallOfFame.length - 1))
      else setFameIndex(p => Math.max(p - 1, 0))
    }
  }

  return (
    <section
      ref={sectionRef}
      id="bracket"
      className="relative w-full py-14 sm:py-20 md:py-28 overflow-hidden"
      aria-label="Tournament Structure"
    >
      {/* Subtle section overlay — transparent, unified bg shows through */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.45]"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.5) 100%)' }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 md:w-[500px] md:h-[500px] rounded-full opacity-[0.05]"
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
        </div>

        {/* Visual Flow: 16 → 4 → 1 — cinematic number display */}
        <div ref={flowRef} className="flex justify-center items-center gap-3 sm:gap-5 mb-10 sm:mb-14">
          {/* 16 Warriors */}
          <div className="flow-item text-center" style={{ opacity: 0 }}>
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-2 relative"
              style={{
                background: 'linear-gradient(145deg, rgba(8, 145, 178, 0.15), rgba(0,0,0,0.6))',
                border: '2px solid rgba(8, 145, 178, 0.35)',
                boxShadow: '0 0 30px rgba(8, 145, 178, 0.1)',
              }}>
              <span className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#0891b2' }}>16</span>
            </div>
            <div className="text-[9px] sm:text-[10px] uppercase tracking-wider" style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(8, 145, 178, 0.7)' }}>Warriors</div>
          </div>

          {/* Arrow */}
          <div className="flow-item flex flex-col items-center" style={{ opacity: 0 }}>
            <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 40 40">
              <defs>
                <linearGradient id="arrowGrad1" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0891b2" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <path d="M8 20h18m0 0l-6-6m6 6l-6 6" stroke="url(#arrowGrad1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[7px] uppercase tracking-wider mt-0.5" style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(6, 182, 212, 0.3)' }}>Rising Tide</span>
          </div>

          {/* 4 Qualifiers */}
          <div className="flow-item text-center" style={{ opacity: 0 }}>
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-2 relative"
              style={{
                background: 'linear-gradient(145deg, rgba(6, 182, 212, 0.15), rgba(0,0,0,0.6))',
                border: '2px solid rgba(6, 182, 212, 0.35)',
                boxShadow: '0 0 30px rgba(6, 182, 212, 0.1)',
              }}>
              <span className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#06b6d4' }}>4</span>
            </div>
            <div className="text-[9px] sm:text-[10px] uppercase tracking-wider" style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(6, 182, 212, 0.7)' }}>Qualifiers</div>
          </div>

          {/* Arrow */}
          <div className="flow-item flex flex-col items-center" style={{ opacity: 0 }}>
            <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 40 40">
              <defs>
                <linearGradient id="arrowGrad2" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.5" />
                </linearGradient>
              </defs>
              <path d="M8 20h18m0 0l-6-6m6 6l-6 6" stroke="url(#arrowGrad2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[7px] uppercase tracking-wider mt-0.5" style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(251, 191, 36, 0.3)' }}>Zampion</span>
          </div>

          {/* 1 Champion */}
          <div className="flow-item text-center" style={{ opacity: 0 }}>
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-2 relative"
              style={{
                background: 'linear-gradient(145deg, rgba(251, 191, 36, 0.15), rgba(0,0,0,0.6))',
                border: '2px solid rgba(251, 191, 36, 0.4)',
                boxShadow: '0 0 35px rgba(251, 191, 36, 0.1)',
              }}>
              <span className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#fbbf24' }}>1</span>
              <span className="absolute -top-1 -right-1 text-lg">👑</span>
            </div>
            <div className="text-[9px] sm:text-[10px] uppercase tracking-wider" style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(251, 191, 36, 0.7)' }}>Zampion</div>
          </div>
        </div>

        {/* Animated Timeline - vertical for mobile */}
        <div ref={timelineRef} className="max-w-md sm:max-w-lg mx-auto mb-14 sm:mb-18 relative">
          {/* Vertical timeline line */}
          <div className="absolute left-5 sm:left-7 top-0 bottom-0 w-px"
            style={{ background: 'linear-gradient(to bottom, #0891b2, #06b6d4, #fbbf24)' }} />

          {rounds.map((round, index) => {
            const isChampion = index === rounds.length - 1
            const isActive = activeRound === index
            return (
              <div key={round.name} className="round-card relative pl-12 sm:pl-16 mb-6 sm:mb-8 last:mb-0" style={{ opacity: 0 }}>
                {/* Timeline dot */}
                <div className="absolute left-3 sm:left-5 top-4 sm:top-5 w-4 h-4 sm:w-5 sm:h-5 rounded-full z-10 flex items-center justify-center"
                  style={{
                    background: `radial-gradient(circle, ${round.color}, ${round.color}80)`,
                    boxShadow: `0 0 15px ${round.color}40`,
                    border: '2px solid rgba(0,0,0,0.4)',
                  }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                </div>

                {/* Round Card */}
                <div
                  className="rounded-xl p-4 sm:p-6 relative overflow-hidden cursor-pointer transition-all duration-500 active:scale-[0.98]"
                  onClick={() => setActiveRound(isActive ? null : index)}
                  style={{
                    background: isChampion
                      ? 'linear-gradient(145deg, rgba(251, 191, 36, 0.1) 0%, rgba(0,0,0,0.85) 100%)'
                      : `linear-gradient(145deg, ${round.bgAccent} 0%, rgba(0,0,0,0.8) 100%)`,
                    border: `1.5px solid ${isActive ? `${round.color}60` : `${round.color}20`}`,
                    boxShadow: isActive
                      ? `0 0 40px ${round.color}15, 0 10px 30px rgba(0,0,0,0.3)`
                      : '0 4px 20px rgba(0,0,0,0.3)',
                  }}>
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] mb-0.5"
                        style={{ fontFamily: "'BlinkerRegular', sans-serif", color: `${round.color}80` }}>
                        {round.subtitle}
                      </p>
                      <h3 className="text-xl sm:text-2xl font-bold uppercase"
                        style={{
                          fontFamily: "'TheWalkyrDemo', serif",
                          color: isChampion ? '#fbbf24' : round.color,
                          textShadow: `0 0 15px ${round.color}25`,
                        }}>
                        {round.icon} {round.name}
                      </h3>
                    </div>

                    {/* Player count badge */}
                    <div className="flex-shrink-0 text-center px-3 py-2 rounded-lg"
                      style={{ background: `${round.color}08`, border: `1px solid ${round.color}15` }}>
                      <div className="flex items-center gap-1">
                        <span className="text-xl sm:text-2xl font-bold" style={{ fontFamily: "'TheWalkyrDemo', serif", color: round.color }}>
                          {round.playersIn}
                        </span>
                        <svg className="w-3 h-3 opacity-40" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <span className="text-xl sm:text-2xl font-bold"
                          style={{ fontFamily: "'TheWalkyrDemo', serif", color: isChampion ? '#fbbf24' : '#e2e8f0' }}>
                          {round.playersOut}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[10px] sm:text-xs leading-relaxed mb-3"
                    style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(255,255,255,0.45)' }}>
                    {round.description}
                  </p>

                  {/* Detail chips - expand on tap */}
                  <div className="overflow-hidden transition-all duration-500"
                    style={{ maxHeight: isActive ? '120px' : '0px', opacity: isActive ? 1 : 0 }}>
                    <div className="w-full h-px mb-3" style={{ background: `linear-gradient(90deg, transparent, ${round.color}20, transparent)` }} />
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {round.details.map((detail, i) => (
                        <span key={i} className="text-[8px] sm:text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full"
                          style={{
                            fontFamily: "'BlinkerRegular', sans-serif",
                            background: `${round.color}08`,
                            border: `1px solid ${round.color}15`,
                            color: `${round.color}90`,
                          }}>
                          {detail}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tap hint */}
                  <p className="text-[8px] uppercase tracking-wider mt-2"
                    style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(255,255,255,0.15)' }}>
                    {isActive ? '▲ Collapse' : '▼ Tap for details'}
                  </p>

                  {/* Bottom glow line */}
                  <div className="absolute bottom-0 left-0 right-0 h-px transition-all duration-500"
                    style={{ background: isActive ? `linear-gradient(90deg, transparent, ${round.color}, transparent)` : 'transparent' }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* ─── HALL OF FAME ─── */}
        <div ref={fameRef} className="opacity-0">
          {/* Hall of Fame Header */}
          <div className="text-center mb-6 sm:mb-8">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-2"
              style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(251, 191, 36, 0.55)' }}>
              ✦ Hall of Fame ✦
            </p>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold uppercase"
              style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#fbbf24', textShadow: '0 0 30px rgba(251, 191, 36, 0.15)' }}>
              Legends of the Tides
            </h3>
            <p className="text-[10px] sm:text-xs text-white/20 mt-2"
              style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
              Zampion Robe bearers throughout history
            </p>
          </div>

          {/* Mobile carousel for Hall of Fame */}
          <div className="sm:hidden">
            <div className="relative overflow-hidden"
              onTouchStart={handleFameTouchStart}
              onTouchMove={handleFameTouchMove}
              onTouchEnd={handleFameTouchEnd}>
              <div className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${fameIndex * 100}%)` }}>
                {hallOfFame.map((entry) => (
                  <div key={entry.rank} className="w-full flex-shrink-0 px-4">
                    <div className="text-center p-6 rounded-xl relative overflow-hidden"
                      style={{
                        background: entry.rank === 1
                          ? 'linear-gradient(145deg, rgba(251, 191, 36, 0.1) 0%, rgba(0,0,0,0.8) 100%)'
                          : 'linear-gradient(145deg, rgba(30, 41, 59, 0.2) 0%, rgba(0,0,0,0.8) 100%)',
                        border: `1px solid ${entry.borderColor}`,
                        boxShadow: entry.rank === 1 ? '0 0 30px rgba(251, 191, 36, 0.08)' : 'none',
                      }}>
                      {/* Zampion Robe motif for champion */}
                      {entry.rank === 1 && (
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fbbf24' fill-opacity='0.4'%3E%3Cpath d='M40 10l8 16 18 2-13 13 3 18-16-8-16 8 3-18L14 28l18-2z'/%3E%3C/g%3E%3C/svg%3E")`,
                          }} />
                      )}
                      <div className="text-4xl mb-3" style={{ filter: `drop-shadow(0 0 10px ${entry.color}40)` }}>
                        {entry.icon}
                      </div>
                      <div className="text-xs uppercase tracking-wider mb-1"
                        style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(255,255,255,0.25)' }}>
                        #{entry.rank}
                      </div>
                      <div className="text-lg font-bold uppercase mb-2"
                        style={{ fontFamily: "'TheWalkyrDemo', serif", color: entry.color, textShadow: `0 0 15px ${entry.color}25` }}>
                        {entry.title}
                      </div>
                      <div className="h-12 rounded-lg flex items-center justify-center"
                        style={{ border: `1px dashed ${entry.color}20`, background: 'rgba(0,0,0,0.3)' }}>
                        <span className="text-[10px] uppercase tracking-wider"
                          style={{ fontFamily: "'BlinkerRegular', sans-serif", color: `${entry.color}40` }}>
                          {entry.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Carousel dots */}
              <div className="flex justify-center gap-2 mt-4">
                {hallOfFame.map((entry, i) => (
                  <button key={i}
                    onClick={() => setFameIndex(i)}
                    className="transition-all duration-300 rounded-full"
                    style={{
                      width: fameIndex === i ? '24px' : '8px',
                      height: '8px',
                      background: fameIndex === i ? entry.color : 'rgba(255,255,255,0.15)',
                      boxShadow: fameIndex === i ? `0 0 10px ${entry.color}40` : 'none',
                    }}
                    aria-label={`View ${entry.title}`} />
                ))}
              </div>
              <p className="text-center mt-2 text-[9px] uppercase tracking-wider"
                style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(6, 182, 212, 0.25)' }}>
                ← Swipe →
              </p>
            </div>
          </div>

          {/* Desktop grid for Hall of Fame */}
          <div className="hidden sm:grid grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
            {hallOfFame.map((entry) => (
              <div key={entry.rank}
                className="text-center p-4 sm:p-5 rounded-xl transition-all duration-300 group cursor-default relative overflow-hidden"
                style={{
                  background: entry.rank === 1
                    ? 'linear-gradient(145deg, rgba(251, 191, 36, 0.08) 0%, rgba(0,0,0,0.8) 100%)'
                    : 'linear-gradient(145deg, rgba(30, 41, 59, 0.2) 0%, rgba(0,0,0,0.8) 100%)',
                  border: `1px solid ${entry.borderColor}`,
                  boxShadow: entry.rank === 1 ? '0 0 25px rgba(251, 191, 36, 0.06)' : 'none',
                }}>
                <div className="text-2xl sm:text-3xl mb-2 transition-transform duration-300 group-hover:scale-110"
                  style={{ filter: `drop-shadow(0 0 8px ${entry.color}35)` }}>
                  {entry.icon}
                </div>
                <div className="text-[9px] sm:text-xs uppercase tracking-wider mb-1"
                  style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(255,255,255,0.25)' }}>
                  #{entry.rank}
                </div>
                <div className="text-[10px] sm:text-sm font-bold uppercase"
                  style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: entry.color, textShadow: `0 0 10px ${entry.color}25` }}>
                  {entry.title}
                </div>
                <div className="mt-3 h-10 rounded-lg flex items-center justify-center"
                  style={{ border: `1px dashed ${entry.color}20`, background: 'rgba(0,0,0,0.3)' }}>
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-wider"
                    style={{ fontFamily: "'BlinkerRegular', sans-serif", color: `${entry.color}35` }}>
                    {entry.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prize callout */}
        <div className="text-center mt-10 sm:mt-14">
          <div className="inline-block px-5 py-3 sm:px-8 sm:py-4 rounded-xl"
            style={{
              background: 'linear-gradient(145deg, rgba(251, 191, 36, 0.06) 0%, rgba(0,0,0,0.6) 100%)',
              border: '1px solid rgba(251, 191, 36, 0.18)',
              boxShadow: '0 0 25px rgba(251, 191, 36, 0.04)',
            }}>
            <p className="text-[9px] sm:text-xs uppercase tracking-[0.3em] mb-1"
              style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(251, 191, 36, 0.5)' }}>
              Grand Prize
            </p>
            <p className="text-sm sm:text-lg"
              style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#fbbf24' }}>
              🏆 Ceremonial Robe + Ocean Bracelet + ₹1,000
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
