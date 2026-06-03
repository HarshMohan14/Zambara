'use client'

import React, { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  where 
} from 'firebase/firestore'
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

interface Tournament {
  id: string
  name: string
  size: number
  dateTime: string
  createdAt: string
}

interface Booking {
  id: string
  tournamentId: string
  userId: string
  userName: string
  userMobile: string
  tribe: string
  seatIndex: number
  bookedAt: string
  isWinner?: boolean
  isZampion?: boolean
}

const TRIBES = [
  { id: 'lava', label: 'Lava Tribe', color: '#ff4400', bg: 'rgba(255, 68, 0, 0.15)', border: 'rgba(255, 68, 0, 0.45)', hoverBg: 'rgba(255, 68, 0, 0.35)', badgeBg: 'bg-orange-500/20 text-orange-400' },
  { id: 'rain', label: 'Rain Tribe', color: '#00aaff', bg: 'rgba(0, 170, 255, 0.15)', border: 'rgba(0, 170, 255, 0.45)', hoverBg: 'rgba(0, 170, 255, 0.35)', badgeBg: 'bg-blue-500/20 text-blue-400' },
  { id: 'mountain', label: 'Mountain Tribe', color: '#eebb77', bg: 'rgba(238, 187, 119, 0.12)', border: 'rgba(238, 187, 119, 0.4)', hoverBg: 'rgba(238, 187, 119, 0.3)', badgeBg: 'bg-yellow-600/25 text-[#eebb77]' },
  { id: 'wind', label: 'Wind Tribe', color: '#00ff88', bg: 'rgba(0, 255, 136, 0.15)', border: 'rgba(0, 255, 136, 0.45)', hoverBg: 'rgba(0, 255, 136, 0.35)', badgeBg: 'bg-emerald-500/20 text-emerald-400' }
]

export default function AdminTagconPage() {
  const [users, setUsers] = useState<TagconUser[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'queue' | 'tournaments' | 'booking'>('queue')

  // Tournaments state
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [newTourneyName, setNewTourneyName] = useState('')
  const [newTourneySize, setNewTourneySize] = useState(16)
  const [newTourneyDateTime, setNewTourneyDateTime] = useState('')
  const [tourneyLoading, setTourneyLoading] = useState(false)

  // Tournament Editing state
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null)
  const [editTourneyName, setEditTourneyName] = useState('')
  const [editTourneySize, setEditTourneySize] = useState(16)
  const [editTourneyDateTime, setEditTourneyDateTime] = useState('')
  const [editTourneyLoading, setEditTourneyLoading] = useState(false)

  // Booking state
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [selectedTribe, setSelectedTribe] = useState<string>('')
  const [selectedSeatIndex, setSelectedSeatIndex] = useState<number>(-1)
  const [searchPlayerQuery, setSearchPlayerQuery] = useState('')

  // Booking Editing/Relocation state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [manageBookingModalOpen, setManageBookingModalOpen] = useState(false)
  const [targetSeatIndex, setTargetSeatIndex] = useState<number>(-1)

  // 1. Live Users Queue Listener
  useEffect(() => {
    const q = query(collection(db, 'tagcon_users'), orderBy('createdAt', 'desc'))
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

  // 2. Tournaments Listener
  useEffect(() => {
    const q = query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
      })) as Tournament[]
      setTournaments(docs)
      if (docs.length > 0) {
        setSelectedTournamentId(prev => prev || docs[0].id)
      }
    }, (error) => {
      console.error("Error fetching tournaments:", error)
    })
    return () => unsubscribe()
  }, [])

  // 3. Bookings Listener (dependent on selected tournament)
  useEffect(() => {
    if (!selectedTournamentId) {
      setBookings([])
      return
    }
    const q = query(collection(db, 'bookings'), where('tournamentId', '==', selectedTournamentId))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
      })) as Booking[]
      setBookings(docs)
    }, (error) => {
      console.error("Error fetching bookings:", error)
    })
    return () => unsubscribe()
  }, [selectedTournamentId])

  // Queue delete user
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name} from the queue? This will affect the tribe balancing algorithms.`)) return
    try {
      const res = await fetch(`/api/tagcon/queue/${id}`, { method: 'DELETE' })
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

  // Toggle user bought status
  const handleToggleBought = async (id: string, currentVal: boolean) => {
    try {
      const docRef = doc(db, 'tagcon_users', id)
      await updateDoc(docRef, { hasBought: !currentVal })
      toast.success('Purchase status updated')
    } catch (err) {
      console.error('Error updating purchase status:', err)
      toast.error('Failed to update status')
    }
  }

  // Generates formatted date string for datetime-local input
  const getPresetDate = (daysAhead: number, hour: number) => {
    const d = new Date()
    d.setDate(d.getDate() + daysAhead)
    d.setHours(hour, 0, 0, 0)
    
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const date = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const mins = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${date}T${hours}:${mins}`
  }

  // Add Tournament Submit
  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTourneyName || !newTourneySize || !newTourneyDateTime) {
      toast.error('Please fill all fields.')
      return
    }
    if (newTourneySize % 16 !== 0 || newTourneySize <= 0) {
      toast.error('Tournament size must be a multiple of 16.')
      return
    }
    setTourneyLoading(true)
    try {
      await addDoc(collection(db, 'tournaments'), {
        name: newTourneyName,
        size: Number(newTourneySize),
        dateTime: newTourneyDateTime,
        createdAt: new Date().toISOString()
      })
      toast.success(`Tournament "${newTourneyName}" created successfully!`)
      setNewTourneyName('')
      setNewTourneySize(16)
      setNewTourneyDateTime('')
    } catch (err) {
      console.error(err)
      toast.error('Failed to create tournament')
    } finally {
      setTourneyLoading(false)
    }
  }

  // Open Edit Tournament Modal
  const handleOpenEditTournament = (tourney: Tournament) => {
    setEditingTournament(tourney)
    setEditTourneyName(tourney.name)
    setEditTourneySize(tourney.size)
    setEditTourneyDateTime(tourney.dateTime)
  }

  // Save Edited Tournament
  const handleSaveTournament = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTournament) return
    if (!editTourneyName || !editTourneySize || !editTourneyDateTime) {
      toast.error('Please fill all fields.')
      return
    }
    if (editTourneySize % 16 !== 0 || editTourneySize <= 0) {
      toast.error('Tournament size must be a multiple of 16.')
      return
    }

    // Capacity checks: check if downsizing violates current bookings count in any tribe
    const tourneyBookings = bookings.filter(b => b.tournamentId === editingTournament.id)
    const tribeCounts = { lava: 0, rain: 0, mountain: 0, wind: 0 }
    tourneyBookings.forEach(b => {
      if (tribeCounts[b.tribe as keyof typeof tribeCounts] !== undefined) {
        tribeCounts[b.tribe as keyof typeof tribeCounts]++
      }
    })
    const maxBookedInAnyTribe = Math.max(tribeCounts.lava, tribeCounts.rain, tribeCounts.mountain, tribeCounts.wind)
    const newTribeCapacity = editTourneySize / 4

    if (maxBookedInAnyTribe > newTribeCapacity) {
      toast.error(`Cannot shrink size to ${editTourneySize}. A tribe has ${maxBookedInAnyTribe} bookings, exceeding the new capacity of ${newTribeCapacity} per tribe. Please release seats first.`)
      return
    }

    setEditTourneyLoading(true)
    try {
      const docRef = doc(db, 'tournaments', editingTournament.id)
      await updateDoc(docRef, {
        name: editTourneyName,
        size: Number(editTourneySize),
        dateTime: editTourneyDateTime
      })
      toast.success('Tournament updated successfully!')
      setEditingTournament(null)
    } catch (err) {
      console.error(err)
      toast.error('Failed to update tournament')
    } finally {
      setEditTourneyLoading(false)
    }
  }

  // Delete Tournament
  const handleDeleteTournament = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? All associated bookings will be lost.`)) return
    try {
      await deleteDoc(doc(db, 'tournaments', id))
      // Clean up bookings in Firestore
      const bookingsToDelete = bookings.filter(b => b.tournamentId === id)
      for (const booking of bookingsToDelete) {
        await deleteDoc(doc(db, 'bookings', booking.id))
      }
      toast.success(`Tournament "${name}" deleted`)
      if (selectedTournamentId === id) {
        setSelectedTournamentId(tournaments.find(t => t.id !== id)?.id || '')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete tournament')
    }
  }

  // Open booking modal for an empty seat
  const handleOpenBooking = (tribeId: string, seatIndex: number) => {
    setSelectedTribe(tribeId)
    setSelectedSeatIndex(seatIndex)
    setSearchPlayerQuery('')
    setBookingModalOpen(true)
  }

  // Open manage booking modal for an occupied seat
  const handleOpenManageBooking = (booking: Booking) => {
    setSelectedBooking(booking)
    setTargetSeatIndex(-1)
    setManageBookingModalOpen(true)
  }

  // Save seat reservation
  const handleBookPlayer = async (player: TagconUser) => {
    if (!selectedTournamentId || selectedSeatIndex === -1 || !selectedTribe) return
    try {
      await addDoc(collection(db, 'bookings'), {
        tournamentId: selectedTournamentId,
        userId: player.id,
        userName: player.name,
        userMobile: player.mobile || player.number,
        tribe: selectedTribe,
        seatIndex: selectedSeatIndex,
        bookedAt: new Date().toISOString()
      })
      toast.success(`Booked ${player.name} to seat`)
      setBookingModalOpen(false)
      setSelectedSeatIndex(-1)
      setSelectedTribe('')
    } catch (err) {
      console.error(err)
      toast.error('Failed to book player')
    }
  }

  // Release booking (Delete Booking CRUD)
  const handleReleaseSelectedBooking = async () => {
    if (!selectedBooking) return
    if (!confirm(`Release seat booked by ${selectedBooking.userName}?`)) return
    try {
      await deleteDoc(doc(db, 'bookings', selectedBooking.id))
      toast.success(`Released seat for ${selectedBooking.userName}`)
      setManageBookingModalOpen(false)
      setSelectedBooking(null)
    } catch (err) {
      console.error(err)
      toast.error('Failed to release seat')
    }
  }

  // Relocate seat (Update Booking CRUD)
  const handleMoveSeat = async () => {
    if (!selectedBooking || targetSeatIndex === -1) return
    try {
      const docRef = doc(db, 'bookings', selectedBooking.id)
      await updateDoc(docRef, {
        seatIndex: Number(targetSeatIndex)
      })
      toast.success(`Moved ${selectedBooking.userName} to seat #${(targetSeatIndex % capacity) + 1}`)
      setManageBookingModalOpen(false)
      setSelectedBooking(null)
    } catch (err) {
      console.error(err)
      toast.error('Failed to move seat')
    }
  }

  // Toggle Round Winner (Update Booking CRUD)
  const handleToggleRoundWinner = async () => {
    if (!selectedBooking) return
    try {
      const isWinnerNow = !selectedBooking.isWinner
      const docRef = doc(db, 'bookings', selectedBooking.id)
      await updateDoc(docRef, {
        isWinner: isWinnerNow
      })
      toast.success(isWinnerNow ? `Declared ${selectedBooking.userName} as Round Winner! ★` : 'Cleared Winner status')
      setManageBookingModalOpen(false)
      setSelectedBooking(null)
    } catch (err) {
      console.error(err)
      toast.error('Failed to update winner status')
    }
  }

  // Crown Ultimate Zampion (Update Booking CRUD)
  const handleCrownZampion = async () => {
    if (!selectedBooking) return
    try {
      const isZampionNow = !selectedBooking.isZampion
      
      // If crowning, clear Zampion from all other players in this tournament
      if (isZampionNow) {
        const otherZampions = bookings.filter(b => b.tournamentId === selectedTournamentId && b.isZampion === true && b.id !== selectedBooking.id)
        for (const z of otherZampions) {
          await updateDoc(doc(db, 'bookings', z.id), { isZampion: false })
        }
      }

      const docRef = doc(db, 'bookings', selectedBooking.id)
      await updateDoc(docRef, {
        isZampion: isZampionNow
      })
      toast.success(isZampionNow ? `👑 ${selectedBooking.userName} crowned ULTIMATE ZAMPION! 👑` : 'Cleared Zampion crown')
      setManageBookingModalOpen(false)
      setSelectedBooking(null)
    } catch (err) {
      console.error(err)
      toast.error('Failed to crown Zampion')
    }
  }

  // Filter queue users
  const filteredUsers = users.filter(user => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    const nameMatch = user.name?.toLowerCase().includes(q)
    const mobileValue = user.mobile || user.number
    const mobileMatch = mobileValue?.toLowerCase().includes(q)
    const tribeMatch = user.tribe?.toLowerCase().includes(q)
    return nameMatch || mobileMatch || tribeMatch
  })

  // Export registrations CSV
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

  // Fetch active tournament details
  const activeTourney = tournaments.find(t => t.id === selectedTournamentId)
  const capacity = activeTourney ? activeTourney.size / 4 : 4

  // Filter players list for the booking selector
  const assignablePlayers = users.filter(user => {
    // 1. Must be assigned to the selected seat's tribe
    if (user.tribe !== selectedTribe) return false
    // 2. Must not be already booked in this tournament
    const isBooked = bookings.some(b => b.userId === user.id)
    if (isBooked) return false
    // 3. Search query filter
    const q = searchPlayerQuery.toLowerCase().trim()
    if (!q) return true
    const nameMatch = user.name?.toLowerCase().includes(q)
    const mobileValue = user.mobile || user.number
    const mobileMatch = mobileValue?.toLowerCase().includes(q)
    return nameMatch || mobileMatch
  })

  // Get available seats for a booking relocation
  const getAvailableSeatsForTribe = (tribeId: string) => {
    const tribeIndex = TRIBES.findIndex(t => t.id === tribeId)
    if (tribeIndex === -1 || !activeTourney) return []
    const seats: number[] = []
    for (let i = 0; i < capacity; i++) {
      const seatIdx = tribeIndex * capacity + i
      const isOccupied = bookings.some(b => b.seatIndex === seatIdx)
      if (!isOccupied) {
        seats.push(seatIdx)
      }
    }
    return seats
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto text-white">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 uppercase text-[#d1a058]" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>
            TagCon Admin Panel
          </h1>
          <p className="text-white/60 font-sans">
            Manage registrations queue, configure tournaments, and book arena slots.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/tagcon" target="_blank" className="bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#d1a058]/50 text-[#d1a058] font-bold px-6 py-3 rounded uppercase tracking-wider transition-colors inline-block text-center text-sm" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>
            Registration Form
          </Link>
          <Link href="/reveal" target="_blank" className="bg-[#d1a058] hover:bg-[#c09048] text-black font-bold px-6 py-3 rounded uppercase tracking-wider transition-colors inline-block text-center text-sm" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>
            Reveal Kiosk
          </Link>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-[#d1a058]/20 mb-6 overflow-x-auto whitespace-nowrap scrollbar-none">
        <button 
          onClick={() => setActiveTab('queue')}
          className={`px-6 py-3 font-bold text-sm uppercase tracking-wider transition-all border-b-2 ${activeTab === 'queue' ? 'border-[#d1a058] text-[#d1a058]' : 'border-transparent text-white/60 hover:text-white'}`}
          style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
        >
          Queue Manager
        </button>
        <button 
          onClick={() => setActiveTab('tournaments')}
          className={`px-6 py-3 font-bold text-sm uppercase tracking-wider transition-all border-b-2 ${activeTab === 'tournaments' ? 'border-[#d1a058] text-[#d1a058]' : 'border-transparent text-white/60 hover:text-white'}`}
          style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
        >
          Tournaments ({tournaments.length})
        </button>
        <button 
          onClick={() => setActiveTab('booking')}
          className={`px-6 py-3 font-bold text-sm uppercase tracking-wider transition-all border-b-2 ${activeTab === 'booking' ? 'border-[#d1a058] text-[#d1a058]' : 'border-transparent text-white/60 hover:text-white'}`}
          style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
        >
          Seat Bookings
        </button>
      </div>

      {/* Tab Contents: Queue Manager */}
      {activeTab === 'queue' && (
        <div className="bg-black/40 border border-[#d1a058]/30 rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(209,160,88,0.1)]">
          <div className="p-6 border-b border-[#d1a058]/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, tribe, or mobile..."
                className="w-full bg-black/60 border border-[#d1a058]/40 rounded px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#d1a058] pr-10"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-white/40 hover:text-white">✕</button>
              )}
            </div>
            <div className="flex items-center gap-4 justify-between md:justify-end w-full md:w-auto">
              <button
                onClick={handleExportCSV}
                className="bg-[#d1a058] hover:bg-[#c09048] text-black font-bold px-5 py-2.5 rounded text-sm uppercase tracking-wider transition-colors flex items-center gap-2 shadow-md"
                style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
              >
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
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-black/90 backdrop-blur border-b border-[#d1a058]/25 z-10">
                  <tr>
                    <th className="p-4 font-semibold text-white/80 uppercase text-xs tracking-wider">Name</th>
                    <th className="p-4 font-semibold text-white/80 uppercase text-xs tracking-wider">Mobile</th>
                    <th className="p-4 font-semibold text-white/80 uppercase text-xs tracking-wider">Status</th>
                    <th className="p-4 font-semibold text-white/80 uppercase text-xs tracking-wider">Tribe</th>
                    <th className="p-4 font-semibold text-white/80 uppercase text-xs tracking-wider">Has Bought</th>
                    <th className="p-4 font-semibold text-white/80 uppercase text-xs tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 font-medium">{user.name}</td>
                      <td className="p-4 font-mono text-white/50">{user.mobile || user.number}</td>
                      <td className="p-4">
                        {user.status === 'pending' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">Waiting</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">Revealed</span>
                        )}
                      </td>
                      <td className="p-4 font-semibold uppercase tracking-wider text-sm">
                        {user.tribe === 'lava' && <span className="text-orange-500">Lava</span>}
                        {user.tribe === 'rain' && <span className="text-blue-500">Rain</span>}
                        {user.tribe === 'mountain' && <span className="text-[#eebb77]">Mountain</span>}
                        {user.tribe === 'wind' && <span className="text-emerald-400">Wind</span>}
                        {!user.tribe && <span className="text-white/30 italic">--</span>}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleBought(user.id, !!user.hasBought)}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all uppercase border ${
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
      )}

      {/* Tab Contents: Tournaments */}
      {activeTab === 'tournaments' && (
        <div className="grid grid-col-1 lg:grid-cols-3 gap-8">
          {/* Creator Form */}
          <div className="lg:col-span-1 bg-black/40 border border-[#d1a058]/30 rounded-xl p-6 shadow-md h-fit">
            <h2 className="text-xl font-bold uppercase text-[#d1a058] mb-4" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>
              Create Tournament
            </h2>
            <form onSubmit={handleCreateTournament} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-white/70 mb-1">Name</label>
                <input
                  type="text"
                  value={newTourneyName}
                  onChange={(e) => setNewTourneyName(e.target.value)}
                  placeholder="e.g. Clash of Elements"
                  className="w-full bg-black/60 border border-white/20 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d1a058]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-white/70 mb-1">Size (Multiple of 16)</label>
                <input
                  type="number"
                  value={newTourneySize}
                  onChange={(e) => setNewTourneySize(Number(e.target.value))}
                  min={16}
                  step={16}
                  className="w-full bg-black/60 border border-white/20 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d1a058]"
                  required
                />
                <p className="text-[10px] text-white/40 mt-1">Each block of 16 accommodates 4 players per tribe.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-white/70 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={newTourneyDateTime}
                  onChange={(e) => setNewTourneyDateTime(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded px-4 py-2.5 text-sm text-[#d1a058] font-bold focus:outline-none focus:border-[#d1a058]"
                  required
                />
                
                {/* Date presets panel */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  <button 
                    type="button" 
                    onClick={() => setNewTourneyDateTime(getPresetDate(0, 18))} 
                    className="text-[9px] font-bold bg-white/5 border border-white/10 hover:bg-[#d1a058] hover:text-black px-2 py-1 rounded transition-all uppercase"
                  >
                    Today 6PM
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setNewTourneyDateTime(getPresetDate(1, 14))} 
                    className="text-[9px] font-bold bg-white/5 border border-white/10 hover:bg-[#d1a058] hover:text-black px-2 py-1 rounded transition-all uppercase"
                  >
                    Tomorrow 2PM
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setNewTourneyDateTime(getPresetDate(1, 18))} 
                    className="text-[9px] font-bold bg-white/5 border border-white/10 hover:bg-[#d1a058] hover:text-black px-2 py-1 rounded transition-all uppercase"
                  >
                    Tomorrow 6PM
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setNewTourneyDateTime(getPresetDate(3, 15))} 
                    className="text-[9px] font-bold bg-white/5 border border-white/10 hover:bg-[#d1a058] hover:text-black px-2 py-1 rounded transition-all uppercase"
                  >
                    In 3 Days 3PM
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={tourneyLoading}
                className="w-full bg-[#d1a058] hover:bg-[#c09048] text-black font-bold py-3.5 rounded text-sm uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
              >
                {tourneyLoading ? 'Creating...' : 'Create Tournament'}
              </button>
            </form>
          </div>

          {/* Tournaments List */}
          <div className="lg:col-span-2 bg-black/40 border border-[#d1a058]/30 rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-bold uppercase text-[#d1a058] mb-4" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>
              Active Tournaments
            </h2>
            {tournaments.length === 0 ? (
              <p className="text-white/40 text-center py-8">No tournaments created yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#d1a058]/20">
                      <th className="pb-3 text-xs uppercase font-semibold text-white/70">Tournament Info</th>
                      <th className="pb-3 text-xs uppercase font-semibold text-white/70">Capacity</th>
                      <th className="pb-3 text-xs uppercase font-semibold text-white/70">Date & Time</th>
                      <th className="pb-3 text-xs uppercase font-semibold text-white/70 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tournaments.map((t) => (
                      <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4">
                          <span className="font-bold block text-[#d1a058]">{t.name}</span>
                          <span className="text-xs text-white/40 font-mono">ID: {t.id}</span>
                        </td>
                        <td className="py-4">
                          <span className="font-semibold">{t.size} Seats</span>
                          <span className="text-xs block text-white/40">({t.size / 4} per tribe)</span>
                        </td>
                        <td className="py-4 font-sans text-sm text-white/80">
                          {new Date(t.dateTime).toLocaleString()}
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleOpenEditTournament(t)}
                              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white p-2 rounded transition-colors"
                              title="Edit Tournament"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteTournament(t.id, t.name)}
                              className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded transition-colors"
                              title="Delete Tournament"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Contents: Seat Bookings */}
      {activeTab === 'booking' && (
        <div className="bg-black/40 border border-[#d1a058]/30 rounded-xl p-6 shadow-md">
          {/* Top selection bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#d1a058]/20 mb-8">
            <div className="flex-1 max-w-md">
              <label className="block text-xs font-semibold uppercase text-white/70 mb-1.5">Select Tournament</label>
              {tournaments.length === 0 ? (
                <p className="text-red-400 text-sm font-semibold uppercase">Please create a tournament first.</p>
              ) : (
                <select
                  value={selectedTournamentId}
                  onChange={(e) => setSelectedTournamentId(e.target.value)}
                  className="w-full bg-black/60 border border-[#d1a058]/40 text-[#d1a058] font-bold rounded px-4 py-2.5 focus:outline-none focus:border-[#d1a058]"
                >
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id} className="bg-black text-[#d1a058]">{t.name} ({t.size} Seats)</option>
                  ))}
                </select>
              )}
            </div>

            {activeTourney && (
              <div className="flex gap-4 md:gap-8 font-sans">
                {TRIBES.map((tr) => {
                  const bookedCount = bookings.filter(b => b.tribe === tr.id).length
                  const isFull = bookedCount >= capacity
                  return (
                    <div key={tr.id} className="text-center bg-black/30 border border-white/5 px-4 py-2 rounded-lg">
                      <span className="block text-[10px] uppercase font-bold text-white/50">{tr.label}</span>
                      <span className={`text-base font-black ${isFull ? 'text-red-500' : 'text-white'}`}>
                        {bookedCount} / {capacity}
                      </span>
                      <span className="block text-[9px] text-white/30 uppercase mt-0.5">{isFull ? 'FULL' : 'Left: ' + (capacity - bookedCount)}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Seating Layout Area */}
          {!activeTourney ? (
            <div className="text-center py-16 text-white/40 uppercase font-bold">Select or create a tournament to manage seats</div>
          ) : (
            <div className="relative w-full overflow-x-auto py-8 select-none">
              
              {/* Cinema Arena Screen / Boundary Heading */}
              <div className="w-full max-w-xl mx-auto mb-14 text-center relative">
                <div className="w-full h-4 border-b-2 border-dashed border-[#d1a058]/40 rounded-b-[100%] shadow-[0_12px_24px_rgba(209,160,88,0.15)]"></div>
                <span className="text-[10px] tracking-[0.4em] text-[#d1a058] uppercase font-black mt-3.5 inline-block">ARENA STAGE / SCREEN</span>
              </div>

              {/* Theater rows */}
              <div className="w-full max-w-4xl mx-auto space-y-8 min-w-[650px] px-4">
                {TRIBES.map((tr, tIdx) => {
                  const tribeBookings = bookings.filter(b => b.tribe === tr.id)
                  
                  return (
                    <div key={tr.id} className="flex items-center gap-6 p-3 rounded-lg bg-black/20 border border-white/5">
                      {/* Row Title */}
                      <div className="w-36 flex-shrink-0 text-left font-sans">
                        <span className="text-sm font-black uppercase tracking-wider block" style={{ color: tr.color }}>
                          {tr.id} Row
                        </span>
                        <span className="text-[10px] text-white/40 block uppercase">
                          Filled: {tribeBookings.length} / {capacity}
                        </span>
                      </div>

                      {/* Seats Horizontal list */}
                      <div className="flex flex-1 items-center gap-3">
                        {Array.from({ length: capacity }).map((_, seatIndexInRow) => {
                          const absoluteSeatIndex = tIdx * capacity + seatIndexInRow
                          const booking = bookings.find(b => b.seatIndex === absoluteSeatIndex)
                          
                          // Get short initials
                          const initials = booking 
                            ? booking.userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                            : ''

                          return (
                            <div key={seatIndexInRow} className="relative group">
                              {booking ? (
                                /* Occupied Seat */
                                <button
                                  onClick={() => handleOpenManageBooking(booking)}
                                  className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center text-xs font-bold text-black font-sans transition-all hover:scale-110 active:scale-95 shadow-md relative ${
                                    booking.isZampion 
                                      ? 'animate-pulse ring-4 ring-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.7)]' 
                                      : booking.isWinner 
                                        ? 'ring-2 ring-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.5)]' 
                                        : ''
                                  }`}
                                  style={{ backgroundColor: booking.isZampion ? '#f59e0b' : tr.color }}
                                >
                                  {booking.isZampion && (
                                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[14px] filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] animate-bounce" style={{ animationDuration: '2s' }}>👑</span>
                                  )}
                                  {!booking.isZampion && booking.isWinner && (
                                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] text-yellow-300 filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">★</span>
                                  )}
                                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mb-0.5">
                                    <path d="M4 18v3h16v-3M4 10V6a2 2 0 012-2h12a2 2 0 012 2v4M2 10h20v6H2z" />
                                  </svg>
                                  <span className="text-[9px] tracking-tight truncate max-w-full px-0.5">{initials}</span>
                                </button>
                              ) : (
                                /* Empty Seat */
                                <button
                                  onClick={() => handleOpenBooking(tr.id, absoluteSeatIndex)}
                                  className="w-12 h-12 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 text-white/30 hover:text-white"
                                  style={{ borderColor: tr.border }}
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                                    <path d="M4 18v3h16v-3M4 10V6a2 2 0 012-2h12a2 2 0 012 2v4M2 10h20v6H2z" />
                                  </svg>
                                  <span className="text-[7px] text-white/30 mt-0.5">#{seatIndexInRow + 1}</span>
                                </button>
                              )}

                              {/* Hover Tooltip */}
                              {booking && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 hidden group-hover:block bg-black border border-[#d1a058] p-3.5 rounded-lg shadow-2xl z-30 font-sans pointer-events-none">
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black" />
                                  <p className="text-[#d1a058] font-black uppercase text-xs tracking-wider">{booking.userName}</p>
                                  <p className="text-white/60 text-[10px] font-mono mt-1">{booking.userMobile}</p>
                                  <p className="text-[9px] text-[#d1a058]/80 font-bold mt-1.5 uppercase">Click to Manage Reservation</p>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Booking Selection Modal (Create Booking) */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans">
          <div className="w-full max-w-xl bg-[#0c120d] border-2 border-[#d1a058] rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-[#d1a058]/20 flex items-center justify-between bg-black/30">
              <div>
                <h3 className="font-bold text-lg text-[#d1a058] uppercase">
                  Book Seat - {selectedTribe.toUpperCase()} Row
                </h3>
                <p className="text-xs text-white/50">Assign a player of the {selectedTribe} tribe to this slot.</p>
              </div>
              <button 
                onClick={() => setBookingModalOpen(false)}
                className="text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-[#d1a058]/10 bg-black/10">
              <input
                type="text"
                value={searchPlayerQuery}
                onChange={(e) => setSearchPlayerQuery(e.target.value)}
                placeholder="Search registered players by name or phone..."
                className="w-full bg-black/60 border border-white/20 rounded px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#d1a058]"
              />
            </div>

            {/* List */}
            <div className="max-h-[350px] overflow-y-auto p-4 space-y-2">
              {assignablePlayers.length === 0 ? (
                <p className="text-center text-white/40 py-8 text-sm">
                  {users.filter(u => u.status === 'revealed' && u.tribe === selectedTribe).length === 0
                    ? `No registered players have been revealed as ${selectedTribe} yet.`
                    : "No matching, unbooked players found."}
                </p>
              ) : (
                assignablePlayers.map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-3.5 rounded-lg bg-black/30 border border-white/5 hover:border-white/15 transition-all">
                    <div>
                      <p className="font-bold text-white text-sm uppercase tracking-wide">{player.name}</p>
                      <p className="text-xs text-white/50 font-mono mt-0.5">{player.mobile || player.number}</p>
                    </div>
                    <button
                      onClick={() => handleBookPlayer(player)}
                      className="bg-[#d1a058] hover:bg-[#c09048] text-black font-black px-4 py-2 rounded text-xs uppercase tracking-wider transition-colors shadow-md"
                    >
                      Assign Seat
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-[#d1a058]/20 text-right bg-black/30 text-[10px] text-white/40">
              Showing {assignablePlayers.length} unbooked {selectedTribe} warriors
            </div>
          </div>
        </div>
      )}

      {/* Edit Tournament Modal (Update Tournament CRUD) */}
      {editingTournament && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0c120d] border-2 border-[#d1a058] rounded-xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-[#d1a058]/20 flex items-center justify-between bg-black/30">
              <h3 className="font-bold text-lg text-[#d1a058] uppercase">
                Edit Tournament Details
              </h3>
              <button 
                onClick={() => setEditingTournament(null)}
                className="text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveTournament} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-white/70 mb-1">Tournament Name</label>
                <input
                  type="text"
                  value={editTourneyName}
                  onChange={(e) => setEditTourneyName(e.target.value)}
                  placeholder="Tournament Name"
                  className="w-full bg-black/60 border border-white/20 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d1a058]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-white/70 mb-1">Capacity Size (Multiple of 16)</label>
                <input
                  type="number"
                  value={editTourneySize}
                  onChange={(e) => setEditTourneySize(Number(e.target.value))}
                  min={16}
                  step={16}
                  className="w-full bg-black/60 border border-white/20 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d1a058]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-white/70 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={editTourneyDateTime}
                  onChange={(e) => setEditTourneyDateTime(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded px-4 py-2.5 text-sm text-[#d1a058] font-bold focus:outline-none focus:border-[#d1a058]"
                  required
                />
                
                {/* Date presets panel for Edit Modal */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  <button 
                    type="button" 
                    onClick={() => setEditTourneyDateTime(getPresetDate(0, 18))} 
                    className="text-[9px] font-bold bg-white/5 border border-white/10 hover:bg-[#d1a058] hover:text-black px-2 py-1 rounded transition-all uppercase"
                  >
                    Today 6PM
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEditTourneyDateTime(getPresetDate(1, 14))} 
                    className="text-[9px] font-bold bg-white/5 border border-white/10 hover:bg-[#d1a058] hover:text-black px-2 py-1 rounded transition-all uppercase"
                  >
                    Tomorrow 2PM
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEditTourneyDateTime(getPresetDate(2, 16))} 
                    className="text-[9px] font-bold bg-white/5 border border-white/10 hover:bg-[#d1a058] hover:text-black px-2 py-1 rounded transition-all uppercase"
                  >
                    In 2 Days 4PM
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTournament(null)}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-2.5 rounded text-xs uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editTourneyLoading}
                  className="flex-1 bg-[#d1a058] hover:bg-[#c09048] text-black font-bold py-2.5 rounded text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {editTourneyLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Booking Modal (Update/Delete Seat Bookings CRUD) */}
      {selectedBooking && manageBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0c120d] border-2 border-[#d1a058] rounded-xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-[#d1a058]/20 flex items-center justify-between bg-black/30">
              <div>
                <h3 className="font-bold text-lg text-[#d1a058] uppercase">
                  Manage Reservation
                </h3>
                <p className="text-xs text-white/50">Modify or cancel seat allocation.</p>
              </div>
              <button 
                onClick={() => {
                  setManageBookingModalOpen(false)
                  setSelectedBooking(null)
                }}
                className="text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Info panel */}
              <div className="bg-black/30 border border-white/5 p-4 rounded-lg">
                <span className="block text-[10px] uppercase font-bold text-white/50">Player name</span>
                <span className="text-base font-bold text-white block uppercase tracking-wide">{selectedBooking.userName}</span>
                
                <span className="block text-[10px] uppercase font-bold text-white/50 mt-3">Mobile number</span>
                <span className="text-sm font-mono text-white/80 block">{selectedBooking.userMobile}</span>

                <span className="block text-[10px] uppercase font-bold text-white/50 mt-3">Current Assignment</span>
                <span className="text-xs font-semibold block uppercase" style={{ color: TRIBES.find(t => t.id === selectedBooking.tribe)?.color }}>
                  {selectedBooking.tribe} Tribe — Seat #{ (selectedBooking.seatIndex % capacity) + 1 }
                </span>
              </div>

              {/* Action 1: Relocate seat (Move Booking CRUD) */}
              <div className="space-y-2 border-t border-white/10 pt-4">
                <label className="block text-xs font-semibold uppercase text-white/70">Move to different seat</label>
                <div className="flex gap-2">
                  <select
                    value={targetSeatIndex}
                    onChange={(e) => setTargetSeatIndex(Number(e.target.value))}
                    className="flex-1 bg-black/60 border border-white/20 rounded px-3 py-2 text-sm text-[#d1a058] font-bold focus:outline-none focus:border-[#d1a058]"
                  >
                    <option value={-1}>Choose available seat...</option>
                    {getAvailableSeatsForTribe(selectedBooking.tribe).map((seatIdx) => (
                      <option key={seatIdx} value={seatIdx}>Seat #{ (seatIdx % capacity) + 1 }</option>
                    ))}
                  </select>
                  <button
                    onClick={handleMoveSeat}
                    disabled={targetSeatIndex === -1}
                    className="bg-[#d1a058] hover:bg-[#c09048] disabled:opacity-50 text-black font-black px-4 rounded text-xs uppercase tracking-wider transition-colors shadow"
                  >
                    Move
                  </button>
                </div>
                {getAvailableSeatsForTribe(selectedBooking.tribe).length === 0 && (
                  <p className="text-[10px] text-red-400">All other seats for the {selectedBooking.tribe} tribe are occupied.</p>
                )}
              </div>

              {/* Action 2: Round Winner & Zampion Controls (Update Booking CRUD) */}
              <div className="space-y-2.5 border-t border-white/10 pt-4">
                <label className="block text-xs font-semibold uppercase text-white/70">Declare Round Winner / Zampion</label>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleToggleRoundWinner}
                    className={`w-full py-2.5 rounded text-xs font-bold transition-all uppercase tracking-wider border ${
                      selectedBooking.isWinner 
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' 
                        : 'bg-black/60 text-white/70 border-white/20 hover:bg-white/5'
                    }`}
                  >
                    {selectedBooking.isWinner ? '★ Winner of Round (Click to clear)' : '☆ Declare Winner of Round'}
                  </button>

                  {selectedBooking.isWinner && (
                    <button
                      onClick={handleCrownZampion}
                      className={`w-full py-2.5 rounded text-xs font-black transition-all uppercase tracking-wider border ${
                        selectedBooking.isZampion 
                          ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                      }`}
                    >
                      {selectedBooking.isZampion ? '👑 Crowned Ultimate ZAMPION!' : 'Crown as Ultimate ZAMPION 👑'}
                    </button>
                  )}
                </div>
              </div>

              {/* Action 3: Release Booking (Delete Booking CRUD) */}
              <div className="border-t border-white/10 pt-4 flex justify-between gap-3">
                <button
                  onClick={() => {
                    setManageBookingModalOpen(false)
                    setSelectedBooking(null)
                  }}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-2.5 rounded text-xs uppercase tracking-wider transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleReleaseSelectedBooking}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded text-xs uppercase tracking-wider transition-colors shadow-md"
                >
                  Release Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
