'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { db } from '@/lib/firebase'
import { 
  collection, 
  query, 
  onSnapshot, 
  where,
  Timestamp 
} from 'firebase/firestore'
import Link from 'next/link'

interface BthPlayer {
  id: string
  name: string
  number: string
}

interface BthGame {
  id: string
  players: BthPlayer[]
  startTime: any
  endTime?: any
  status: 'active' | 'ended'
  winnerId?: string
  winnerName?: string
  duration?: number // in seconds
}

// Live timer component for active games
function ActiveTimer({ startTime }: { startTime: any }) {
  const [elapsed, setElapsed] = useState('00:00')

  useEffect(() => {
    if (!startTime) return

    const startMs = startTime instanceof Timestamp 
      ? startTime.toMillis() 
      : (startTime?.seconds ? startTime.seconds * 1000 : Date.now())

    const updateTimer = () => {
      const diffSecs = Math.floor((Date.now() - startMs) / 1000)
      if (diffSecs < 0) {
        setElapsed('00:00')
        return
      }
      const mins = Math.floor(diffSecs / 60)
      const secs = diffSecs % 60
      setElapsed(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  return <span className="font-mono text-xl md:text-2xl text-[#d1a058] tracking-widest font-black drop-shadow-[0_0_10px_rgba(209,160,88,0.5)]">{elapsed}</span>
}

export default function BeatTheHostPage() {
  const [activeGames, setActiveGames] = useState<BthGame[]>([])
  const [leaderboard, setLeaderboard] = useState<BthGame[]>([])
  const [loading, setLoading] = useState(true)
  
  // Interactive search query
  const [searchQuery, setSearchQuery] = useState('')

  // Real-time listeners
  useEffect(() => {
    // 1. Listen Active BTH Games
    const qActive = query(collection(db, 'bth_games'), where('status', '==', 'active'))
    const unsubscribeActive = onSnapshot(qActive, (snapshot) => {
      const data: BthGame[] = []
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as BthGame)
      })
      data.sort((a, b) => {
        const tA = a.startTime?.seconds || 0
        const tB = b.startTime?.seconds || 0
        return tB - tA
      })
      setActiveGames(data)
      setLoading(false)
    }, (err) => {
      console.error('Active games listener error:', err)
      setLoading(false)
    })

    // 2. Listen Ended Games (for leaderboard)
    const qEnded = query(collection(db, 'bth_games'), where('status', '==', 'ended'))
    const unsubscribeEnded = onSnapshot(qEnded, (snapshot) => {
      const endedData: BthGame[] = []
      snapshot.forEach((doc) => {
        endedData.push({ id: doc.id, ...doc.data() } as BthGame)
      })

      // Leaderboard: only players who beat host, sorted by duration asc
      const winners = endedData.filter(g => g.winnerName && g.winnerName !== 'Host')
      winners.sort((a, b) => (a.duration || 0) - (b.duration || 0))
      setLeaderboard(winners)
    }, (err) => {
      console.error('Ended games listener error:', err)
    })

    return () => {
      unsubscribeActive()
      unsubscribeEnded()
    }
  }, [])

  // Format seconds to MM:SS helper
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Filtered leaderboard records based on search query
  const filteredLeaderboard = useMemo(() => {
    return leaderboard.filter(g => 
      g.winnerName?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [leaderboard, searchQuery])

  // Top 3 winners for the podium layout
  const topThree = useMemo(() => {
    return leaderboard.slice(0, 3)
  }, [leaderboard])

  // Remaining leaderboard records
  const remainingLeaderboard = useMemo(() => {
    return leaderboard.slice(3)
  }, [leaderboard])

  return (
    <main className="min-h-screen relative pt-24 pb-20 px-4 overflow-hidden bg-black/90">
      
      {/* Floating Particles/Embers Backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/10 w-2 h-2 bg-[#d1a058]/30 rounded-full animate-float-slow-1" />
        <div className="absolute top-1/2 left-3/4 w-3 h-3 bg-red-500/20 rounded-full animate-float-slow-2" />
        <div className="absolute top-4/5 left-1/3 w-1.5 h-1.5 bg-[#d1a058]/40 rounded-full animate-float-slow-3" />
        <div className="absolute top-1/10 left-4/5 w-2.5 h-2.5 bg-yellow-500/20 rounded-full animate-float-slow-4" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10 space-y-12">
        
        {/* Navigation Breadcrumb & Back Link */}
        <div className="flex justify-between items-center">
          <Link
            href="/#hero"
            className="inline-flex items-center gap-2 transition-all duration-300 hover:opacity-80 group text-[#d1a058] text-sm"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
          >
            <span className="transform group-hover:-translate-x-1 transition-transform">←</span> Back to Home
          </Link>
          <div className="text-white/40 text-xs uppercase tracking-widest font-mono">
            Arena Registry v2.0
          </div>
        </div>

        {/* Hero Banner Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-block px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold uppercase tracking-widest rounded-full animate-pulse">
            🔥 Live Tournament Event 🔥
          </div>
          <h1
            className="text-4xl md:text-6xl font-black text-center tracking-wide uppercase"
            style={{
              fontFamily: "'TheWalkyrDemo', serif",
              color: '#d1a058',
              textShadow: '0 0 15px rgba(209, 160, 88, 0.4), 2px 2px 4px rgba(0, 0, 0, 0.9)',
            }}
          >
            Beat the Host
          </h1>
          <p
            className="text-white/80 max-w-2xl mx-auto text-sm md:text-base leading-relaxed"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
          >
            Do you have what it takes to vanquish the Host? Track live active battles as warriors challenge the reigning champion, and check the Hall of Fame for the fastest winners of the night.
          </p>
        </div>

        {/* 1. Active Battles Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-[#d1a058]/20 pb-3">
            <span className="text-2xl">⚔️</span>
            <h2 className="text-2xl md:text-3xl font-bold uppercase text-[#d1a058]" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>
              Live Arena Matchups
            </h2>
          </div>

          {loading ? (
            <div className="bg-black/60 border border-[#d1a058]/20 rounded-2xl p-12 text-center space-y-4 shadow-lg backdrop-blur-md">
              <div className="w-12 h-12 border-4 border-[#d1a058] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-white/60 font-semibold tracking-wider uppercase text-xs animate-pulse">Syncing Arena Data...</p>
            </div>
          ) : activeGames.length === 0 ? (
            <div className="bg-black/40 border border-[#d1a058]/20 rounded-2xl p-10 text-center relative overflow-hidden shadow-2xl backdrop-blur-md group hover:border-[#d1a058]/40 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d1a058]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <div className="text-4xl mb-3 animate-bounce">👹</div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>
                Arena Status: Waiting for Challengers
              </h3>
              <p className="text-white/50 text-xs max-w-md mx-auto" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
                The Host sits unchallenged in the elemental chamber. Register at the organizer desk to launch a battle and claim your spot on the Leaderboard.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {activeGames.map((game) => (
                <div 
                  key={game.id} 
                  className="bg-black border-2 border-red-500/30 hover:border-red-500/50 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.1)] relative backdrop-blur-md transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Energy border gradient backdrop */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-red-500 to-purple-600 animate-pulse" />
                  
                  {/* Split VS Battle Screen Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 items-center text-center">
                    
                    {/* Challengers Card (Left) */}
                    <div className="md:col-span-5 p-8 bg-gradient-to-br from-yellow-950/20 via-yellow-900/10 to-transparent relative overflow-hidden flex flex-col justify-center min-h-[160px]">
                      <div className="absolute top-0 left-0 w-24 h-24 bg-yellow-500/5 blur-3xl rounded-full" />
                      <span className="text-[10px] tracking-widest text-[#d1a058] font-bold uppercase mb-2">Challenger Team</span>
                      <h4 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide uppercase line-clamp-2" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>
                        {game.players.map(p => p.name).join(' & ')}
                      </h4>
                      <div className="mt-3 flex justify-center gap-1.5">
                        {game.players.map((p, idx) => (
                          <span key={p.id} className="text-[10px] bg-yellow-500/10 border border-yellow-500/20 text-[#d1a058] px-2 py-0.5 rounded-full">
                            WARRIOR #{idx + 1}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Central Timer & Pulse (Middle) */}
                    <div className="md:col-span-2 p-6 flex flex-col items-center justify-center border-y md:border-y-0 md:border-x border-white/10 bg-black/60 relative">
                      {/* Pulse ring animation */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 border border-[#d1a058]/30 rounded-full animate-ping opacity-40" />
                      </div>
                      
                      <div className="z-10 flex flex-col items-center">
                        <span className="text-xs uppercase tracking-widest text-red-500 font-bold mb-1 animate-pulse">CLASHING</span>
                        <div className="my-1">
                          <ActiveTimer startTime={game.startTime} />
                        </div>
                        <span className="text-[10px] font-mono text-white/40 mt-1">ELAPSED TIME</span>
                      </div>
                    </div>

                    {/* The Host Card (Right) */}
                    <div className="md:col-span-5 p-8 bg-gradient-to-bl from-purple-950/20 via-red-950/10 to-transparent relative overflow-hidden flex flex-col justify-center min-h-[160px]">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-3xl rounded-full" />
                      <span className="text-[10px] tracking-widest text-purple-400 font-bold uppercase mb-2">Defending Master</span>
                      <h4 className="text-2xl md:text-3xl font-extrabold text-red-500 tracking-wide uppercase" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>
                        THE HOST
                      </h4>
                      <div className="mt-3 flex justify-center">
                        <span className="text-[10px] bg-red-500/15 border border-red-500/30 text-red-400 px-3 py-0.5 rounded-full font-mono uppercase tracking-wider animate-pulse">
                          👹 BOSS LEVEL
                        </span>
                      </div>
                    </div>

                  </div>

                </div>
              ))}
            </div>
          )}
        </section>

        {/* 2. Leaderboard Section */}
        <section className="space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#d1a058]/20 pb-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <h2 className="text-2xl md:text-3xl font-bold uppercase text-[#d1a058]" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>
                Hall of Fame
              </h2>
            </div>
            
            {/* Leaderboard Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search Zampions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/80 border border-[#d1a058]/30 hover:border-[#d1a058]/50 focus:border-[#d1a058] rounded px-3 py-1 text-xs text-white placeholder-white/40 focus:outline-none transition-all w-full sm:w-48"
                style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-xs"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {leaderboard.length === 0 ? (
            <div className="bg-black/40 border border-white/5 rounded-2xl p-8 text-center text-white/40 text-sm">
              No record-breaking player victories logged yet. Be the first to defeat the host!
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Top 3 Podium Layout (Only visible if search query is empty) */}
              {!searchQuery && topThree.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* 1st Place Card */}
                  <div className="bg-gradient-to-b from-yellow-950/40 via-black/80 to-black border-2 border-yellow-500/80 rounded-2xl p-6 text-center shadow-[0_0_25px_rgba(234,179,8,0.25)] relative overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[9px] font-black tracking-widest px-3 py-0.5 rounded-bl uppercase">
                      CHAMPION
                    </div>
                    <div className="text-4xl mb-2 animate-bounce">👑</div>
                    <span className="text-[10px] uppercase tracking-widest text-yellow-500 font-bold block mb-1">Rank 1</span>
                    <h3 className="text-xl font-bold text-white truncate max-w-full px-2" title={topThree[0].winnerName}>
                      {topThree[0].winnerName}
                    </h3>
                    <div className="text-2xl font-black text-yellow-400 font-mono mt-2">
                      {topThree[0].duration ? formatDuration(topThree[0].duration) : '00:00'}
                    </div>
                    <div className="text-[10px] text-white/40 mt-3 font-mono">
                      SET ON {topThree[0].endTime instanceof Timestamp
                        ? topThree[0].endTime.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                        : (topThree[0].endTime?.seconds ? new Date(topThree[0].endTime.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A')}
                    </div>
                  </div>

                  {/* 2nd Place Card */}
                  {topThree[1] && (
                    <div className="bg-gradient-to-b from-slate-900/40 via-black/85 to-black border-2 border-slate-400/60 rounded-2xl p-6 text-center shadow-[0_0_20px_rgba(148,163,184,0.15)] relative overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
                      <div className="text-4xl mb-2">🥈</div>
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-1">Rank 2</span>
                      <h3 className="text-xl font-bold text-white truncate max-w-full px-2" title={topThree[1].winnerName}>
                        {topThree[1].winnerName}
                      </h3>
                      <div className="text-2xl font-black text-slate-300 font-mono mt-2">
                        {topThree[1].duration ? formatDuration(topThree[1].duration) : '00:00'}
                      </div>
                      <div className="text-[10px] text-white/40 mt-3 font-mono">
                        SET ON {topThree[1].endTime instanceof Timestamp
                          ? topThree[1].endTime.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                          : (topThree[1].endTime?.seconds ? new Date(topThree[1].endTime.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A')}
                      </div>
                    </div>
                  )}

                  {/* 3rd Place Card */}
                  {topThree[2] && (
                    <div className="bg-gradient-to-b from-orange-950/40 via-black/85 to-black border-2 border-orange-700/50 rounded-2xl p-6 text-center shadow-[0_0_20px_rgba(194,65,12,0.15)] relative overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
                      <div className="text-4xl mb-2">🥉</div>
                      <span className="text-[10px] uppercase tracking-widest text-orange-500 font-bold block mb-1">Rank 3</span>
                      <h3 className="text-xl font-bold text-white truncate max-w-full px-2" title={topThree[2].winnerName}>
                        {topThree[2].winnerName}
                      </h3>
                      <div className="text-2xl font-black text-orange-400 font-mono mt-2">
                        {topThree[2].duration ? formatDuration(topThree[2].duration) : '00:00'}
                      </div>
                      <div className="text-[10px] text-white/40 mt-3 font-mono">
                        SET ON {topThree[2].endTime instanceof Timestamp
                          ? topThree[2].endTime.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                          : (topThree[2].endTime?.seconds ? new Date(topThree[2].endTime.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A')}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Leaderboard Table (Remaining and/or searched) */}
              <div className="bg-black/40 border border-[#d1a058]/25 rounded-2xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#d1a058]/20 bg-black/60">
                        <th className="p-4 font-semibold text-white/80 uppercase text-[10px] tracking-wider">Rank</th>
                        <th className="p-4 font-semibold text-white/80 uppercase text-[10px] tracking-wider">Warrior Challenger</th>
                        <th className="p-4 font-semibold text-white/80 uppercase text-[10px] tracking-wider">Duration</th>
                        <th className="p-4 font-semibold text-white/80 uppercase text-[10px] tracking-wider text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* If searching, render all matching. Else render 4th+ place */}
                      {searchQuery ? (
                        filteredLeaderboard.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-white/40 text-xs">
                              No matching challengers found.
                            </td>
                          </tr>
                        ) : (
                          filteredLeaderboard.map((game, index) => (
                            <tr key={game.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="p-4 font-mono font-bold text-xs text-white/80">
                                {index === 0 && '🥇'}
                                {index === 1 && '🥈'}
                                {index === 2 && '🥉'}
                                {index > 2 && `${index + 1}`}
                              </td>
                              <td className="p-4 text-xs font-semibold text-white">{game.winnerName}</td>
                              <td className="p-4 text-xs font-mono text-[#d1a058] font-bold">
                                {game.duration ? formatDuration(game.duration) : '00:00'}
                              </td>
                              <td className="p-4 text-[10px] font-mono text-white/40 text-right">
                                {game.endTime instanceof Timestamp
                                  ? game.endTime.toDate().toLocaleDateString()
                                  : (game.endTime?.seconds ? new Date(game.endTime.seconds * 1000).toLocaleDateString() : 'N/A')}
                              </td>
                            </tr>
                          ))
                        )
                      ) : (
                        remainingLeaderboard.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-6 text-center text-white/40 text-xs">
                              Elite records podium displayed above.
                            </td>
                          </tr>
                        ) : (
                          remainingLeaderboard.map((game, index) => {
                            const rank = index + 4
                            return (
                              <tr key={game.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-4 font-mono font-bold text-xs text-white/80">
                                  #{rank}
                                </td>
                                <td className="p-4 text-xs font-semibold text-white">{game.winnerName}</td>
                                <td className="p-4 text-xs font-mono text-[#d1a058] font-bold">
                                  {game.duration ? formatDuration(game.duration) : '00:00'}
                                </td>
                                <td className="p-4 text-[10px] font-mono text-white/40 text-right">
                                  {game.endTime instanceof Timestamp
                                    ? game.endTime.toDate().toLocaleDateString()
                                    : (game.endTime?.seconds ? new Date(game.endTime.seconds * 1000).toLocaleDateString() : 'N/A')}
                                </td>
                              </tr>
                            )
                          })
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </section>

      </div>

      {/* Global CSS for Anime Energy Floating Embers */}
      <style jsx global>{`
        @keyframes float-up-1 {
          0% { transform: translate(0, 0) scale(1); opacity: 0.1; }
          50% { opacity: 0.4; }
          100% { transform: translate(-30px, -150px) scale(0.6); opacity: 0; }
        }
        @keyframes float-up-2 {
          0% { transform: translate(0, 0) scale(0.8); opacity: 0.15; }
          50% { opacity: 0.5; }
          100% { transform: translate(40px, -120px) scale(0.4); opacity: 0; }
        }
        @keyframes float-up-3 {
          0% { transform: translate(0, 0) scale(1.2); opacity: 0.1; }
          50% { opacity: 0.6; }
          100% { transform: translate(-20px, -180px) scale(0.5); opacity: 0; }
        }
        @keyframes float-up-4 {
          0% { transform: translate(0, 0) scale(0.9); opacity: 0.2; }
          50% { opacity: 0.4; }
          100% { transform: translate(30px, -100px) scale(0.6); opacity: 0; }
        }
        .animate-float-slow-1 {
          animation: float-up-1 8s infinite ease-in-out;
        }
        .animate-float-slow-2 {
          animation: float-up-2 9s infinite ease-in-out;
        }
        .animate-float-slow-3 {
          animation: float-up-3 10s infinite ease-in-out;
        }
        .animate-float-slow-4 {
          animation: float-up-4 7s infinite ease-in-out;
        }
      `}</style>
    </main>
  )
}
