'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

interface Player {
  name: string
  mobile: string
}

interface Game {
  id: string
  eventId?: string
  hostId?: string
  players: Player[]
  status: 'running' | 'completed'
  startTime: string
  winner?: string
  winnerMobile?: string
  winnerId?: string
  winnerTime?: number
  createdAt: string
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
  const [events, setEvents] = useState<Array<{ id: string; name: string }>>([])
  const [hosts, setHosts] = useState<Array<{ id: string; name: string }>>([])
  const [eventsMap, setEventsMap] = useState<Record<string, string>>({})
  const [hostsMap, setHostsMap] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    eventId: '',
    hostId: '',
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
    fetchEventsAndHosts()
  }, [filter, currentPage])

  const fetchEventsAndHosts = async () => {
    try {
      const [eventsRes, hostsRes] = await Promise.all([
        apiClient.getEvents({ limit: 100 }),
        apiClient.getHosts({ limit: 100 }),
      ])

      if (eventsRes.success && eventsRes.data) {
        const eventsData = eventsRes.data as { events?: any[] }
        const eventsList = eventsData.events?.map((e: any) => ({ id: e.id, name: e.name })) || []
        setEvents(eventsList)
        // Create a map for quick lookup
        const eventsMapObj: Record<string, string> = {}
        eventsList.forEach((e) => {
          eventsMapObj[e.id] = e.name
        })
        setEventsMap(eventsMapObj)
      }

      if (hostsRes.success && hostsRes.data) {
        const hostsData = hostsRes.data as { hosts?: any[] }
        const hostsList = hostsData.hosts?.map((h: any) => ({ id: h.id, name: h.name })) || []
        setHosts(hostsList)
        // Create a map for quick lookup
        const hostsMapObj: Record<string, string> = {}
        hostsList.forEach((h) => {
          hostsMapObj[h.id] = h.name
        })
        setHostsMap(hostsMapObj)
      }
    } catch (error) {
      console.error('Error fetching events and hosts:', error)
    }
  }

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

  const handleFilterChange = (newFilter: 'all' | 'running' | 'completed') => {
    setFilter(newFilter)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate event and host are selected
    if (!formData.eventId || !formData.eventId.trim()) {
      toast.warning('Please select an event')
      return
    }
    if (!formData.hostId || !formData.hostId.trim()) {
      toast.warning('Please select a host')
      return
    }
    
    const validPlayers = formData.players.filter(p => p.name.trim().length > 0 && p.mobile.trim().length > 0)
    if (validPlayers.length < 3) {
      toast.warning('Please add at least 3 players with both name and mobile number')
      return
    }
    if (validPlayers.length > 6) {
      toast.warning('Maximum 6 players allowed')
      return
    }

    // Validate mobile numbers
    for (let i = 0; i < validPlayers.length; i++) {
      const player = validPlayers[i]
      if (!player.mobile.match(/^[0-9]{10,15}$/)) {
        toast.warning(`Player ${i + 1} mobile number is invalid. Please enter 10-15 digits.`)
        return
      }
    }

    try {
      if (editingGame) {
        // Update existing game
        const response = await apiClient.updateGame(editingGame.id, {
          eventId: formData.eventId,
          hostId: formData.hostId,
        })
        if (response.success) {
          toast.success('Game updated successfully!')
          setShowForm(false)
          setEditingGame(null)
          resetForm()
          fetchGames()
          refreshDashboard()
        } else {
          toast.error(response.error || 'Failed to update game')
        }
      } else {
        // Create new game
        const response = await apiClient.createGame({
          eventId: formData.eventId,
          hostId: formData.hostId,
          players: validPlayers.map(p => ({
            name: p.name.trim(),
            mobile: p.mobile.trim(),
          })),
        })
        if (response.success) {
          toast.success('Game created successfully!')
          setShowForm(false)
          resetForm()
          fetchGames()
          refreshDashboard()
        } else {
          toast.error(response.error || 'Failed to create game')
        }
      }
    } catch (error) {
      console.error('Error saving game:', error)
      toast.error('Failed to save game')
    }
  }

  const handleEdit = (game: Game, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingGame(game)
    setFormData({
      eventId: (game as any).eventId || '',
      hostId: (game as any).hostId || '',
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
        toast.success('Game deleted successfully!')
        fetchGames()
        refreshDashboard()
      } else {
        toast.error(response.error || 'Failed to delete game')
      }
    } catch (error) {
      console.error('Error deleting game:', error)
      toast.error('Failed to delete game')
    }
  }

  const resetForm = () => {
    setFormData({
      eventId: '',
      hostId: '',
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
              <label className="block mb-2 text-white">Event *</label>
              <select
                required
                value={formData.eventId}
                onChange={(e) =>
                  setFormData({ ...formData, eventId: e.target.value })
                }
                className="w-full px-4 py-2 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none"
              >
                <option value="">Select Event *</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-white">Host *</label>
              <select
                required
                value={formData.hostId}
                onChange={(e) =>
                  setFormData({ ...formData, hostId: e.target.value })
                }
                className="w-full px-4 py-2 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none"
              >
                <option value="">Select Host *</option>
                {hosts.map((host) => (
                  <option key={host.id} value={host.id}>
                    {host.name}
                  </option>
                ))}
              </select>
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
                        {game.eventId && eventsMap[game.eventId] 
                          ? eventsMap[game.eventId] 
                          : game.hostId && hostsMap[game.hostId]
                          ? `${hostsMap[game.hostId]}'s Game`
                          : 'Game'}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {game.eventId && eventsMap[game.eventId] && (
                          <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-blue-400 text-xs">
                            Event: {eventsMap[game.eventId]}
                          </span>
                        )}
                        {game.hostId && hostsMap[game.hostId] && (
                          <span className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-400 text-xs">
                            Host: {hostsMap[game.hostId]}
                          </span>
                        )}
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
                    <div className="text-xs text-[#d1a058] mb-2">
                      Winner: {game.winner}{game.winnerMobile ? ` (${game.winnerMobile})` : ''} ({game.winnerTime}s)
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
