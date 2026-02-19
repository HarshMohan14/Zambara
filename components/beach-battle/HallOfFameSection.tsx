'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import { TribeIcon, CrownIcon, TrophyIcon, ShieldIcon, OceanIcon, SwordsIcon, getDisplayColor, TRIBES } from './TribeIcons'

// ═══════════════════════════════════════════════════════════
// Types — synced with admin panel data model
// ═══════════════════════════════════════════════════════════

interface CompletedGame {
  id: string
  slotNumber: number
  tribe: string
  status: string
  warrior?: string
  warriorId?: string
  zampion?: string
  zampionId?: string
  zampionTribe?: string
}

// Creative upcoming line — fixed to avoid hydration mismatch
const UPCOMING_LINE = 'The tides are gathering. Soon, legends will be written in salt and fury.'

// ═══════════════════════════════════════════════════════════
// Component — ALWAYS renders, syncs with admin panel state
// Shows: upcoming → warriors qualified → Zampion round → Zampion winner
// ═══════════════════════════════════════════════════════════

export function HallOfFameSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const [completedGames, setCompletedGames] = useState<CompletedGame[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/beach-battle/live')
        const json = await res.json()
        if (json.success && json.data) {
          setCompletedGames(json.data.completed || [])
        }
      } catch { /* silent */ }
    }
    fetchData()
    const interval = setInterval(fetchData, 15000)
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
            scrollTrigger: { trigger: titleRef.current, start: 'top 85%', toggleActions: 'play none none none' }
          }
        )
      }
      if (gridRef.current) {
        gsap.fromTo(Array.from(gridRef.current.children),
          { opacity: 0, y: 40, scale: 0.95 },
          {
            opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.15, ease: 'back.out(1.2)',
            scrollTrigger: { trigger: gridRef.current, start: 'top 82%', toggleActions: 'play none none none' }
          }
        )
      }
    }, sectionRef)
    return () => { ctx.revert() }
  }, [])

  // Derive warriors from completed games (one per tribe)
  const warriors: { name: string; tribe: string }[] = []
  const seenTribes = new Set<string>()
  for (const g of completedGames) {
    if (g.warrior && !seenTribes.has(g.tribe)) {
      warriors.push({ name: g.warrior, tribe: g.tribe })
      seenTribes.add(g.tribe)
    }
  }

  // Check for Zampion
  const zampionGame = completedGames.find(g => g.zampion && g.zampionTribe)
  const zampion = zampionGame ? { name: zampionGame.zampion!, tribe: zampionGame.zampionTribe! } : null

  // States
  const hasData = completedGames.length > 0
  const allTribesCompleted = warriors.length >= 4
  const hasZampion = !!zampion

  return (
    <section
      ref={sectionRef}
      id="hall-of-fame"
      aria-label="Hall of Fame"
      className="relative w-full py-14 sm:py-20 md:py-28 lg:py-32 overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.5]"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.5) 100%)' }} />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.4), transparent 60%)', filter: 'blur(100px)' }} />
        <div className="absolute bottom-1/3 left-1/4 w-[200px] h-[200px] md:w-[350px] md:h-[350px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.4), transparent 60%)', filter: 'blur(80px)' }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.15), transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.15), transparent)' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* ── HEADER ── */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <CrownIcon size={16} />
            <span className="text-xs uppercase tracking-[0.25em] font-semibold"
              style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(251,191,36,0.7)' }}>
              Warriors &amp; Zampions
            </span>
          </div>

          <h2 ref={titleRef}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold uppercase mb-3"
            style={{
              fontFamily: "'TheWalkyrDemo', serif",
              color: '#fbbf24',
              textShadow: '0 0 40px rgba(251,191,36,0.2), 0 0 80px rgba(251,191,36,0.08), 2px 4px 8px rgba(0,0,0,0.6)',
            }}>
            Hall of Fame
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-white/40 max-w-xs sm:max-w-md lg:max-w-lg mx-auto"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
            {hasZampion
              ? 'The Zampion has been crowned. The legend is immortalized.'
              : hasData
                ? allTribesCompleted
                  ? 'All tribe warriors have risen. The Zampion Round awaits the ultimate champion.'
                  : 'The warriors are rising from the clash. The Hall of Fame awaits its legends.'
                : 'Where legends will be immortalized after the battle.'}
          </p>
          <div className="flex justify-center mt-4">
            <div className="w-20 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.4), transparent)' }} />
          </div>
        </div>

        {/* ── NO DATA: UPCOMING STATE ── */}
        {!hasData && (
          <div ref={gridRef} className="max-w-3xl mx-auto relative z-10">
            <div className="rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, rgba(6,30,50,0.85) 0%, rgba(0,0,0,0.95) 100%)',
                border: '1px solid rgba(251,191,36,0.2)',
              }}>
              <div className="absolute inset-0 pointer-events-none opacity-[0.015]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fbbf24' fill-opacity='0.5'%3E%3Cpath d='M30 8l6 12 14 2-10 10 2 14-12-6-12 6 2-14L10 22l14-2z'/%3E%3C/g%3E%3C/svg%3E")`,
                }} />

              <div className="flex justify-center items-center gap-4 mb-6">
                <OceanIcon size={32} className="opacity-25" />
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center"
                  style={{
                    background: 'radial-gradient(circle, rgba(251,191,36,0.1), rgba(0,0,0,0.4))',
                    border: '1.5px solid rgba(251,191,36,0.15)',
                    boxShadow: '0 0 30px rgba(251,191,36,0.05)',
                  }}>
                  <CrownIcon size={40} />
                </div>
                <OceanIcon size={32} className="opacity-25" />
              </div>

              <p className="text-sm sm:text-base text-white/35 mb-4 max-w-md mx-auto italic leading-relaxed"
                style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
                &ldquo;{UPCOMING_LINE}&rdquo;
              </p>

              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full"
                style={{
                  background: 'rgba(251,191,36,0.06)',
                  border: '1px solid rgba(251,191,36,0.15)',
                }}>
                <TrophyIcon size={16} />
                <span className="text-xs uppercase tracking-[0.25em] font-semibold"
                  style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(251,191,36,0.5)' }}>
                  Battles Upcoming
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
                {TRIBES.map(tribe => {
                  const color = getDisplayColor(tribe.name)
                  return (
                    <div key={tribe.name} className="rounded-xl p-3 sm:p-4 text-center"
                      style={{
                        background: `${color}05`,
                        border: `1px dashed ${color}15`,
                      }}>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mx-auto mb-2 flex items-center justify-center opacity-40"
                        style={{
                          background: `radial-gradient(circle, ${color}20, ${color}05)`,
                          border: `1px solid ${color}15`,
                        }}>
                        <TribeIcon tribe={tribe.name} size={20} />
                      </div>
                      <p className="text-[10px] uppercase tracking-wider mb-1"
                        style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: `${color}40` }}>
                        {tribe.name}
                      </p>
                      <p className="text-[9px] uppercase tracking-wider text-white/15"
                        style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
                        Warrior TBD
                      </p>
                    </div>
                  )
                })}
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-[2px]"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.15), transparent)' }} />
            </div>
          </div>
        )}

        {/* ── HAS DATA: Warriors, Zampion Round, Zampion Result ── */}
        {hasData && (
          <div ref={gridRef} className="max-w-4xl mx-auto">
            {/* Warriors section */}
            <div className="rounded-2xl overflow-hidden relative mb-8"
              style={{
                background: 'linear-gradient(160deg, rgba(6,30,50,0.5) 0%, rgba(0,0,0,0.8) 100%)',
                border: '1px solid rgba(251,191,36,0.15)',
              }}>
              {/* Warriors header */}
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(145deg, rgba(6,182,212,0.12), rgba(0,0,0,0.5))',
                      border: '1.5px solid rgba(6,182,212,0.25)',
                    }}>
                    <ShieldIcon size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold uppercase"
                      style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#e2e8f0' }}>
                      Tribe Warriors
                    </h3>
                    <p className="text-xs text-white/25 uppercase tracking-wider"
                      style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
                      {warriors.length} of 4 warriors qualified
                      {allTribesCompleted ? ' — All tribes complete' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 Tribe Warrior cards — shows each tribe's warrior or awaiting */}
              <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {TRIBES.map(tribe => {
                    const warrior = warriors.find(w => w.tribe === tribe.name)
                    const color = getDisplayColor(tribe.name)
                    const isZampion = zampion?.name === warrior?.name
                    return (
                      <div key={tribe.name}
                        className="rounded-xl p-3 sm:p-4 text-center relative overflow-hidden transition-all duration-300"
                        style={{
                          background: isZampion
                            ? `linear-gradient(160deg, rgba(251,191,36,0.08), ${color}06, rgba(0,0,0,0.5))`
                            : warrior
                              ? `linear-gradient(160deg, ${color}10, rgba(0,0,0,0.4))`
                              : 'rgba(0,0,0,0.3)',
                          border: `1px solid ${isZampion ? 'rgba(251,191,36,0.3)' : warrior ? `${color}25` : 'rgba(255,255,255,0.05)'}`,
                          boxShadow: isZampion ? '0 0 20px rgba(251,191,36,0.06)' : 'none',
                        }}>
                        {isZampion && (
                          <div className="absolute top-1 right-1">
                            <CrownIcon size={14} />
                          </div>
                        )}
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                          style={{
                            background: `radial-gradient(circle, ${color}${warrior ? '25' : '10'}, ${color}05)`,
                            border: `1px solid ${color}${warrior ? '25' : '10'}`,
                            opacity: warrior ? 1 : 0.5,
                          }}>
                          <TribeIcon tribe={tribe.name} size={22} />
                        </div>
                        <p className="text-[10px] uppercase tracking-wider mb-0.5"
                          style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: `${color}${warrior ? '' : '40'}` }}>
                          {tribe.name}
                        </p>
                        {warrior ? (
                          <>
                            <p className="text-xs sm:text-sm font-bold truncate"
                              style={{
                                fontFamily: "'BlinkerSemiBold', sans-serif",
                                color: isZampion ? '#fbbf24' : color,
                              }}>
                              {warrior.name}
                            </p>
                            <p className="text-[9px] text-white/25 uppercase tracking-wider mt-0.5"
                              style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
                              Warrior
                            </p>
                          </>
                        ) : (
                          <div className="h-8 rounded-lg flex items-center justify-center mt-1"
                            style={{ border: `1px dashed ${color}15`, background: 'rgba(0,0,0,0.3)' }}>
                            <span className="text-[9px] uppercase tracking-wider" style={{ color: `${color}20` }}>
                              Pending
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* ── ZAMPION ROUND — shows when all 4 tribes complete but no zampion yet ── */}
            {allTribesCompleted && !hasZampion && (
              <div className="rounded-2xl overflow-hidden relative mb-8"
                style={{
                  background: 'linear-gradient(160deg, rgba(6,30,50,0.4) 0%, rgba(0,0,0,0.85) 100%)',
                  border: '1px dashed rgba(251,191,36,0.2)',
                }}>
                <div className="p-6 sm:p-8 text-center">
                  <div className="flex justify-center items-center gap-3 mb-4">
                    <SwordsIcon size={24} className="opacity-40" />
                    <CrownIcon size={32} />
                    <SwordsIcon size={24} className="opacity-40" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold uppercase mb-2"
                    style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#fbbf24', textShadow: '0 0 20px rgba(251,191,36,0.15)' }}>
                    Zampion Round
                  </h3>
                  <p className="text-sm text-white/30 mb-4 italic max-w-md mx-auto"
                    style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
                    &ldquo;The throne awaits its conqueror. Four warriors, one crown. The Zampion Round is being played.&rdquo;
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full animate-pulse"
                    style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold"
                      style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(251,191,36,0.5)' }}>
                      Awaiting the Zampion
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── ZAMPION CROWNED — final champion display ── */}
            {hasZampion && zampion && (
              <div className="rounded-2xl overflow-hidden relative"
                style={{
                  background: 'linear-gradient(160deg, rgba(251,191,36,0.06) 0%, rgba(0,0,0,0.85) 100%)',
                  border: '1.5px solid rgba(251,191,36,0.25)',
                  boxShadow: '0 0 40px rgba(251,191,36,0.06), 0 0 80px rgba(251,191,36,0.02)',
                }}>
                <div className="absolute inset-0 pointer-events-none opacity-[0.015]"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fbbf24' fill-opacity='0.5'%3E%3Cpath d='M30 8l6 12 14 2-10 10 2 14-12-6-12 6 2-14L10 22l14-2z'/%3E%3C/g%3E%3C/svg%3E")`,
                  }} />

                <div className="p-6 sm:p-8 text-center relative">
                  <CrownIcon size={42} className="mx-auto mb-3" />

                  <p className="text-[10px] uppercase tracking-[0.3em] mb-1"
                    style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(251,191,36,0.5)' }}>
                    Zampion of the Tides
                  </p>

                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase mb-3"
                    style={{
                      fontFamily: "'TheWalkyrDemo', serif",
                      color: '#fbbf24',
                      textShadow: '0 0 25px rgba(251,191,36,0.3), 0 0 50px rgba(251,191,36,0.1)',
                    }}>
                    {zampion.name}
                  </h3>

                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                    style={{
                      background: `${getDisplayColor(zampion.tribe)}10`,
                      border: `1px solid ${getDisplayColor(zampion.tribe)}25`,
                    }}>
                    <TribeIcon tribe={zampion.tribe} size={18} />
                    <span className="text-sm uppercase tracking-wider font-bold"
                      style={{ color: getDisplayColor(zampion.tribe) }}>
                      {zampion.tribe} Tribe
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{ background: 'linear-gradient(90deg, transparent, #fbbf24, transparent)', opacity: 0.3 }} />
                </div>
              </div>
            )}

            {/* Not all warriors yet — waiting message */}
            {!allTribesCompleted && warriors.length > 0 && (
              <div className="text-center mt-4">
                <p className="text-xs text-white/20 uppercase tracking-wider"
                  style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
                  Tribe battles in progress &mdash; {4 - warriors.length} more warrior{4 - warriors.length !== 1 ? 's' : ''} needed
                </p>
                <div className="flex justify-center gap-2 mt-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-3 h-3 rounded-full"
                      style={{
                        background: i <= warriors.length ? '#fbbf24' : 'rgba(255,255,255,0.1)',
                        boxShadow: i <= warriors.length ? '0 0 8px rgba(251,191,36,0.3)' : 'none',
                      }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
