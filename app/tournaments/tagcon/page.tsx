'use client'

import React, { useEffect, useState, useRef } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { convertTimestamps } from '@/lib/firestore'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'

interface Tournament {
  id: string
  name: string
  size: number
  dateTime: string
  createdAt: string
}

interface Booking {
  id: string
  tournamentId: string
  userId: string
  userName: string
  userMobile: string
  tribe: string
  seatIndex: number
  bookedAt: string
  isWinner?: boolean
  isZampion?: boolean
}

const TRIBES = [
  { id: 'lava', label: 'Lava Tribe', color: '#ff4400', cardImage: '/new_LAVA.png', badgeBg: 'bg-orange-500/20 text-orange-400 border border-orange-500/30' },
  { id: 'rain', label: 'Rain Tribe', color: '#00aaff', cardImage: '/new_Rain.png', badgeBg: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
  { id: 'mountain', label: 'Mountain Tribe', color: '#eebb77', cardImage: '/new_Mountain.png', badgeBg: 'bg-yellow-600/25 text-[#eebb77] border border-yellow-500/20' },
  { id: 'wind', label: 'Wind Tribe', color: '#00ff88', cardImage: '/new_Wind.png', badgeBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' }
]

export default function TagconTournamentPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [mounted, setMounted] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const firefliesRef = useRef<HTMLDivElement>(null)
  const zampionRef = useRef<HTMLDivElement>(null)

  // 1. Tournaments list listener
  useEffect(() => {
    setMounted(true)
    const q = query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
      })) as Tournament[]
      setTournaments(docs)
      if (docs.length > 0 && !selectedTournamentId) {
        setSelectedTournamentId(docs[0].id)
      }
    }, (error) => {
      console.error("Error loading tournaments:", error)
    })
    return () => unsubscribe()
  }, [])

  // 2. Bookings listener
  useEffect(() => {
    if (!selectedTournamentId) {
      setBookings([])
      return
    }
    const q = query(collection(db, 'bookings'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
      })) as Booking[]
      setBookings(docs.filter(b => b.tournamentId === selectedTournamentId))
    }, (error) => {
      console.error("Error loading bookings:", error)
    })
    return () => unsubscribe()
  }, [selectedTournamentId])

  // 3. Entry GSAP animations
  useEffect(() => {
    if (!mounted) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.tagcon-content-anim', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.15 }
      )
    }, containerRef)
    return () => ctx.revert()
  }, [mounted])

  // 4. Crowned Zampion float & scale effect
  useEffect(() => {
    const zampion = bookings.find(b => b.isZampion)
    if (zampion && zampionRef.current) {
      gsap.fromTo(zampionRef.current,
        { scale: 0.8, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 1.2, ease: 'back.out(1.5)' }
      )
    }
  }, [bookings, selectedTournamentId])

  // 5. Fireflies backdrop effect
  useEffect(() => {
    if (!mounted) return
    if (firefliesRef.current) {
      const fireflies = firefliesRef.current.children
      Array.from(fireflies).forEach((ff) => {
        const floatX = Math.random() * 200 - 100
        const floatY = Math.random() * 200 - 100
        const duration = 6 + Math.random() * 6

        gsap.to(ff, {
          x: floatX,
          y: floatY,
          opacity: 'random(0.1, 0.9)',
          duration: duration,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut'
        })
      })
    }
  }, [mounted])

  const activeTourney = tournaments.find(t => t.id === selectedTournamentId)
  const zampion = bookings.find(b => b.isZampion)

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes levitate {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        .levitate-slow {
          animation: levitate 4.5s ease-in-out infinite;
        }
      `}} />

      <div 
        ref={containerRef}
        className="min-h-screen bg-black text-white relative pt-24 pb-16 overflow-hidden font-sans"
        style={{
          backgroundImage: "url('/magical_forest_bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Darkening overlay */}
        <div className="absolute inset-0 bg-black/70 pointer-events-none z-0"></div>

        {/* Dynamic green/teal aura for TagCon */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)] z-0" />

        {/* Fireflies floating in the background */}
        <div ref={firefliesRef} className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {mounted && Array.from({ length: 20 }).map((_, index) => {
            const left = `${Math.random() * 100}%`
            const top = `${Math.random() * 100}%`
            const size = 3 + Math.random() * 5
            
            const palettes = [
              { bg: 'bg-[#10b981]/90', glow: '0 0 10px #34d399' },
              { bg: 'bg-[#06b6d4]/90', glow: '0 0 10px #22d3ee' },
              { bg: 'bg-[#d1a058]/90', glow: '0 0 10px #eebb77' }
            ]
            const styleChoice = palettes[index % palettes.length]
            
            return (
              <div 
                key={index} 
                className={`absolute rounded-full pointer-events-none ${styleChoice.bg}`}
                style={{
                  left,
                  top,
                  width: `${size}px`,
                  height: `${size}px`,
                  boxShadow: styleChoice.glow,
                }}
              />
            )
          })}
        </div>

        <div className="relative z-20 container mx-auto px-4 max-w-7xl flex flex-col">
          {/* Back button */}
          <div className="mb-4">
            <Link 
              href="/tournaments"
              className="inline-flex items-center gap-2 text-sm text-[#d1a058] hover:text-white transition-colors"
            >
              <span>←</span>
              <span>All Tournaments</span>
            </Link>
          </div>

          {/* Header section */}
          <div className="text-center mb-10 tagcon-content-anim">
            <h1 
              className="text-4xl md:text-6xl font-black uppercase tracking-widest text-[#d1a058] mb-3"
              style={{ fontFamily: "'TheWalkyrDemo', serif", textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
            >
              TagCon Arena
            </h1>
            <p className="text-white/60 max-w-lg mx-auto text-sm md:text-base font-sans">
              Enter the sacred grounds. Check live bookings, tribe rosters, and the reigning Zampions.
            </p>
          </div>

          {/* Selector Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#d1a058]/20 mb-8 max-w-5xl mx-auto w-full tagcon-content-anim">
            <div className="flex-1 max-w-sm">
              <label className="block text-xs font-semibold uppercase text-white/50 mb-1.5">Select active tournament</label>
              {tournaments.length === 0 ? (
                <p className="text-red-400 text-sm font-semibold uppercase">No tournaments currently registered.</p>
              ) : (
                <select
                  value={selectedTournamentId}
                  onChange={(e) => setSelectedTournamentId(e.target.value)}
                  className="w-full bg-black/60 border border-[#d1a058]/40 text-[#d1a058] font-bold rounded px-4 py-2.5 focus:outline-none focus:border-[#d1a058] text-sm"
                >
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id} className="bg-black text-[#d1a058]">{t.name} ({t.size} Slots)</option>
                  ))}
                </select>
              )}
            </div>

            {activeTourney && (
              <div className="text-right font-sans">
                <span className="block text-[10px] text-white/40 uppercase">Arena Date & Time</span>
                <span className="text-base font-black text-white">{new Date(activeTourney.dateTime).toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Tournament detail grid */}
          {!activeTourney ? (
            <div className="text-center py-20 text-white/40 uppercase font-black tracking-widest tagcon-content-anim">Select a tournament to view details</div>
          ) : (
            <div className="flex-1 flex flex-col gap-10">
              {/* Spotlight Zampion Card */}
              {zampion && (
                <div ref={zampionRef} className="flex flex-col items-center justify-center p-6 bg-black/30 border border-[#d1a058]/35 rounded-2xl max-w-md mx-auto w-full shadow-2xl relative mb-4">
                  {/* Aura glowing background */}
                  <div className="absolute w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

                  <span className="text-sm font-black uppercase text-[#d1a058] tracking-[0.3em] mb-1">👑 TOURNAMENT CHAMPION 👑</span>
                  <h2 className="text-2xl font-black uppercase text-white mb-6" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>THE ULTIMATE ZAMPION</h2>

                  {/* Zampion tribe card image display */}
                  {(() => {
                    const tribeConfig = TRIBES.find(t => t.id === zampion.tribe)
                    return (
                      <div className="relative w-64 h-96 z-10 mb-4 levitate-slow">
                        <Image
                          src={tribeConfig?.cardImage || '/new_LAVA.png'}
                          alt="Zampion Card"
                          fill
                          className="object-contain filter drop-shadow-[0_8px_25px_rgba(0,0,0,0.85)]"
                          priority
                        />
                      </div>
                    )
                  })()}

                  {/* Name card overlay */}
                  <div 
                    className="px-6 py-2 bg-[#000]/95 border-2 border-[#d1a058] rounded-md text-center w-[85%] shadow-xl z-20"
                    style={{
                      boxShadow: '0 8px 25px rgba(0,0,0,0.95), inset 0 0 10px rgba(209,160,88,0.3)'
                    }}
                  >
                    <p className="text-[#d1a058] text-[17px] font-black tracking-widest uppercase truncate" style={{ fontFamily: "'Cinzel', serif" }}>
                      {zampion.userName}
                    </p>
                  </div>
                </div>
              )}

              {/* Tribes Roster Standings */}
              <div className="w-full max-w-5xl mx-auto tagcon-content-anim">
                <h3 className="text-xl font-bold uppercase text-[#d1a058] mb-6 text-center tracking-widest" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>
                  Tribe Rosters & Match Standings
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {TRIBES.map((tr) => {
                    const tribeRoster = bookings.filter(b => b.tribe === tr.id)
                    
                    return (
                      <div key={tr.id} className="bg-black/55 border border-white/5 rounded-2xl p-6 shadow-lg">
                        {/* Tribe Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                          <h4 className="text-lg font-black uppercase tracking-wider" style={{ color: tr.color, fontFamily: "'TheWalkyrDemo', serif" }}>
                            {tr.label}
                          </h4>
                          <span className="text-[10px] text-white/50 uppercase font-semibold">
                            Booked: {tribeRoster.length} / {activeTourney.size / 4}
                          </span>
                        </div>

                        {/* Rosters list */}
                        {tribeRoster.length === 0 ? (
                          <p className="text-white/30 text-xs italic text-center py-6">No warriors assigned to this tribe yet.</p>
                        ) : (
                          <div className="space-y-2.5">
                            {tribeRoster.map((player) => (
                              <div 
                                key={player.id} 
                                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                                  player.isZampion 
                                    ? 'bg-amber-950/20 border-amber-400/50 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                                    : player.isWinner
                                      ? 'bg-yellow-950/15 border-yellow-400/40 shadow-[0_0_6px_rgba(234,179,8,0.15)]'
                                      : 'bg-black/30 border-white/5 hover:border-white/10'
                                }`}
                              >
                                <div>
                                  <p className="font-bold text-sm uppercase tracking-wide flex items-center gap-1.5">
                                    {player.userName}
                                    {player.isZampion && (
                                      <span className="text-[11px] text-amber-400" title="Tournament Zampion">👑</span>
                                    )}
                                    {!player.isZampion && player.isWinner && (
                                      <span className="text-[9px] text-yellow-300" title="Round Winner">★</span>
                                    )}
                                  </p>
                                  <p className="text-[10px] text-white/45 font-mono mt-0.5">Seat #{ (player.seatIndex % (activeTourney.size / 4)) + 1 }</p>
                                </div>

                                {/* Badges */}
                                <div className="flex gap-2">
                                  {player.isZampion && (
                                    <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-amber-500 text-black shadow">
                                      Zampion
                                    </span>
                                  )}
                                  {!player.isZampion && player.isWinner && (
                                    <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                                      Winner
                                    </span>
                                  )}
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${tr.badgeBg}`}>
                                    {tr.id}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
