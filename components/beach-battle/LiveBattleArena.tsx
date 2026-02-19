'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import { TribeIcon, OceanIcon, SwordsIcon, CrownIcon, ShieldIcon, LivePulseIcon, getDisplayColor, TRIBES } from './TribeIcons'

// ═══════════════════════════════════════════════════════════
// Types — Synced with admin panel data model
// ═══════════════════════════════════════════════════════════

interface Player {
  name: string
  id?: string
  playerNumber?: number
}

interface Game {
  id: string
  slotNumber: number
  tribe: string
  status: string
  players?: Player[]
  matchups?: { table: number; player1: string; player2: string; player1Id?: string; player2Id?: string; status: string }[]
  warrior?: string
  warriorId?: string
  zampion?: string
  zampionId?: string
  zampionTribe?: string
  createdAt?: string
  updatedAt?: string
}

// ═══════════════════════════════════════════════════════════
// Component — Always renders; syncs with admin panel state
// ═══════════════════════════════════════════════════════════

export function LiveBattleArena() {
  const [games, setGames] = useState<Game[]>([])
  const titleRef = useRef<HTMLHeadingElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  // Fetch from /api/beach-battle/games — same endpoint as admin panel
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch('/api/beach-battle/games?limit=100')
        const json = await res.json()
        if (json.success && json.data) {
          setGames(json.data.games || [])
        }
      } catch { /* silent */ }
    }
    fetchGames()
    const interval = setInterval(fetchGames, 8000)
    return () => clearInterval(interval)
  }, [])

  // GSAP scroll-triggered entrance animations — runs once after first data load
  useEffect(() => {
    if (games.length === 0 || hasAnimated.current) return
    hasAnimated.current = true

    if (titleRef.current) {
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 50,
        filter: 'blur(8px)',
        duration: 1.4,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: titleRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })
    }

    if (contentRef.current) {
      gsap.from(contentRef.current, {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: contentRef.current,
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      })
    }
  }, [games])

  // Derive pending/live/completed from games — same logic as admin panel
  const pendingGames = games.filter(g => g.status === 'pending')
  const liveGames = games.filter(g => g.status === 'live')
  const completedGames = games.filter(g => g.status === 'completed')
  const hasAny = games.length > 0
  const hasLive = liveGames.length > 0

  // Derive the current slot (latest slot that has games)
  const activeSlot = games.length > 0
    ? Math.max(...games.map(g => g.slotNumber))
    : 1

  // Get games for the active slot
  const slotGames = games.filter(g => g.slotNumber === activeSlot)
  const slotLive = slotGames.filter(g => g.status === 'live')
  const slotCompleted = slotGames.filter(g => g.status === 'completed')
  const slotPending = slotGames.filter(g => g.status === 'pending')

  // Warriors from completed games
  const warriors = slotCompleted
    .filter(g => g.warrior)
    .map(g => ({ name: g.warrior!, tribe: g.tribe, gameId: g.id }))

  // All tribe games that were created are now completed? (no pending/live remain)
  const allCreatedTribesCompleted = slotGames.length > 0 && slotLive.length === 0 && slotPending.length === 0

  // Zampion for this slot (if set)
  const zampionGame = slotGames.find(g => g.zampion)
  const zampion = zampionGame ? { name: zampionGame.zampion!, tribe: zampionGame.zampionTribe || '' } : null

  // Determine overall state for the header
  const hasZampion = !!zampion

  return (
    <section
      id="live-arena"
      aria-label="Live Battle Arena"
      className="relative w-full py-14 sm:py-20 md:py-28 lg:py-32 overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.5]"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 12%, transparent 88%, rgba(0,0,0,0.6) 100%)' }} />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.4), transparent 60%)', filter: 'blur(100px)' }} />
        {hasLive && (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[200px] h-[200px] md:w-[400px] md:h-[400px] rounded-full opacity-[0.04] animate-pulse"
            style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.5), transparent 60%)', filter: 'blur(80px)' }} />
        )}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.2), transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.2), transparent)' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* ── HEADER ── */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full mb-5"
            style={{ background: hasLive ? 'rgba(34,197,94,0.1)' : 'rgba(6,182,212,0.08)', border: `1px solid ${hasLive ? 'rgba(34,197,94,0.3)' : 'rgba(6,182,212,0.2)'}` }}>
            {hasLive ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <LivePulseIcon size={18} />
                <span className="text-xs uppercase tracking-[0.25em] font-semibold"
                  style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#22c55e' }}>
                  Battles in Progress
                </span>
              </>
            ) : (
              <>
                <OceanIcon size={18} />
                <span className="text-xs uppercase tracking-[0.25em] font-semibold"
                  style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#06b6d4' }}>
                  Battle Arena
                </span>
              </>
            )}
          </div>

          <h2
            ref={titleRef}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold uppercase mb-3"
            style={{
              fontFamily: "'TheWalkyrDemo', serif",
              color: '#e2e8f0',
              textShadow: '0 0 50px rgba(6,182,212,0.25), 0 0 100px rgba(6,182,212,0.1), 2px 4px 8px rgba(0,0,0,0.7)',
            }}>
            The Battle Arena
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-white/45 max-w-md lg:max-w-xl mx-auto"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
            {hasLive
              ? 'Warriors are clashing right now. Watch the tide turn in real time.'
              : hasAny
                ? hasZampion
                  ? 'The Zampion has risen. The arena has witnessed legendary battles.'
                  : allCreatedTribesCompleted && warriors.length > 0
                    ? 'All tribe battles are complete. The Zampion Round awaits.'
                    : 'Tribal battles are underway. Watch as warriors rise from the clash.'
                : 'The arena awaits. When the tribes clash, their battles will unfold here in real time.'}
          </p>
        </div>

        {/* ── NO GAMES: UPCOMING STATE ── */}
        {!hasAny && (
          <div ref={contentRef} className="max-w-3xl mx-auto relative z-10">
            <div className="rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, rgba(6,30,50,0.85), rgba(0,0,0,0.95))',
                border: '1px solid rgba(6,182,212,0.2)',
              }}>
              <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='40' viewBox='0 0 80 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20C10 10 20 30 30 20C40 10 50 30 60 20C70 10 80 30 80 30' stroke='%2306b6d4' fill='none' stroke-width='1'/%3E%3C/svg%3E")`,
                }} />

              <div className="flex justify-center items-center gap-4 mb-6">
                <ShieldIcon size={28} className="opacity-20" />
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center"
                  style={{
                    background: 'radial-gradient(circle, rgba(6,182,212,0.1), rgba(0,0,0,0.4))',
                    border: '1.5px solid rgba(6,182,212,0.15)',
                    boxShadow: '0 0 30px rgba(6,182,212,0.05)',
                  }}>
                  <SwordsIcon size={40} />
                </div>
                <ShieldIcon size={28} className="opacity-20" />
              </div>

              <p className="text-sm sm:text-base text-white/35 mb-4 max-w-md mx-auto italic leading-relaxed"
                style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
                &ldquo;The drums of war have not yet sounded. When the tribes meet, every clash will appear here — live.&rdquo;
              </p>

              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8"
                style={{
                  background: 'rgba(6,182,212,0.06)',
                  border: '1px solid rgba(6,182,212,0.15)',
                }}>
                <OceanIcon size={16} />
                <span className="text-xs uppercase tracking-[0.25em] font-semibold"
                  style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(6,182,212,0.5)' }}>
                  Live Battles Upcoming
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                      <p className="text-[10px] sm:text-xs uppercase tracking-wider mb-0.5"
                        style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: `${color}40` }}>
                        {tribe.name}
                      </p>
                      <p className="text-[8px] sm:text-[9px] uppercase tracking-wider text-white/15"
                        style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
                        4 Players &middot; Awaiting
                      </p>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(6,182,212,0.08)' }}>
                <div className="flex flex-wrap justify-center items-center gap-2 text-[9px] sm:text-[10px] uppercase tracking-wider"
                  style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>
                  <span style={{ color: 'rgba(6,182,212,0.4)' }}>4 per Tribe</span>
                  <span className="text-white/10">&rarr;</span>
                  <span style={{ color: 'rgba(34,197,94,0.4)' }}>Tribe Fight</span>
                  <span className="text-white/10">&rarr;</span>
                  <span style={{ color: 'rgba(239,68,68,0.4)' }}>1 Warrior</span>
                  <span className="text-white/10">&rarr;</span>
                  <span style={{ color: 'rgba(251,191,36,0.4)' }}>Zampion Round</span>
                  <span className="text-white/10">&rarr;</span>
                  <span style={{ color: 'rgba(251,191,36,0.5)' }}>1 Zampion</span>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-[2px]"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.15), transparent)' }} />
            </div>
          </div>
        )}

        {/* ── HAS GAMES: LIVE ARENA — synced with admin panel ── */}
        {hasAny && (
          <div ref={contentRef}>
            {/* 4 Tribe Status Cards — each shows its real status from admin */}
            <div className="max-w-5xl mx-auto mb-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TRIBES.map(tribe => {
                  const tribeColor = getDisplayColor(tribe.name)
                  const tribeGame = slotGames.find(g => g.tribe === tribe.name)
                  const status = tribeGame?.status || 'awaiting'
                  const isLive = status === 'live'
                  const isCompleted = status === 'completed'
                  const isPending = status === 'pending'
                  const warrior = tribeGame?.warrior
                  const players = tribeGame ? getGamePlayers(tribeGame) : []

                  return (
                    <div key={tribe.name} className="rounded-xl p-3 sm:p-4 relative overflow-hidden transition-all duration-500"
                      style={{
                        background: `linear-gradient(160deg, ${tribeColor}08, rgba(0,0,0,0.6))`,
                        border: `1.5px solid ${isLive ? '#22c55e' : isCompleted ? `${tribeColor}35` : isPending ? `${tribeColor}20` : `${tribeColor}10`}${isLive ? '' : ''}`,
                        boxShadow: isLive ? `0 0 25px rgba(34,197,94,0.08)` : 'none',
                      }}>
                      {/* Live indicator */}
                      {isLive && (
                        <div className="absolute top-2 right-2">
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] uppercase tracking-wider"
                            style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Live
                          </span>
                        </div>
                      )}

                      {/* Completed indicator */}
                      {isCompleted && (
                        <div className="absolute top-2 right-2">
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] uppercase tracking-wider"
                            style={{ background: 'rgba(148,163,184,0.12)', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.2)' }}>
                            Done
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
                          style={{ background: `radial-gradient(circle, ${tribeColor}30, ${tribeColor}08)`, border: `1px solid ${tribeColor}25` }}>
                          <TribeIcon tribe={tribe.name} size={24} />
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-bold uppercase tracking-wider"
                            style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: tribeColor }}>
                            {tribe.name}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider"
                            style={{ fontFamily: "'BlinkerRegular', sans-serif", color: isLive ? '#22c55e' : isCompleted ? '#94a3b8' : isPending ? `${tribeColor}60` : `${tribeColor}30` }}>
                            {isLive ? 'Fighting Now' : isCompleted ? (warrior ? `Warrior: ${warrior}` : 'Battle Complete') : isPending ? 'Ready to Fight' : 'Awaiting'}
                          </p>
                        </div>
                      </div>

                      {/* Players */}
                      {players.length > 0 && (
                        <div className="space-y-1">
                          {players.map((p, i) => {
                            const isWarrior = warrior === p.name
                            return (
                              <div key={i} className="flex items-center gap-1.5 rounded-md px-2 py-1"
                                style={{
                                  background: isWarrior ? `${tribeColor}15` : 'rgba(0,0,0,0.25)',
                                  border: `1px solid ${isWarrior ? `${tribeColor}30` : 'rgba(255,255,255,0.03)'}`,
                                }}>
                                {isWarrior && <ShieldIcon size={10} />}
                                <span className={`text-[10px] sm:text-xs truncate ${isWarrior ? 'font-bold' : ''}`}
                                  style={{ color: isWarrior ? tribeColor : 'rgba(255,255,255,0.55)' }}>
                                  {p.name}
                                </span>
                                {isWarrior && (
                                  <span className="text-[7px] uppercase tracking-wider ml-auto flex-shrink-0" style={{ color: `${tribeColor}80` }}>
                                    Warrior
                                  </span>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* No game for this tribe yet */}
                      {!tribeGame && (
                        <div className="text-center py-2">
                          <p className="text-[9px] uppercase tracking-wider" style={{ color: `${tribeColor}30` }}>
                            No game yet
                          </p>
                        </div>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 h-[2px]"
                        style={{ background: `linear-gradient(90deg, transparent, ${isLive ? '#22c55e' : tribeColor}40, transparent)` }} />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── LIVE GAMES — Shows when any tribe is live ── */}
            {slotLive.length > 0 && (
              <div className="max-w-5xl mx-auto mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <SwordsIcon size={20} />
                  <h3 className="text-lg sm:text-xl font-bold uppercase"
                    style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#22c55e', textShadow: '0 0 15px rgba(34,197,94,0.2)' }}>
                    Live Tribe Fights
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {slotLive.map(game => {
                    const tribeColor = getDisplayColor(game.tribe)
                    const players = getGamePlayers(game)
                    return (
                      <div key={game.id} className="rounded-xl p-4 relative overflow-hidden"
                        style={{
                          background: `linear-gradient(160deg, ${tribeColor}08, rgba(0,0,0,0.7))`,
                          border: `1.5px solid rgba(34,197,94,0.25)`,
                          boxShadow: '0 0 20px rgba(34,197,94,0.05)',
                        }}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <TribeIcon tribe={game.tribe} size={20} />
                            <span className="text-sm font-bold uppercase tracking-wider" style={{ color: tribeColor }}>
                              {game.tribe} Tribe
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-green-400/70">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            In Progress
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {players.map((p, i) => (
                            <div key={i} className="rounded-lg p-2.5 text-center relative"
                              style={{
                                background: 'rgba(0,0,0,0.3)',
                                border: `1px solid ${tribeColor}15`,
                              }}>
                              <p className="text-xs sm:text-sm font-bold truncate"
                                style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#e2e8f0' }}>
                                {p.name}
                              </p>
                              <p className="text-[8px] uppercase tracking-wider mt-0.5"
                                style={{ color: `${tribeColor}50` }}>
                                Player {p.playerNumber || i + 1}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-3 text-center">
                          <p className="text-[9px] uppercase tracking-[0.2em]"
                            style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(34,197,94,0.5)' }}>
                            4 Players &mdash; 1 Warrior will rise
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── COMPLETED GAMES — Shows warriors from completed tribe fights ── */}
            {warriors.length > 0 && !allCreatedTribesCompleted && (
              <div className="max-w-5xl mx-auto mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldIcon size={20} />
                  <h3 className="text-lg sm:text-xl font-bold uppercase"
                    style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#e2e8f0', textShadow: '0 0 15px rgba(6,182,212,0.15)' }}>
                    Tribe Warriors Qualified
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {warriors.map((w, i) => {
                    const tribeColor = getDisplayColor(w.tribe)
                    return (
                      <div key={i} className="rounded-xl p-4 text-center relative overflow-hidden"
                        style={{
                          background: `linear-gradient(160deg, ${tribeColor}10, rgba(0,0,0,0.6))`,
                          border: `1.5px solid ${tribeColor}25`,
                        }}>
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full mx-auto mb-2 flex items-center justify-center"
                          style={{
                            background: `radial-gradient(circle, ${tribeColor}30, ${tribeColor}08)`,
                            border: `1.5px solid ${tribeColor}30`,
                          }}>
                          <TribeIcon tribe={w.tribe} size={24} />
                        </div>
                        <ShieldIcon size={16} className="mx-auto mb-1" />
                        <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: tribeColor }}>
                          {w.tribe}
                        </p>
                        <p className="text-sm font-bold uppercase truncate"
                          style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#e2e8f0' }}>
                          {w.name}
                        </p>
                        <p className="text-[8px] uppercase tracking-wider mt-1" style={{ color: `${tribeColor}60` }}>
                          Warrior
                        </p>
                        <div className="absolute bottom-0 left-0 right-0 h-[2px]"
                          style={{ background: `linear-gradient(90deg, transparent, ${tribeColor}, transparent)`, opacity: 0.3 }} />
                      </div>
                    )
                  })}
                </div>

                {/* Waiting for more */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-white/25 uppercase tracking-wider"
                    style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
                    {warriors.length} of 4 warriors qualified &mdash; waiting for remaining tribe battles
                  </p>
                  <div className="flex justify-center gap-2 mt-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-3 h-3 rounded-full"
                        style={{
                          background: i <= warriors.length ? '#06b6d4' : 'rgba(255,255,255,0.1)',
                          boxShadow: i <= warriors.length ? '0 0 8px rgba(6,182,212,0.3)' : 'none',
                        }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── ZAMPION ROUND — Shows when all created tribe games are completed ── */}
            {allCreatedTribesCompleted && warriors.length > 0 && !hasZampion && (
              <div className="max-w-3xl mx-auto mb-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 mb-3">
                    <CrownIcon size={28} />
                    <h3 className="text-2xl sm:text-3xl font-bold uppercase"
                      style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#fbbf24', textShadow: '0 0 25px rgba(251,191,36,0.2)' }}>
                      Zampion Round
                    </h3>
                  </div>
                  <p className="text-sm text-white/35 max-w-md mx-auto"
                    style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
                    All 4 tribe warriors face off in the ultimate clash. One rises above all.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {warriors.map((w, i) => {
                    const tribeColor = getDisplayColor(w.tribe)
                    return (
                      <div key={i}
                        className="rounded-xl p-4 text-center relative overflow-hidden"
                        style={{
                          background: `linear-gradient(160deg, ${tribeColor}08, rgba(0,0,0,0.6))`,
                          border: `1.5px solid ${tribeColor}25`,
                          boxShadow: `0 0 10px ${tribeColor}10`,
                        }}>
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                          style={{
                            background: `radial-gradient(circle, ${tribeColor}30, ${tribeColor}08)`,
                            border: `1.5px solid ${tribeColor}30`,
                          }}>
                          <TribeIcon tribe={w.tribe} size={28} />
                        </div>
                        <p className="text-xs uppercase tracking-wider mb-1"
                          style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: tribeColor }}>
                          {w.tribe}
                        </p>
                        <p className="text-sm sm:text-base font-bold uppercase truncate"
                          style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#e2e8f0' }}>
                          {w.name}
                        </p>
                        <p className="text-[8px] uppercase tracking-wider mt-1" style={{ color: `${tribeColor}60` }}>
                          Warrior
                        </p>
                      </div>
                    )
                  })}
                </div>

                {/* Zampion round in progress */}
                <div className="rounded-xl p-6 text-center"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px dashed rgba(251,191,36,0.2)',
                  }}>
                  <div className="flex justify-center items-center gap-3 mb-3">
                    <SwordsIcon size={24} className="opacity-50" />
                    <CrownIcon size={32} />
                    <SwordsIcon size={24} className="opacity-50" />
                  </div>
                  <p className="text-sm text-white/40 italic mb-2"
                    style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
                    &ldquo;The final showdown. Four warriors, one crown. The Zampion Round is being played.&rdquo;
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full animate-pulse"
                    style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold"
                      style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(251,191,36,0.6)' }}>
                      Zampion Round in Progress
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── ZAMPION CROWNED — Final state ── */}
            {hasZampion && zampion && (
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 mb-3">
                    <CrownIcon size={28} />
                    <h3 className="text-2xl sm:text-3xl font-bold uppercase"
                      style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#fbbf24', textShadow: '0 0 25px rgba(251,191,36,0.2)' }}>
                      Zampion Round
                    </h3>
                  </div>
                </div>

                {/* Warriors with Zampion highlighted */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {TRIBES.map(tribe => {
                    const warrior = warriors.find(w => w.tribe === tribe.name)
                    const tribeColor = getDisplayColor(tribe.name)
                    const isZampion = zampion && warrior && zampion.name === warrior.name

                    return (
                      <div key={tribe.name}
                        className="rounded-xl p-4 text-center relative overflow-hidden transition-all duration-500"
                        style={{
                          background: isZampion
                            ? 'linear-gradient(160deg, rgba(251,191,36,0.1), rgba(0,0,0,0.7))'
                            : `linear-gradient(160deg, ${tribeColor}08, rgba(0,0,0,0.6))`,
                          border: `1.5px solid ${isZampion ? 'rgba(251,191,36,0.4)' : warrior ? `${tribeColor}25` : 'rgba(255,255,255,0.04)'}`,
                          boxShadow: isZampion ? '0 0 30px rgba(251,191,36,0.1)' : 'none',
                        }}>
                        {isZampion && (
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                            <CrownIcon size={20} />
                          </div>
                        )}

                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                          style={{
                            background: `radial-gradient(circle, ${tribeColor}30, ${tribeColor}08)`,
                            border: `1.5px solid ${tribeColor}30`,
                            boxShadow: isZampion ? `0 0 20px rgba(251,191,36,0.15)` : `0 0 10px ${tribeColor}10`,
                          }}>
                          <TribeIcon tribe={tribe.name} size={28} />
                        </div>

                        <p className="text-xs uppercase tracking-wider mb-1"
                          style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: tribeColor }}>
                          {tribe.name}
                        </p>

                        {warrior ? (
                          <p className="text-sm sm:text-base font-bold uppercase truncate"
                            style={{
                              fontFamily: "'TheWalkyrDemo', serif",
                              color: isZampion ? '#fbbf24' : '#e2e8f0',
                              textShadow: isZampion ? '0 0 15px rgba(251,191,36,0.3)' : 'none',
                            }}>
                            {warrior.name}
                          </p>
                        ) : (
                          <p className="text-xs text-white/20 italic">—</p>
                        )}

                        {isZampion && (
                          <span className="text-[8px] uppercase tracking-[0.15em] font-bold mt-1 inline-block"
                            style={{ color: '#fbbf24' }}>
                            Zampion
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Zampion result card */}
                <div className="rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(160deg, rgba(251,191,36,0.08), rgba(0,0,0,0.8))',
                    border: '2px solid rgba(251,191,36,0.3)',
                    boxShadow: '0 0 50px rgba(251,191,36,0.08), 0 0 100px rgba(251,191,36,0.03)',
                  }}>
                  <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fbbf24' fill-opacity='0.5'%3E%3Cpath d='M40 10l8 16 18 2-13 13 3 18-16-8-16 8 3-18L14 28l18-2z'/%3E%3C/g%3E%3C/svg%3E")`,
                    }} />

                  <CrownIcon size={48} className="mx-auto mb-4" />

                  <h4 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase mb-3"
                    style={{
                      fontFamily: "'TheWalkyrDemo', serif",
                      color: '#fbbf24',
                      textShadow: '0 0 30px rgba(251,191,36,0.3), 0 0 60px rgba(251,191,36,0.1)',
                    }}>
                    {zampion.name}
                  </h4>

                  <p className="text-sm uppercase tracking-[0.2em] mb-4"
                    style={{ fontFamily: "'BlinkerRegular', sans-serif", color: 'rgba(251,191,36,0.6)' }}>
                    Zampion of the Tides
                  </p>

                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                    style={{ background: `${getDisplayColor(zampion.tribe)}10`, border: `1px solid ${getDisplayColor(zampion.tribe)}25` }}>
                    <TribeIcon tribe={zampion.tribe} size={18} />
                    <span className="text-sm uppercase tracking-wider font-bold" style={{ color: getDisplayColor(zampion.tribe) }}>
                      {zampion.tribe} Tribe
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </section>
  )
}

// ═══════════════════════════════════════════════════════════
// Helper: Get players from game (players array or fallback)
// ═══════════════════════════════════════════════════════════

function getGamePlayers(game: Game): Player[] {
  if (game.players && game.players.length > 0) return game.players
  if (game.matchups && game.matchups.length > 0) {
    const playerMap = new Map<string, Player>()
    for (const m of game.matchups) {
      if (m.player1 && !playerMap.has(m.player1)) {
        playerMap.set(m.player1, { name: m.player1, id: m.player1Id })
      }
      if (m.player2 && !playerMap.has(m.player2)) {
        playerMap.set(m.player2, { name: m.player2, id: m.player2Id })
      }
    }
    return Array.from(playerMap.values())
  }
  return []
}
