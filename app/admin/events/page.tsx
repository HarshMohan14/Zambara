'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

interface Event {
  id: string
  name: string
  description?: string
  startDate: string
  endDate?: string
  location?: string
  hostId?: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  maxParticipants?: number
  image?: string
  createdAt: string
  updatedAt: string
}

const ITEMS_PER_PAGE = 10

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    hostId: '',
    status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
    maxParticipants: '',
    image: '',
  })

  const refreshDashboard = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('refreshDashboard'))
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [filter, currentPage])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const params: any = {
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
      }
      if (filter !== 'all') {
        params.status = filter
      }
      
      const response = await apiClient.getEvents(params)
      if (response.success && response.data) {
        const data = response.data as { events?: any[], total?: number }
        setEvents(data.events || [])
        setTotal(data.total || 0)
      } else {
        console.error('Failed to fetch events:', response.error)
        setEvents([])
        setTotal(0)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      setEvents([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingEvent) {
        const response = await apiClient.updateEvent(editingEvent.id, {
          ...formData,
          maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        })
        if (response.success) {
          toast.success('Event updated successfully!')
          setShowForm(false)
          setEditingEvent(null)
          resetForm()
          fetchEvents()
          refreshDashboard()
        } else {
          toast.error(response.error || 'Failed to update event')
        }
      } else {
        const response = await apiClient.createEvent({
          ...formData,
          maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        })
        if (response.success) {
          toast.success('Event created successfully!')
          setShowForm(false)
          resetForm()
          fetchEvents()
          refreshDashboard()
        } else {
          toast.error(response.error || 'Failed to create event')
        }
      }
    } catch (error) {
      console.error('Error saving event:', error)
      toast.error('Failed to save event')
    }
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      name: event.name,
      description: event.description || '',
      startDate: event.startDate.split('T')[0],
      endDate: event.endDate ? event.endDate.split('T')[0] : '',
      location: event.location || '',
      hostId: event.hostId || '',
      status: event.status,
      maxParticipants: event.maxParticipants?.toString() || '',
      image: event.image || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return
    }

    try {
      const response = await apiClient.deleteEvent(id)
      if (response.success) {
        toast.success('Event deleted successfully!')
        fetchEvents()
        refreshDashboard()
      } else {
        toast.error(response.error || 'Failed to delete event')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Failed to delete event')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
      hostId: '',
      status: 'upcoming',
      maxParticipants: '',
      image: '',
    })
    setEditingEvent(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500/20 border-blue-500/30 text-blue-400'
      case 'ongoing':
        return 'bg-green-500/20 border-green-500/30 text-green-400'
      case 'completed':
        return 'bg-gray-500/20 border-gray-500/30 text-gray-400'
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
          Events
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as any)
              setCurrentPage(1)
            }}
            className="px-4 py-2 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none text-sm md:text-base"
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
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
            {showForm ? 'Cancel' : '+ New Event'}
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
            {editingEvent ? 'Edit Event' : 'Create New Event'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-white">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-black border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none"
              />
            </div>
            <div>
              <label className="block mb-2 text-white">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 bg-black border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-white">Start Date *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 bg-black border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none"
              />
            </div>
            <div>
              <label className="block mb-2 text-white">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 bg-black border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none"
              />
            </div>
            <div>
              <label className="block mb-2 text-white">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 bg-black border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none"
              />
            </div>
            <div>
              <label className="block mb-2 text-white">Host ID</label>
              <input
                type="text"
                value={formData.hostId}
                onChange={(e) => setFormData({ ...formData, hostId: e.target.value })}
                className="w-full px-4 py-2 bg-black border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none"
                placeholder="Optional host reference"
              />
            </div>
            <div>
              <label className="block mb-2 text-white">Max Participants</label>
              <input
                type="number"
                min="1"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                className="w-full px-4 py-2 bg-black border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none"
              />
            </div>
            <div>
              <label className="block mb-2 text-white">Image URL</label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-2 bg-black border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-2 text-white">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-black border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="px-6 py-2 bg-[#d1a058] text-black rounded-lg font-semibold uppercase"
              style={{
                fontFamily: "'BlinkerSemiBold', sans-serif",
              }}
            >
              {editingEvent ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                resetForm()
              }}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold uppercase"
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
        <div className="text-[#d1a058]">Loading events...</div>
      ) : (
        <>
          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="bg-black/60 border-2 border-[#d1a058]/30 rounded-lg p-8 text-center text-white/60">
                No events found
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="bg-black/60 border-2 border-[#d1a058]/30 rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3
                        className="text-lg font-semibold text-white mb-2"
                        style={{
                          fontFamily: "'BlinkerSemiBold', sans-serif",
                        }}
                      >
                        {event.name}
                      </h3>
                      {event.description && (
                        <p className="text-white/80 text-sm mb-2">{event.description}</p>
                      )}
                      <div className="space-y-1 text-sm text-white/70">
                        <div>Start: {new Date(event.startDate).toLocaleString()}</div>
                        {event.endDate && (
                          <div>End: {new Date(event.endDate).toLocaleString()}</div>
                        )}
                        {event.location && <div>Location: {event.location}</div>}
                        {event.maxParticipants && (
                          <div>Max Participants: {event.maxParticipants}</div>
                        )}
                        {event.hostId && <div>Host ID: {event.hostId}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                      <button
                        onClick={() => handleEdit(event)}
                        className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-blue-400 text-xs hover:bg-blue-500/30 transition-all"
                        title="Edit event"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-xs hover:bg-red-500/30 transition-all"
                        title="Delete event"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-white/60 text-sm">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, total)} of {total} events
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
