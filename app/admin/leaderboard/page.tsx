'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'

interface LeaderboardEntry {
  id: string
  rank: number
  score: number
  playerName: string
  playerMobile?: string
  playerId?: string
  time?: number
  gameId?: string
  game?: {
    id: string
    name: string
  }
}

interface GameInfo {
  id: string
  name: string
}

const ITEMS_PER_PAGE = 20

export default function AdminLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [leaderboardByGame, setLeaderboardByGame] = useState<Record<string, LeaderboardEntry[]>>({})
  const [gameInfoMap, setGameInfoMap] = useState<Record<string, GameInfo>>({})
  const [editingGameId, setEditingGameId] = useState<string | null>(null)
  const [editingGameName, setEditingGameName] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [gameIdToUpdate, setGameIdToUpdate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [gameFilter, setGameFilter] = useState('')

  // Refresh dashboard stats
  const refreshDashboard = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('refreshDashboard'))
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [gameFilter, currentPage])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const params: any = {
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
      }
      if (gameFilter.trim()) {
        params.gameId = gameFilter.trim()
      }
      
      // Admin panel should show all entries including deleted games
      const response = await apiClient.getLeaderboard({
        ...params,
        excludeDeleted: false, // Show deleted games in admin panel
      })
      if (response.success && response.data) {
        const data = response.data as { leaderboard?: any[], total?: number }
        const entries = data.leaderboard || []
        setLeaderboard(entries)
        setTotal(data.total || 0)
        
        // Group by game/event and collect game info
        const grouped: Record<string, LeaderboardEntry[]> = {}
        const gameMap: Record<string, GameInfo> = {}
        
        // First, collect all unique game IDs
        const uniqueGameIds = new Set<string>()
        entries.forEach((entry: LeaderboardEntry) => {
          const gameId = entry.gameId || entry.game?.id
          if (gameId && gameId !== 'unknown') {
            uniqueGameIds.add(gameId)
          }
        })
        
        // Fetch all game info in parallel, handle 404s gracefully
        const gameInfoPromises = Array.from(uniqueGameIds).map(async (gameId) => {
          try {
            const gameResponse = await apiClient.getGame(gameId)
            if (gameResponse.success && gameResponse.data) {
              const gameData = gameResponse.data as any
              return {
                id: gameId,
                name: gameData.name || 'Unknown Event',
              }
            } else {
              // Game not found (404) or other error
              console.warn(`Game ${gameId} not found or error:`, gameResponse.error)
              return {
                id: gameId,
                name: 'Deleted Event',
              }
            }
          } catch (error: any) {
            console.error(`Error fetching game ${gameId}:`, error)
            // Handle 404 specifically
            if (error.status === 404 || error.message?.includes('404')) {
              return {
                id: gameId,
                name: 'Deleted Event',
              }
            }
            return {
              id: gameId,
              name: 'Unknown Event',
            }
          }
        })
        
        const fetchedGameInfos = await Promise.all(gameInfoPromises)
        fetchedGameInfos.forEach((gameInfo) => {
          gameMap[gameInfo.id] = gameInfo
        })
        
        // Group entries by game
        entries.forEach((entry: LeaderboardEntry) => {
          const gameId = entry.gameId || entry.game?.id || 'unknown'
          if (!grouped[gameId]) {
            grouped[gameId] = []
          }
          grouped[gameId].push(entry)
        })
        
        setLeaderboardByGame(grouped)
        setGameInfoMap(prev => ({ ...prev, ...gameMap }))
      } else {
        console.error('Failed to fetch leaderboard:', response.error)
        setLeaderboard([])
        setLeaderboardByGame({})
        setGameInfoMap({})
        setTotal(0)
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      setLeaderboard([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateLeaderboard = async (gameId?: string) => {
    if (!gameId && !gameIdToUpdate) {
      alert('Please enter a game ID')
      return
    }

    const targetGameId = gameId || gameIdToUpdate
    try {
      setUpdating(true)
      const response = await apiClient.updateLeaderboard(targetGameId)
      
      if (response.success) {
        const data = response.data as any
        const message = data?.entriesUpdated !== undefined
          ? `Leaderboard updated! ${data.entriesUpdated} of ${data.totalEntries} entries updated.`
          : 'Leaderboard updated successfully!'
        alert(message)
        setTimeout(() => {
          fetchLeaderboard()
        }, 1000)
        setGameIdToUpdate('')
      } else {
        alert(response.error || 'Failed to update leaderboard')
      }
    } catch (error: any) {
      console.error('Error updating leaderboard:', error)
      alert(`Failed to update leaderboard: ${error.message || 'Unknown error'}`)
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this leaderboard entry? This action cannot be undone.')) {
      return
    }

    try {
      const response = await apiClient.deleteLeaderboardEntry(id)
      if (response.success) {
        alert('Leaderboard entry deleted successfully!')
        fetchLeaderboard()
        refreshDashboard()
      } else {
        alert(response.error || 'Failed to delete leaderboard entry')
      }
    } catch (error) {
      console.error('Error deleting leaderboard entry:', error)
      alert('Failed to delete leaderboard entry')
    }
  }

  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  const handleEditGameName = (gameId: string, currentName: string) => {
    setEditingGameId(gameId)
    setEditingGameName(currentName)
  }

  const handleSaveGameName = async (gameId: string) => {
    if (!editingGameName.trim()) {
      alert('Game name cannot be empty')
      return
    }

    try {
      const response = await apiClient.updateGame(gameId, {
        name: editingGameName.trim(),
      })
      if (response.success) {
        alert('Game name updated successfully!')
        setGameInfoMap(prev => ({
          ...prev,
          [gameId]: {
            id: gameId,
            name: editingGameName.trim(),
          },
        }))
        setEditingGameId(null)
        setEditingGameName('')
        refreshDashboard()
        // Refresh leaderboard to get updated game names
        fetchLeaderboard()
      } else {
        if ((response as any).status === 404) {
          alert('Game not found. It may have been deleted.')
          // Remove from gameInfoMap
          setGameInfoMap(prev => {
            const updated = { ...prev }
            delete updated[gameId]
            return updated
          })
        } else {
          alert(response.error || 'Failed to update game name')
        }
      }
    } catch (error: any) {
      console.error('Error updating game name:', error)
      if (error.status === 404) {
        alert('Game not found. It may have been deleted.')
      } else {
        alert('Failed to update game name')
      }
    }
  }

  const handleCancelEdit = () => {
    setEditingGameId(null)
    setEditingGameName('')
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h1
            className="text-2xl md:text-3xl font-bold uppercase"
            style={{
              fontFamily: "'TheWalkyrDemo', serif",
              color: '#d1a058',
            }}
          >
            Leaderboard Rankings
          </h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Filter by Game ID"
              value={gameFilter}
              onChange={(e) => {
                setGameFilter(e.target.value)
                handleFilterChange()
              }}
              className="px-4 py-2 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none text-sm md:text-base"
            />
            <button
              onClick={fetchLeaderboard}
              disabled={loading}
              className="px-4 py-2 bg-[#d1a058] text-black rounded-lg font-semibold uppercase transition-all hover:scale-105 disabled:opacity-50 text-sm md:text-base"
              style={{
                fontFamily: "'BlinkerSemiBold', sans-serif",
              }}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
        
        {/* Manual Update Section */}
        <div className="bg-black/60 border-2 border-[#d1a058]/30 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-2 items-end">
            <div className="flex-1">
              <label className="block mb-2 text-white text-sm">Update Leaderboard for Game ID</label>
              <input
                type="text"
                value={gameIdToUpdate}
                onChange={(e) => setGameIdToUpdate(e.target.value)}
                placeholder="Enter game ID"
                className="w-full px-4 py-2 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none text-sm"
              />
            </div>
            <button
              onClick={() => handleUpdateLeaderboard()}
              disabled={updating || !gameIdToUpdate}
              className="px-4 py-2 bg-[#d1a058] text-black rounded-lg font-semibold uppercase transition-all hover:scale-105 disabled:opacity-50 text-sm"
              style={{
                fontFamily: "'BlinkerSemiBold', sans-serif",
              }}
            >
              {updating ? 'Updating...' : 'Update'}
            </button>
          </div>
          <div className="text-white/60 text-xs mt-2">
            Tip: Leaderboard updates automatically when you complete a game. Use this to manually refresh if needed.
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-[#d1a058]">Loading leaderboard...</div>
      ) : (
        <>
          {Object.keys(leaderboardByGame).length > 0 ? (
            Object.entries(leaderboardByGame).map(([gameId, entries]) => {
              const gameInfo = gameInfoMap[gameId] || entries[0]?.game
              const gameName = gameInfo?.name || entries[0]?.game?.name || 'Deleted Event'
              const isEditing = editingGameId === gameId
              const isDeleted = gameName === 'Deleted Event' || gameName === 'Unknown Event'
              
              return (
                <div key={gameId} className="mb-8">
                  <div className="bg-[#d1a058]/20 border-2 border-[#d1a058]/50 rounded-lg p-4 mb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <input
                              type="text"
                              value={editingGameName}
                              onChange={(e) => setEditingGameName(e.target.value)}
                              className="flex-1 min-w-[200px] px-4 py-2 bg-black/60 border-2 border-[#d1a058]/50 rounded-lg text-white focus:border-[#d1a058] focus:outline-none text-xl md:text-2xl font-bold uppercase"
                              style={{
                                fontFamily: "'TheWalkyrDemo', serif",
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveGameName(gameId)}
                              className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded text-green-400 hover:bg-green-500/30 transition-all text-sm"
                            >
                              ✓ Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded text-red-400 hover:bg-red-500/30 transition-all text-sm"
                            >
                              ✕ Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2
                              className={`text-xl md:text-2xl font-bold uppercase ${
                                isDeleted ? 'text-red-400' : 'text-[#d1a058]'
                              }`}
                              style={{
                                fontFamily: "'TheWalkyrDemo', serif",
                              }}
                            >
                              {gameName} - Leaderboard
                            </h2>
                            {!isDeleted && (
                              <button
                                onClick={() => handleEditGameName(gameId, gameName)}
                                className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-blue-400 hover:bg-blue-500/30 transition-all text-xs"
                                title="Edit event name"
                              >
                                ✏️ Edit Name
                              </button>
                            )}
                            {isDeleted && (
                              <span className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-xs">
                                Game Deleted
                              </span>
                            )}
                          </div>
                        )}
                        <div className="text-white/60 text-sm mt-1">
                          Game ID: {gameId} • {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black/60 border-2 border-[#d1a058]/30 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px]">
                        <thead>
                          <tr className="border-b-2 border-[#d1a058]/30 bg-black/40">
                            <th
                              className="px-3 md:px-6 py-3 md:py-4 text-left text-sm md:text-base text-[#d1a058] font-semibold"
                              style={{
                                fontFamily: "'BlinkerSemiBold', sans-serif",
                              }}
                            >
                              Rank
                            </th>
                            <th
                              className="px-3 md:px-6 py-3 md:py-4 text-left text-sm md:text-base text-[#d1a058] font-semibold"
                              style={{
                                fontFamily: "'BlinkerSemiBold', sans-serif",
                              }}
                            >
                              Player
                            </th>
                            <th
                              className="px-3 md:px-6 py-3 md:py-4 text-right text-sm md:text-base text-[#d1a058] font-semibold"
                              style={{
                                fontFamily: "'BlinkerSemiBold', sans-serif",
                              }}
                            >
                              Score
                            </th>
                            <th
                              className="px-3 md:px-6 py-3 md:py-4 text-right text-sm md:text-base text-[#d1a058] font-semibold"
                              style={{
                                fontFamily: "'BlinkerSemiBold', sans-serif",
                              }}
                            >
                              Time
                            </th>
                            <th
                              className="px-3 md:px-6 py-3 md:py-4 text-center text-sm md:text-base text-[#d1a058] font-semibold"
                              style={{
                                fontFamily: "'BlinkerSemiBold', sans-serif",
                              }}
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {entries.map((entry) => (
                            <tr
                              key={entry.id}
                              className="border-b border-[#d1a058]/10 hover:bg-[#d1a058]/5"
                            >
                              <td
                                className="px-3 md:px-6 py-3 md:py-4 font-bold text-[#d1a058] text-base md:text-xl"
                                style={{
                                  fontFamily: "'TheWalkyrDemo', serif",
                                }}
                              >
                                #{entry.rank}
                              </td>
                              <td className="px-3 md:px-6 py-3 md:py-4 text-white text-sm md:text-base">
                                <div>{entry.playerName || 'Unknown'}</div>
                                {entry.playerMobile && (
                                  <div className="text-white/60 text-xs">{entry.playerMobile}</div>
                                )}
                              </td>
                              <td
                                className="px-3 md:px-6 py-3 md:py-4 text-right font-bold text-[#d1a058] text-sm md:text-base"
                                style={{
                                  fontFamily: "'TheWalkyrDemo', serif",
                                }}
                              >
                                {entry.score.toLocaleString()}
                              </td>
                              <td className="px-3 md:px-6 py-3 md:py-4 text-right text-white/80 text-sm md:text-base">
                                {entry.time ? `${entry.time}s` : '-'}
                              </td>
                              <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                                <button
                                  onClick={() => handleDelete(entry.id)}
                                  className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-xs hover:bg-red-500/30 transition-all"
                                  title="Delete entry"
                                >
                                  🗑️
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="bg-black/60 border-2 border-[#d1a058]/30 rounded-lg p-8 text-center text-white/60">
              No leaderboard entries yet
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-white/60 text-sm">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, total)} of {total} entries
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#d1a058] transition-all text-sm"
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm transition-all ${
                          currentPage === pageNum
                            ? 'bg-[#d1a058] text-black font-semibold'
                            : 'bg-black/60 border-2 border-[#d1a058]/30 text-white hover:border-[#d1a058]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#d1a058] transition-all text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
