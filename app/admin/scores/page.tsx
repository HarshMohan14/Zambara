'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'

interface Score {
  id: string
  playerName: string
  gameId: string
  score: number
  time?: number
  createdAt: string
  game?: {
    name: string
  }
}

const ITEMS_PER_PAGE = 20

export default function AdminScores() {
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [gameFilter, setGameFilter] = useState('')
  const [playerFilter, setPlayerFilter] = useState('')

  // Refresh dashboard stats
  const refreshDashboard = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('refreshDashboard'))
    }
  }

  useEffect(() => {
    fetchScores()
  }, [gameFilter, playerFilter, currentPage])

  const fetchScores = async () => {
    try {
      setLoading(true)
      const params: any = {
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
        orderBy: 'score',
        order: 'desc',
      }
      if (gameFilter.trim()) {
        params.gameId = gameFilter.trim()
      }
      if (playerFilter.trim()) {
        params.playerName = playerFilter.trim()
      }
      
      const response = await apiClient.getScores(params)
      if (response.success && response.data) {
        const data = response.data as { scores?: any[], total?: number }
        setScores(data.scores || [])
        setTotal(data.total || 0)
      } else {
        console.error('Failed to fetch scores:', response.error)
        setScores([])
        setTotal(0)
      }
    } catch (error) {
      console.error('Error fetching scores:', error)
      setScores([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this score? This action cannot be undone.')) {
      return
    }

    try {
      const response = await apiClient.deleteScore(id)
      if (response.success) {
        alert('Score deleted successfully!')
        fetchScores()
        refreshDashboard()
      } else {
        alert(response.error || 'Failed to delete score')
      }
    } catch (error) {
      console.error('Error deleting score:', error)
      alert('Failed to delete score')
    }
  }

  const handleFilterChange = () => {
    setCurrentPage(1) // Reset to first page when filter changes
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
          Player Scores
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
          <input
            type="text"
            placeholder="Filter by Player Name"
            value={playerFilter}
            onChange={(e) => {
              setPlayerFilter(e.target.value)
              handleFilterChange()
            }}
            className="px-4 py-2 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none text-sm md:text-base"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-[#d1a058]">Loading scores...</div>
      ) : (
        <>
          <div className="bg-black/60 border-2 border-[#d1a058]/30 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b-2 border-[#d1a058]/30">
                    <th
                      className="px-3 md:px-6 py-3 md:py-4 text-left text-sm md:text-base"
                      style={{
                        fontFamily: "'BlinkerSemiBold', sans-serif",
                        color: '#d1a058',
                      }}
                    >
                      Player
                    </th>
                    <th
                      className="px-3 md:px-6 py-3 md:py-4 text-left text-sm md:text-base"
                      style={{
                        fontFamily: "'BlinkerSemiBold', sans-serif",
                        color: '#d1a058',
                      }}
                    >
                      Game
                    </th>
                    <th
                      className="px-3 md:px-6 py-3 md:py-4 text-right text-sm md:text-base"
                      style={{
                        fontFamily: "'BlinkerSemiBold', sans-serif",
                        color: '#d1a058',
                      }}
                    >
                      Score
                    </th>
                    <th
                      className="px-3 md:px-6 py-3 md:py-4 text-right text-sm md:text-base"
                      style={{
                        fontFamily: "'BlinkerSemiBold', sans-serif",
                        color: '#d1a058',
                      }}
                    >
                      Time
                    </th>
                    <th
                      className="px-3 md:px-6 py-3 md:py-4 text-left text-sm md:text-base"
                      style={{
                        fontFamily: "'BlinkerSemiBold', sans-serif",
                        color: '#d1a058',
                      }}
                    >
                      Date
                    </th>
                    <th
                      className="px-3 md:px-6 py-3 md:py-4 text-center text-sm md:text-base"
                      style={{
                        fontFamily: "'BlinkerSemiBold', sans-serif",
                        color: '#d1a058',
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((score) => (
                    <tr
                      key={score.id}
                      className="border-b border-[#d1a058]/10 hover:bg-[#d1a058]/5"
                    >
                      <td className="px-3 md:px-6 py-3 md:py-4 text-white text-sm md:text-base">
                        {score.playerName || 'Unknown'}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <span className="text-white text-sm md:text-base">{score.game?.name || 'Unknown'}</span>
                      </td>
                      <td
                        className="px-3 md:px-6 py-3 md:py-4 text-right font-bold text-[#d1a058] text-sm md:text-base"
                        style={{
                          fontFamily: "'TheWalkyrDemo', serif",
                        }}
                      >
                        {score.score.toLocaleString()}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-right text-white/80 text-sm md:text-base">
                        {score.time ? `${score.time}s` : '-'}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-white/60 text-xs md:text-sm">
                        {new Date(score.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                        <button
                          onClick={() => handleDelete(score.id)}
                          className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-xs hover:bg-red-500/30 transition-all"
                          title="Delete score"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {scores.length === 0 && (
              <div className="p-8 text-center text-white/60">
                No scores found
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-white/60 text-sm">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, total)} of {total} scores
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
