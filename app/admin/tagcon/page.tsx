'use client'

import React, { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { convertTimestamps } from '@/lib/firestore'
import Link from 'next/link'
import { toast } from 'sonner'

interface TagconUser {
  id: string
  name: string
  number: string
  mobile?: string
  tribe: string | null
  status: string
  createdAt: string
  revealedAt?: string
  hasBought?: boolean
}

export default function AdminTagconPage() {
  const [users, setUsers] = useState<TagconUser[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'tagcon_users'), orderBy('createdAt', 'desc'))
    
    // Realtime listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
      })) as TagconUser[]
      
      setUsers(docs)
      setLoading(false)
    }, (error) => {
      console.error("Error fetching tagcon users:", error)
      toast.error('Failed to load TagCon data')
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name} from the queue? This will affect the tribe balancing algorithms.`)) return
    
    try {
      const res = await fetch(`/api/tagcon/queue/${id}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        toast.success(`Deleted ${name}`)
      } else {
        toast.error('Failed to delete user')
      }
    } catch (err) {
      console.error(err)
      toast.error('Internal error occurred while deleting')
    }
  }

  const handleToggleBought = async (id: string, currentVal: boolean) => {
    try {
      const docRef = doc(db, 'tagcon_users', id)
      await updateDoc(docRef, {
        hasBought: !currentVal
      })
      toast.success('Purchase status updated')
    } catch (err) {
      console.error('Error updating purchase status:', err)
      toast.error('Failed to update status')
    }
  }

  // Filter users by search query (checks name, tribe, mobile)
  const filteredUsers = users.filter(user => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true

    const nameMatch = user.name?.toLowerCase().includes(q)
    const mobileValue = user.mobile || user.number
    const mobileMatch = mobileValue?.toLowerCase().includes(q)
    const tribeMatch = user.tribe?.toLowerCase().includes(q)

    return nameMatch || mobileMatch || tribeMatch
  })

  // Export filtered users to CSV
  const handleExportCSV = () => {
    if (filteredUsers.length === 0) {
      toast.error('No records to export')
      return
    }

    const headers = ['Name', 'Mobile Number', 'Status', 'Tribe', 'Registered At', 'Has Bought']
    const rows = filteredUsers.map(user => [
      user.name,
      user.mobile || user.number,
      user.status === 'pending' ? 'Waiting' : 'Revealed',
      user.tribe ? user.tribe.toUpperCase() : 'NONE',
      user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A',
      user.hasBought ? 'Yes' : 'No'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `tagcon_registrations_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('CSV exported successfully!')
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto text-white">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 uppercase text-[#d1a058]" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>
            TagCon Live Queue
          </h1>
          <p className="text-white/60" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
            Monitor and manage live tribe reveals, registration queues, and purchases.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/tagcon" target="_blank" className="bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#d1a058]/50 text-[#d1a058] font-bold px-6 py-3 rounded uppercase tracking-wider transition-colors inline-block" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>
            Registration Form
          </Link>
          <Link href="/reveal" target="_blank" className="bg-[#d1a058] hover:bg-[#c09048] text-black font-bold px-6 py-3 rounded uppercase tracking-wider transition-colors inline-block" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>
            Reveal Kiosk
          </Link>
        </div>
      </div>

      <div className="bg-black/40 border border-[#d1a058]/30 rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(209,160,88,0.1)]">
        {/* Controls: Search & CSV Export */}
        <div className="p-6 border-b border-[#d1a058]/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, tribe, or mobile..."
              className="w-full bg-black/60 border border-[#d1a058]/40 rounded px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#d1a058] pr-10"
              style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-white/40 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 justify-between md:justify-end w-full md:w-auto">
            <button
              onClick={handleExportCSV}
              className="bg-[#d1a058] hover:bg-[#c09048] text-black font-bold px-5 py-2.5 rounded text-sm uppercase tracking-wider transition-colors flex items-center gap-2 shadow-md"
              style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
            <div className="text-sm text-white/60">
              Filtered: {filteredUsers.length} | Total: {users.length}
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-white/50">Loading records...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-white/50">No users match your criteria.</div>
        ) : (
          <div className="overflow-x-auto max-h-[800px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-black/90 backdrop-blur border-b border-[#d1a058]/20 z-10">
                <tr>
                  <th className="p-4 font-semibold text-white/80 uppercase text-sm tracking-wider" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>Name</th>
                  <th className="p-4 font-semibold text-white/80 uppercase text-sm tracking-wider" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>Mobile</th>
                  <th className="p-4 font-semibold text-white/80 uppercase text-sm tracking-wider" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>Status</th>
                  <th className="p-4 font-semibold text-white/80 uppercase text-sm tracking-wider" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>Tribe</th>
                  <th className="p-4 font-semibold text-white/80 uppercase text-sm tracking-wider" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>Has Bought</th>
                  <th className="p-4 font-semibold text-white/80 uppercase text-sm tracking-wider text-right" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium">{user.name}</td>
                    <td className="p-4 font-mono text-white/50">{user.mobile || user.number}</td>
                    <td className="p-4">
                      {user.status === 'pending' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                          Waiting
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                          Revealed
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {user.tribe ? (
                        <span className="capitalize font-semibold text-lg" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>
                          {user.tribe === 'lava' && <span className="text-orange-500">Lava</span>}
                          {user.tribe === 'rain' && <span className="text-blue-500">Rain</span>}
                          {user.tribe === 'mountain' && <span className="text-stone-400">Mountain</span>}
                          {user.tribe === 'wind' && <span className="text-cyan-400">Wind</span>}
                        </span>
                      ) : (
                        <span className="text-white/30 italic text-sm">--</span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleBought(user.id, !!user.hasBought)}
                        className={`px-3.5 py-1 rounded text-xs font-bold transition-all uppercase tracking-wider border ${
                          user.hasBought 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                            : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                        }`}
                      >
                        {user.hasBought ? 'Yes ✓' : 'No ✕'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDelete(user.id, user.name)}
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded transition-colors"
                        title="Delete user"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
