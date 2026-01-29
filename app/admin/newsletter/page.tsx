'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

interface Subscriber {
  id: string
  email: string
  subscribed: boolean
  createdAt: string
}

const ITEMS_PER_PAGE = 20

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'subscribed' | 'unsubscribed'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)

  // Refresh dashboard stats
  const refreshDashboard = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('refreshDashboard'))
    }
  }

  useEffect(() => {
    fetchSubscribers()
  }, [filter, currentPage])

  const fetchSubscribers = async () => {
    try {
      setLoading(true)
      const params: any = {
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
      }
      if (filter === 'subscribed') {
        params.subscribed = true
      } else if (filter === 'unsubscribed') {
        params.subscribed = false
      }
      
      const response = await apiClient.getNewsletterSubscribers(params)
      if (response.success && response.data) {
        const data = response.data as { subscribers?: any[], total?: number }
        setSubscribers(data.subscribers || [])
        setTotal(data.total || 0)
      } else {
        console.error('Failed to fetch subscribers:', response.error)
        setSubscribers([])
        setTotal(0)
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error)
      setSubscribers([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscriber? This action cannot be undone.')) {
      return
    }

    try {
      const response = await apiClient.deleteNewsletterSubscriber(id)
      if (response.success) {
        toast.success('Subscriber deleted successfully!')
        fetchSubscribers()
        refreshDashboard()
      } else {
        toast.error(response.error || 'Failed to delete subscriber')
      }
    } catch (error) {
      console.error('Error deleting subscriber:', error)
      toast.error('Failed to delete subscriber')
    }
  }

  const handleFilterChange = (newFilter: 'all' | 'subscribed' | 'unsubscribed') => {
    setFilter(newFilter)
    setCurrentPage(1)
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
          Newsletter Subscribers
        </h1>
        <select
          value={filter}
          onChange={(e) => handleFilterChange(e.target.value as 'all' | 'subscribed' | 'unsubscribed')}
          className="px-4 py-2 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none text-sm md:text-base w-full sm:w-auto"
        >
          <option value="all">All Subscribers</option>
          <option value="subscribed">Subscribed</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
      </div>

      {loading ? (
        <div className="text-[#d1a058]">Loading subscribers...</div>
      ) : (
        <>
          <div className="bg-black/60 border-2 border-[#d1a058]/30 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px]">
                <thead>
                  <tr className="border-b-2 border-[#d1a058]/30">
                    <th
                      className="px-3 md:px-6 py-3 md:py-4 text-left text-sm md:text-base"
                      style={{
                        fontFamily: "'BlinkerSemiBold', sans-serif",
                        color: '#d1a058',
                      }}
                    >
                      Email
                    </th>
                    <th
                      className="px-3 md:px-6 py-3 md:py-4 text-left text-sm md:text-base"
                      style={{
                        fontFamily: "'BlinkerSemiBold', sans-serif",
                        color: '#d1a058',
                      }}
                    >
                      Status
                    </th>
                    <th
                      className="px-3 md:px-6 py-3 md:py-4 text-left text-sm md:text-base"
                      style={{
                        fontFamily: "'BlinkerSemiBold', sans-serif",
                        color: '#d1a058',
                      }}
                    >
                      Subscribed Date
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
                  {subscribers.map((subscriber) => (
                    <tr
                      key={subscriber.id}
                      className="border-b border-[#d1a058]/10 hover:bg-[#d1a058]/5"
                    >
                      <td className="px-3 md:px-6 py-3 md:py-4 text-white text-sm md:text-base break-words">{subscriber.email}</td>
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs uppercase ${
                            subscriber.subscribed
                              ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                              : 'bg-red-500/20 border border-red-500/30 text-red-400'
                          }`}
                        >
                          {subscriber.subscribed ? 'Subscribed' : 'Unsubscribed'}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-white/60 text-xs md:text-sm">
                        {new Date(subscriber.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                        <button
                          onClick={() => handleDelete(subscriber.id)}
                          className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-xs hover:bg-red-500/30 transition-all"
                          title="Delete subscriber"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {subscribers.length === 0 && (
              <div className="p-8 text-center text-white/60">
                No subscribers found
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-white/60 text-sm">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, total)} of {total} subscribers
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
