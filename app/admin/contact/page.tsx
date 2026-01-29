'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useConfirm } from '@/components/admin/ConfirmProvider'
import { apiClient } from '@/lib/api-client'

interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  subject?: string
  read: boolean
  createdAt: string
}

const ITEMS_PER_PAGE = 10

export default function AdminContact() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)

  // Refresh dashboard stats
  const refreshDashboard = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('refreshDashboard'))
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [filter, currentPage])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const params: any = {
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
      }
      if (filter === 'read') {
        params.read = true
      } else if (filter === 'unread') {
        params.read = false
      }
      
      const response = await apiClient.getContactMessages(params)
      if (response.success && response.data) {
        const data = response.data as { messages?: any[], total?: number }
        setMessages(data.messages || [])
        setTotal(data.total || 0)
      } else {
        console.error('Failed to fetch messages:', response.error)
        setMessages([])
        setTotal(0)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      setMessages([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkRead = async (id: string, currentRead: boolean) => {
    try {
      const response = await apiClient.updateContactMessage(id, { read: !currentRead })
      if (response.success) {
        fetchMessages()
        refreshDashboard()
      } else {
        toast.error(response.error || 'Failed to update message')
      }
    } catch (error) {
      console.error('Error updating message:', error)
      toast.error('Failed to update message')
    }
  }

  const confirmDialog = useConfirm()
  const handleDelete = async (id: string) => {
    const ok = await confirmDialog.confirm({
      title: 'Delete message',
      message: 'Are you sure you want to delete this message? This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
    })
    if (!ok) return

    try {
      const response = await apiClient.deleteContactMessage(id)
      if (response.success) {
        toast.success('Message deleted successfully!')
        fetchMessages()
        refreshDashboard()
      } else {
        toast.error(response.error || 'Failed to delete message')
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      toast.error('Failed to delete message')
    }
  }

  const handleFilterChange = (newFilter: 'all' | 'read' | 'unread') => {
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
          Contact Messages
        </h1>
        <select
          value={filter}
          onChange={(e) => handleFilterChange(e.target.value as 'all' | 'read' | 'unread')}
          className="px-4 py-2 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none text-sm md:text-base w-full sm:w-auto"
        >
          <option value="all">All Messages</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
      </div>

      {loading ? (
        <div className="text-[#d1a058]">Loading messages...</div>
      ) : (
        <>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="bg-black/60 border-2 border-[#d1a058]/30 rounded-lg p-8 text-center text-white/60">
                No contact messages yet
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
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
                        {message.name}
                      </h3>
                      <div className="text-[#d1a058] text-sm">{message.email}</div>
                      {message.subject && (
                        <div className="text-white/80 mt-2">
                          Subject: {message.subject}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-white/40">
                        {new Date(message.createdAt).toLocaleString()}
                      </div>
                      <button
                        onClick={() => handleMarkRead(message.id, message.read)}
                        className={`px-2 py-1 rounded text-xs transition-all ${
                          message.read
                            ? 'bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30'
                            : 'bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30'
                        }`}
                        title={message.read ? 'Mark as unread' : 'Mark as read'}
                      >
                        {message.read ? '✓ Read' : 'Unread'}
                      </button>
                      <button
                        onClick={() => handleDelete(message.id)}
                        className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-xs hover:bg-red-500/30 transition-all"
                        title="Delete message"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <p className="text-white/80 mb-4">{message.message}</p>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-white/60 text-sm">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, total)} of {total} messages
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
