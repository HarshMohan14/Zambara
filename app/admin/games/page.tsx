'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'

interface Player {
  name: string
  mobile: string
}

interface Game {
  id: string
  name: string
  description?: string
  difficulty: string
  players: Player[]
  status: 'running' | 'completed'
  startTime: string
  winner?: string
  winnerMobile?: string
  winnerId?: string
  winnerTime?: number
  createdAt: string
}

interface LeaderboardStatus {
  hasLeaderboard: boolean
  lastUpdated: string | null
  entryCount: number
}

const ITEMS_PER_PAGE = 12

export default function AdminGames() {
  const router = useRouter()
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [filter, setFilter] = useState<'all' | 'running' | 'completed'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [updatingLeaderboard, setUpdatingLeaderboard] = useState<string | null>(null)
  const [leaderboardStatuses, setLeaderboardStatuses] = useState<Record<string, LeaderboardStatus>>({})
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty: 'medium',
    players: [
      { name: '', mobile: '' },
      { name: '', mobile: '' },
      { name: '', mobile: '' },
    ] as Player[],
  })

  // Refresh dashboard stats
  const refreshDashboard = () => {
    // Dispatch custom event to refresh dashboard
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('refreshDashboard'))
    }
  }

  useEffect(() => {
    fetchGames()
  }, [filter, currentPage])

  const fetchGames = async () => {
    try {
      setLoading(true)
      const params: any = { 
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE
      }
      if (filter !== 'all') {
        params.status = filter
      }
      console.log(`[fetchGames] Fetching games with filter: ${filter}, page: ${currentPage}`, params)
      const response = await apiClient.getGames(params)
      console.log(`[fetchGames] Response:`, response)
      if (response.success && response.data) {
        const data = response.data as { games?: any[], total?: number }
        const fetchedGames = data.games || []
        const totalCount = data.total || 0
        console.log(`[fetchGames] Found ${fetchedGames.length} games, total: ${totalCount}`)
        setGames(fetchedGames)
        setTotal(totalCount)
        
        // Fetch leaderboard status for completed games
        const completedGames = fetchedGames.filter((g: Game) => g.status === 'completed')
        if (completedGames.length > 0) {
          const statusPromises = completedGames.map(async (game: Game) => {
            try {
              const statusResponse = await apiClient.checkGameLeaderboardStatus(game.id)
              if (statusResponse.success && statusResponse.data) {
                return { gameId: game.id, status: statusResponse.data as LeaderboardStatus }
              }
              return { gameId: game.id, status: { hasLeaderboard: false, lastUpdated: null, entryCount: 0 } }
            } catch (error) {
              console.error(`Error checking leaderboard for game ${game.id}:`, error)
              return { gameId: game.id, status: { hasLeaderboard: false, lastUpdated: null, entryCount: 0 } }
            }
          })
          
          const statuses = await Promise.all(statusPromises)
          const statusMap: Record<string, LeaderboardStatus> = {}
          statuses.forEach(({ gameId, status }) => {
            statusMap[gameId] = status
          })
          setLeaderboardStatuses(statusMap)
        }
      } else {
        console.error('Failed to fetch games:', response.error)
        setGames([])
        setTotal(0)
      }
    } catch (error) {
      console.error('Error fetching games:', error)
      setGames([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const refreshLeaderboardStatus = async (gameId: string) => {
    try {
      const statusResponse = await apiClient.checkGameLeaderboardStatus(gameId)
      if (statusResponse.success && statusResponse.data) {
        const status = statusResponse.data as LeaderboardStatus
        setLeaderboardStatuses(prev => ({
          ...prev,
          [gameId]: status,
        }))
        return status
      }
      return null
    } catch (statusError: any) {
      console.error(`Error refreshing leaderboard status for game ${gameId}:`, statusError)
      return null
    }
  }

  const handleUpdateLeaderboard = async (gameId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      setUpdatingLeaderboard(gameId)
      const response = await apiClient.updateLeaderboard(gameId)
      if (response.success) {
        const data = response.data as any
        alert(data?.entriesUpdated 
          ? `Leaderboard updated! ${data.entriesUpdated} entries updated.`
          : 'Leaderboard updated successfully!')
        
        setTimeout(async () => {
          await refreshLeaderboardStatus(gameId)
        }, 1000)
      } else {
        alert(response.error || 'Failed to update leaderboard')
      }
    } catch (error: any) {
      console.error('Error updating leaderboard:', error)
      alert(`Failed to update leaderboard: ${error.message || 'Unknown error'}`)
    } finally {
      setUpdatingLeaderboard(null)
    }
  }

  const handleFilterChange = (newFilter: 'all' | 'running' | 'completed') => {
    setFilter(newFilter)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validPlayers = formData.players.filter(p => p.name.trim().length > 0 && p.mobile.trim().length > 0)
    if (validPlayers.length < 3) {
      alert('Please add at least 3 players with both name and mobile number')
      return
    }
    if (validPlayers.length > 6) {
      alert('Maximum 6 players allowed')
      return
    }

    // Validate mobile numbers
    for (let i = 0; i < validPlayers.length; i++) {
      const player = validPlayers[i]
      if (!player.mobile.match(/^[0-9]{10,15}$/)) {
        alert(`Player ${i + 1} mobile number is invalid. Please enter 10-15 digits.`)
        return
      }
    }

    try {
      if (editingGame) {
        // Update existing game
        const response = await apiClient.updateGame(editingGame.id, {
          name: formData.name,
          description: formData.description,
          difficulty: formData.difficulty as 'easy' | 'medium' | 'hard' | undefined,
        })
        if (response.success) {
          alert('Game updated successfully!')
          setShowForm(false)
          setEditingGame(null)
          resetForm()
          fetchGames()
          refreshDashboard()
        } else {
          alert(response.error || 'Failed to update game')
        }
      } else {
        // Create new game
        const response = await apiClient.createGame({
          ...formData,
          difficulty: formData.difficulty as 'easy' | 'medium' | 'hard' | undefined,
          players: validPlayers.map(p => ({
            name: p.name.trim(),
            mobile: p.mobile.trim(),
          })),
        })
        if (response.success) {
          alert('Game created successfully!')
          setShowForm(false)
          resetForm()
          fetchGames()
          refreshDashboard()
        } else {
          alert(response.error || 'Failed to create game')
        }
      }
    } catch (error) {
      console.error('Error saving game:', error)
      alert('Failed to save game')
    }
  }

  const handleEdit = (game: Game, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingGame(game)
    setFormData({
      name: game.name,
      description: game.description || '',
      difficulty: game.difficulty,
      players: game.players.map(p => 
        typeof p === 'string' 
          ? { name: p, mobile: '' } // Handle legacy data
          : p
      ),
    })
    setShowForm(true)
  }

  const handleDelete = async (gameId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this game? This action cannot be undone.')) {
      return
    }

    try {
      const response = await apiClient.deleteGame(gameId)
      if (response.success) {
        alert('Game deleted successfully!')
        fetchGames()
        refreshDashboard()
      } else {
        alert(response.error || 'Failed to delete game')
      }
    } catch (error) {
      console.error('Error deleting game:', error)
      alert('Failed to delete game')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      difficulty: 'medium',
      players: [
        { name: '', mobile: '' },
        { name: '', mobile: '' },
        { name: '', mobile: '' },
      ],
    })
    setEditingGame(null)
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <h1
          className="text-2xl md:text-3xl font-bold uppercase"
          style={{
            fontFamily: "'TheWalkyrDemo', serif",
            color: '#d1a058',
          }}
        >
          Manage Games
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <select
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value as 'all' | 'running' | 'completed')}
            className="px-4 py-2 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none text-sm md:text-base"
          >
            <option value="all">All Games</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
          </select>
          <button
            onClick={() => {
              resetForm()
              setShowForm(!showForm)
            }}
            className="px-4 py-2 bg-[#d1a058] text-black rounded-lg font-semibold uppercase transition-all hover:scale-105 text-sm md:text-base"
            style={{
              fontFamily: "'BlinkerSemiBold', sans-serif",
            }}
          >
            {showForm ? 'Cancel' : '+ New Game'}
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 md:mb-8 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg p-4 md:p-6"
        >
          <h2
            className="text-lg md:text-xl font-bold uppercase mb-4"
            style={{
              fontFamily: "'TheWalkyrDemo', serif",
              color: '#d1a058',
            }}
          >
            {editingGame ? 'Edit Game' : 'Create New Game'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-white">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none"
              />
            </div>
            <div>
              <label className="block mb-2 text-white">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({ ...formData, difficulty: e.target.value })
                }
                className="w-full px-4 py-2 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block mb-2 text-white">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none"
                rows={3}
              />
            </div>
            {!editingGame && (
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-white">Players (3-6 required) *</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.players.length < 6) {
                          setFormData({
                            ...formData,
                            players: [...formData.players, { name: '', mobile: '' }],
                          })
                        }
                      }}
                      className="px-3 py-1 bg-[#d1a058]/20 border border-[#d1a058]/30 rounded text-[#d1a058] text-sm hover:bg-[#d1a058]/30"
                      disabled={formData.players.length >= 6}
                    >
                      + Add Player
                    </button>
                    {formData.players.length > 3 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (formData.players.length > 3) {
                            setFormData({
                              ...formData,
                              players: formData.players.slice(0, -1),
                            })
                          }
                        }}
                        className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-sm hover:bg-red-500/30"
                      >
                        - Remove
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  {formData.players.map((player, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        value={player.name}
                        onChange={(e) => {
                          const newPlayers = [...formData.players]
                          newPlayers[index] = { ...newPlayers[index], name: e.target.value }
                          setFormData({ ...formData, players: newPlayers })
                        }}
                        placeholder={`Player ${index + 1} name *`}
                        className="w-full px-4 py-2 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none"
                      />
                      <input
                        type="tel"
                        required
                        value={player.mobile}
                        onChange={(e) => {
                          const newPlayers = [...formData.players]
                          newPlayers[index] = { ...newPlayers[index], mobile: e.target.value }
                          setFormData({ ...formData, players: newPlayers })
                        }}
                        placeholder={`Mobile number *`}
                        className="w-full px-4 py-2 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-white/60 text-xs mt-2">
                  {formData.players.filter(p => p.name.trim() && p.mobile.trim()).length} player{formData.players.filter(p => p.name.trim() && p.mobile.trim()).length !== 1 ? 's' : ''} added
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-[#d1a058] text-black rounded-lg font-semibold uppercase transition-all hover:scale-105"
              style={{
                fontFamily: "'BlinkerSemiBold', sans-serif",
              }}
            >
              {editingGame ? 'Update Game' : 'Create Game'}
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm()
                setShowForm(false)
              }}
              className="px-6 py-2 bg-white/10 text-white rounded-lg font-semibold uppercase transition-all hover:bg-white/20"
              style={{
                fontFamily: "'BlinkerSemiBold', sans-serif",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-[#d1a058]">Loading games...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {games.map((game) => {
              const startDate = new Date(game.startTime)
              const elapsedTime = game.status === 'running' 
                ? Math.floor((Date.now() - startDate.getTime()) / 1000)
                : null
              
              return (
                <div
                  key={game.id}
                  className="bg-black/60 border-2 border-[#d1a058]/30 rounded-lg p-4 md:p-6 hover:border-[#d1a058]/60 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3
                        className="text-xl font-bold text-white mb-1 cursor-pointer hover:text-[#d1a058]"
                        onClick={() => router.push(`/admin/games/${game.id}`)}
                        style={{
                          fontFamily: "'BlinkerSemiBold', sans-serif",
                        }}
                      >
                        {game.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span
                          className="px-2 py-1 bg-[#d1a058]/20 border border-[#d1a058]/30 rounded text-[#d1a058] text-xs uppercase"
                        >
                          {game.difficulty}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs uppercase ${
                            game.status === 'running'
                              ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                              : 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
                          }`}
                        >
                          {game.status === 'running' ? 'Running' : 'Completed'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => handleEdit(game, e)}
                        className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-blue-400 text-xs hover:bg-blue-500/30 transition-all"
                        title="Edit game"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => handleDelete(game.id, e)}
                        className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-xs hover:bg-red-500/30 transition-all"
                        title="Delete game"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  {game.description && (
                    <p className="text-white/60 text-sm mb-3 line-clamp-2">{game.description}</p>
                  )}
                  <div className="mb-3">
                    <div className="text-white/60 text-xs mb-1">Players ({game.players.length})</div>
                    <div className="flex flex-wrap gap-1">
                      {game.players.slice(0, 3).map((player, idx) => {
                        const playerName = typeof player === 'string' ? player : player.name
                        const playerMobile = typeof player === 'string' ? '' : player.mobile
                        return (
                          <span key={idx} className="text-white text-xs bg-black/40 px-2 py-1 rounded">
                            {playerName}{playerMobile ? ` (${playerMobile})` : ''}
                          </span>
                        )
                      })}
                      {game.players.length > 3 && (
                        <span className="text-white/60 text-xs px-2 py-1">
                          +{game.players.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  {game.status === 'running' && elapsedTime !== null && (
                    <div className="text-xs text-green-400 mb-2">
                      Running for {Math.floor(elapsedTime / 60)}m {elapsedTime % 60}s
                    </div>
                  )}
                  {game.status === 'completed' && game.winner && (
                    <div className="space-y-2 mb-2">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-[#d1a058]">
                          Winner: {game.winner}{game.winnerMobile ? ` (${game.winnerMobile})` : ''} ({game.winnerTime}s)
                        </div>
                        <button
                          onClick={(e) => handleUpdateLeaderboard(game.id, e)}
                          disabled={updatingLeaderboard === game.id}
                          className="px-2 py-1 bg-[#d1a058]/20 border border-[#d1a058]/30 rounded text-[#d1a058] text-xs hover:bg-[#d1a058]/30 transition-all disabled:opacity-50"
                          title="Update leaderboard for this game"
                        >
                          {updatingLeaderboard === game.id ? 'Updating...' : '↻ Update LB'}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {leaderboardStatuses[game.id] !== undefined ? (
                          leaderboardStatuses[game.id].hasLeaderboard ? (
                            <>
                              <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded text-green-400 text-xs flex items-center gap-1">
                                <span>✓</span>
                                <span>In Leaderboard</span>
                                {leaderboardStatuses[game.id].entryCount > 0 && (
                                  <span className="text-green-300/60">({leaderboardStatuses[game.id].entryCount})</span>
                                )}
                              </span>
                              {leaderboardStatuses[game.id].lastUpdated && (
                                <span className="text-white/40 text-xs">
                                  Updated: {new Date(leaderboardStatuses[game.id].lastUpdated!).toLocaleString()}
                                </span>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  refreshLeaderboardStatus(game.id)
                                }}
                                className="px-2 py-0.5 bg-[#d1a058]/20 border border-[#d1a058]/30 rounded text-[#d1a058] text-xs hover:bg-[#d1a058]/30 transition-all"
                                title="Refresh status"
                              >
                                ↻
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/30 rounded text-yellow-400 text-xs">
                                Not in Leaderboard
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  refreshLeaderboardStatus(game.id)
                                }}
                                className="px-2 py-0.5 bg-[#d1a058]/20 border border-[#d1a058]/30 rounded text-[#d1a058] text-xs hover:bg-[#d1a058]/30 transition-all"
                                title="Refresh status"
                              >
                                ↻
                              </button>
                            </>
                          )
                        ) : (
                          <span className="text-white/40 text-xs">Checking status...</span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-white/40">
                    Started: {startDate.toLocaleDateString()}
                  </div>
                </div>
              )
            })}
            {games.length === 0 && (
              <div className="col-span-full text-center text-white/60 p-8">
                No games found. Create your first game!
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-white/60 text-sm">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, total)} of {total} games
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
