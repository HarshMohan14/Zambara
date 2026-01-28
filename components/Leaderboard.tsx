'use client'

import { useEffect, useState, useRef } from 'react'
import { apiClient } from '@/lib/api-client'
import { createTimeline } from '@/lib/gsap'

interface LeaderboardEntry {
  id: string
  rank: number
  score: number
  playerName: string
  playerMobile?: string
  time?: number
  gameId?: string
  game?: {
    id: string
    name: string
  }
}

export function Leaderboard({ gameId }: { gameId?: string }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('[Leaderboard] Fetching leaderboard...', { gameId })
        
        const response = await apiClient.getLeaderboard({
          gameId,
          limit: 10,
        })

        console.log('[Leaderboard] API Response:', response)

        if (response.success && response.data) {
          const data = response.data as { leaderboard?: any[] }
          const entries = data.leaderboard || []
          console.log('[Leaderboard] Fetched entries:', entries.length, entries)
          
          if (entries.length === 0) {
            console.log('[Leaderboard] No entries found')
          }
          
          setLeaderboard(entries)
        } else {
          const errorMsg = response.error || 'Failed to load leaderboard'
          console.error('[Leaderboard] API Error:', errorMsg, response)
          setError(errorMsg)
        }
      } catch (err: any) {
        console.error('[Leaderboard] Fetch Error:', err)
        setError(err.message || 'Failed to load leaderboard')
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [gameId])

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = createTimeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    })

    if (headerRef.current) {
      ctx.fromTo(
        headerRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
        }
      )
    }

    return () => {
      ctx.kill()
    }
  }, [leaderboard]) // Re-run animation when leaderboard data changes

  // Always render the section, even when loading or error
  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-black/80 py-16 overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <h2
          ref={headerRef}
          className="text-3xl md:text-4xl lg:text-5xl font-bold uppercase text-center mb-12 opacity-0"
          style={{
            fontFamily: "'TheWalkyrDemo', serif",
            color: '#d1a058',
            textShadow:
              '2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(209, 160, 88, 0.2)',
          }}
        >
          Leaderboard
        </h2>

        {loading ? (
          <div className="text-center text-[#d1a058]">Loading leaderboard...</div>
        ) : error ? (
          <div className="text-center text-red-400">
            <div className="mb-2">{error}</div>
            <button
              onClick={() => {
                setError(null)
                setLoading(true)
                const fetchLeaderboard = async () => {
                  try {
                    const response = await apiClient.getLeaderboard({
                      gameId,
                      limit: 10,
                    })
                    if (response.success && response.data) {
                      const retryData = response.data as { leaderboard?: any[] }
                      setLeaderboard(retryData.leaderboard || [])
                    } else {
                      setError(response.error || 'Failed to load leaderboard')
                    }
                  } catch (err: any) {
                    setError(err.message || 'Failed to load leaderboard')
                  } finally {
                    setLoading(false)
                  }
                }
                fetchLeaderboard()
              }}
              className="mt-4 px-4 py-2 bg-[#d1a058] text-black rounded-lg font-semibold uppercase transition-all hover:scale-105"
              style={{
                fontFamily: "'BlinkerSemiBold', sans-serif",
              }}
            >
              Retry
            </button>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center text-white/60">
            No scores yet. Be the first to compete!
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.id || index}
                  className="bg-black/60 border-2 border-[#d1a058]/30 rounded-lg p-4 flex items-center justify-between backdrop-blur-sm hover:border-[#d1a058]/60 transition-all duration-300"
                  style={{
                    boxShadow: '0 4px 15px rgba(209, 160, 88, 0.1)',
                  }}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="text-2xl font-bold w-12 text-center"
                      style={{
                        fontFamily: "'TheWalkyrDemo', serif",
                        color: '#d1a058',
                      }}
                    >
                      #{entry.rank || index + 1}
                    </div>
                    <div className="flex-1">
                      <div
                        className="text-xl font-semibold text-white"
                        style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
                      >
                        {entry.playerName || 'Unknown Player'}
                      </div>
                      <div
                        className="text-sm text-white/60 uppercase"
                        style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
                      >
                        {entry.game?.name || 'Unknown Event'}
                      </div>
                    </div>
                  </div>
                  <div
                    className="text-2xl font-bold"
                    style={{
                      fontFamily: "'TheWalkyrDemo', serif",
                      color: '#d1a058',
                    }}
                  >
                    {(entry.score || 0).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
