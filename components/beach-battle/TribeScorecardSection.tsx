'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import { TribeIcon, CrownIcon, ShieldIcon, OceanIcon, TrophyIcon, getDisplayColor, TRIBES } from './TribeIcons'

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
          { opacity: 0, y: 50, filter: 'blur(8px)' },
          {
            opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.4, ease: 'power3.out',
            scrollTrigger: { trigger: titleRef.current, start: 'top 85%', toggleActions: 'play none none reverse' }
          }
        )
      }
      if (gridRef.current) {
        gsap.fromTo(Array.from(gridRef.current.children),
          { opacity: 0, y: 40, scale: 0.85 },
          {
            opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12, ease: 'back.out(1.4)',
            scrollTrigger: { trigger: gridRef.current, start: 'top 82%', toggleActions: 'play none none reverse' }
          }
        )
      }
    }, sectionRef)
    return () => { ctx.revert() }
  }, [])

  if (scores.length === 0) return null

  const totalZampions = scores.reduce((sum, s) => sum + s.zampionCount, 0)
  if (totalZampions === 0 && scores.every(s => s.warriorCount === 0)) return null

  // Find the leading tribe
  const maxZampions = Math.max(...scores.map(s => s.zampionCount))
  const leadingTribes = scores.filter(s => s.zampionCount === maxZampions && maxZampions > 0)

  return (
    <section
      ref={sectionRef}
      id="tribe-scorecard"
      aria-label="Tribe Scorecard"
      className="relative w-full py-14 sm:py-20 md:py-28 lg:py-32 overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.5]"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.5) 100%)' }} />
        {/* Ocean teal ambient */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.4), transparent 60%)', filter: 'blur(100px)' }} />
        {/* Borders */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.15), transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.15), transparent)' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
            <OceanIcon size={16} />
            <span className="text-xs uppercase tracking-[0.25em] font-semibold"
              style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(6,182,212,0.7)' }}>
              Battle Statistics
            </span>
          </div>

          <h2 ref={titleRef}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold uppercase mb-3 opacity-0"
            style={{
              fontFamily: "'TheWalkyrDemo', serif",
              color: '#e2e8f0',
              textShadow: '0 0 40px rgba(6,182,212,0.2), 0 0 80px rgba(6,182,212,0.08), 2px 4px 8px rgba(0,0,0,0.6)',
            }}>
            Tribe Scorecard
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-white/45 max-w-xs sm:max-w-md lg:max-w-lg mx-auto"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
            The number of Zampions crowned from each tribe across all battle slots.
          </p>
          <div className="flex justify-center mt-4">
            <div className="w-20 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.4), transparent)' }} />
          </div>
        </div>

        {/* Total Zampions banner */}
        {totalZampions > 0 && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl"
              style={{
                background: 'linear-gradient(160deg, rgba(251,191,36,0.06), rgba(0,0,0,0.5))',
                border: '1px solid rgba(251,191,36,0.15)',
                boxShadow: '0 0 25px rgba(251,191,36,0.04)',
              }}>
              <TrophyIcon size={24} />
              <div className="text-left">
                <p className="text-2xl sm:text-3xl font-bold"
                  style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#fbbf24' }}>
                  {totalZampions}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-yellow-400/50"
                  style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
                  Total Zampions Crowned
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Scorecard Grid */}
        <div ref={gridRef} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-4xl mx-auto">
          {scores.map(score => {
            const tribe = TRIBES.find(t => t.name === score.tribe)
            const color = tribe ? getDisplayColor(score.tribe) : '#ccc'
            const isLeading = leadingTribes.some(t => t.tribe === score.tribe) && maxZampions > 0

            return (
              <div key={score.tribe}
                className="rounded-xl p-4 sm:p-6 text-center relative overflow-hidden group"
                style={{
                  background: isLeading
                    ? `linear-gradient(160deg, ${color}0c, rgba(251,191,36,0.04), rgba(0,0,0,0.7))`
                    : `linear-gradient(160deg, ${color}08, rgba(0,0,0,0.7))`,
                  border: `1.5px solid ${isLeading ? 'rgba(251,191,36,0.25)' : `${color}20`}`,
                  boxShadow: isLeading ? `0 0 25px rgba(251,191,36,0.06)` : 'none',
                  opacity: 0,
                }}>
                {/* Leading badge */}
                {isLeading && (
                  <div className="absolute top-2 right-2">
                    <CrownIcon size={16} />
                  </div>
                )}

                {/* Tribe icon */}
                <div className="mb-3 flex justify-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `radial-gradient(circle at 40% 35%, ${color}35, ${color}08)`,
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
                  {/* Zampion count */}
                  <div className="rounded-lg p-2.5 relative overflow-hidden"
                    style={{
                      background: isLeading ? 'rgba(251,191,36,0.08)' : 'rgba(251,191,36,0.04)',
                      border: `1px solid ${isLeading ? 'rgba(251,191,36,0.15)' : 'rgba(251,191,36,0.08)'}`,
                    }}>
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <CrownIcon size={14} />
                      <p className="text-2xl sm:text-3xl font-bold"
                        style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#fbbf24' }}>
                        {score.zampionCount}
                      </p>
                    </div>
                    <p className="text-[10px] uppercase tracking-wider text-yellow-400/50"
                      style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
                      Zampions
                    </p>
                  </div>

                  {/* Warrior count */}
                  <div className="rounded-lg p-2.5"
                    style={{ background: `${color}06`, border: `1px solid ${color}0c` }}>
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <ShieldIcon size={14} />
                      <p className="text-xl sm:text-2xl font-bold"
                        style={{ fontFamily: "'TheWalkyrDemo', serif", color }}>
                        {score.warriorCount}
                      </p>
                    </div>
                    <p className="text-[10px] uppercase tracking-wider"
                      style={{ fontFamily: "'BlinkerRegular', sans-serif", color: `${color}60` }}>
                      Warriors
                    </p>
                  </div>
                </div>

                {/* Bottom glow */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] transition-opacity duration-500"
                  style={{ background: `linear-gradient(90deg, transparent, ${isLeading ? '#fbbf24' : color}40, transparent)` }} />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
