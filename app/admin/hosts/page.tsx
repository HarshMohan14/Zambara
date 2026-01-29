'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

interface Host {
  id: string
  name: string
  email: string
  mobile: string
  bio?: string
  image?: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

const ITEMS_PER_PAGE = 10

export default function AdminHosts() {
  const [hosts, setHosts] = useState<Host[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingHost, setEditingHost] = useState<Host | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    bio: '',
    image: '',
    status: 'active' as 'active' | 'inactive',
  })

  const refreshDashboard = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('refreshDashboard'))
    }
  }

  useEffect(() => {
    fetchHosts()
  }, [filter, currentPage])

  const fetchHosts = async () => {
    try {
      setLoading(true)
      const params: any = {
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
      }
      if (filter !== 'all') {
        params.status = filter
      }
      
      const response = await apiClient.getHosts(params)
      if (response.success && response.data) {
        const data = response.data as { hosts?: any[], total?: number }
        setHosts(data.hosts || [])
        setTotal(data.total || 0)
      } else {
        console.error('Failed to fetch hosts:', response.error)
        setHosts([])
        setTotal(0)
      }
    } catch (error) {
      console.error('Error fetching hosts:', error)
      setHosts([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingHost) {
        const response = await apiClient.updateHost(editingHost.id, formData)
        if (response.success) {
          toast.success('Host updated successfully!')
          setShowForm(false)
          setEditingHost(null)
          resetForm()
          fetchHosts()
          refreshDashboard()
        } else {
          toast.error(response.error || 'Failed to update host')
        }
      } else {
        const response = await apiClient.createHost(formData)
        if (response.success) {
          toast.success('Host created successfully!')
          setShowForm(false)
          resetForm()
          fetchHosts()
          refreshDashboard()
        } else {
          toast.error(response.error || 'Failed to create host')
        }
      }
    } catch (error) {
      console.error('Error saving host:', error)
      toast.error('Failed to save host')
    }
  }

  const handleEdit = (host: Host) => {
    setEditingHost(host)
    setFormData({
      name: host.name,
      email: host.email,
      mobile: host.mobile,
      bio: host.bio || '',
      image: host.image || '',
      status: host.status,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this host? This action cannot be undone.')) {
      return
    }

    try {
      const response = await apiClient.deleteHost(id)
      if (response.success) {
        toast.success('Host deleted successfully!')
        fetchHosts()
        refreshDashboard()
      } else {
        toast.error(response.error || 'Failed to delete host')
      }
    } catch (error) {
      console.error('Error deleting host:', error)
      toast.error('Failed to delete host')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      mobile: '',
      bio: '',
      image: '',
      status: 'active',
    })
    setEditingHost(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 border-green-500/30 text-green-400'
      case 'inactive':
        return 'bg-gray-500/20 border-gray-500/30 text-gray-400'
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
          Hosts
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
            <option value="all">All Hosts</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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
            {showForm ? 'Cancel' : '+ New Host'}
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
            {editingHost ? 'Edit Host' : 'Create New Host'}
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
              <label className="block mb-2 text-white">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 bg-black border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none"
              />
            </div>
            <div>
              <label className="block mb-2 text-white">Mobile *</label>
              <input
                type="tel"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-4 py-2 bg-black border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none"
                placeholder="10-15 digits"
              />
            </div>
            <div>
              <label className="block mb-2 text-white">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 bg-black border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
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
              <label className="block mb-2 text-white">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
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
              {editingHost ? 'Update' : 'Create'}
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
        <div className="text-[#d1a058]">Loading hosts...</div>
      ) : (
        <>
          <div className="space-y-4">
            {hosts.length === 0 ? (
              <div className="bg-black/60 border-2 border-[#d1a058]/30 rounded-lg p-8 text-center text-white/60">
                No hosts found
              </div>
            ) : (
              hosts.map((host) => (
                <div
                  key={host.id}
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
                        {host.name}
                      </h3>
                      <div className="space-y-1 text-sm text-white/70">
                        <div>Email: {host.email}</div>
                        <div>Mobile: {host.mobile}</div>
                        {host.bio && <div className="mt-2 text-white/80">{host.bio}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(host.status)}`}>
                        {host.status}
                      </span>
                      <button
                        onClick={() => handleEdit(host)}
                        className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-blue-400 text-xs hover:bg-blue-500/30 transition-all"
                        title="Edit host"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(host.id)}
                        className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-xs hover:bg-red-500/30 transition-all"
                        title="Delete host"
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
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, total)} of {total} hosts
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
