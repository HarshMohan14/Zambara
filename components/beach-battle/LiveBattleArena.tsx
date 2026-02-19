'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap } from '@/lib/gsap'
import { TribeIcon, OceanIcon, SwordsIcon, CrownIcon, TrophyIcon, ShieldIcon, LivePulseIcon, getDisplayColor, TRIBES } from './TribeIcons'

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface Matchup {
  table: number
  player1: string
  player2: string
  player1Id?: string
  player2Id?: string
  status: string
  winner?: string
  winnerId?: string
}

interface LiveGame {
  id: string
  slotNumber: number
  tribe: string
  status: string
  matchups: Matchup[]
  warrior?: string
  warriorId?: string
  zampion?: string
  zampionId?: string
  zampionTribe?: string
}

interface LiveData {
  live: LiveGame[]
  completed: LiveGame[]
}

type TabView = 'arena' | 'tribeFight' | 'zampion'

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function LiveBattleArena() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<LiveData | null>(null)
  const [activeTab, setActiveTab] = useState<TabView>('arena')
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [expandedGame, setExpandedGame] = useState<string | null>(null)

  // Fetch live data every 8 seconds
  useEffect(() => {
    const fetchLive = async () => {
      try {
        const res = await fetch('/api/beach-battle/live')
        const json = await res.json()
        if (json.success && json.data) setData(json.data)
      } catch { /* silent */ }
    }
    fetchLive()
    const interval = setInterval(fetchLive, 8000)
    return () => clearInterval(interval)
  }, [])

  // GSAP animations
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
      if (contentRef.current) {
        gsap.fromTo(contentRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: 'power2.out',
            scrollTrigger: { trigger: contentRef.current, start: 'top 82%', toggleActions: 'play none none reverse' }
          }
        )
      }
    }, sectionRef)
    return () => { ctx.revert() }
  }, [])

  const liveGames = data?.live || []
  const completedGames = data?.completed || []
  const allGames = [...liveGames, ...completedGames]
  const hasAny = allGames.length > 0

  // Derive slots
  const slots = [...new Set(allGames.map(g => g.slotNumber))].sort((a, b) => b - a)

  // Get games for selected slot (or latest)
  const activeSlot = selectedSlot ?? (slots[0] || 1)
  const slotGames = allGames.filter(g => g.slotNumber === activeSlot)
  const slotLive = liveGames.filter(g => g.slotNumber === activeSlot)
  const slotCompleted = completedGames.filter(g => g.slotNumber === activeSlot)

  // Warriors from completed games in this slot
  const warriors = slotCompleted
    .filter(g => g.warrior)
    .map(g => ({ name: g.warrior!, tribe: g.tribe, gameId: g.id }))

  // Zampion for this slot (if set)
  const zampionGame = slotGames.find(g => g.zampion)
  const zampion = zampionGame ? { name: zampionGame.zampion!, tribe: zampionGame.zampionTribe || '' } : null

  // Determine which tab should show
  const hasLive = slotLive.length > 0
  const hasWarriors = warriors.length > 0
  const hasZampion = !!zampion

  // If nothing to show, render a minimal waiting state
  if (!hasAny) return null

  return (
    <section
      ref={sectionRef}
      id="live-arena"
      aria-label="Live Battle Arena"
      className="relative w-full py-14 sm:py-20 md:py-28 lg:py-32 overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.5]"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 12%, transparent 88%, rgba(0,0,0,0.6) 100%)' }} />
        {/* Animated ocean glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.4), transparent 60%)', filter: 'blur(100px)' }} />
        {/* Green live glow when live games active */}
        {hasLive && (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[200px] h-[200px] md:w-[400px] md:h-[400px] rounded-full opacity-[0.04] animate-pulse"
            style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.5), transparent 60%)', filter: 'blur(80px)' }} />
        )}
        {/* Top/bottom borders */}
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

          <h2 ref={titleRef}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold uppercase mb-3 opacity-0"
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
              : 'The arena has seen battle. Explore the history of tribal warfare.'}
          </p>
        </div>

        {/* ── SLOT SELECTOR ── */}
        {slots.length > 1 && (
          <div className="flex justify-center gap-2 mb-8">
            {slots.map(s => (
              <button key={s}
                onClick={() => setSelectedSlot(s)}
                className="px-4 py-2 rounded-lg text-xs sm:text-sm uppercase tracking-wider font-semibold transition-all duration-300"
                style={{
                  fontFamily: "'BlinkerSemiBold', sans-serif",
                  background: activeSlot === s ? 'rgba(6,182,212,0.15)' : 'rgba(0,0,0,0.3)',
                  border: `1.5px solid ${activeSlot === s ? 'rgba(6,182,212,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  color: activeSlot === s ? '#22d3ee' : 'rgba(255,255,255,0.3)',
                  boxShadow: activeSlot === s ? '0 0 20px rgba(6,182,212,0.1)' : 'none',
                }}>
                Slot #{s}
              </button>
            ))}
          </div>
        )}

        {/* ── TAB NAVIGATION ── */}
        <div className="flex justify-center mb-8 sm:mb-10">
          <div className="inline-flex rounded-xl overflow-hidden"
            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(6,182,212,0.12)' }}>
            {[
              { id: 'arena' as TabView, label: 'Live Arena', icon: <ShieldIcon size={16} />, show: true },
              { id: 'tribeFight' as TabView, label: 'Tribe Fights', icon: <SwordsIcon size={16} />, show: true },
              { id: 'zampion' as TabView, label: 'Zampion Round', icon: <CrownIcon size={16} />, show: hasWarriors || hasZampion },
            ].filter(t => t.show).map((tab) => (
              <button key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm uppercase tracking-wider font-semibold transition-all duration-300"
                style={{
                  fontFamily: "'BlinkerSemiBold', sans-serif",
                  background: activeTab === tab.id ? 'rgba(6,182,212,0.12)' : 'transparent',
                  color: activeTab === tab.id ? '#22d3ee' : 'rgba(255,255,255,0.3)',
                  borderBottom: activeTab === tab.id ? '2px solid #06b6d4' : '2px solid transparent',
                }}>
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div ref={contentRef} className="opacity-0">
          {activeTab === 'arena' && <ArenaView games={slotGames} hasLive={hasLive} />}
          {activeTab === 'tribeFight' && <TribeFightView games={slotGames} expandedGame={expandedGame} setExpandedGame={setExpandedGame} />}
          {activeTab === 'zampion' && <ZampionRoundView warriors={warriors} zampion={zampion} slotNumber={activeSlot} />}
        </div>
      </div>

      {/* Inline keyframes */}
      <style jsx>{`
        @keyframes arenaGlow {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.08; }
        }
        @keyframes warrior-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════
// Sub-components: Arena View — Overview of all live/recent games
// ═══════════════════════════════════════════════════════════

function ArenaView({ games, hasLive }: { games: LiveGame[]; hasLive: boolean }) {
  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <OceanIcon size={48} className="mx-auto mb-4 opacity-30" />
        <p className="text-white/25 text-sm uppercase tracking-wider" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
          No battles in this slot yet. The tides are calm.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {TRIBES.map(tribe => {
          const tribeGames = games.filter(g => g.tribe === tribe.name)
          const tribeColor = getDisplayColor(tribe.name)
          const isLive = tribeGames.some(g => g.status === 'live')
          const isCompleted = tribeGames.some(g => g.status === 'completed')
          const warrior = tribeGames.find(g => g.warrior)?.warrior

          return (
            <div key={tribe.name} className="rounded-xl p-3 sm:p-4 relative overflow-hidden"
              style={{
                background: `linear-gradient(160deg, ${tribeColor}08, rgba(0,0,0,0.6))`,
                border: `1.5px solid ${isLive ? '#22c55e' : tribeColor}${isLive ? '50' : '20'}`,
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
                    style={{ fontFamily: "'BlinkerRegular', sans-serif", color: isLive ? '#22c55e' : isCompleted ? '#94a3b8' : `${tribeColor}60` }}>
                    {isLive ? 'Fighting Now' : isCompleted ? 'Battle Complete' : 'Awaiting'}
                  </p>
                </div>
              </div>

              {/* Matchup info */}
              {tribeGames.length > 0 && (
                <div className="space-y-1.5">
                  {tribeGames[0].matchups.slice(0, 2).map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-xs rounded-lg px-2 py-1.5"
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <span className="text-[9px] text-white/20 mr-1.5">T{m.table}</span>
                      <span className={`truncate flex-1 text-center ${m.winner === m.player1 ? 'text-green-400' : 'text-white/60'}`}>
                        {m.player1}
                      </span>
                      <span className="text-white/15 mx-1">vs</span>
                      <span className={`truncate flex-1 text-center ${m.winner === m.player2 ? 'text-green-400' : 'text-white/60'}`}>
                        {m.player2}
                      </span>
                      {m.status === 'live' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse ml-1" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Warrior result */}
              {warrior && (
                <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${tribeColor}15` }}>
                  <div className="flex items-center gap-1.5">
                    <ShieldIcon size={12} />
                    <span className="text-[10px] uppercase tracking-wider text-white/30">Warrior:</span>
                    <span className="text-xs font-bold" style={{ color: tribeColor }}>{warrior}</span>
                  </div>
                </div>
              )}

              {/* Bottom glow */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, transparent, ${isLive ? '#22c55e' : tribeColor}40, transparent)` }} />
            </div>
          )
        })}
      </div>

      {/* Per-table view for live games */}
      {hasLive && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <SwordsIcon size={20} />
            <h3 className="text-lg sm:text-xl font-bold uppercase"
              style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#22c55e', textShadow: '0 0 15px rgba(34,197,94,0.2)' }}>
              Live Matchups
            </h3>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {games.filter(g => g.status === 'live').flatMap(game =>
              game.matchups.filter(m => m.status === 'live' || m.status === 'pending').map((m, i) => ({
                ...m,
                tribe: game.tribe,
                gameId: game.id,
                key: `${game.id}-${i}`,
              }))
            ).map(matchup => {
              const tribeColor = getDisplayColor(matchup.tribe)
              return (
                <div key={matchup.key} className="rounded-xl p-4 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(160deg, ${tribeColor}08, rgba(0,0,0,0.7))`,
                    border: `1px solid ${matchup.status === 'live' ? 'rgba(34,197,94,0.25)' : `${tribeColor}15`}`,
                    boxShadow: matchup.status === 'live' ? '0 0 20px rgba(34,197,94,0.05)' : 'none',
                  }}>
                  {/* Tribe + Table badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TribeIcon tribe={matchup.tribe} size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: tribeColor }}>
                        {matchup.tribe}
                      </span>
                      <span className="text-[10px] text-white/20 uppercase">Table {matchup.table}</span>
                    </div>
                    {matchup.status === 'live' && (
                      <span className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-green-400/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        In Progress
                      </span>
                    )}
                  </div>

                  {/* VS display */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1 text-center">
                      <p className="text-sm sm:text-base font-bold truncate"
                        style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: matchup.winner === matchup.player1 ? '#22c55e' : '#e2e8f0' }}>
                        {matchup.player1}
                      </p>
                    </div>
                    <div className="px-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(6,182,212,0.15)' }}>
                        <SwordsIcon size={18} />
                      </div>
                    </div>
                    <div className="flex-1 text-center">
                      <p className="text-sm sm:text-base font-bold truncate"
                        style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: matchup.winner === matchup.player2 ? '#22c55e' : '#e2e8f0' }}>
                        {matchup.player2}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Sub-component: Tribe Fight View — Detailed per-tribe breakdowns
// ═══════════════════════════════════════════════════════════

function TribeFightView({ games, expandedGame, setExpandedGame }: {
  games: LiveGame[]
  expandedGame: string | null
  setExpandedGame: (id: string | null) => void
}) {
  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <SwordsIcon size={48} className="mx-auto mb-4 opacity-30" />
        <p className="text-white/25 text-sm uppercase tracking-wider" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
          No tribe fights in this slot yet.
        </p>
      </div>
    )
  }

  // Sort: live first, then completed, then pending
  const sortedGames = [...games].sort((a, b) => {
    const order: Record<string, number> = { live: 0, pending: 1, completed: 2 }
    return (order[a.status] ?? 3) - (order[b.status] ?? 3)
  })

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Section title */}
      <div className="flex items-center gap-3 mb-6">
        <SwordsIcon size={24} />
        <div>
          <h3 className="text-xl sm:text-2xl font-bold uppercase"
            style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#e2e8f0', textShadow: '0 0 20px rgba(6,182,212,0.15)' }}>
            Tribe Battles
          </h3>
          <p className="text-xs text-white/30 uppercase tracking-wider" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
            Each tribe fights at their own table. One warrior qualifies per tribe.
          </p>
        </div>
      </div>

      {sortedGames.map(game => {
        const tribeColor = getDisplayColor(game.tribe)
        const isExpanded = expandedGame === game.id
        const isLive = game.status === 'live'
        const isCompleted = game.status === 'completed'
        const totalMatchups = game.matchups.length
        const completedMatchups = game.matchups.filter(m => m.status === 'completed').length
        const liveMatchups = game.matchups.filter(m => m.status === 'live').length

        return (
          <div key={game.id} className="rounded-xl overflow-hidden transition-all duration-500"
            style={{
              background: `linear-gradient(160deg, ${tribeColor}06, rgba(0,0,0,0.7))`,
              border: `1.5px solid ${isLive ? 'rgba(34,197,94,0.3)' : `${tribeColor}${isExpanded ? '35' : '15'}`}`,
              boxShadow: isLive ? `0 0 30px rgba(34,197,94,0.06)` : isExpanded ? `0 0 25px ${tribeColor}08` : 'none',
            }}>
            {/* Game Header */}
            <div className="p-4 sm:p-5 cursor-pointer" onClick={() => setExpandedGame(isExpanded ? null : game.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center relative"
                    style={{
                      background: `radial-gradient(circle, ${tribeColor}25, ${tribeColor}08)`,
                      border: `1.5px solid ${tribeColor}30`,
                      boxShadow: isLive ? `0 0 20px ${tribeColor}15` : 'none',
                    }}>
                    <TribeIcon tribe={game.tribe} size={28} />
                    {isLive && (
                      <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-black animate-pulse" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base sm:text-lg font-bold uppercase tracking-wider"
                        style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: tribeColor }}>
                        {game.tribe} Tribe
                      </h4>
                      <StatusBadge status={game.status} />
                    </div>
                    <p className="text-xs text-white/30" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
                      {totalMatchups} matchup{totalMatchups !== 1 ? 's' : ''}
                      {liveMatchups > 0 && ` \u00b7 ${liveMatchups} live`}
                      {completedMatchups > 0 && ` \u00b7 ${completedMatchups} done`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Warrior badge */}
                  {game.warrior && (
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                      style={{ background: `${tribeColor}08`, border: `1px solid ${tribeColor}15` }}>
                      <ShieldIcon size={14} />
                      <span className="text-xs font-bold" style={{ color: tribeColor }}>{game.warrior}</span>
                    </div>
                  )}
                  <span className="text-white/15 text-sm transition-transform duration-300"
                    style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>
                    &#9660;
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              {totalMatchups > 0 && (
                <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${isCompleted ? 100 : ((completedMatchups / totalMatchups) * 100)}%`,
                      background: isLive
                        ? `linear-gradient(90deg, ${tribeColor}, #22c55e)`
                        : `linear-gradient(90deg, ${tribeColor}80, ${tribeColor})`,
                    }} />
                </div>
              )}
            </div>

            {/* Expanded matchups */}
            <div className="overflow-hidden transition-all duration-500"
              style={{ maxHeight: isExpanded ? '600px' : '0px', opacity: isExpanded ? 1 : 0 }}>
              <div className="px-4 sm:px-5 pb-5 space-y-3" style={{ borderTop: `1px solid ${tribeColor}10` }}>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/25 pt-3 mb-2"
                  style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>
                  Table Matchups
                </p>

                {game.matchups.map((m, i) => (
                  <div key={i} className="rounded-xl p-3 sm:p-4 relative overflow-hidden"
                    style={{
                      background: m.status === 'live'
                        ? 'linear-gradient(160deg, rgba(34,197,94,0.05), rgba(0,0,0,0.5))'
                        : 'rgba(0,0,0,0.3)',
                      border: `1px solid ${m.status === 'live' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.04)'}`,
                    }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase tracking-wider text-white/20"
                        style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>
                        Table {m.table}
                      </span>
                      <MatchupStatusBadge status={m.status} />
                    </div>

                    {/* VS Display */}
                    <div className="flex items-center">
                      <PlayerCard name={m.player1} isWinner={m.winner === m.player1} tribeColor={tribeColor} />
                      <div className="flex-shrink-0 px-2 sm:px-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
                          style={{
                            background: m.status === 'live' ? 'rgba(34,197,94,0.1)' : 'rgba(0,0,0,0.4)',
                            border: `1px solid ${m.status === 'live' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)'}`,
                          }}>
                          <span className="text-[10px] font-bold uppercase" style={{ color: m.status === 'live' ? '#22c55e' : 'rgba(255,255,255,0.2)' }}>VS</span>
                        </div>
                      </div>
                      <PlayerCard name={m.player2} isWinner={m.winner === m.player2} tribeColor={tribeColor} />
                    </div>

                    {/* Winner */}
                    {m.winner && (
                      <div className="mt-2 pt-2 flex items-center justify-center gap-1.5"
                        style={{ borderTop: '1px solid rgba(34,197,94,0.1)' }}>
                        <TrophyIcon size={14} />
                        <span className="text-xs font-bold text-green-400 uppercase tracking-wider">{m.winner} wins</span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Warrior result */}
                {game.warrior && (
                  <div className="rounded-xl p-4 text-center"
                    style={{
                      background: `linear-gradient(160deg, ${tribeColor}0a, rgba(0,0,0,0.5))`,
                      border: `1.5px solid ${tribeColor}25`,
                      boxShadow: `0 0 20px ${tribeColor}08`,
                    }}>
                    <ShieldIcon size={24} className="mx-auto mb-2" />
                    <p className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: `${tribeColor}80` }}>
                      Round 1 Warrior (Qualifier)
                    </p>
                    <p className="text-lg sm:text-xl font-bold uppercase"
                      style={{ fontFamily: "'TheWalkyrDemo', serif", color: tribeColor, textShadow: `0 0 15px ${tribeColor}25` }}>
                      {game.warrior}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Sub-component: Zampion Round View
// ═══════════════════════════════════════════════════════════

function ZampionRoundView({ warriors, zampion, slotNumber }: {
  warriors: { name: string; tribe: string; gameId: string }[]
  zampion: { name: string; tribe: string } | null
  slotNumber: number
}) {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Zampion Round Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <CrownIcon size={28} />
          <h3 className="text-2xl sm:text-3xl font-bold uppercase"
            style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#fbbf24', textShadow: '0 0 25px rgba(251,191,36,0.2)' }}>
            Zampion Round
          </h3>
        </div>
        <p className="text-sm text-white/35 max-w-md mx-auto"
          style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
          {warriors.length === 4
            ? 'All 4 tribe warriors face off in the ultimate clash. One rises above all.'
            : warriors.length > 0
              ? `${warriors.length} of 4 warriors qualified. Waiting for remaining tribe battles to complete.`
              : 'Warriors are still being determined from tribe fights.'}
        </p>
      </div>

      {/* Warriors Grid */}
      {warriors.length > 0 && (
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-white/25 mb-4 text-center"
            style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>
            Qualified Warriors
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TRIBES.map(tribe => {
              const warrior = warriors.find(w => w.tribe === tribe.name)
              const tribeColor = getDisplayColor(tribe.name)
              const isZampion = zampion && zampion.name === warrior?.name

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
                  {/* Zampion crown */}
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
                    <div className="h-8 rounded-lg flex items-center justify-center"
                      style={{ border: `1px dashed ${tribeColor}15`, background: 'rgba(0,0,0,0.3)' }}>
                      <span className="text-[10px] uppercase tracking-wider" style={{ color: `${tribeColor}25` }}>
                        Pending
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Zampion Result */}
      {zampion && (
        <div className="rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, rgba(251,191,36,0.08), rgba(0,0,0,0.8))',
            border: '2px solid rgba(251,191,36,0.3)',
            boxShadow: '0 0 50px rgba(251,191,36,0.08), 0 0 100px rgba(251,191,36,0.03)',
          }}>
          {/* Decorative pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fbbf24' fill-opacity='0.5'%3E%3Cpath d='M40 10l8 16 18 2-13 13 3 18-16-8-16 8 3-18L14 28l18-2z'/%3E%3C/g%3E%3C/svg%3E")`,
            }} />

          <CrownIcon size={48} className="mx-auto mb-4" />

          <p className="text-xs uppercase tracking-[0.3em] mb-2"
            style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: 'rgba(251,191,36,0.5)' }}>
            Slot #{slotNumber}
          </p>

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
      )}

      {/* Waiting state */}
      {!zampion && warriors.length > 0 && warriors.length < 4 && (
        <div className="rounded-xl p-6 text-center"
          style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px dashed rgba(251,191,36,0.15)',
          }}>
          <OceanIcon size={36} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm text-white/30 uppercase tracking-wider"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
            Waiting for all 4 tribe warriors before the Zampion clash begins...
          </p>
          <div className="flex justify-center gap-2 mt-3">
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
  )
}

// ═══════════════════════════════════════════════════════════
// Utility Sub-components
// ═══════════════════════════════════════════════════════════

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24', label: 'PENDING' },
    live: { bg: 'rgba(34,197,94,0.12)', text: '#22c55e', label: 'LIVE' },
    completed: { bg: 'rgba(148,163,184,0.1)', text: '#94a3b8', label: 'DONE' },
  }
  const s = styles[status] || styles.pending
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.text}25` }}>
      {status === 'live' && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: s.text }} />}
      {s.label}
    </span>
  )
}

function MatchupStatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'rgba(251,191,36,0.08)', text: '#fbbf24', label: 'Waiting' },
    live: { bg: 'rgba(34,197,94,0.08)', text: '#22c55e', label: 'In Progress' },
    completed: { bg: 'rgba(148,163,184,0.06)', text: '#94a3b8', label: 'Complete' },
  }
  const s = styles[status] || styles.pending
  return (
    <span className="flex items-center gap-1 text-[9px] uppercase tracking-wider"
      style={{ color: s.text }}>
      {status === 'live' && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: s.text }} />}
      {s.label}
    </span>
  )
}

function PlayerCard({ name, isWinner, tribeColor }: { name: string; isWinner: boolean; tribeColor: string }) {
  return (
    <div className="flex-1 text-center rounded-lg p-2 sm:p-3"
      style={{
        background: isWinner ? 'rgba(34,197,94,0.08)' : 'rgba(0,0,0,0.2)',
        border: `1px solid ${isWinner ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.03)'}`,
      }}>
      <p className="text-xs sm:text-sm font-bold truncate"
        style={{
          fontFamily: "'BlinkerSemiBold', sans-serif",
          color: isWinner ? '#22c55e' : '#e2e8f0',
        }}>
        {name}
      </p>
      {isWinner && (
        <span className="text-[8px] uppercase tracking-wider text-green-400/60">Winner</span>
      )}
    </div>
  )
}
