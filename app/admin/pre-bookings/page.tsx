'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'

interface PreBooking {
  id: string
  name: string
  email: string
  mobile: string
  preferredDate?: string
  preferredTime?: string
  numberOfPlayers: number
  specialRequests?: string
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

const ITEMS_PER_PAGE = 10

export default function AdminPreBookings() {
  const [preBookings, setPreBookings] = useState<PreBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)

  // Refresh dashboard stats
  const refreshDashboard = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('refreshDashboard'))
    }
  }

  useEffect(() => {
    fetchPreBookings()
  }, [filter, currentPage])

  const fetchPreBookings = async () => {
    try {
      setLoading(true)
      const params: any = {
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
      }
      if (filter !== 'all') {
        params.status = filter
      }
      
      console.log('Fetching pre-bookings with params:', params)
      const response = await apiClient.getPreBookings(params)
      console.log('Pre-bookings API response:', response)
      
      if (response.success && response.data) {
        const data = response.data as { preBookings?: any[], total?: number }
        console.log('Pre-bookings data:', data)
        setPreBookings(data.preBookings || [])
        setTotal(data.total || 0)
        setError(null)
      } else {
        const errorMsg = response.error || 'Failed to fetch pre-bookings'
        console.error('Failed to fetch pre-bookings:', response.error, response)
        setError(errorMsg)
        setPreBookings([])
        setTotal(0)
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'An unexpected error occurred'
      console.error('Error fetching pre-bookings:', error)
      setError(errorMsg)
      setPreBookings([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: 'pending' | 'confirmed' | 'cancelled') => {
    try {
      const response = await apiClient.updatePreBooking(id, { status: newStatus })
      if (response.success) {
        fetchPreBookings()
        refreshDashboard()
      } else {
        alert(response.error || 'Failed to update pre-booking')
      }
    } catch (error) {
      console.error('Error updating pre-booking:', error)
      alert('Failed to update pre-booking')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pre-booking? This action cannot be undone.')) {
      return
    }

    try {
      const response = await apiClient.deletePreBooking(id)
      if (response.success) {
        alert('Pre-booking deleted successfully!')
        fetchPreBookings()
        refreshDashboard()
      } else {
        alert(response.error || 'Failed to delete pre-booking')
      }
    } catch (error) {
      console.error('Error deleting pre-booking:', error)
      alert('Failed to delete pre-booking')
    }
  }

  const handleFilterChange = (newFilter: 'all' | 'pending' | 'confirmed' | 'cancelled') => {
    setFilter(newFilter)
    setCurrentPage(1)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
      case 'confirmed':
        return 'bg-green-500/20 border-green-500/30 text-green-400'
      case 'cancelled':
        return 'bg-red-500/20 border-red-500/30 text-red-400'
      default:
        return 'bg-gray-500/20 border-gray-500/30 text-gray-400'
    }
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
          Pre-Bookings
        </h1>
        <select
          value={filter}
          onChange={(e) => handleFilterChange(e.target.value as any)}
          className="px-4 py-2 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none text-sm md:text-base w-full sm:w-auto"
        >
          <option value="all">All Pre-Bookings</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="text-[#d1a058]">Loading pre-bookings...</div>
      ) : error ? (
        <div className="bg-red-500/20 border-2 border-red-500/50 rounded-lg p-6">
          <div className="text-red-400 font-semibold mb-2">Error loading pre-bookings</div>
          <div className="text-red-300 text-sm">{error}</div>
          <button
            onClick={() => fetchPreBookings()}
            className="mt-4 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 hover:bg-red-500/30 transition-all text-sm"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {preBookings.length === 0 ? (
              <div className="bg-black/60 border-2 border-[#d1a058]/30 rounded-lg p-8 text-center text-white/60">
                No pre-bookings found
              </div>
            ) : (
              preBookings.map((preBooking) => (
                <div
                  key={preBooking.id}
                  className="bg-black/60 border-2 border-[#d1a058]/30 rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3
                        className="text-lg font-semibold text-white mb-1"
                        style={{
                          fontFamily: "'BlinkerSemiBold', sans-serif",
                        }}
                      >
                        {preBooking.name}
                      </h3>
                      <div className="text-[#d1a058] text-sm mb-1">{preBooking.email}</div>
                      <div className="text-white/80 text-sm mb-1">Mobile: {preBooking.mobile}</div>
                      {preBooking.preferredDate && (
                        <div className="text-white/80 text-sm mb-1">
                          Preferred Date: {new Date(preBooking.preferredDate).toLocaleDateString()}
                        </div>
                      )}
                      {preBooking.preferredTime && (
                        <div className="text-white/80 text-sm mb-1">
                          Preferred Time: {preBooking.preferredTime}
                        </div>
                      )}
                      <div className="text-white/80 text-sm">
                        Players: {preBooking.numberOfPlayers}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-white/40">
                        {new Date(preBooking.createdAt).toLocaleString()}
                      </div>
                      <select
                        value={preBooking.status}
                        onChange={(e) => handleStatusChange(preBooking.id, e.target.value as any)}
                        className={`px-2 py-1 rounded text-xs border transition-all ${getStatusColor(preBooking.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button
                        onClick={() => handleDelete(preBooking.id)}
                        className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-xs hover:bg-red-500/30 transition-all"
                        title="Delete pre-booking"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  {preBooking.specialRequests && (
                    <div className="mt-4 pt-4 border-t border-[#d1a058]/20">
                      <p className="text-white/80 text-sm">
                        <strong>Special Requests:</strong> {preBooking.specialRequests}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-white/60 text-sm">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, total)} of {total} pre-bookings
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
