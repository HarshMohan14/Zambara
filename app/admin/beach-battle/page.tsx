'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useConfirm } from '@/components/admin/ConfirmProvider'
import { apiClient } from '@/lib/api-client'

interface Registration {
  id: string
  name: string
  email: string
  phone: string
  createdAt: string
  updatedAt: string
}

const ITEMS_PER_PAGE = 10

export default function AdminBeachBattle() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' })
  const [search, setSearch] = useState('')

  const refreshDashboard = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('refreshDashboard'))
    }
  }

  useEffect(() => {
    fetchRegistrations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const fetchRegistrations = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getBeachBattleRegistrations({
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
      })

      if (response.success && response.data) {
        const data = response.data as { registrations?: any[]; total?: number }
        setRegistrations(data.registrations || [])
        setTotal(data.total || 0)
        setError(null)
      } else {
        setError(response.error || 'Failed to fetch registrations')
        setRegistrations([])
        setTotal(0)
      }
    } catch (error: any) {
      setError(error?.message || 'An unexpected error occurred')
      setRegistrations([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (reg: Registration) => {
    setEditingId(reg.id)
    setEditForm({ name: reg.name, email: reg.email, phone: reg.phone })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({ name: '', email: '', phone: '' })
  }

  const handleSaveEdit = async (id: string) => {
    try {
      const response = await apiClient.updateBeachBattleRegistration(id, editForm)
      if (response.success) {
        toast.success('Registration updated successfully!')
        setEditingId(null)
        fetchRegistrations()
        refreshDashboard()
      } else {
        toast.error(response.error || 'Failed to update registration')
      }
    } catch (error) {
      console.error('Error updating registration:', error)
      toast.error('Failed to update registration')
    }
  }

  const confirmDialog = useConfirm()
  const handleDelete = async (id: string, name: string) => {
    const ok = await confirmDialog.confirm({
      title: 'Delete registration',
      message: `Are you sure you want to delete the registration for "${name}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
    })
    if (!ok) return

    try {
      const response = await apiClient.deleteBeachBattleRegistration(id)
      if (response.success) {
        toast.success('Registration deleted successfully!')
        fetchRegistrations()
        refreshDashboard()
      } else {
        toast.error(response.error || 'Failed to delete registration')
      }
    } catch (error) {
      console.error('Error deleting registration:', error)
      toast.error('Failed to delete registration')
    }
  }

  const filteredRegistrations = search
    ? registrations.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.email.toLowerCase().includes(search.toLowerCase()) ||
          r.phone.includes(search)
      )
    : registrations

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1
            className="text-2xl md:text-3xl font-bold uppercase"
            style={{
              fontFamily: "'TheWalkyrDemo', serif",
              color: '#d1a058',
            }}
          >
            Beach Battle Registrations
          </h1>
          <p
            className="text-sm text-white/50 mt-1"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
          >
            {total} total registration{total !== 1 ? 's' : ''}
          </p>
        </div>
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none text-sm md:text-base w-full sm:w-72 placeholder:text-white/30"
          style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
        />
      </div>

      {loading ? (
        <div className="text-[#d1a058]">Loading registrations...</div>
      ) : error ? (
        <div className="bg-red-500/20 border-2 border-red-500/50 rounded-lg p-6">
          <div className="text-red-400 font-semibold mb-2">Error loading registrations</div>
          <div className="text-red-300 text-sm">{error}</div>
          <button
            onClick={() => fetchRegistrations()}
            className="mt-4 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 hover:bg-red-500/30 transition-all text-sm"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Table view */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#d1a058]/30">
                  <th
                    className="text-left py-3 px-4 text-sm uppercase tracking-wider"
                    style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#d1a058' }}
                  >
                    Name
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm uppercase tracking-wider"
                    style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#d1a058' }}
                  >
                    Email
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm uppercase tracking-wider"
                    style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#d1a058' }}
                  >
                    Phone
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm uppercase tracking-wider"
                    style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#d1a058' }}
                  >
                    Registered
                  </th>
                  <th
                    className="text-right py-3 px-4 text-sm uppercase tracking-wider"
                    style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#d1a058' }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-white/60">
                      No registrations found
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((reg) => (
                    <tr
                      key={reg.id}
                      className="border-b border-[#d1a058]/10 hover:bg-[#d1a058]/5 transition-all"
                    >
                      {editingId === reg.id ? (
                        <>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="w-full px-2 py-1 bg-black/60 border border-[#d1a058]/40 rounded text-white text-sm focus:border-[#d1a058] focus:outline-none"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="email"
                              value={editForm.email}
                              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                              className="w-full px-2 py-1 bg-black/60 border border-[#d1a058]/40 rounded text-white text-sm focus:border-[#d1a058] focus:outline-none"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="tel"
                              value={editForm.phone}
                              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                              className="w-full px-2 py-1 bg-black/60 border border-[#d1a058]/40 rounded text-white text-sm focus:border-[#d1a058] focus:outline-none"
                            />
                          </td>
                          <td className="py-3 px-4 text-white/40 text-xs">
                            {new Date(reg.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleSaveEdit(reg.id)}
                                className="px-3 py-1 bg-green-500/20 border border-green-500/40 rounded text-green-400 text-xs hover:bg-green-500/30 transition-all"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-3 py-1 bg-gray-500/20 border border-gray-500/40 rounded text-gray-400 text-xs hover:bg-gray-500/30 transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td
                            className="py-3 px-4 text-white font-semibold text-sm"
                            style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
                          >
                            {reg.name}
                          </td>
                          <td
                            className="py-3 px-4 text-sm"
                            style={{ color: '#d1a058', fontFamily: "'BlinkerRegular', sans-serif" }}
                          >
                            {reg.email}
                          </td>
                          <td
                            className="py-3 px-4 text-white/80 text-sm"
                            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
                          >
                            {reg.phone}
                          </td>
                          <td className="py-3 px-4 text-white/40 text-xs">
                            {new Date(reg.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEdit(reg)}
                                className="px-3 py-1 bg-[#d1a058]/15 border border-[#d1a058]/40 rounded text-[#d1a058] text-xs hover:bg-[#d1a058]/25 transition-all"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(reg.id, reg.name)}
                                className="px-3 py-1 bg-red-500/15 border border-red-500/30 rounded text-red-400 text-xs hover:bg-red-500/25 transition-all"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-white/60 text-sm">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, total)} of {total} registrations
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
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
