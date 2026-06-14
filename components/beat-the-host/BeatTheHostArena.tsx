'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'

interface GamePlayer {
  id: string
  player_id: string
  player_name: string
}

interface Game {
  id: string
  status: string
  started_at: string
  ended_at: string | null
  duration_seconds: number | null
  winner_id: string | null
  winner_name: string | null
  created_at: string
  beat_the_host_game_players: GamePlayer[]
}

interface LeaderboardEntry {
  id: string
  winner_name: string
  duration_seconds: number
  ended_at: string
  started_at: string
}

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
}

function LiveTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const start = new Date(startedAt).getTime()
    const tick = () => setElapsed(Math.round((Date.now() - start) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [startedAt])
  const m = Math.floor(elapsed / 60)
  const s = elapsed % 60
  return (
    <div className="font-mono text-5xl md:text-6xl font-bold tracking-widest"
      style={{ color: '#22c55e', textShadow: '0 0 30px rgba(34,197,94,0.6), 0 0 60px rgba(34,197,94,0.2)' }}>
      {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
    </div>
  )
}

export function BeatTheHostArena() {
  const [games, setGames] = useState<Game[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const heroRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  const fetchData = async () => {
    try {
      const [gR, lR] = await Promise.all([
        fetch('/api/beat-the-host/games'),
        fetch('/api/beat-the-host/leaderboard'),
      ])
      const [gD, lD] = await Promise.all([gR.json(), lR.json()])
      if (gD.success) setGames(gD.data.games || [])
      if (lD.success) setLeaderboard(lD.data.leaderboard || [])
    } catch { /* silent */ }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 5000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (hasAnimated.current || !heroRef.current) return
    hasAnimated.current = true
    const els = heroRef.current.querySelectorAll('.h-anim')
    gsap.from(els, { opacity: 0, y: 60, filter: 'blur(8px)', duration: 1.2, stagger: 0.18, ease: 'power3.out' })
  }, [])

  const liveGames = games.filter(g => g.status === 'live')
  const completedGames = games.filter(g => g.status === 'completed')

  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden">
      {/* Ambient bg glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '800px', height: '500px', background: 'radial-gradient(ellipse, rgba(209,160,88,0.07) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(ellipse, rgba(239,68,68,0.04) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: '400px', height: '400px', background: 'radial-gradient(ellipse, rgba(34,197,94,0.04) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <div className="relative z-10">
        {/* ═══ HERO ═══ */}
        <section ref={heroRef} id="beat-hero" className="min-h-screen flex items-center justify-center px-4 py-24 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="h-anim mb-4">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs uppercase tracking-[0.3em]"
                style={{ background: 'rgba(209,160,88,0.1)', border: '1px solid rgba(209,160,88,0.3)', color: '#d1a058', fontFamily: "'BlinkerSemiBold', sans-serif" }}>
                Zambaara Tournament Arena
              </span>
            </div>

            <h1 className="h-anim text-6xl md:text-8xl font-bold uppercase leading-[0.88] mb-6"
              style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#d1a058', textShadow: '0 0 50px rgba(209,160,88,0.25), 0 4px 30px rgba(0,0,0,0.8)' }}>
              Beat<br />The<br />Host
            </h1>

            <p className="h-anim text-lg md:text-xl text-white/55 max-w-xl mx-auto mb-10 leading-relaxed"
              style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
              Step into the arena. Defeat the host. Claim your place in the Hall of Champions.
            </p>

            <div className="h-anim flex flex-wrap justify-center gap-8 text-sm uppercase tracking-widest"
              style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1" style={{ color: '#22c55e', textShadow: '0 0 20px rgba(34,197,94,0.4)' }}>{liveGames.length}</div>
                <div className="text-white/40 text-xs">Live Battles</div>
              </div>
              <div className="text-white/10 text-3xl">|</div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1" style={{ color: '#fbbf24' }}>{leaderboard.length}</div>
                <div className="text-white/40 text-xs">Champions</div>
              </div>
              <div className="text-white/10 text-3xl">|</div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1 text-white/50">{completedGames.length}</div>
                <div className="text-white/40 text-xs">Battles Fought</div>
              </div>
            </div>

            <div className="h-anim mt-16 animate-bounce">
              <svg className="w-6 h-6 mx-auto text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </section>

        {/* ═══ LIVE ARENA ═══ */}
        <section className="px-4 py-20 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold uppercase mb-2"
              style={{ fontFamily: "'TheWalkyrDemo', serif", color: liveGames.length > 0 ? '#22c55e' : '#d1a058', textShadow: liveGames.length > 0 ? '0 0 40px rgba(34,197,94,0.3)' : 'none' }}>
              {liveGames.length > 0 ? 'Live Arena' : 'The Arena'}
            </h2>
            <p className="text-white/35 text-xs uppercase tracking-[0.25em]" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
              {liveGames.length > 0 ? `${liveGames.length} battle${liveGames.length > 1 ? 's' : ''} in progress` : 'Awaiting the next challenger'}
            </p>
          </div>

          {liveGames.length === 0 ? (
            <div className="text-center py-20 rounded-2xl max-w-lg mx-auto"
              style={{ background: 'rgba(209,160,88,0.03)', border: '1px dashed rgba(209,160,88,0.15)' }}>
              <svg className="w-14 h-14 mx-auto mb-4 opacity-15" viewBox="0 0 24 24" fill="none" stroke="#d1a058" strokeWidth="1">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
              </svg>
              <p className="text-white/25 text-base" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>The arena is silent...</p>
              <p className="text-white/15 text-sm mt-2" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>A new challenger will rise soon.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {liveGames.map((game, idx) => (
                <div key={game.id} className="relative rounded-2xl p-8 md:p-10 overflow-hidden text-center"
                  style={{
                    background: 'linear-gradient(160deg, rgba(34,197,94,0.04), rgba(0,0,0,0.85))',
                    border: '2px solid rgba(34,197,94,0.3)',
                    boxShadow: '0 0 50px rgba(34,197,94,0.07), inset 0 0 80px rgba(34,197,94,0.02)',
                  }}>
                  {/* Corner brackets */}
                  {[['top-0 left-0', 'border-t border-l'], ['top-0 right-0', 'border-t border-r'], ['bottom-0 left-0', 'border-b border-l'], ['bottom-0 right-0', 'border-b border-r']].map(([pos, borders]) => (
                    <div key={pos} className={`absolute ${pos} w-8 h-8`} style={{ borderColor: 'rgba(34,197,94,0.5)', borderWidth: '1.5px', borderStyle: 'solid', borderRight: borders.includes('border-r') ? undefined : 'none', borderLeft: borders.includes('border-l') ? undefined : 'none', borderTop: borders.includes('border-t') ? undefined : 'none', borderBottom: borders.includes('border-b') ? undefined : 'none' }} />
                  ))}

                  <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full"
                    style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs uppercase tracking-[0.25em] font-semibold" style={{ color: '#22c55e', fontFamily: "'BlinkerSemiBold', sans-serif" }}>
                      Battle {idx + 1} — Live
                    </span>
                  </div>

                  <LiveTimer startedAt={game.started_at} />

                  <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    {game.beat_the_host_game_players.map((gp, pi) => (
                      <div key={gp.id} className="flex items-center gap-3">
                        {pi > 0 && (
                          <span className="text-base font-bold" style={{ color: 'rgba(209,160,88,0.4)', fontFamily: "'TheWalkyrDemo', serif" }}>×</span>
                        )}
                        <div className="px-6 py-3 rounded-xl"
                          style={{ background: 'rgba(209,160,88,0.08)', border: '1.5px solid rgba(209,160,88,0.25)' }}>
                          <span className="text-sm md:text-base font-bold uppercase tracking-wider"
                            style={{ color: '#d1a058', fontFamily: "'BlinkerSemiBold', sans-serif" }}>{gp.player_name}</span>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold" style={{ color: 'rgba(239,68,68,0.5)', fontFamily: "'TheWalkyrDemo', serif" }}>VS</span>
                      <div className="px-6 py-3 rounded-xl"
                        style={{ background: 'rgba(239,68,68,0.07)', border: '1.5px solid rgba(239,68,68,0.25)', boxShadow: '0 0 20px rgba(239,68,68,0.08)' }}>
                        <span className="text-sm md:text-base font-bold uppercase tracking-wider"
                          style={{ color: '#ef4444', fontFamily: "'TheWalkyrDemo', serif" }}>The Host</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ═══ HALL OF CHAMPIONS ═══ */}
        <section className="px-4 py-20 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold uppercase mb-2"
              style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#fbbf24', textShadow: '0 0 30px rgba(251,191,36,0.2)' }}>
              Hall of Champions
            </h2>
            <p className="text-white/35 text-xs uppercase tracking-[0.25em]" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
              Fastest warriors who defeated the host
            </p>
          </div>

          {leaderboard.length === 0 ? (
            <div className="text-center py-16 rounded-2xl max-w-md mx-auto"
              style={{ background: 'rgba(251,191,36,0.03)', border: '1px dashed rgba(251,191,36,0.12)' }}>
              <p className="text-white/25" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>No champions yet. Be the first.</p>
            </div>
          ) : (
            <>
              {/* Podium */}
              <div className="flex items-end justify-center gap-2 md:gap-4 mb-10">
                {leaderboard.length >= 2 && (
                  <div className="flex-1 max-w-[180px]">
                    <div className="rounded-t-2xl p-4 text-center flex flex-col justify-end"
                      style={{ height: '160px', background: 'linear-gradient(180deg, rgba(148,163,184,0.08), rgba(148,163,184,0.02))', border: '1px solid rgba(148,163,184,0.2)', borderBottom: 'none' }}>
                      <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(148,163,184,0.15)', border: '2px solid rgba(148,163,184,0.4)' }}>
                        <span className="text-sm font-bold text-gray-300">2</span>
                      </div>
                      <p className="text-sm font-bold text-white truncate" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>{leaderboard[1].winner_name}</p>
                      <p className="font-mono text-xs mt-0.5" style={{ color: '#22c55e' }}>{fmt(leaderboard[1].duration_seconds)}</p>
                    </div>
                  </div>
                )}
                <div className="flex-1 max-w-[200px]">
                  <div className="rounded-t-2xl p-5 text-center flex flex-col justify-end relative"
                    style={{ height: '210px', background: 'linear-gradient(180deg, rgba(251,191,36,0.1), rgba(251,191,36,0.02))', border: '2px solid rgba(251,191,36,0.25)', borderBottom: 'none', boxShadow: '0 0 40px rgba(251,191,36,0.07)' }}>
                    <div className="absolute top-4 left-1/2 -translate-x-1/2">
                      <svg className="w-9 h-9" viewBox="0 0 24 24" fill="#fbbf24" opacity="0.9">
                        <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
                      </svg>
                    </div>
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(251,191,36,0.15)', border: '2px solid rgba(251,191,36,0.5)', boxShadow: '0 0 20px rgba(251,191,36,0.15)' }}>
                      <span className="text-base font-bold" style={{ color: '#fbbf24' }}>1</span>
                    </div>
                    <p className="text-base font-bold text-white truncate" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>{leaderboard[0].winner_name}</p>
                    <p className="font-mono text-sm mt-0.5 font-bold" style={{ color: '#22c55e' }}>{fmt(leaderboard[0].duration_seconds)}</p>
                  </div>
                </div>
                {leaderboard.length >= 3 && (
                  <div className="flex-1 max-w-[180px]">
                    <div className="rounded-t-2xl p-4 text-center flex flex-col justify-end"
                      style={{ height: '130px', background: 'linear-gradient(180deg, rgba(180,83,9,0.08), rgba(180,83,9,0.02))', border: '1px solid rgba(180,83,9,0.2)', borderBottom: 'none' }}>
                      <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(180,83,9,0.15)', border: '2px solid rgba(180,83,9,0.4)' }}>
                        <span className="text-sm font-bold text-amber-600">3</span>
                      </div>
                      <p className="text-sm font-bold text-white truncate" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>{leaderboard[2].winner_name}</p>
                      <p className="font-mono text-xs mt-0.5" style={{ color: '#22c55e' }}>{fmt(leaderboard[2].duration_seconds)}</p>
                    </div>
                  </div>
                )}
              </div>

              {leaderboard.length > 3 && (
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(209,160,88,0.12)' }}>
                  {leaderboard.slice(3).map((e, i) => (
                    <div key={e.id}
                      className="flex items-center justify-between px-5 py-3.5 transition-all hover:bg-white/[0.02]"
                      style={{ borderBottom: i < leaderboard.length - 4 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                      <div className="flex items-center gap-4">
                        <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}>
                          {i + 4}
                        </span>
                        <span className="text-sm font-semibold text-white" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>{e.winner_name}</span>
                      </div>
                      <div className="flex items-center gap-5">
                        <span className="font-mono text-sm font-bold" style={{ color: '#22c55e' }}>{fmt(e.duration_seconds)}</span>
                        <span className="text-xs text-white/20">{new Date(e.ended_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* ═══ BATTLE ARCHIVES ═══ */}
        <section className="px-4 py-20 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold uppercase mb-2"
              style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#d1a058' }}>
              Battle Archives
            </h2>
            <p className="text-white/35 text-xs uppercase tracking-[0.25em]" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
              Every battle written in history
            </p>
          </div>

          {completedGames.length === 0 ? (
            <div className="text-center py-16 rounded-2xl max-w-md mx-auto"
              style={{ background: 'rgba(209,160,88,0.03)', border: '1px dashed rgba(209,160,88,0.1)' }}>
              <p className="text-white/25" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>No battles recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedGames.map((game, idx) => (
                <div key={game.id}
                  className="rounded-xl p-5 md:p-6 transition-all group"
                  style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(209,160,88,0.08)' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(209,160,88,0.22)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(209,160,88,0.08)')}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: 'rgba(209,160,88,0.08)', border: '1px solid rgba(209,160,88,0.2)' }}>
                        <span className="text-xs font-bold" style={{ color: 'rgba(209,160,88,0.7)' }}>#{completedGames.length - idx}</span>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          {game.beat_the_host_game_players.map(gp => (
                            <span key={gp.id} className="text-xs px-2 py-0.5 rounded"
                              style={{
                                background: gp.player_id === game.winner_id ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${gp.player_id === game.winner_id ? 'rgba(251,191,36,0.28)' : 'rgba(255,255,255,0.05)'}`,
                                color: gp.player_id === game.winner_id ? '#fbbf24' : 'rgba(255,255,255,0.45)',
                                fontFamily: "'BlinkerSemiBold', sans-serif",
                              }}>
                              {gp.player_id === game.winner_id && (
                                <svg className="inline w-2.5 h-2.5 mr-1 -mt-0.5" viewBox="0 0 24 24" fill="#fbbf24">
                                  <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z"/>
                                </svg>
                              )}
                              {gp.player_name}
                            </span>
                          ))}
                          <span className="text-xs px-2 py-0.5 rounded"
                            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)', color: 'rgba(239,68,68,0.5)' }}>
                            Host
                          </span>
                        </div>
                        <p className="text-xs text-white/20" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
                          {new Date(game.started_at).toLocaleDateString()} · {new Date(game.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-5 md:flex-shrink-0">
                      {game.winner_name && (
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wider text-white/20 mb-0.5">Winner</p>
                          <p className="text-sm font-bold" style={{ color: '#fbbf24', fontFamily: "'BlinkerSemiBold', sans-serif" }}>{game.winner_name}</p>
                        </div>
                      )}
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-white/20 mb-0.5">Time</p>
                        <p className="font-mono text-sm font-bold" style={{ color: '#22c55e' }}>
                          {game.duration_seconds ? fmt(game.duration_seconds) : '--:--'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="h-24" />
      </div>
    </div>
  )
}
