'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'

interface Player {
  name: string
  mobile: string
}

interface Game {
  id: string
  eventId?: string
  hostId?: string
  players: Player[] | string[] // Support both formats for backward compatibility
  status: 'running' | 'completed'
  startTime: string
  winner?: string
  winnerMobile?: string
  winnerId?: string
  winnerTime?: number
  createdAt: string
}

export default function GameDetail() {
  const params = useParams()
  const router = useRouter()
  const gameId = params.id as string
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [winnerId, setWinnerId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [eventName, setEventName] = useState<string>('')
  const [hostName, setHostName] = useState<string>('')

  useEffect(() => {
    fetchGame()
  }, [gameId])

  const fetchGame = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getGame(gameId)
      if (response.success && response.data) {
        const gameData = response.data as any
        setGame(gameData)
        if (gameData.winnerId) {
          setWinnerId(gameData.winnerId)
        } else if (gameData.winner) {
          // Legacy support
          setWinnerId(gameData.winner)
        }
        
        // Fetch event and host names if IDs exist
        if (gameData.eventId) {
          try {
            const eventRes = await apiClient.getEvent(gameData.eventId)
            if (eventRes.success && eventRes.data) {
              setEventName((eventRes.data as any).name)
            }
          } catch (err) {
            console.error('Error fetching event:', err)
          }
        }
        
        if (gameData.hostId) {
          try {
            const hostRes = await apiClient.getHost(gameData.hostId)
            if (hostRes.success && hostRes.data) {
              setHostName((hostRes.data as any).name)
            }
          } catch (err) {
            console.error('Error fetching host:', err)
          }
        }
      } else {
        setError('Failed to load game')
      }
    } catch (error) {
      console.error('Error fetching game:', error)
      setError('Failed to load game')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!game || game.status === 'completed') return

    if (!winnerId) {
      setError('Please select a winner')
      return
    }

    try {
      setCompleting(true)
      setError(null)
      const response = await apiClient.completeGame(gameId, winnerId)
      if (response.success) {
        // Wait a moment for leaderboard to update
        await new Promise(resolve => setTimeout(resolve, 2000))
        router.push('/admin/games')
      } else {
        setError(response.error || 'Failed to complete game')
      }
    } catch (error: any) {
      console.error('Error completing game:', error)
      setError(error.message || 'Failed to complete game')
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="text-[#d1a058]">Loading game...</div>
    )
  }

  if (error && !game) {
    return (
      <div className="text-red-400">{error}</div>
    )
  }

  if (!game) {
    return (
      <div className="text-white/60">Game not found</div>
    )
  }

  const startDate = new Date(game.startTime)
  const elapsedTime = game.status === 'running' 
    ? Math.floor((Date.now() - startDate.getTime()) / 1000)
    : null

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="mb-4 text-[#d1a058] hover:text-[#d1a058]/80 flex items-center gap-2"
        >
          ← Back to Games
        </button>
        <h1
          className="text-2xl md:text-3xl font-bold uppercase"
          style={{
            fontFamily: "'TheWalkyrDemo', serif",
            color: '#d1a058',
          }}
        >
          {eventName || hostName ? `${eventName || 'Game'} - ${hostName || 'Host'}` : 'Game Details'}
        </h1>
      </div>

      <div className="bg-black/60 border-2 border-[#d1a058]/30 rounded-lg p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {eventName && (
            <div>
              <div className="text-white/60 text-sm mb-1">Event</div>
              <div className="text-white font-semibold">{eventName}</div>
            </div>
          )}
          {hostName && (
            <div>
              <div className="text-white/60 text-sm mb-1">Host</div>
              <div className="text-white font-semibold">{hostName}</div>
            </div>
          )}
          <div>
            <div className="text-white/60 text-sm mb-1">Status</div>
            <span
              className={`px-3 py-1 rounded text-sm uppercase font-semibold ${
                game.status === 'running'
                  ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                  : 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
              }`}
            >
              {game.status === 'running' ? 'Running' : 'Completed'}
            </span>
          </div>
          <div>
            <div className="text-white/60 text-sm mb-1">Started</div>
            <div className="text-white">{startDate.toLocaleString()}</div>
            {elapsedTime !== null && (
              <div className="text-white/60 text-xs mt-1">
                Running for {Math.floor(elapsedTime / 60)}m {elapsedTime % 60}s
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="text-white/60 text-sm mb-2">Players ({game.players.length})</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {game.players.map((player, index) => {
              const playerName = typeof player === 'string' ? player : player.name
              const playerMobile = typeof player === 'string' ? '' : player.mobile
              const playerId = typeof player === 'string' ? player : `${player.name}_${player.mobile}`
              return (
                <div
                  key={index}
                  className="bg-black/40 border border-[#d1a058]/30 rounded p-2 text-white"
                >
                  <div className="font-semibold">{playerName}</div>
                  {playerMobile && <div className="text-xs text-white/60">{playerMobile}</div>}
                </div>
              )
            })}
          </div>
        </div>

        {game.status === 'completed' && game.winner && (
          <div className="mt-6 p-4 bg-[#d1a058]/10 border border-[#d1a058]/30 rounded">
            <div className="text-[#d1a058] font-semibold mb-1">Winner</div>
            <div className="text-white text-lg">
              {game.winner}{game.winnerMobile ? ` (${game.winnerMobile})` : ''}
            </div>
            {game.winnerTime !== undefined && (
              <div className="text-white/60 text-sm mt-1">
                Time: {game.winnerTime}s
              </div>
            )}
          </div>
        )}
      </div>

      {game.status === 'running' && (
        <div className="bg-black/60 border-2 border-[#d1a058]/30 rounded-lg p-4 md:p-6">
          <h2
            className="text-xl font-bold uppercase mb-4"
            style={{
              fontFamily: "'TheWalkyrDemo', serif",
              color: '#d1a058',
            }}
          >
            Complete Game
          </h2>
          <form onSubmit={handleComplete}>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-white">Select Winner *</label>
                <select
                  value={winnerId}
                  onChange={(e) => setWinnerId(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none"
                >
                  <option value="">Select a winner</option>
                  {game.players.map((player, index) => {
                    const playerName = typeof player === 'string' ? player : player.name
                    const playerMobile = typeof player === 'string' ? '' : player.mobile
                    const playerId = typeof player === 'string' ? player : `${player.name}_${player.mobile}`
                    return (
                      <option key={index} value={playerId}>
                        {playerName}{playerMobile ? ` (${playerMobile})` : ''}
                      </option>
                    )
                  })}
                </select>
              </div>
              <div className="bg-[#d1a058]/10 border border-[#d1a058]/30 rounded-lg p-3">
                <div className="text-white/80 text-sm mb-1">Winning Time</div>
                <div className="text-[#d1a058] font-semibold">
                  {elapsedTime !== null 
                    ? `${Math.floor(elapsedTime / 60)}m ${elapsedTime % 60}s`
                    : 'Calculating...'}
                </div>
                <div className="text-white/60 text-xs mt-1">
                  Time will be calculated automatically from when the game started
                </div>
              </div>
              {error && (
                <div className="bg-red-500/20 border-2 border-red-500 rounded-lg p-3 text-red-300">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={completing || !winnerId}
                className="w-full px-6 py-3 bg-[#d1a058] text-black rounded-lg font-semibold uppercase transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  fontFamily: "'BlinkerSemiBold', sans-serif",
                }}
              >
                {completing ? 'Completing...' : 'Complete Game'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
