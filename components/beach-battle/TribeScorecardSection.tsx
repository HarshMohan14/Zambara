'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import { TribeIcon, getDisplayColor, TRIBES } from './TribeIcons'

interface TribeScore {
  tribe: string
  zampionCount: number
  warriorCount: number
}

export function TribeScorecardSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const [scores, setScores] = useState<TribeScore[]>([])

  useEffect(() => {
    const fetchScorecard = async () => {
      try {
        const res = await fetch('/api/beach-battle/scorecard')
        const json = await res.json()
        if (json.success && json.data) setScores(json.data)
      } catch { /* silent */ }
    }
    fetchScorecard()
    const interval = setInterval(fetchScorecard, 30000)
    return () => clearInterval(interval)
  }, [])

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
          { opacity: 0, y: 30, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.3)',
            scrollTrigger: { trigger: gridRef.current, start: 'top 82%', toggleActions: 'play none none reverse' } }
        )
      }
    }, sectionRef)
    return () => { ctx.revert() }
  }, [])

  if (scores.length === 0) return null

  const totalZampions = scores.reduce((sum, s) => sum + s.zampionCount, 0)
  if (totalZampions === 0 && scores.every(s => s.warriorCount === 0)) return null

  return (
    <section
      ref={sectionRef}
      id="tribe-scorecard"
      aria-label="Tribe Scorecard"
      className="relative w-full py-14 sm:py-20 md:py-28 lg:py-32 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.45]"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.5) 100%)' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <p className="text-sm sm:text-base uppercase tracking-[0.35em] mb-3"
            style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(6, 182, 212, 0.6)' }}>
            Battle Statistics
          </p>
          <h2 ref={titleRef}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold uppercase mb-3 opacity-0"
            style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#e2e8f0', textShadow: '0 0 40px rgba(6, 182, 212, 0.2), 2px 4px 8px rgba(0,0,0,0.6)' }}>
            Tribe Scorecard
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-white/50 max-w-xs sm:max-w-md lg:max-w-lg mx-auto"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
            The number of Zampions crowned from each tribe across all battle slots.
          </p>
        </div>

        {/* Scorecard Grid */}
        <div ref={gridRef} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-4xl mx-auto">
          {scores.map(score => {
            const tribe = TRIBES.find(t => t.name === score.tribe)
            const color = tribe ? getDisplayColor(score.tribe) : '#ccc'
            return (
              <div key={score.tribe}
                className="rounded-xl p-4 sm:p-6 text-center relative overflow-hidden"
                style={{
                  background: `linear-gradient(145deg, ${color}08, rgba(0,0,0,0.7))`,
                  border: `1.5px solid ${color}25`,
                  opacity: 0,
                }}>
                {/* Tribe icon */}
                <div className="mb-3 flex justify-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center"
                    style={{
                      background: `radial-gradient(circle at 40% 35%, ${color}40, ${color}10)`,
                      border: `1.5px solid ${color}30`,
                      boxShadow: `0 0 20px ${color}10`,
                    }}>
                    <TribeIcon tribe={score.tribe} size={28} />
                  </div>
                </div>

                {/* Tribe name */}
                <p className="text-sm sm:text-base font-bold uppercase tracking-wider mb-3"
                  style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color }}>
                  {score.tribe}
                </p>

                {/* Stats */}
                <div className="space-y-2">
                  <div className="rounded-lg p-2"
                    style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.1)' }}>
                    <p className="text-2xl sm:text-3xl font-bold"
                      style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#fbbf24' }}>
                      {score.zampionCount}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-yellow-400/50"
                      style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
                      Zampions
                    </p>
                  </div>

                  <div className="rounded-lg p-2"
                    style={{ background: `${color}06`, border: `1px solid ${color}10` }}>
                    <p className="text-xl sm:text-2xl font-bold"
                      style={{ fontFamily: "'TheWalkyrDemo', serif", color }}>
                      {score.warriorCount}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider"
                      style={{ fontFamily: "'BlinkerRegular', sans-serif", color: `${color}60` }}>
                      Warriors
                    </p>
                  </div>
                </div>

                {/* Bottom glow */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px]"
                  style={{ background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }} />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
