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
import { toast, Toaster } from 'sonner'

interface ZambaaraUser {
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

interface DateTimePickerProps {
  isOpen: boolean
  onClose: () => void
  value: string
  onChange: (val: string) => void
  title?: string
}

function DateTimePickerModal({ isOpen, onClose, value, onChange, title = "Select Date & Time" }: DateTimePickerProps) {
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });

  const [selectedDay, setSelectedDay] = useState<number>(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d.getDate();
    }
    return new Date().getDate();
  });

  const [hour, setHour] = useState<number>(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        const h = d.getHours() % 12;
        return h === 0 ? 12 : h;
      }
    }
    return 12;
  });

  const [minute, setMinute] = useState<number>(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d.getMinutes();
    }
    return 0;
  });

  const [ampm, setAmpm] = useState<'AM' | 'PM'>(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        return d.getHours() >= 12 ? 'PM' : 'AM';
      }
    }
    return 'PM';
  });

  useEffect(() => {
    if (isOpen) {
      const d = value ? new Date(value) : new Date();
      const parsedDate = isNaN(d.getTime()) ? new Date() : d;
      setCurrentDate(parsedDate);
      setSelectedDay(parsedDate.getDate());
      
      const h = parsedDate.getHours() % 12;
      setHour(h === 0 ? 12 : h);
      setMinute(parsedDate.getMinutes());
      setAmpm(parsedDate.getHours() >= 12 ? 'PM' : 'AM');
    }
  }, [isOpen, value]);

  if (!isOpen) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDaysInMonth = (y: number, m: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  const getFirstDayOfWeek = (y: number, m: number) => {
    return new Date(y, m, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfWeek(year, month);

  const handlePrevMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    setCurrentDate(newDate);
    const maxDays = getDaysInMonth(newDate.getFullYear(), newDate.getMonth());
    if (selectedDay > maxDays) {
      setSelectedDay(maxDays);
    }
  };

  const handleNextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    setCurrentDate(newDate);
    const maxDays = getDaysInMonth(newDate.getFullYear(), newDate.getMonth());
    if (selectedDay > maxDays) {
      setSelectedDay(maxDays);
    }
  };

  const handleApply = () => {
    let militaryHour = hour % 12;
    if (ampm === 'PM') militaryHour += 12;
    
    const yyyy = year.toString();
    const mm = (month + 1).toString().padStart(2, '0');
    const dd = selectedDay.toString().padStart(2, '0');
    const hh = militaryHour.toString().padStart(2, '0');
    const min = minute.toString().padStart(2, '0');

    const formattedVal = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    onChange(formattedVal);
    onClose();
  };

  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const isSelected = d === selectedDay;
    const isToday = d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
    cells.push(
      <button
        key={`day-${d}`}
        type="button"
        onClick={() => setSelectedDay(d)}
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
          isSelected 
            ? 'bg-[#d1a058] text-black shadow-[0_0_8px_rgba(209,160,88,0.5)]' 
            : isToday 
              ? 'border border-[#d1a058] text-[#d1a058]' 
              : 'hover:bg-white/10 text-white'
        }`}
      >
        {d}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="bg-[#0f0f0f] border border-[#d1a058]/40 rounded-xl p-5 w-full max-w-sm shadow-2xl relative">
        <h3 className="text-sm font-bold text-[#d1a058] mb-3 uppercase tracking-wider text-center" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>
          {title}
        </h3>

        <div className="flex items-center justify-between mb-4 px-2">
          <button 
            type="button"
            onClick={handlePrevMonth}
            className="text-white/60 hover:text-white p-1 rounded hover:bg-white/5 transition-all text-xs font-black"
          >
            ◀
          </button>
          <span className="text-xs font-extrabold uppercase text-[#d1a058] tracking-widest">
            {monthNames[month]} {year}
          </span>
          <button 
            type="button"
            onClick={handleNextMonth}
            className="text-white/60 hover:text-white p-1 rounded hover:bg-white/5 transition-all text-xs font-black"
          >
            ▶
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[9px] uppercase font-black tracking-wider text-white/40 mb-2">
          <div>Su</div>
          <div>Mo</div>
          <div>Tu</div>
          <div>We</div>
          <div>Th</div>
          <div>Fr</div>
          <div>Sa</div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center justify-items-center mb-4">
          {cells}
        </div>

        <div className="border-t border-white/10 pt-3 mb-4">
          <label className="block text-[9px] uppercase font-black tracking-wider text-white/50 mb-2 text-center">
            Set Time
          </label>
          <div className="flex items-center justify-center gap-1.5">
            <select
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
              className="bg-black border border-white/20 text-[#d1a058] font-bold rounded px-2 py-1 text-xs focus:outline-none focus:border-[#d1a058] cursor-pointer"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                <option key={h} value={h}>{h.toString().padStart(2, '0')}</option>
              ))}
            </select>
            <span className="text-white/60 font-bold">:</span>
            <select
              value={minute}
              onChange={(e) => setMinute(Number(e.target.value))}
              className="bg-black border border-white/20 text-[#d1a058] font-bold rounded px-2 py-1 text-xs focus:outline-none focus:border-[#d1a058] cursor-pointer"
            >
              {Array.from({ length: 60 }, (_, i) => i).map(m => (
                <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
              ))}
            </select>
            <div className="flex border border-white/20 rounded overflow-hidden">
              <button
                type="button"
                onClick={() => setAmpm('AM')}
                className={`px-2 py-1 text-[10px] font-black transition-all ${ampm === 'AM' ? 'bg-[#d1a058] text-black' : 'text-white hover:bg-white/5'}`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => setAmpm('PM')}
                className={`px-2 py-1 text-[10px] font-black transition-all ${ampm === 'PM' ? 'bg-[#d1a058] text-black' : 'text-white hover:bg-white/5'}`}
              >
                PM
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-2.5 text-center mb-4 border border-white/5">
          <span className="block text-[8px] uppercase tracking-widest text-white/40 mb-0.5">Preview</span>
          <span className="text-xs font-mono font-bold text-white">
            {monthNames[month].slice(0, 3)} {selectedDay.toString().padStart(2, '0')}, {year} @ {hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')} {ampm}
          </span>
        </div>

        <div className="flex justify-end gap-2 text-[10px] uppercase font-bold tracking-wider">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 hover:bg-white/5 rounded transition-all text-white/70 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="bg-[#d1a058] hover:bg-[#c09048] text-black px-4 py-1.5 rounded font-black shadow-md transition-all"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminZambaaraPage() {
  const [users, setUsers] = useState<ZambaaraUser[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTribeFilter, setSelectedTribeFilter] = useState('all')
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

  // Date picker states
  const [createDatePickerOpen, setCreateDatePickerOpen] = useState(false)
  const [editDatePickerOpen, setEditDatePickerOpen] = useState(false)

  // Queue filter state (revealed vs confirmed vs pending)
  const [queueFilterMode, setQueueFilterMode] = useState<'revealed' | 'confirmed' | 'pending'>('revealed')

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
    const q = query(collection(db, 'zambaara_users'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
      })) as ZambaaraUser[]
      setUsers(docs)
      setLoading(false)
    }, (error) => {
      console.error("Error fetching Zambaara users:", error)
      toast.error('Failed to load Zambaara queue data')
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // 2. Tournaments Listener
  useEffect(() => {
    const q = query(collection(db, 'zambaara_tournaments'), orderBy('createdAt', 'desc'))
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
      console.error("Error fetching Zambaara tournaments:", error)
    })
    return () => unsubscribe()
  }, [])

  // 3. Bookings Listener
  useEffect(() => {
    if (!selectedTournamentId) {
      setBookings([])
      return
    }
    const q = query(collection(db, 'zambaara_bookings'), where('tournamentId', '==', selectedTournamentId))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
      })) as Booking[]
      setBookings(docs)
    }, (error) => {
      console.error("Error fetching Zambaara bookings:", error)
    })
    return () => unsubscribe()
  }, [selectedTournamentId])

  // Queue delete user
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name} from the queue?`)) return
    try {
      const res = await fetch(`/api/zambaara/queue/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success(`Deleted ${name}`)
      } else {
        toast.error('Failed to delete user')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error occurred while deleting')
    }
  }

  // Toggle user bought status
  const handleToggleBought = async (id: string, currentVal: boolean) => {
    try {
      const docRef = doc(db, 'zambaara_users', id)
      await updateDoc(docRef, { hasBought: !currentVal })
      toast.success('Purchase status updated')
    } catch (err) {
      console.error('Error updating purchase status:', err)
      toast.error('Failed to update status')
    }
  }

  // Copy phone number to clipboard
  const handleCopyMobile = (mobile: string, name: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(mobile)
      toast.success(`Copied phone number for ${name}`)
    } else {
      toast.error('Clipboard copy not supported by your browser')
    }
  }

  // Confirm player (marks status as confirmed in zambaara_users)
  const handleConfirmPlayer = async (player: ZambaaraUser) => {
    if (!player.tribe) {
      toast.error('Player has not scanned/revealed their tribe yet.')
      return
    }

    try {
      const docRef = doc(db, 'zambaara_users', player.id)
      await updateDoc(docRef, { status: 'confirmed' })
      toast.success(`Successfully confirmed ${player.name}! Moved to confirmed pool.`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to confirm player')
    }
  }

  // Unconfirm player (marks status back to completed in zambaara_users)
  const handleUnconfirmPlayer = async (player: ZambaaraUser) => {
    try {
      const docRef = doc(db, 'zambaara_users', player.id)
      await updateDoc(docRef, { status: 'completed' })
      toast.success(`Moved ${player.name} back to waiting reveal queue.`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to unconfirm player')
    }
  }

  // Create Tournament Submit
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
      await addDoc(collection(db, 'zambaara_tournaments'), {
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

    // Capacity checks
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
      toast.error(`Cannot shrink size to ${editTourneySize}. A tribe has ${maxBookedInAnyTribe} bookings. Please release seats first.`)
      return
    }

    setEditTourneyLoading(true)
    try {
      const docRef = doc(db, 'zambaara_tournaments', editingTournament.id)
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
      await deleteDoc(doc(db, 'zambaara_tournaments', id))
      
      // Clean up bookings in Firestore
      const bookingsToDelete = bookings.filter(b => b.tournamentId === id)
      for (const booking of bookingsToDelete) {
        await deleteDoc(doc(db, 'zambaara_bookings', booking.id))
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

  // Save manual seat reservation
  const handleBookPlayer = async (player: ZambaaraUser) => {
    if (!selectedTournamentId || selectedSeatIndex === -1 || !selectedTribe) return
    try {
      await addDoc(collection(db, 'zambaara_bookings'), {
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

  // Release booking
  const handleReleaseSelectedBooking = async () => {
    if (!selectedBooking) return
    if (!confirm(`Release seat booked by ${selectedBooking.userName}?`)) return
    try {
      await deleteDoc(doc(db, 'zambaara_bookings', selectedBooking.id))
      toast.success(`Released seat for ${selectedBooking.userName}`)
      setManageBookingModalOpen(false)
      setSelectedBooking(null)
    } catch (err) {
      console.error(err)
      toast.error('Failed to release seat')
    }
  }

  // Relocate seat
  const handleMoveSeat = async () => {
    if (!selectedBooking || targetSeatIndex === -1) return
    try {
      const docRef = doc(db, 'zambaara_bookings', selectedBooking.id)
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

  // Toggle Round Winner
  const handleToggleRoundWinner = async () => {
    if (!selectedBooking) return
    try {
      const isWinnerNow = !selectedBooking.isWinner
      const docRef = doc(db, 'zambaara_bookings', selectedBooking.id)
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

  // Crown Ultimate Zampion
  const handleCrownZampion = async () => {
    if (!selectedBooking) return
    try {
      const isZampionNow = !selectedBooking.isZampion
      
      if (isZampionNow) {
        const otherZampions = bookings.filter(b => b.tournamentId === selectedTournamentId && b.isZampion === true && b.id !== selectedBooking.id)
        for (const z of otherZampions) {
          await updateDoc(doc(db, 'zambaara_bookings', z.id), { isZampion: false })
        }
      }

      const docRef = doc(db, 'zambaara_bookings', selectedBooking.id)
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
    const status = user.status || 'pending'
    if (queueFilterMode === 'revealed' && status !== 'completed') return false
    if (queueFilterMode === 'confirmed' && status !== 'confirmed') return false
    if (queueFilterMode === 'pending' && status !== 'pending') return false

    if (selectedTribeFilter !== 'all') {
      if (selectedTribeFilter === 'none') {
        if (user.tribe) return false
      } else {
        if (user.tribe !== selectedTribeFilter) return false
      }
    }

    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    const nameMatch = user.name?.toLowerCase().includes(q)
    const mobileValue = user.mobile || user.number
    const mobileMatch = mobileValue?.toLowerCase().includes(q)
    const tribeMatch = user.tribe?.toLowerCase().includes(q)
    return nameMatch || mobileMatch || tribeMatch
  })

  // Fetch active tournament details
  const activeTourney = tournaments.find(t => t.id === selectedTournamentId)
  const capacity = activeTourney ? activeTourney.size / 4 : 4

  // Filter players list for the booking selector
  const assignablePlayers = users.filter(user => {
    if (user.status !== 'confirmed') return false
    if (user.tribe !== selectedTribe) return false
    const isBooked = bookings.some(b => b.userId === user.id)
    if (isBooked) return false
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
      <Toaster position="top-center" />
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 uppercase text-[#d1a058]" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>
            Zambaara Tournament Admin
          </h1>
          <p className="text-white/60 font-sans text-sm">
            Double-verification queue manager, active brackets, and live standings config panel.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/tournaments/zambaara/register" target="_blank" className="bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#d1a058]/50 text-[#d1a058] font-bold px-5 py-2.5 rounded uppercase tracking-wider transition-colors text-xs" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>
            Registration Page
          </Link>
          <Link href="/tournaments/zambaara/reveal" target="_blank" className="bg-[#d1a058] hover:bg-[#c09048] text-black font-bold px-5 py-2.5 rounded uppercase tracking-wider transition-colors text-xs" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>
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
          Verification Queue
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
          Seat Allocations
        </button>
      </div>

      {/* Tab Contents: Queue Manager */}
      {activeTab === 'queue' && (
        <div className="bg-black/40 border border-[#d1a058]/30 rounded-xl overflow-hidden shadow-lg">
          <div className="p-6 border-b border-[#d1a058]/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-xl w-full">
              <div className="relative flex-1">
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
              <select
                value={selectedTribeFilter}
                onChange={(e) => setSelectedTribeFilter(e.target.value)}
                className="bg-black/60 border border-[#d1a058]/40 rounded px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#d1a058] cursor-pointer min-w-[160px]"
              >
                <option value="all">All Tribes</option>
                <option value="lava">Lava Tribe</option>
                <option value="rain">Rain Tribe</option>
                <option value="mountain">Mountain Tribe</option>
                <option value="wind">Wind Tribe</option>
                <option value="none">No Tribe (Unrevealed)</option>
              </select>
            </div>
            
            <div className="flex items-center gap-4 justify-between md:justify-end w-full md:w-auto">
              <div className="text-sm text-white/50">
                Active Tournament: <span className="font-bold text-[#d1a058]">{activeTourney?.name || 'None'}</span>
              </div>
              <div className="text-sm text-white/60">
                Filtered: {filteredUsers.length} | Total: {users.length}
              </div>
            </div>
          </div>

          {/* Sub-tabs for Queue Status */}
          <div className="flex border-b border-white/10 bg-black/20 px-6 py-2.5 gap-2 overflow-x-auto whitespace-nowrap">
            <button
              onClick={() => setQueueFilterMode('revealed')}
              className={`px-4 py-2 rounded text-xs font-bold uppercase transition-all ${
                queueFilterMode === 'revealed'
                  ? 'bg-[#d1a058] text-black shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Waiting Verification ({users.filter(u => u.status === 'completed').length})
            </button>
            <button
              onClick={() => setQueueFilterMode('confirmed')}
              className={`px-4 py-2 rounded text-xs font-bold uppercase transition-all ${
                queueFilterMode === 'confirmed'
                  ? 'bg-green-500 text-black shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Confirmed Pool ({users.filter(u => u.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setQueueFilterMode('pending')}
              className={`px-4 py-2 rounded text-xs font-bold uppercase transition-all ${
                queueFilterMode === 'pending'
                  ? 'bg-yellow-600 text-black shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Unrevealed Sign-ups ({users.filter(u => !u.status || u.status === 'pending').length})
            </button>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-white/50">Loading registrations...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-white/50">
              {queueFilterMode === 'revealed' && 'No revealed tribe players waiting for verification.'}
              {queueFilterMode === 'confirmed' && 'No players in the confirmed pool yet.'}
              {queueFilterMode === 'pending' && 'No pending sign-ups waiting to reveal.'}
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-black/90 backdrop-blur border-b border-[#d1a058]/25 z-10">
                  <tr>
                    <th className="p-4 font-semibold text-white/80 uppercase text-xs tracking-wider">Name</th>
                    <th className="p-4 font-semibold text-white/80 uppercase text-xs tracking-wider">Phone Number</th>
                    <th className="p-4 font-semibold text-white/80 uppercase text-xs tracking-wider">Status</th>
                    <th className="p-4 font-semibold text-white/80 uppercase text-xs tracking-wider">Tribe</th>
                    <th className="p-4 font-semibold text-white/80 uppercase text-xs tracking-wider">Ticket Purchased</th>
                    <th className="p-4 font-semibold text-white/80 uppercase text-xs tracking-wider text-right">Verification Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const isAlreadyBooked = bookings.some(b => b.userId === user.id)
                    const mobileNum = user.mobile || user.number || ''
                    const userStatus = user.status || 'pending'

                    return (
                      <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 font-medium">{user.name}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-white/70">{mobileNum}</span>
                            <button
                              onClick={() => handleCopyMobile(mobileNum, user.name)}
                              className="text-[#d1a058] hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
                              title="Copy to Clipboard"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="p-4">
                          {userStatus === 'pending' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">Waiting Reveal</span>
                          ) : userStatus === 'confirmed' ? (
                            isAlreadyBooked ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">Seat Booked</span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Ready to Seat</span>
                            )
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">Tribe Revealed</span>
                          )}
                        </td>
                        <td className="p-4 font-semibold uppercase tracking-wider text-sm">
                          {user.tribe === 'lava' && <span className="text-orange-500 font-bold">Lava</span>}
                          {user.tribe === 'rain' && <span className="text-blue-500 font-bold">Rain</span>}
                          {user.tribe === 'mountain' && <span className="text-[#eebb77] font-bold">Mountain</span>}
                          {user.tribe === 'wind' && <span className="text-emerald-400 font-bold">Wind</span>}
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
                          <div className="flex justify-end items-center gap-2">
                            {queueFilterMode === 'revealed' && (
                              <button
                                onClick={() => handleConfirmPlayer(user)}
                                className="bg-[#d1a058] hover:bg-[#c09048] text-black font-black px-3 py-1.5 rounded font-sans text-xs uppercase tracking-wider shadow-md transition-colors"
                              >
                                Confirm Player
                              </button>
                            )}

                            {queueFilterMode === 'confirmed' && (
                              <button
                                onClick={() => handleUnconfirmPlayer(user)}
                                disabled={isAlreadyBooked}
                                className={`px-3 py-1.5 rounded font-sans text-xs uppercase font-bold tracking-wider transition-colors ${
                                  isAlreadyBooked
                                    ? 'bg-white/5 text-white/20 border border-white/10 cursor-not-allowed'
                                    : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 shadow-sm'
                                }`}
                              >
                                {isAlreadyBooked ? 'Booked' : 'Unconfirm'}
                              </button>
                            )}

                            {queueFilterMode === 'pending' && (
                              <span className="text-white/30 text-xs italic font-bold tracking-wider uppercase pr-2">
                                Waiting Scan Kiosk
                              </span>
                            )}

                            <button 
                              onClick={() => handleDelete(user.id, user.name)}
                              className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded transition-colors"
                              title="Delete from Queue"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab Contents: Tournaments */}
      {activeTab === 'tournaments' && (
        <div className="grid grid-col-1 lg:grid-cols-3 gap-8">
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
                  placeholder="e.g. Elemental Clash"
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
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-white/70 mb-1">Date & Time</label>
                <button
                  type="button"
                  onClick={() => setCreateDatePickerOpen(true)}
                  className="w-full bg-black/60 border border-white/20 rounded px-4 py-2.5 text-sm text-[#d1a058] font-bold text-left focus:outline-none focus:border-[#d1a058] flex justify-between items-center"
                >
                  <span>{newTourneyDateTime ? new Date(newTourneyDateTime).toLocaleString() : 'Select Date & Time...'}</span>
                  <span className="text-white/40 text-xs">📅</span>
                </button>
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

          <div className="lg:col-span-2 bg-black/40 border border-[#d1a058]/30 rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-bold uppercase text-[#d1a058] mb-4" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>
              Active Tournaments
            </h2>
            {tournaments.length === 0 ? (
              <p className="text-white/40 text-center py-8">No tournaments registered.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#d1a058]/20">
                      <th className="pb-3 text-xs uppercase font-semibold text-white/70">Tournament Info</th>
                      <th className="pb-3 text-xs uppercase font-semibold text-white/70">Size</th>
                      <th className="pb-3 text-xs uppercase font-semibold text-white/70 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tournaments.map((t) => (
                      <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4">
                          <div className="font-bold text-[#d1a058]">{t.name}</div>
                          <div className="text-xs text-white/40 font-mono mt-0.5">{new Date(t.dateTime).toLocaleString()}</div>
                        </td>
                        <td className="py-4 font-mono">{t.size} Slots</td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditTournament(t)}
                              className="text-amber-500 hover:text-amber-400 p-2 hover:bg-amber-500/10 rounded transition-all"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTournament(t.id, t.name)}
                              className="text-red-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded transition-all"
                            >
                              Delete
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex-1 max-w-sm">
              <label className="block text-xs font-semibold uppercase text-white/50 mb-1.5">Selected Tournament</label>
              <select
                value={selectedTournamentId}
                onChange={(e) => setSelectedTournamentId(e.target.value)}
                className="w-full bg-black/60 border border-[#d1a058]/40 text-[#d1a058] font-bold rounded px-4 py-2.5 focus:outline-none focus:border-[#d1a058] text-sm"
              >
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id} className="bg-black text-[#d1a058]">{t.name}</option>
                ))}
              </select>
            </div>
            {activeTourney && (
              <div className="text-right text-xs text-white/40">
                Roster Allocation Capacity: {bookings.length} / {activeTourney.size} Seats Occupied
              </div>
            )}
          </div>

          {!activeTourney ? (
            <p className="text-white/40 text-center py-10 uppercase font-black">Please select or register a tournament</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {TRIBES.map((tr) => {
                const tribeIndex = TRIBES.findIndex(t => t.id === tr.id)
                const tribeSeats: (Booking | null)[] = Array.from({ length: capacity }, () => null)
                
                // Map existing bookings into their specific seat indices
                bookings.forEach((booking) => {
                  if (booking.tribe === tr.id) {
                    const relativeIdx = booking.seatIndex % capacity
                    if (relativeIdx >= 0 && relativeIdx < capacity) {
                      tribeSeats[relativeIdx] = booking
                    }
                  }
                })

                return (
                  <div key={tr.id} className="bg-black/55 border border-white/5 rounded-2xl p-6">
                    <h3 className="text-lg font-black uppercase pb-3 border-b border-white/10 mb-4" style={{ color: tr.color, fontFamily: "'TheWalkyrDemo', serif" }}>
                      {tr.label}
                    </h3>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {tribeSeats.map((seat, idx) => {
                        const globalSeatIdx = tribeIndex * capacity + idx
                        
                        return (
                          <div key={idx} className="flex flex-col items-center">
                            <span className="text-[10px] text-white/40 font-mono mb-1">Seat #{idx + 1}</span>
                            {seat ? (
                              <button
                                onClick={() => handleOpenManageBooking(seat)}
                                className={`w-full aspect-[3/4] rounded-lg border p-2 flex flex-col justify-between items-center text-center transition-all ${
                                  seat.isZampion 
                                    ? 'bg-amber-950/20 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                                    : seat.isWinner 
                                      ? 'bg-yellow-950/10 border-yellow-400/80 shadow-[0_0_8px_rgba(234,179,8,0.25)]'
                                      : 'bg-black/80 border-[#d1a058]/50 hover:border-[#d1a058]'
                                }`}
                              >
                                <span className="text-[9px] text-[#d1a058] uppercase font-bold tracking-wider truncate w-full">
                                  {seat.userName}
                                </span>
                                <div className="text-[15px] filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                  {seat.isZampion ? '👑' : seat.isWinner ? '★' : '⚔'}
                                </div>
                                <span className="text-[8px] text-white/40 uppercase font-black tracking-wider">
                                  Manage
                                </span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenBooking(tr.id, globalSeatIdx)}
                                className="w-full aspect-[3/4] bg-white/5 border border-dashed border-white/15 rounded-lg flex flex-col justify-center items-center text-white/30 hover:text-[#d1a058] hover:border-[#d1a058]/50 hover:bg-[#d1a058]/5 transition-all text-center"
                              >
                                <span className="text-xl font-bold">+</span>
                                <span className="text-[8px] uppercase tracking-wider font-semibold mt-1">Book</span>
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Booking Selector Modal */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f0f0f] border border-[#d1a058]/40 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="text-lg font-bold text-[#d1a058] mb-4 uppercase" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>
              Assign Player to seat #{ (selectedSeatIndex % capacity) + 1 }
            </h3>
            
            <input
              type="text"
              value={searchPlayerQuery}
              onChange={(e) => setSearchPlayerQuery(e.target.value)}
              placeholder="Search player by name or mobile..."
              className="w-full bg-black/60 border border-white/20 rounded px-4 py-2.5 text-sm text-white placeholder-white/35 focus:outline-none focus:border-[#d1a058] mb-4"
            />

            <div className="max-h-60 overflow-y-auto space-y-2 mb-6">
              {assignablePlayers.length === 0 ? (
                <p className="text-white/30 text-xs italic text-center py-4">No verified, unbooked {selectedTribe.toUpperCase()} players found.</p>
              ) : (
                assignablePlayers.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => handleBookPlayer(player)}
                    className="w-full text-left p-3 rounded bg-white/5 hover:bg-[#d1a058]/10 hover:text-[#d1a058] border border-white/5 transition-all flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-sm">{player.name}</div>
                      <div className="text-[10px] text-white/40 font-mono mt-0.5">{player.mobile || player.number}</div>
                    </div>
                    <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded font-black uppercase text-white">Select</span>
                  </button>
                ))
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setBookingModalOpen(false)}
                className="px-4 py-2 text-sm hover:bg-white/5 rounded uppercase font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Management / Crown / Winner Modal */}
      {manageBookingModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f0f0f] border border-[#d1a058]/40 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="text-lg font-bold text-[#d1a058] mb-1 uppercase" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>
              Seat Slot Management
            </h3>
            <p className="text-xs text-white/50 mb-5">Gladiator: <span className="text-white font-bold">{selectedBooking.userName}</span></p>

            <div className="space-y-3 mb-6">
              {/* Declare Round Winner */}
              <button
                onClick={handleToggleRoundWinner}
                className="w-full bg-[#d1a058]/10 hover:bg-[#d1a058]/20 border border-[#d1a058]/35 text-[#d1a058] font-bold py-2.5 rounded text-xs uppercase tracking-wider transition-all"
              >
                {selectedBooking.isWinner ? '★ Clear Round Winner status' : '★ Declare Round Winner'}
              </button>

              {/* Crown Ultimate Zampion */}
              <button
                onClick={handleCrownZampion}
                className="w-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/35 text-amber-400 font-bold py-2.5 rounded text-xs uppercase tracking-wider transition-all"
              >
                {selectedBooking.isZampion ? '👑 Clear Zampion crown' : '👑 Crown Ultimate Zampion'}
              </button>

              {/* Move Seat Location */}
              <div className="border border-white/5 p-4 rounded bg-white/5">
                <label className="block text-[10px] uppercase font-bold text-white/60 mb-2">Relocate to another seat</label>
                <div className="flex gap-2">
                  <select
                    value={targetSeatIndex}
                    onChange={(e) => setTargetSeatIndex(Number(e.target.value))}
                    className="flex-1 bg-black border border-white/20 text-[#d1a058] font-bold rounded px-3 py-2 text-xs focus:outline-none focus:border-[#d1a058]"
                  >
                    <option value={-1}>Select seat...</option>
                    {getAvailableSeatsForTribe(selectedBooking.tribe).map((seatIdx) => (
                      <option key={seatIdx} value={seatIdx}>Seat #{ (seatIdx % capacity) + 1 }</option>
                    ))}
                  </select>
                  <button
                    onClick={handleMoveSeat}
                    disabled={targetSeatIndex === -1}
                    className="bg-[#d1a058] hover:bg-[#c09048] disabled:opacity-50 text-black font-black px-4 py-2 rounded text-xs uppercase tracking-wider transition-all"
                  >
                    Relocate
                  </button>
                </div>
              </div>
              
              {/* Release Slot (Delete Booking) */}
              <button
                onClick={handleReleaseSelectedBooking}
                className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold py-2.5 rounded text-xs uppercase tracking-wider transition-all"
              >
                Release Seat Reservation
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setManageBookingModalOpen(false)
                  setSelectedBooking(null)
                }}
                className="px-4 py-2 text-sm hover:bg-white/5 rounded uppercase font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Tournament Modal */}
      {editingTournament && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f0f0f] border border-[#d1a058]/40 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="text-lg font-bold text-[#d1a058] mb-4 uppercase" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>
              Edit Tournament Settings
            </h3>
            
            <form onSubmit={handleSaveTournament} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-white/70 mb-1">Name</label>
                <input
                  type="text"
                  value={editTourneyName}
                  onChange={(e) => setEditTourneyName(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d1a058]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-white/70 mb-1">Size (Multiple of 16)</label>
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
                <button
                  type="button"
                  onClick={() => setEditDatePickerOpen(true)}
                  className="w-full bg-black/60 border border-white/20 rounded px-4 py-2.5 text-sm text-[#d1a058] font-bold text-left focus:outline-none focus:border-[#d1a058] flex justify-between items-center"
                >
                  <span>{editTourneyDateTime ? new Date(editTourneyDateTime).toLocaleString() : 'Select Date & Time...'}</span>
                  <span className="text-white/40 text-xs">📅</span>
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTournament(null)}
                  className="px-4 py-2 text-sm hover:bg-white/5 rounded uppercase font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editTourneyLoading}
                  className="bg-[#d1a058] hover:bg-[#c09048] text-black font-bold px-5 py-2 rounded text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {editTourneyLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Date & Time Picker Modals */}
      <DateTimePickerModal
        isOpen={createDatePickerOpen}
        onClose={() => setCreateDatePickerOpen(false)}
        value={newTourneyDateTime}
        onChange={(val) => setNewTourneyDateTime(val)}
        title="Create Tournament Date & Time"
      />

      <DateTimePickerModal
        isOpen={editDatePickerOpen}
        onClose={() => setEditDatePickerOpen(false)}
        value={editTourneyDateTime}
        onChange={(val) => setEditTourneyDateTime(val)}
        title="Edit Tournament Date & Time"
      />
    </div>
  )
}
