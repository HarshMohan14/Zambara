'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import { TribeIcon, getDisplayColor } from './TribeIcons'

interface Matchup {
  table: number
  player1: string
  player2: string
  status: string
  winner?: string
}

interface LiveGame {
  id: string
  slotNumber: number
  tribe: string
  status: string
  matchups: Matchup[]
  warrior?: string
  zampion?: string
  zampionTribe?: string
}

interface LiveData {
  live: LiveGame[]
  completed: LiveGame[]
}

export function LiveArenaSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [data, setData] = useState<LiveData | null>(null)

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const res = await fetch('/api/beach-battle/live')
        const json = await res.json()
        if (json.success && json.data) setData(json.data)
      } catch { /* silent */ }
    }
    fetchLive()
    const interval = setInterval(fetchLive, 10000)
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
    }, sectionRef)
    return () => { ctx.revert() }
  }, [])

  const liveGames = data?.live || []
  const hasLive = liveGames.length > 0

  if (!hasLive) return null

  return (
    <section
      ref={sectionRef}
      id="live-arena"
      aria-label="Live Arena"
      className="relative w-full py-14 sm:py-20 md:py-28 lg:py-32 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.45]"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.5) 100%)' }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 md:w-[500px] md:h-[500px] rounded-full opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.3), transparent 60%)', filter: 'blur(80px)' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs uppercase tracking-[0.25em] font-semibold"
              style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#22c55e' }}>
              Live Now
            </span>
          </div>
          <h2 ref={titleRef}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold uppercase mb-3 opacity-0"
            style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#e2e8f0', textShadow: '0 0 40px rgba(34,197,94,0.2), 2px 4px 8px rgba(0,0,0,0.6)' }}>
            The Arena
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-white/50 max-w-xs sm:max-w-md lg:max-w-lg mx-auto"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
            Battles are raging. Watch the warriors clash in real time.
          </p>
        </div>

        {/* Live Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {liveGames.map(game => {
            const color = getDisplayColor(game.tribe)
            return (
              <div key={game.id} className="rounded-xl p-4 sm:p-5 relative overflow-hidden"
                style={{
                  background: `linear-gradient(145deg, ${color}10 0%, rgba(0,0,0,0.8) 100%)`,
                  border: `1.5px solid ${color}35`,
                  boxShadow: `0 0 30px ${color}10`,
                }}>
                {/* Tribe badge */}
                <div className="flex items-center gap-2 mb-4">
                  <TribeIcon tribe={game.tribe} size={24} />
                  <span className="text-sm font-bold uppercase tracking-wider"
                    style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color }}>
                    {game.tribe}
                  </span>
                  <span className="ml-auto text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse mr-1" />
                    Live
                  </span>
                </div>

                {/* Matchups */}
                <div className="space-y-2">
                  {game.matchups.map((m, i) => (
                    <div key={i} className="rounded-lg p-2.5"
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/20 mr-2">T{m.table}</span>
                        <div className="flex-1 text-center">
                          <span className={`text-xs sm:text-sm font-semibold ${m.winner === m.player1 ? 'text-green-400' : 'text-white/70'}`}>
                            {m.player1}
                          </span>
                          <span className="text-xs text-white/20 mx-1.5">vs</span>
                          <span className={`text-xs sm:text-sm font-semibold ${m.winner === m.player2 ? 'text-green-400' : 'text-white/70'}`}>
                            {m.player2}
                          </span>
                        </div>
                      </div>
                      {m.status === 'live' && (
                        <div className="text-center mt-1">
                          <span className="text-[9px] uppercase tracking-wider text-green-400/60 animate-pulse">In Progress</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Slot badge */}
                <p className="text-center text-[10px] text-white/15 mt-3 uppercase tracking-wider">
                  Slot #{game.slotNumber}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
