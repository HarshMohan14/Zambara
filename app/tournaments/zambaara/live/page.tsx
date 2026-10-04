'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore'
import {
  CUSTOM_PLAYERS_COLLECTION,
  CUSTOM_TOURNAMENTS_COLLECTION,
  CustomPlayer,
  CustomTable,
  CustomTournament,
  TRIBE_META,
  Tribe,
  getChampionId,
  winnersOfRound,
} from '@/lib/zambaara-custom'

const walkyr = { fontFamily: "'TheWalkyrDemo', serif" }
const cinzel = { fontFamily: "'Cinzel', serif" }

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase()).join('') || '?'

function TribePill({ tribe }: { tribe: Tribe | null }) {
  if (!tribe) return <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-white/5 text-white/35 border border-white/10">Hidden</span>
  const m = TRIBE_META[tribe]
  return (
    <span className="text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider border" style={{ color: m.color, background: m.soft, borderColor: m.border }}>
      {m.label}
    </span>
  )
}

/** Circular arena table with players seated around it */
function ArenaTable({ table, players, isFinal }: { table: CustomTable; players: Map<string, CustomPlayer>; isFinal: boolean }) {
  const seats = table.playerIds
  const n = Math.max(seats.length, 1)
  const winner = table.winnerId ? players.get(table.winnerId) : undefined

  return (
    <div
      className={`zl-table group relative rounded-2xl border p-5 bg-black/55 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 ${
        winner
          ? 'border-[#d1a058]/70 shadow-[0_0_30px_rgba(209,160,88,0.18)]'
          : 'border-white/10 hover:border-[#d1a058]/40 hover:shadow-[0_0_24px_rgba(209,160,88,0.12)]'
      } ${isFinal ? 'md:col-span-2 xl:col-span-3 max-w-2xl mx-auto w-full' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-lg font-black uppercase tracking-widest text-[#d1a058]" style={walkyr}>{table.name}</h4>
        <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{seats.length} warriors</span>
      </div>

      {/* Circular table */}
      <div className={`relative mx-auto my-4 ${isFinal ? 'w-72 h-72 sm:w-80 sm:h-80' : 'w-60 h-60'}`}>
        {/* Table surface */}
        <div
          className="absolute inset-[22%] rounded-full flex flex-col items-center justify-center text-center"
          style={{
            background: 'radial-gradient(circle at 35% 30%, rgba(209,160,88,0.28), rgba(40,26,10,0.95) 65%)',
            boxShadow: '0 0 0 2px rgba(209,160,88,0.45), 0 0 0 7px rgba(0,0,0,0.6), 0 0 0 8px rgba(209,160,88,0.2), inset 0 0 25px rgba(0,0,0,0.8)',
          }}
        >
          {winner ? (
            <>
              <span className="text-2xl leading-none mb-1">{isFinal ? '👑' : '★'}</span>
              <span className="text-[8px] uppercase tracking-[0.25em] text-[#d1a058] font-black">{isFinal ? 'Zampion' : 'Winner'}</span>
              <span className="text-[11px] font-black uppercase text-white px-2 truncate max-w-full" style={cinzel}>{winner.name.split(' ')[0]}</span>
            </>
          ) : (
            <>
              <span className="text-xl leading-none text-white/70 mb-1">⚔</span>
              <span className="text-[8px] uppercase tracking-[0.25em] text-white/40 font-black">In Battle</span>
            </>
          )}
        </div>

        {/* Seats */}
        {seats.map((pid, i) => {
          const p = players.get(pid)
          const angle = (i / n) * Math.PI * 2 - Math.PI / 2
          const r = 42
          const x = 50 + r * Math.cos(angle)
          const y = 50 + r * Math.sin(angle)
          const tribeColor = p?.tribe ? TRIBE_META[p.tribe].color : 'rgba(255,255,255,0.35)'
          const isWinner = table.winnerId === pid
          return (
            <div
              key={pid}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
              title={p ? `${p.name}${p.tribe ? ` · ${TRIBE_META[p.tribe].label}` : ''}` : ''}
            >
              <div
                className={`relative w-11 h-11 rounded-full flex items-center justify-center text-[11px] font-black transition-transform duration-300 group-hover:scale-105 ${isWinner ? 'zl-winner-seat' : ''}`}
                style={{
                  background: isWinner ? 'linear-gradient(135deg,#f5d58f,#b3833d)' : 'rgba(10,10,12,0.92)',
                  color: isWinner ? '#000' : tribeColor,
                  border: `2px solid ${isWinner ? '#f5d58f' : tribeColor}`,
                  boxShadow: isWinner ? '0 0 18px rgba(245,213,143,0.7)' : `0 0 10px ${p?.tribe ? tribeColor : 'transparent'}`,
                  opacity: table.winnerId && !isWinner ? 0.55 : 1,
                }}
              >
                {p ? initials(p.name) : '?'}
                {isWinner && <span className="absolute -top-3 text-sm">👑</span>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Names list */}
      <div className="space-y-1.5">
        {seats.length === 0 && <p className="text-white/30 text-xs italic text-center">Seats being assigned…</p>}
        {seats.map(pid => {
          const p = players.get(pid)
          if (!p) return null
          const isWinner = table.winnerId === pid
          return (
            <div
              key={pid}
              className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg border ${
                isWinner ? 'bg-[#d1a058]/15 border-[#d1a058]/50' : 'bg-black/30 border-white/5'
              } ${table.winnerId && !isWinner ? 'opacity-60' : ''}`}
            >
              <span className={`text-xs font-bold uppercase tracking-wide truncate ${isWinner ? 'text-[#f5d58f]' : 'text-white/90'}`}>
                {isWinner && (isFinal ? '👑 ' : '★ ')}{p.name}
              </span>
              <TribePill tribe={p.tribe} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ZambaaraLivePage() {
  const [tournaments, setTournaments] = useState<CustomTournament[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [players, setPlayers] = useState<CustomPlayer[]>([])
  const [roundIdx, setRoundIdx] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)

  const containerRef = useRef<HTMLDivElement>(null)
  const firefliesRef = useRef<HTMLDivElement>(null)
  const championRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const fromUrl = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('t') : null
    const q = query(collection(db, CUSTOM_TOURNAMENTS_COLLECTION), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, rounds: [], ...d.data() })) as unknown as CustomTournament[]
      setTournaments(docs)
      setSelectedId(prev => {
        if (prev && docs.some(d => d.id === prev)) return prev
        if (fromUrl && docs.some(d => d.id === fromUrl)) return fromUrl
        return docs[0]?.id || ''
      })
      setLoading(false)
    }, (err) => {
      console.error('Failed to load live tournaments', err)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!selectedId) { setPlayers([]); return }
    const q = query(collection(db, CUSTOM_PLAYERS_COLLECTION), where('tournamentId', '==', selectedId))
    return onSnapshot(q, (snap) => {
      setPlayers(snap.docs.map(d => ({ id: d.id, ...d.data() })) as CustomPlayer[])
    })
  }, [selectedId])

  const tourney = tournaments.find(t => t.id === selectedId)
  const rounds = useMemo(() => tourney?.rounds || [], [tourney])
  const activeRoundIdx = roundIdx === null ? Math.max(0, rounds.length - 1) : Math.min(roundIdx, rounds.length - 1)
  const round = rounds[activeRoundIdx]
  const playerMap = useMemo(() => new Map(players.map(p => [p.id, p])), [players])
  const championId = getChampionId(tourney)
  const champion = championId ? playerMap.get(championId) : undefined
  const isFinalRound = !!round && activeRoundIdx > 0 && activeRoundIdx === rounds.length - 1 && round.tables.length === 1

  const tribeCounts = useMemo(() => {
    const c: Record<Tribe, number> = { lava: 0, rain: 0, mountain: 0, wind: 0 }
    players.forEach(p => { if (p.tribe) c[p.tribe]++ })
    return c
  }, [players])
  const revealed = players.filter(p => p.tribe).length

  // Reset to latest round when switching tournaments / new round created
  useEffect(() => { setRoundIdx(null) }, [selectedId, rounds.length])

  // Entry animation
  useEffect(() => {
    if (!mounted) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.zl-anim', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.12 })
    }, containerRef)
    return () => ctx.revert()
  }, [mounted])

  // Tables stagger on round change
  useEffect(() => {
    if (!mounted) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.zl-table', { opacity: 0, y: 24, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power2.out', stagger: 0.07 })
    }, containerRef)
    return () => ctx.revert()
  }, [mounted, activeRoundIdx, selectedId])

  // Champion entrance
  useEffect(() => {
    if (champion && championRef.current) {
      gsap.fromTo(championRef.current, { scale: 0.85, opacity: 0, y: 30 }, { scale: 1, opacity: 1, y: 0, duration: 1.2, ease: 'back.out(1.5)' })
    }
  }, [championId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fireflies
  useEffect(() => {
    if (!mounted || !firefliesRef.current) return
    Array.from(firefliesRef.current.children).forEach(ff => {
      gsap.to(ff, {
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        opacity: 'random(0.1, 0.9)',
        duration: 6 + Math.random() * 6,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      })
    })
  }, [mounted])

  const prevWinners = activeRoundIdx > 0 ? winnersOfRound(rounds[activeRoundIdx - 1]) : []

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes zlLevitate { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
        .zl-levitate { animation: zlLevitate 4.5s ease-in-out infinite; }
        @keyframes zlPulse { 0%,100% { box-shadow: 0 0 14px rgba(245,213,143,0.6) } 50% { box-shadow: 0 0 26px rgba(245,213,143,1) } }
        .zl-winner-seat { animation: zlPulse 2s ease-in-out infinite; }
        @keyframes zlLive { 0% { transform: scale(1); opacity: .8 } 100% { transform: scale(2.4); opacity: 0 } }
        .zl-live-ring { animation: zlLive 1.6s ease-out infinite; }
      ` }} />

      <div
        ref={containerRef}
        className="min-h-screen bg-black text-white relative pt-24 pb-20 overflow-hidden font-sans"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.85)), url('/zambaara_bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-black/55 pointer-events-none z-0" />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_20%,rgba(209,160,88,0.10)_0%,transparent_60%)] z-0" />

        <div ref={firefliesRef} className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {mounted && Array.from({ length: 22 }).map((_, i) => {
            const palettes = [
              { bg: 'bg-[#ff4400]/90', glow: '0 0 10px #ff6622' },
              { bg: 'bg-[#06b6d4]/90', glow: '0 0 10px #22d3ee' },
              { bg: 'bg-[#d1a058]/90', glow: '0 0 10px #eebb77' },
              { bg: 'bg-[#10b981]/90', glow: '0 0 10px #34d399' },
            ]
            const s = palettes[i % palettes.length]
            const size = 3 + Math.random() * 5
            return (
              <div
                key={i}
                className={`absolute rounded-full ${s.bg}`}
                style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: size, height: size, boxShadow: s.glow }}
              />
            )
          })}
        </div>

        <div className="relative z-20 container mx-auto px-4 max-w-7xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Link href="/tournaments/zambaara" className="inline-flex items-center gap-2 text-sm text-[#d1a058] hover:text-white transition-colors">
              <span>←</span><span>Zambaara Arena</span>
            </Link>
            <Link
              href="/tournaments/zambaara/reveal"
              className="text-[11px] uppercase tracking-widest font-bold text-[#d1a058] border border-[#d1a058]/40 bg-black/40 hover:bg-[#d1a058]/10 rounded-full px-4 py-1.5 transition-colors"
            >
              Reveal your tribe →
            </Link>
          </div>

          {/* Header */}
          <header className="text-center mb-10 zl-anim">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/40 bg-red-500/10 mb-4">
              <span className="relative flex w-2 h-2">
                <span className="zl-live-ring absolute inset-0 rounded-full bg-red-500" />
                <span className="relative w-2 h-2 rounded-full bg-red-500" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400">Live</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest text-[#d1a058] mb-3" style={{ ...walkyr, textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
              {tourney?.name || 'Zambaara Live Tables'}
            </h1>
            <p className="text-white/60 max-w-xl mx-auto text-sm md:text-base">
              Every table, every warrior, every elemental tribe — follow the battle from the first round to the crowning of the Zampion.
            </p>
            {tourney?.dateTime && (
              <p className="text-[11px] uppercase tracking-widest text-white/40 mt-2">{new Date(tourney.dateTime).toLocaleString()}</p>
            )}
          </header>

          {loading ? (
            <div className="text-center py-24 text-white/40 uppercase tracking-widest font-black">Summoning the arena…</div>
          ) : !tourney ? (
            <div className="text-center py-24 text-white/40 uppercase tracking-widest font-black zl-anim">No live tournament right now. Stay tuned.</div>
          ) : (
            <>
              {/* Tournament switcher */}
              {tournaments.length > 1 && (
                <div className="flex justify-center mb-8 zl-anim">
                  <select
                    id="live-tournament-select"
                    value={selectedId}
                    onChange={e => setSelectedId(e.target.value)}
                    className="bg-black/60 border border-[#d1a058]/40 text-[#d1a058] font-bold rounded-full px-5 py-2 focus:outline-none focus:border-[#d1a058] text-sm cursor-pointer"
                  >
                    {tournaments.map(t => <option key={t.id} value={t.id} className="bg-black">{t.name}</option>)}
                  </select>
                </div>
              )}

              {/* Stats */}
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto mb-10 zl-anim" aria-label="Tournament stats">
                <div className="rounded-xl border border-white/10 bg-black/50 px-5 py-4">
                  <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Warriors</div>
                  <div className="text-3xl font-black text-white" style={cinzel}>{players.length}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/50 px-5 py-4">
                  <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Tables</div>
                  <div className="text-3xl font-black text-white" style={cinzel}>{rounds[0]?.tables.length || 0}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/50 px-5 py-4">
                  <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Stage</div>
                  <div className="text-xl font-black text-[#d1a058] mt-1 uppercase" style={walkyr}>{champion ? 'Concluded' : rounds[rounds.length - 1]?.name}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/50 px-5 py-4">
                  <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Tribes Revealed · {revealed}</div>
                  <div className="flex h-2 rounded-full overflow-hidden bg-white/5">
                    {(Object.keys(TRIBE_META) as Tribe[]).map(t => (
                      <div key={t} style={{ width: `${revealed ? (tribeCounts[t] / revealed) * 100 : 0}%`, background: TRIBE_META[t].color }} />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1.5">
                    {(Object.keys(TRIBE_META) as Tribe[]).map(t => (
                      <span key={t} className="text-[9px] font-black uppercase" style={{ color: TRIBE_META[t].color }}>{tribeCounts[t]}</span>
                    ))}
                  </div>
                </div>
              </section>

              {/* Champion spotlight */}
              {champion && (
                <section
                  ref={championRef}
                  className="relative flex flex-col items-center p-8 mb-12 rounded-3xl border border-[#d1a058]/50 bg-black/45 max-w-md mx-auto shadow-2xl overflow-hidden"
                  aria-label="Tournament Zampion"
                >
                  <div className="absolute w-80 h-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
                  <span className="relative text-xs font-black uppercase text-[#d1a058] tracking-[0.35em] mb-1">👑 Tournament Champion 👑</span>
                  <h2 className="relative text-3xl font-black uppercase text-white mb-6" style={walkyr}>The Ultimate Zampion</h2>
                  <div className="relative w-60 h-[22rem] mb-4 zl-levitate">
                    <Image
                      src={champion.tribe ? TRIBE_META[champion.tribe].card : '/new_LAVA.png'}
                      alt={`${champion.name} tribe card`}
                      fill
                      sizes="240px"
                      className="object-contain drop-shadow-[0_8px_25px_rgba(0,0,0,0.85)]"
                      priority
                    />
                  </div>
                  <div className="relative px-6 py-2 bg-black/95 border-2 border-[#d1a058] rounded-md text-center w-[85%]" style={{ boxShadow: '0 8px 25px rgba(0,0,0,0.95), inset 0 0 10px rgba(209,160,88,0.3)' }}>
                    <p className="text-[#d1a058] text-lg font-black tracking-widest uppercase truncate" style={cinzel}>{champion.name}</p>
                  </div>
                </section>
              )}

              {/* Round tabs */}
              {rounds.length > 0 && (
                <nav className="flex flex-wrap justify-center items-center gap-2 mb-8 zl-anim" aria-label="Rounds">
                  {rounds.map((r, i) => (
                    <React.Fragment key={r.id}>
                      {i > 0 && <span className="text-[#d1a058]/40 text-xs">➜</span>}
                      <button
                        onClick={() => setRoundIdx(i)}
                        className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all border ${
                          i === activeRoundIdx
                            ? 'bg-gradient-to-r from-[#e7b875] to-[#b3833d] text-black border-transparent shadow-[0_0_18px_rgba(209,160,88,0.45)]'
                            : 'bg-black/50 text-white/60 border-white/10 hover:text-white hover:border-[#d1a058]/40'
                        }`}
                      >
                        {r.name}
                      </button>
                    </React.Fragment>
                  ))}
                </nav>
              )}

              {/* Qualified strip */}
              {round && prevWinners.length > 0 && (
                <div className="max-w-4xl mx-auto mb-8 text-center">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold mb-3">Advanced from {rounds[activeRoundIdx - 1].name}</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {prevWinners.map(id => {
                      const p = playerMap.get(id)
                      if (!p) return null
                      return (
                        <span key={id} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 border border-[#d1a058]/30 text-xs font-bold uppercase">
                          <span style={{ color: p.tribe ? TRIBE_META[p.tribe].color : '#fff' }}>●</span>{p.name}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Tables */}
              {round && (
                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" aria-label={`${round.name} tables`}>
                  {round.tables.map(tb => (
                    <ArenaTable key={tb.id} table={tb} players={playerMap} isFinal={isFinalRound} />
                  ))}
                  {round.tables.length === 0 && (
                    <p className="col-span-full text-center text-white/40 py-16 uppercase tracking-widest font-bold">Tables are being prepared…</p>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
