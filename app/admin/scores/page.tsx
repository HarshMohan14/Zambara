'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'

interface Ranking {
  id: string
  rank: number
  playerName: string
  playerMobile?: string
  gameId: string
  gameName: string
  time: number
  createdAt: string
}

interface EventOption {
  id: string
  name: string
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]
const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_BUTTONS = 7

export default function AdminEventRankings() {
  const [events, setEvents] = useState<EventOption[]>([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [rankings, setRankings] = useState<Ranking[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingRankings, setLoadingRankings] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    if (selectedEventId) {
      fetchRankings()
    } else {
      setRankings([])
      setTotal(0)
      setTotalPages(0)
    }
  }, [selectedEventId, page, pageSize])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const res = await apiClient.getEvents({ limit: 500 })
      if (res.success && res.data) {
        const data = res.data as { events?: { id: string; name: string }[] }
        setEvents(data.events || [])
        if (data.events?.length && !selectedEventId) {
          setSelectedEventId(data.events[0].id)
        }
      }
    } catch (e) {
      console.error(e)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const fetchRankings = async () => {
    if (!selectedEventId) return
    try {
      setLoadingRankings(true)
      const res = await apiClient.getRankings({
        eventId: selectedEventId,
        page,
        pageSize,
      })
      if (res.success && res.data) {
        const d = res.data as {
          rankings?: Ranking[]
          total?: number
          totalPages?: number
        }
        setRankings(d.rankings || [])
        setTotal(d.total ?? 0)
        setTotalPages(d.totalPages ?? 0)
      } else {
        setRankings([])
        setTotal(0)
        setTotalPages(0)
      }
    } catch (e) {
      console.error(e)
      setRankings([])
      setTotal(0)
      setTotalPages(0)
    } finally {
      setLoadingRankings(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this ranking record? This cannot be undone.')) return
    try {
      const res = await apiClient.deleteScore(id)
      if (res.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('refreshDashboard'))
        }
        fetchRankings()
      } else {
        alert(res.error || 'Failed to delete')
      }
    } catch (e) {
      console.error(e)
      alert('Failed to delete')
    }
  }

  const goToPage = (p: number) => {
    setPage(Math.max(1, Math.min(p, totalPages)))
  }

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  const pageNumbers: number[] = []
  if (totalPages <= MAX_PAGE_BUTTONS) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i)
  } else {
    const half = Math.floor(MAX_PAGE_BUTTONS / 2)
    let low = Math.max(1, page - half)
    let high = Math.min(totalPages, low + MAX_PAGE_BUTTONS - 1)
    if (high - low + 1 < MAX_PAGE_BUTTONS) {
      low = Math.max(1, high - MAX_PAGE_BUTTONS + 1)
    }
    for (let i = low; i <= high; i++) pageNumbers.push(i)
  }

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6 md:mb-8">
        <h1
          className="text-2xl md:text-3xl font-bold uppercase"
          style={{
            fontFamily: "'TheWalkyrDemo', serif",
            color: '#d1a058',
          }}
        >
          Event Rankings
        </h1>
        <p className="text-white/70 text-sm md:text-base" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
          Rankings by event (lower time = better rank). Select an event to view.
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <label className="text-white/80 text-sm font-medium" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>
            Event
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value)
              setPage(1)
            }}
            disabled={loading}
            className="px-4 py-2 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none text-sm md:text-base min-w-[200px]"
          >
            <option value="">Select event…</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-[#d1a058]">Loading events…</div>
      ) : !selectedEventId ? (
        <div className="text-white/60 py-8">Select an event to view rankings.</div>
      ) : (
        <>
          <div className="bg-black/60 border-2 border-[#d1a058]/30 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b-2 border-[#d1a058]/30">
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-sm md:text-base" style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#d1a058' }}>Rank</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-sm md:text-base" style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#d1a058' }}>Player</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-right text-sm md:text-base" style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#d1a058' }}>Time</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-sm md:text-base" style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#d1a058' }}>Date</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-center text-sm md:text-base" style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#d1a058' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingRankings ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-white/60">
                        Loading rankings…
                      </td>
                    </tr>
                  ) : (
                    rankings.map((r) => (
                      <tr key={r.id} className="border-b border-[#d1a058]/10 hover:bg-[#d1a058]/5">
                        <td className="px-3 md:px-6 py-3 md:py-4 font-bold text-[#d1a058] text-sm md:text-base" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>{r.rank}</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-white text-sm md:text-base">{r.playerName || '—'}</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-right text-white/90 text-sm md:text-base">{r.time != null ? `${r.time}s` : '—'}</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-white/60 text-xs md:text-sm">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleDelete(r.id)}
                            className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-xs hover:bg-red-500/30 transition-all"
                            title="Delete record"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {!loadingRankings && rankings.length === 0 && (
              <div className="p-8 text-center text-white/60">No rankings for this event yet.</div>
            )}
          </div>

          {/* Full pagination */}
          {totalPages > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-white/60 text-sm">
                  Showing {start} to {end} of {total}
                </span>
                <label className="flex items-center gap-2 text-white/80 text-sm">
                  <span>Per page</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value))
                      setPage(1)
                    }}
                    className="px-2 py-1 bg-black/60 border border-[#d1a058]/30 rounded text-white text-sm focus:border-[#d1a058] focus:outline-none"
                  >
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(1)}
                  disabled={page === 1}
                  className="px-3 py-2 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#d1a058] transition-all"
                >
                  First
                </button>
                <button
                  type="button"
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-2 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#d1a058] transition-all"
                >
                  Previous
                </button>
                {pageNumbers.map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => goToPage(num)}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      page === num
                        ? 'bg-[#d1a058] text-black font-semibold'
                        : 'bg-black/60 border-2 border-[#d1a058]/30 text-white hover:border-[#d1a058]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-2 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#d1a058] transition-all"
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={() => goToPage(totalPages)}
                  disabled={page === totalPages}
                  className="px-3 py-2 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#d1a058] transition-all"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
