'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { db } from '@/lib/firebase'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore'
import {
  CUSTOM_PLAYERS_COLLECTION,
  CUSTOM_TOURNAMENTS_COLLECTION,
  CustomPlayer,
  CustomRound,
  CustomTournament,
  TRIBE_META,
  Tribe,
  genId,
  getChampionId,
  makeTables,
  normalizeMobile,
  seatedIdsInRound,
  winnersOfRound
} from '@/lib/zambaara-custom'

const walkyr = { fontFamily: "'TheWalkyrDemo', serif" }
const blinker = { fontFamily: "'BlinkerSemiBold', sans-serif" }

export function TribeBadge({ tribe, size = 'sm' }: { tribe: CustomPlayer['tribe']; size?: 'xs' | 'sm' }) {
  const cls = size === 'xs' ? 'text-[8px] px-1.5 py-0.5' : 'text-[10px] px-2 py-0.5'
  if (!tribe) {
    return (
      <span className={`${cls} rounded font-bold uppercase tracking-wider bg-white/5 text-white/35 border border-white/10`}>
        Unrevealed
      </span>
    )
  }
  const m = TRIBE_META[tribe]
  return (
    <span
      className={`${cls} rounded font-black uppercase tracking-wider border`}
      style={{ color: m.color, background: m.soft, borderColor: m.border }}
    >
      {m.label}
    </span>
  )
}

const shuffle = <T,>(arr: T[]) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function CustomTournamentAdmin() {
  // Mobile section switch: 'tables' | 'roster' | 'tournaments'
  const [mobileTab, setMobileTab] = useState<'tables' | 'roster' | 'tournaments'>('tables')

  // Tournaments list
  const [tournaments, setTournaments] = useState<CustomTournament[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [players, setPlayers] = useState<CustomPlayer[]>([])

  // Create tournament form
  const [newName, setNewName] = useState('')
  const [newTables, setNewTables] = useState(4)
  const [newDateTime, setNewDateTime] = useState('')
  const [creating, setCreating] = useState(false)

  // Edit tournament modal
  const [editTourneyOpen, setEditTourneyOpen] = useState(false)
  const [editTourneyName, setEditTourneyName] = useState('')
  const [editTourneyDateTime, setEditTourneyDateTime] = useState('')
  const [savingTourney, setSavingTourney] = useState(false)

  // Roster form
  const [playerName, setPlayerName] = useState('')
  const [playerMobile, setPlayerMobile] = useState('')
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [rosterSearch, setRosterSearch] = useState('')
  const [rosterTribeFilter, setRosterTribeFilter] = useState<'all' | 'unrevealed' | Tribe>('all')

  // Edit player modal
  const [editPlayer, setEditPlayer] = useState<CustomPlayer | null>(null)
  const [editPlayerName, setEditPlayerName] = useState('')
  const [editPlayerMobile, setEditPlayerMobile] = useState('')
  const [editPlayerTribe, setEditPlayerTribe] = useState<'unrevealed' | Tribe>('unrevealed')
  const [savingPlayer, setSavingPlayer] = useState(false)

  // Rounds & Tables
  const [roundIdx, setRoundIdx] = useState(0)
  const [seatModal, setSeatModal] = useState<{ tableId: string } | null>(null)
  const [seatSearch, setSeatSearch] = useState('')
  const [nextRoundOpen, setNextRoundOpen] = useState(false)
  const [nextRoundSelected, setNextRoundSelected] = useState<Set<string>>(new Set())
  const [nextRoundTables, setNextRoundTables] = useState(1)
  const [nextRoundSearch, setNextRoundSearch] = useState('')
  const [addTablesCount, setAddTablesCount] = useState(1)

  // Table rename modal (replacing browser prompt)
  const [renameModal, setRenameModal] = useState<{ tableId: string; currentName: string } | null>(null)
  const [renameInput, setRenameInput] = useState('')

  // 1. Tournaments listener
  useEffect(() => {
    const q = query(collection(db, CUSTOM_TOURNAMENTS_COLLECTION), orderBy('createdAt', 'desc'))
    return onSnapshot(
      q,
      snap => {
        const docs = snap.docs.map(d => ({ id: d.id, rounds: [], ...d.data() })) as unknown as CustomTournament[]
        setTournaments(docs)
        setSelectedId(prev => (prev && docs.some(d => d.id === prev) ? prev : docs[0]?.id || ''))
      },
      err => {
        console.error(err)
        toast.error('Failed to load custom tournaments')
      }
    )
  }, [])

  // 2. Roster listener
  useEffect(() => {
    if (!selectedId) {
      setPlayers([])
      return
    }
    const q = query(collection(db, CUSTOM_PLAYERS_COLLECTION), where('tournamentId', '==', selectedId))
    return onSnapshot(
      q,
      snap => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as CustomPlayer[]
        docs.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
        setPlayers(docs)
      },
      err => {
        console.error(err)
        toast.error('Failed to load roster')
      }
    )
  }, [selectedId])

  const tourney = tournaments.find(t => t.id === selectedId)
  const rounds = tourney?.rounds || []

  // Ensure round index stays valid
  useEffect(() => {
    setRoundIdx(Math.max(0, (tourney?.rounds?.length || 1) - 1))
  }, [selectedId, tourney?.rounds?.length])

  const round: CustomRound | undefined = rounds[roundIdx]
  const playerMap = useMemo(() => new Map(players.map(p => [p.id, p])), [players])
  const championId = getChampionId(tourney)
  const champion = championId ? playerMap.get(championId) : undefined
  const revealedCount = players.filter(p => p.tribe).length

  // Save rounds helper
  const saveRounds = async (newRounds: CustomRound[], successMsg?: string) => {
    if (!tourney) return
    try {
      await updateDoc(doc(db, CUSTOM_TOURNAMENTS_COLLECTION, tourney.id), { rounds: newRounds })
      if (successMsg) toast.success(successMsg)
    } catch (err) {
      console.error(err)
      toast.error('Failed to save changes')
    }
  }

  const cloneRounds = () => JSON.parse(JSON.stringify(rounds)) as CustomRound[]

  // ---------- Tournament CRUD ----------
  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = newName.trim()
    const count = Math.floor(Number(newTables))
    if (!name) return toast.error('Enter a tournament name')
    if (!count || count < 1) return toast.error('Enter number of tables (at least 1)')
    setCreating(true)
    try {
      const ref = await addDoc(collection(db, CUSTOM_TOURNAMENTS_COLLECTION), {
        name,
        dateTime: newDateTime || '',
        rounds: [{ id: genId(), name: 'Round 1', tables: makeTables(count) }],
        createdAt: new Date().toISOString()
      })
      setSelectedId(ref.id)
      setNewName('')
      setNewTables(4)
      setNewDateTime('')
      setMobileTab('tables')
      toast.success(`Created "${name}" with ${count} table${count > 1 ? 's' : ''}`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to create tournament')
    } finally {
      setCreating(false)
    }
  }

  const openEditTournament = () => {
    if (!tourney) return
    setEditTourneyName(tourney.name)
    setEditTourneyDateTime(tourney.dateTime || '')
    setEditTourneyOpen(true)
  }

  const handleSaveTournament = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tourney) return
    const name = editTourneyName.trim()
    if (!name) return toast.error('Tournament name cannot be empty')
    setSavingTourney(true)
    try {
      await updateDoc(doc(db, CUSTOM_TOURNAMENTS_COLLECTION, tourney.id), {
        name,
        dateTime: editTourneyDateTime || ''
      })
      toast.success('Tournament updated successfully')
      setEditTourneyOpen(false)
    } catch (err) {
      console.error(err)
      toast.error('Failed to update tournament')
    } finally {
      setSavingTourney(false)
    }
  }

  const handleDeleteTournament = async (t: CustomTournament) => {
    if (!confirm(`Are you sure you want to delete "${t.name}"?\nAll associated players and table bookings will be permanently removed.`)) {
      return
    }
    try {
      const batch = writeBatch(db)
      if (t.id === selectedId) {
        players.forEach(p => batch.delete(doc(db, CUSTOM_PLAYERS_COLLECTION, p.id)))
      }
      batch.delete(doc(db, CUSTOM_TOURNAMENTS_COLLECTION, t.id))
      await batch.commit()
      toast.success(`Deleted "${t.name}"`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete tournament')
    }
  }

  // ---------- Roster Player CRUD ----------
  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tourney) return
    const name = playerName.trim()
    const mobile = normalizeMobile(playerMobile)
    if (!name) return toast.error('Enter player name')
    if (mobile.length < 7) return toast.error('Enter a valid phone number (at least 7 digits)')
    if (players.some(p => normalizeMobile(p.mobile) === mobile)) {
      return toast.error('A player with this phone number already exists in the roster')
    }

    try {
      await addDoc(collection(db, CUSTOM_PLAYERS_COLLECTION), {
        tournamentId: tourney.id,
        name,
        mobile,
        tribe: null,
        revealedAt: null,
        createdAt: new Date().toISOString()
      })
      setPlayerName('')
      setPlayerMobile('')
      toast.success(`Added ${name}`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to add player')
    }
  }

  const handleBulkAdd = async () => {
    if (!tourney) return
    const existing = new Set(players.map(p => normalizeMobile(p.mobile)))
    const rows: { name: string; mobile: string }[] = []
    const skipped: string[] = []

    bulkText
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean)
      .forEach(line => {
        let name = ''
        let mobile = ''
        const parts = line.split(/[,\t;|]/).map(s => s.trim()).filter(Boolean)
        if (parts.length >= 2) {
          const numIdx = parts.findIndex(p => normalizeMobile(p).length >= 7)
          if (numIdx >= 0) {
            mobile = normalizeMobile(parts[numIdx])
            name = parts.filter((_, i) => i !== numIdx).join(' ')
          }
        } else {
          const m = line.match(/^(.*?)[\s-]*([+\d][\d\s-]{6,})$/)
          if (m) {
            name = m[1].trim()
            mobile = normalizeMobile(m[2])
          }
        }
        if (!name || mobile.length < 7 || existing.has(mobile)) {
          skipped.push(line)
          return
        }
        existing.add(mobile)
        rows.push({ name, mobile })
      })

    if (rows.length === 0) {
      return toast.error('No valid new rows. Format: one "Name, Number" per line.')
    }

    try {
      const batch = writeBatch(db)
      const now = Date.now()
      rows.forEach((r, i) => {
        batch.set(doc(collection(db, CUSTOM_PLAYERS_COLLECTION)), {
          tournamentId: tourney.id,
          name: r.name,
          mobile: r.mobile,
          tribe: null,
          revealedAt: null,
          createdAt: new Date(now + i).toISOString()
        })
      })
      await batch.commit()
      setBulkText(skipped.join('\n'))
      toast.success(
        `Imported ${rows.length} player${rows.length > 1 ? 's' : ''}${
          skipped.length ? ` · ${skipped.length} skipped (kept in box)` : ''
        }`
      )
      if (!skipped.length) setBulkOpen(false)
    } catch (err) {
      console.error(err)
      toast.error('Bulk import failed')
    }
  }

  const openEditPlayer = (p: CustomPlayer) => {
    setEditPlayer(p)
    setEditPlayerName(p.name)
    setEditPlayerMobile(p.mobile)
    setEditPlayerTribe((p.tribe as Tribe) || 'unrevealed')
  }

  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editPlayer) return
    const name = editPlayerName.trim()
    const mobile = normalizeMobile(editPlayerMobile)
    if (!name) return toast.error('Name cannot be empty')
    if (mobile.length < 7) return toast.error('Enter a valid phone number (at least 7 digits)')

    setSavingPlayer(true)
    try {
      const updatedTribe = editPlayerTribe === 'unrevealed' ? null : editPlayerTribe
      await updateDoc(doc(db, CUSTOM_PLAYERS_COLLECTION, editPlayer.id), {
        name,
        mobile,
        tribe: updatedTribe,
        revealedAt: updatedTribe ? (editPlayer.revealedAt || new Date().toISOString()) : null
      })
      toast.success(`Updated player ${name}`)
      setEditPlayer(null)
    } catch (err) {
      console.error(err)
      toast.error('Failed to update player')
    } finally {
      setSavingPlayer(false)
    }
  }

  const handleDeletePlayer = async (p: CustomPlayer) => {
    if (!confirm(`Remove ${p.name} from the roster?\nThey will be unseated from all tables.`)) return
    try {
      const newRounds = cloneRounds().map(r => ({
        ...r,
        tables: r.tables.map(tb => ({
          ...tb,
          playerIds: tb.playerIds.filter(id => id !== p.id),
          winnerId: tb.winnerId === p.id ? null : tb.winnerId
        }))
      }))
      await deleteDoc(doc(db, CUSTOM_PLAYERS_COLLECTION, p.id))
      await saveRounds(newRounds)
      toast.success(`Removed ${p.name}`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to remove player')
    }
  }

  const handleResetTribe = async (p: CustomPlayer) => {
    if (!confirm(`Reset tribe for ${p.name}?\nThey will be able to search and reveal their tribe again on the kiosk.`)) {
      return
    }
    try {
      await updateDoc(doc(db, CUSTOM_PLAYERS_COLLECTION, p.id), { tribe: null, revealedAt: null })
      toast.success(`Tribe reset for ${p.name}`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to reset tribe')
    }
  }

  // ---------- Tables & Seating ----------
  const seatedInRound = seatedIdsInRound(round)
  const prevWinners = new Set(roundIdx > 0 ? winnersOfRound(rounds[roundIdx - 1]) : [])

  const seatPlayer = (tableId: string, playerId: string) => {
    const r = cloneRounds()
    const cur = r[roundIdx]
    cur.tables.forEach(tb => {
      tb.playerIds = tb.playerIds.filter(id => id !== playerId)
      if (tb.winnerId === playerId) tb.winnerId = null
    })
    cur.tables.find(tb => tb.id === tableId)?.playerIds.push(playerId)
    const tName = cur.tables.find(tb => tb.id === tableId)?.name
    saveRounds(r, `${playerMap.get(playerId)?.name} seated at ${tName}`)
  }

  const unseatPlayer = (tableId: string, playerId: string) => {
    const r = cloneRounds()
    const tb = r[roundIdx].tables.find(t => t.id === tableId)
    if (!tb) return
    tb.playerIds = tb.playerIds.filter(id => id !== playerId)
    if (tb.winnerId === playerId) tb.winnerId = null
    saveRounds(r)
  }

  const movePlayer = (fromTableId: string, toTableId: string, playerId: string) => {
    if (fromTableId === toTableId) return
    seatPlayer(toTableId, playerId)
  }

  const toggleWinner = (tableId: string, playerId: string) => {
    const r = cloneRounds()
    const tb = r[roundIdx].tables.find(t => t.id === tableId)
    if (!tb) return
    const isNow = tb.winnerId !== playerId
    tb.winnerId = isNow ? playerId : null
    const isFinal = roundIdx === r.length - 1 && r[roundIdx].tables.length === 1 && roundIdx > 0
    const name = playerMap.get(playerId)?.name
    saveRounds(r, isNow ? (isFinal ? `👑 ${name} is the ULTIMATE ZAMPION!` : `★ ${name} wins ${tb.name}`) : `Cleared winner of ${tb.name}`)
  }

  const addTables = () => {
    const n = Math.max(1, Math.floor(Number(addTablesCount) || 1))
    const r = cloneRounds()
    r[roundIdx].tables.push(...makeTables(n, r[roundIdx].tables.length))
    saveRounds(r, `Added ${n} table${n > 1 ? 's' : ''}`)
  }

  const removeTable = (tableId: string) => {
    const r = cloneRounds()
    const tb = r[roundIdx].tables.find(t => t.id === tableId)
    if (!tb) return
    if (tb.playerIds.length && !confirm(`${tb.name} currently has ${tb.playerIds.length} players. Remove table anyway?`)) {
      return
    }
    r[roundIdx].tables = r[roundIdx].tables.filter(t => t.id !== tableId)
    saveRounds(r, `Removed ${tb.name}`)
  }

  const openRenameTable = (tb: { id: string; name: string }) => {
    setRenameModal({ tableId: tb.id, currentName: tb.name })
    setRenameInput(tb.name)
  }

  const handleSaveRenameTable = (e: React.FormEvent) => {
    e.preventDefault()
    if (!renameModal) return
    const name = renameInput.trim()
    if (!name) return toast.error('Table name cannot be empty')
    const r = cloneRounds()
    const tb = r[roundIdx].tables.find(t => t.id === renameModal.tableId)
    if (tb) {
      tb.name = name
      saveRounds(r, `Renamed to "${name}"`)
    }
    setRenameModal(null)
  }

  const autoFill = () => {
    if (!round || round.tables.length === 0) return toast.error('Please add a table first')
    const pool = (roundIdx === 0 ? players.map(p => p.id) : Array.from(prevWinners)).filter(id => !seatedInRound.has(id))
    if (pool.length === 0) {
      return toast.error(roundIdx === 0 ? 'All players are already seated' : 'All qualified winners are already seated')
    }
    const r = cloneRounds()
    const tables = r[roundIdx].tables
    shuffle(pool).forEach(id => {
      const target = tables.reduce((min, tb) => (tb.playerIds.length < min.playerIds.length ? tb : min), tables[0])
      target.playerIds.push(id)
    })
    saveRounds(r, `Auto-seated ${pool.length} warrior${pool.length > 1 ? 's' : ''}`)
  }

  const openNextRound = () => {
    const last = rounds[rounds.length - 1]
    const winners = winnersOfRound(last)
    const missing = last.tables.filter(tb => !tb.winnerId).length
    if (missing && !confirm(`${missing} table(s) in ${last.name} have no declared winner yet. Proceed to next round anyway?`)) {
      return
    }
    setNextRoundSelected(new Set(winners))
    setNextRoundTables(1)
    setNextRoundSearch('')
    setNextRoundOpen(true)
  }

  const createNextRound = () => {
    const ids = Array.from(nextRoundSelected)
    const count = Math.max(1, Math.floor(Number(nextRoundTables) || 1))
    if (ids.length < 2) return toast.error('Select at least 2 players for the next round')
    const r = cloneRounds()
    const tables = makeTables(count)
    if (count === 1) tables[0].name = 'Final Table'
    ids.forEach((id, i) => tables[i % count].playerIds.push(id))
    const name = count === 1 ? 'Final Round' : `Round ${r.length + 1}`
    r.push({ id: genId(), name, tables })
    saveRounds(r, `${name} created with ${ids.length} players!`)
    setNextRoundOpen(false)
  }

  const deleteRound = () => {
    if (roundIdx === 0 || roundIdx !== rounds.length - 1) return
    if (!confirm(`Delete ${round?.name}? Seating and table outcomes in this round will be lost.`)) return
    const r = cloneRounds()
    r.pop()
    saveRounds(r, 'Round deleted')
  }

  // Filtered lists
  const rosterFiltered = players.filter(p => {
    if (rosterTribeFilter === 'unrevealed' && p.tribe) return false
    if (rosterTribeFilter !== 'all' && rosterTribeFilter !== 'unrevealed' && p.tribe !== rosterTribeFilter) return false
    const q = rosterSearch.toLowerCase().trim()
    if (!q) return true
    return p.name.toLowerCase().includes(q) || p.mobile.includes(q)
  })

  const seatPool = players
    .filter(p => !seatedInRound.has(p.id))
    .filter(p => {
      const q = seatSearch.toLowerCase().trim()
      return !q || p.name.toLowerCase().includes(q) || p.mobile.includes(q)
    })
    .sort((a, b) => Number(prevWinners.has(b.id)) - Number(prevWinners.has(a.id)))

  const lastRoundWinners = new Set(winnersOfRound(rounds[rounds.length - 1]))
  const nextRoundPool = players
    .filter(p => {
      const q = nextRoundSearch.toLowerCase().trim()
      return !q || p.name.toLowerCase().includes(q) || p.mobile.includes(q)
    })
    .sort((a, b) => Number(lastRoundWinners.has(b.id)) - Number(lastRoundWinners.has(a.id)))

  const tableOf = (pid: string) => round?.tables.find(tb => tb.playerIds.includes(pid))

  return (
    <div className="space-y-6">
      {/* Mobile sub-tab navigation (< 1024px) */}
      <div className="flex lg:hidden bg-black/60 border border-[#d1a058]/30 rounded-xl p-1 gap-1">
        <button
          onClick={() => setMobileTab('tables')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            mobileTab === 'tables'
              ? 'bg-[#d1a058] text-black shadow-md'
              : 'text-white/60 hover:text-white'
          }`}
        >
          ⚔️ Tables ({round?.tables.length || 0})
        </button>
        <button
          onClick={() => setMobileTab('roster')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            mobileTab === 'roster'
              ? 'bg-[#d1a058] text-black shadow-md'
              : 'text-white/60 hover:text-white'
          }`}
        >
          👥 Roster ({players.length})
        </button>
        <button
          onClick={() => setMobileTab('tournaments')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            mobileTab === 'tournaments'
              ? 'bg-[#d1a058] text-black shadow-md'
              : 'text-white/60 hover:text-white'
          }`}
        >
          🏆 Setup
        </button>
      </div>

      {/* Top Section: Create Tournament & Tournament List */}
      <div className={`${mobileTab === 'tournaments' ? 'block' : 'hidden lg:grid'} grid-cols-1 lg:grid-cols-3 gap-6`}>
        {/* Create Tournament */}
        <form onSubmit={handleCreateTournament} className="bg-black/40 border border-[#d1a058]/30 rounded-xl p-5 sm:p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold uppercase text-[#d1a058]" style={walkyr}>
              New Tournament
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#d1a058] bg-[#d1a058]/10 px-2 py-0.5 rounded border border-[#d1a058]/30">
              Custom Setup
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-white/70 mb-1">Tournament Name</label>
            <input
              id="custom-tourney-name"
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="e.g. Zambaara Clash — Arena 1"
              className="w-full bg-black/60 border border-white/20 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d1a058]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-white/70 mb-1">Number of Tables</label>
              <input
                id="custom-tourney-tables"
                type="number"
                min={1}
                value={newTables}
                onChange={e => setNewTables(Number(e.target.value))}
                className="w-full bg-black/60 border border-white/20 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d1a058]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-white/70 mb-1">Date & Time</label>
              <input
                type="datetime-local"
                value={newDateTime}
                onChange={e => setNewDateTime(e.target.value)}
                className="w-full bg-black/60 border border-white/20 rounded px-3 py-3 text-xs text-white focus:outline-none focus:border-[#d1a058] [color-scheme:dark]"
              />
            </div>
          </div>

          <p className="text-[11px] text-white/40">
            Players can be added at any time. Any combination of tribes can sit together at a table.
          </p>

          <button
            id="custom-tourney-create"
            type="submit"
            disabled={creating}
            className="w-full min-h-[44px] bg-[#d1a058] hover:bg-[#c09048] text-black font-bold py-3 rounded-lg text-sm uppercase tracking-wider transition-colors disabled:opacity-50 shadow-md"
            style={blinker}
          >
            {creating ? 'Creating…' : 'Create Tournament'}
          </button>
        </form>

        {/* Tournaments List & Management */}
        <div className="lg:col-span-2 bg-black/40 border border-[#d1a058]/30 rounded-xl p-5 sm:p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-bold uppercase text-[#d1a058]" style={walkyr}>
                Active Tournaments
              </h2>
              <p className="text-xs text-white/50">Select a tournament to view its roster and manage live tables.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/tournaments/zambaara/reveal"
                target="_blank"
                className="min-h-[38px] inline-flex items-center bg-[#d1a058] hover:bg-[#c09048] text-black font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider text-[11px]"
                style={blinker}
              >
                Reveal Kiosk ↗
              </Link>
              <Link
                href={`/tournaments/zambaara/live${selectedId ? `?t=${selectedId}` : ''}`}
                target="_blank"
                className="min-h-[38px] inline-flex items-center bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#d1a058]/50 text-[#d1a058] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider text-[11px]"
                style={blinker}
              >
                Live Tables ↗
              </Link>
            </div>
          </div>

          {tournaments.length === 0 ? (
            <p className="text-white/40 text-center py-10 text-sm">No custom tournaments created yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
              {tournaments.map(t => {
                const active = t.id === selectedId
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedId(t.id)
                      setMobileTab('tables')
                    }}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      active
                        ? 'border-[#d1a058] bg-[#d1a058]/10 shadow-[0_0_15px_rgba(209,160,88,0.25)]'
                        : 'border-white/10 bg-black/40 hover:border-[#d1a058]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className={`font-bold truncate ${active ? 'text-[#d1a058]' : 'text-white'}`}>{t.name}</div>
                        <div className="text-[10px] text-white/40 font-mono mt-0.5">
                          {t.dateTime ? new Date(t.dateTime).toLocaleString() : new Date(t.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-white/50 mt-1 uppercase tracking-wider">
                          {t.rounds?.length || 0} round{(t.rounds?.length || 0) !== 1 ? 's' : ''} · {t.rounds?.[0]?.tables.length || 0} initial tables
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            setSelectedId(t.id)
                            openEditTournament()
                          }}
                          className="text-[#d1a058] hover:text-white p-1 text-xs"
                          title="Edit tournament"
                        >
                          ✎
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            handleDeleteTournament(t)
                          }}
                          className="text-red-500/70 hover:text-red-400 p-1 text-xs"
                          title="Delete tournament"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {tourney && (
        <>
          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Warriors', value: players.length },
              { label: 'Tribes Revealed', value: `${revealedCount} / ${players.length}` },
              { label: 'Current Stage', value: rounds[rounds.length - 1]?.name || '—' },
              { label: 'Reigning Zampion', value: champion ? `👑 ${champion.name}` : 'TBD' }
            ].map(s => (
              <div key={s.label} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3">
                <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{s.label}</div>
                <div className="text-base sm:text-lg font-black text-[#d1a058] truncate">{s.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Roster Column */}
            <div className={`${mobileTab === 'roster' ? 'block' : 'hidden lg:flex'} flex-col bg-black/40 border border-[#d1a058]/30 rounded-xl p-5 shadow-md`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold uppercase text-[#d1a058]" style={walkyr}>
                    Tournament Roster
                  </h3>
                  <span className="text-[10px] text-white/50">{players.length} registered warriors</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBulkOpen(v => !v)}
                  className="min-h-[34px] text-[10px] uppercase font-bold tracking-wider text-[#d1a058] hover:text-white border border-[#d1a058]/40 rounded-lg px-2.5 py-1"
                >
                  {bulkOpen ? 'Single Add' : 'Bulk Import'}
                </button>
              </div>

              {/* Add player forms */}
              {bulkOpen ? (
                <div className="mb-4 space-y-2">
                  <textarea
                    value={bulkText}
                    onChange={e => setBulkText(e.target.value)}
                    rows={5}
                    placeholder={'One per line:\nVikram Singh, 9876543210\nAnanya Iyer 9811203377'}
                    className="w-full bg-black/60 border border-white/20 rounded-lg p-3 text-xs text-white font-mono focus:outline-none focus:border-[#d1a058]"
                  />
                  <button
                    onClick={handleBulkAdd}
                    className="w-full min-h-[40px] bg-[#d1a058] hover:bg-[#c09048] text-black font-bold py-2 rounded-lg text-xs uppercase tracking-wider"
                  >
                    Import Warriors
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAddPlayer} className="space-y-2 mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      id="custom-player-name"
                      type="text"
                      value={playerName}
                      onChange={e => setPlayerName(e.target.value)}
                      placeholder="Warrior Name"
                      className="bg-black/60 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#d1a058]"
                      required
                    />
                    <input
                      id="custom-player-mobile"
                      type="tel"
                      value={playerMobile}
                      onChange={e => setPlayerMobile(e.target.value)}
                      placeholder="Phone Number"
                      className="bg-black/60 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#d1a058]"
                      required
                    />
                  </div>
                  <button
                    id="custom-player-add"
                    type="submit"
                    className="w-full min-h-[40px] bg-[#d1a058] hover:bg-[#c09048] text-black font-black rounded-lg text-xs uppercase tracking-wider"
                  >
                    + Add to Tournament Roster
                  </button>
                </form>
              )}

              {/* Roster Search & Tribe Filter */}
              <div className="space-y-2 mb-3">
                <input
                  type="text"
                  value={rosterSearch}
                  onChange={e => setRosterSearch(e.target.value)}
                  placeholder="Search roster by name or phone…"
                  className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#d1a058]"
                />
                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
                  {(['all', 'unrevealed', 'lava', 'rain', 'wind', 'mountain'] as const).map(flt => (
                    <button
                      key={flt}
                      onClick={() => setRosterTribeFilter(flt)}
                      className={`px-2 py-1 rounded capitalize whitespace-nowrap ${
                        rosterTribeFilter === flt
                          ? 'bg-[#d1a058] text-black font-bold'
                          : 'bg-white/5 text-white/50 hover:text-white'
                      }`}
                    >
                      {flt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Roster List */}
              <div className="space-y-1.5 overflow-y-auto max-h-[520px] pr-1">
                {rosterFiltered.length === 0 ? (
                  <p className="text-white/30 text-xs italic text-center py-8">No matching warriors found.</p>
                ) : (
                  rosterFiltered.map((p, i) => {
                    const tb = tableOf(p.id)
                    return (
                      <div
                        key={p.id}
                        className="group flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-lg px-3 py-2 transition-all"
                      >
                        <span className="text-[10px] text-white/30 font-mono w-5">{i + 1}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold truncate text-white">{p.name}</div>
                          <div className="text-[10px] text-white/40 font-mono">
                            {p.mobile}
                            {tb ? <span className="text-[#d1a058] ml-1.5">[{tb.name}]</span> : ''}
                          </div>
                        </div>

                        <TribeBadge tribe={p.tribe} size="xs" />

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={() => openEditPlayer(p)}
                            className="p-1 text-xs text-white/40 hover:text-[#d1a058]"
                            title="Edit warrior"
                          >
                            ✎
                          </button>
                          {p.tribe && (
                            <button
                              onClick={() => handleResetTribe(p)}
                              className="p-1 text-xs text-amber-400/80 hover:text-amber-300"
                              title="Reset tribe (allow re-reveal)"
                            >
                              ↺
                            </button>
                          )}
                          <button
                            onClick={() => handleDeletePlayer(p)}
                            className="p-1 text-xs text-red-500/80 hover:text-red-400"
                            title="Remove warrior"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Rounds & Live Tables Column */}
            <div className={`${mobileTab === 'tables' ? 'block' : 'hidden lg:block'} lg:col-span-2 bg-black/40 border border-[#d1a058]/30 rounded-xl p-5 shadow-md`}>
              {/* Round Selector Tabs */}
              <div className="flex flex-wrap items-center gap-2 mb-4 border-b border-white/10 pb-3">
                {rounds.map((r, i) => (
                  <button
                    key={r.id}
                    onClick={() => setRoundIdx(i)}
                    className={`min-h-[38px] px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                      i === roundIdx
                        ? 'bg-[#d1a058] text-black shadow-md'
                        : 'text-white/60 hover:text-white hover:bg-white/5 border border-white/10'
                    }`}
                  >
                    {r.name}
                  </button>
                ))}

                {!championId && (
                  <button
                    id="custom-next-round"
                    onClick={openNextRound}
                    className="min-h-[38px] px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border border-dashed border-[#d1a058]/60 text-[#d1a058] hover:bg-[#d1a058]/10"
                  >
                    + Next Round
                  </button>
                )}
              </div>

              {round && (
                <>
                  {/* Round Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="text-xs text-white/50">
                      {round.tables.length} table{round.tables.length !== 1 ? 's' : ''} · {seatedInRound.size} seated
                      {roundIdx === 0 && ` · ${players.length - seatedInRound.size} unseated`}
                      {' · '}
                      <span className="text-[#d1a058] font-bold">
                        {round.tables.filter(t => t.winnerId).length}/{round.tables.length} winners picked
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center border border-white/15 rounded-lg overflow-hidden bg-black/40">
                        <input
                          type="number"
                          min={1}
                          value={addTablesCount}
                          onChange={e => setAddTablesCount(Number(e.target.value))}
                          className="w-12 bg-transparent px-2 py-1.5 text-xs text-white text-center focus:outline-none"
                        />
                        <button
                          onClick={addTables}
                          className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/80 hover:bg-white/10 border-l border-white/15"
                        >
                          + Tables
                        </button>
                      </div>

                      <button
                        onClick={autoFill}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30"
                      >
                        ⚡ Auto-seat
                      </button>

                      {roundIdx > 0 && roundIdx === rounds.length - 1 && (
                        <button
                          onClick={deleteRound}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
                        >
                          Delete Round
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Crowned Zampion Spotlight Banner */}
                  {champion && roundIdx === rounds.length - 1 && (
                    <div className="mb-5 rounded-2xl border border-amber-400/60 bg-gradient-to-r from-amber-950/40 via-black/50 to-amber-950/40 p-5 flex items-center justify-between shadow-[0_0_25px_rgba(245,158,11,0.25)]">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.3em] text-amber-400 font-black">
                          👑 ULTIMATE TOURNAMENT ZAMPION
                        </div>
                        <div className="text-2xl font-black text-white mt-0.5" style={walkyr}>
                          {champion.name}
                        </div>
                      </div>
                      <TribeBadge tribe={champion.tribe} />
                    </div>
                  )}

                  {/* Tables Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {round.tables.map(tb => (
                      <div
                        key={tb.id}
                        className={`rounded-xl border bg-black/50 flex flex-col transition-all ${
                          tb.winnerId
                            ? 'border-yellow-400/60 shadow-[0_0_12px_rgba(234,179,8,0.15)]'
                            : 'border-white/10'
                        }`}
                      >
                        {/* Table Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                          <button
                            onClick={() => openRenameTable(tb)}
                            className="text-sm font-black uppercase tracking-wider text-[#d1a058] hover:text-white flex items-center gap-1.5"
                            title="Click to rename table"
                            style={walkyr}
                          >
                            <span>{tb.name}</span>
                            <span className="text-[10px] text-white/30">✎</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-white/40 font-mono">{tb.playerIds.length} seated</span>
                            <button
                              onClick={() => removeTable(tb.id)}
                              className="text-white/30 hover:text-red-400 text-xs p-1"
                              title="Delete table"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Players at this table */}
                        <div className="p-3 space-y-1.5 flex-1">
                          {tb.playerIds.length === 0 ? (
                            <p className="text-white/25 text-[11px] italic text-center py-4">No warriors at this table.</p>
                          ) : (
                            tb.playerIds.map(pid => {
                              const p = playerMap.get(pid)
                              const isWinner = tb.winnerId === pid
                              return (
                                <div
                                  key={pid}
                                  className={`group flex items-center gap-2 rounded-lg px-3 py-2 border transition-all ${
                                    isWinner
                                      ? 'bg-yellow-500/10 border-yellow-400/50'
                                      : 'bg-white/[0.03] border-white/5'
                                  }`}
                                >
                                  <span
                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                    style={{
                                      background: p?.tribe ? TRIBE_META[p.tribe].color : 'rgba(255,255,255,0.2)',
                                      boxShadow: p?.tribe ? `0 0 6px ${TRIBE_META[p.tribe].color}` : 'none'
                                    }}
                                  />

                                  <div className="min-w-0 flex-1">
                                    <div className={`text-xs font-bold truncate ${isWinner ? 'text-yellow-300' : 'text-white'}`}>
                                      {p?.name || 'Removed warrior'}
                                    </div>
                                    <div className="text-[9px] text-white/35 font-mono">
                                      {p?.tribe ? TRIBE_META[p.tribe].label : 'Unrevealed'}
                                    </div>
                                  </div>

                                  {/* Table Winner button */}
                                  <button
                                    onClick={() => toggleWinner(tb.id, pid)}
                                    className={`min-h-[28px] text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded border transition-all ${
                                      isWinner
                                        ? 'bg-yellow-400 text-black border-yellow-400'
                                        : 'text-yellow-400/70 border-yellow-400/30 hover:bg-yellow-400/10'
                                    }`}
                                    title={isWinner ? 'Clear table winner' : 'Declare as table winner'}
                                  >
                                    {isWinner ? '★ Winner' : '★ Pick Winner'}
                                  </button>

                                  {/* Move to another table */}
                                  {round.tables.length > 1 && (
                                    <select
                                      value=""
                                      onChange={e => e.target.value && movePlayer(tb.id, e.target.value, pid)}
                                      className="min-h-[28px] w-7 bg-black text-white/60 text-[10px] rounded border border-white/10 cursor-pointer"
                                      title="Move warrior to another table"
                                    >
                                      <option value="">⇄</option>
                                      {round.tables
                                        .filter(t => t.id !== tb.id)
                                        .map(t => (
                                          <option key={t.id} value={t.id}>
                                            {t.name}
                                          </option>
                                        ))}
                                    </select>
                                  )}

                                  {/* Unseat */}
                                  <button
                                    onClick={() => unseatPlayer(tb.id, pid)}
                                    className="p-1 text-white/40 hover:text-red-400 text-xs"
                                    title="Unseat from table"
                                  >
                                    ✕
                                  </button>
                                </div>
                              )
                            })
                          )}
                        </div>

                        {/* Seat Player Button */}
                        <button
                          onClick={() => {
                            setSeatModal({ tableId: tb.id })
                            setSeatSearch('')
                          }}
                          className="m-3 mt-0 py-2.5 rounded-lg border border-dashed border-white/20 text-white/40 hover:text-[#d1a058] hover:border-[#d1a058]/50 hover:bg-[#d1a058]/5 text-[11px] font-bold uppercase tracking-wider transition-all"
                        >
                          + Seat Warrior
                        </button>
                      </div>
                    ))}
                  </div>

                  {round.tables.length === 0 && (
                    <p className="text-white/40 text-center py-12 text-sm">
                      No tables in this round yet. Use “+ Tables” to add your first table.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* MODAL 1: Edit Tournament */}
      {editTourneyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f0f0f] border border-[#d1a058]/40 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-[#d1a058] mb-4 uppercase" style={walkyr}>
              Edit Tournament
            </h3>
            <form onSubmit={handleSaveTournament} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-white/70 mb-1">Tournament Name</label>
                <input
                  type="text"
                  value={editTourneyName}
                  onChange={e => setEditTourneyName(e.target.value)}
                  className="w-full bg-black/70 border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d1a058]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-white/70 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={editTourneyDateTime}
                  onChange={e => setEditTourneyDateTime(e.target.value)}
                  className="w-full bg-black/70 border border-white/20 rounded-lg px-3 py-3 text-xs text-white focus:outline-none focus:border-[#d1a058] [color-scheme:dark]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditTourneyOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTourney}
                  className="bg-[#d1a058] hover:bg-[#c09048] text-black font-black px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {savingTourney ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Warrior */}
      {editPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f0f0f] border border-[#d1a058]/40 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-[#d1a058] mb-4 uppercase" style={walkyr}>
              Edit Warrior Profile
            </h3>
            <form onSubmit={handleSavePlayer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-white/70 mb-1">Name</label>
                <input
                  type="text"
                  value={editPlayerName}
                  onChange={e => setEditPlayerName(e.target.value)}
                  className="w-full bg-black/70 border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d1a058]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-white/70 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editPlayerMobile}
                  onChange={e => setEditPlayerMobile(e.target.value)}
                  className="w-full bg-black/70 border border-white/20 rounded-lg px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-[#d1a058]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-white/70 mb-1">Tribe Assignment</label>
                <select
                  value={editPlayerTribe}
                  onChange={e => setEditPlayerTribe(e.target.value as any)}
                  className="w-full bg-black/70 border border-white/20 rounded-lg px-4 py-3 text-sm text-[#d1a058] font-bold focus:outline-none focus:border-[#d1a058]"
                >
                  <option value="unrevealed">Unrevealed (Must scan on kiosk)</option>
                  <option value="lava">Lava Tribe</option>
                  <option value="rain">Rain Tribe</option>
                  <option value="wind">Wind Tribe</option>
                  <option value="mountain">Mountain Tribe</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditPlayer(null)}
                  className="px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPlayer}
                  className="bg-[#d1a058] hover:bg-[#c09048] text-black font-black px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {savingPlayer ? 'Saving…' : 'Save Warrior'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Rename Table */}
      {renameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f0f0f] border border-[#d1a058]/40 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-[#d1a058] mb-3 uppercase" style={walkyr}>
              Rename Table
            </h3>
            <form onSubmit={handleSaveRenameTable} className="space-y-4">
              <input
                autoFocus
                type="text"
                value={renameInput}
                onChange={e => setRenameInput(e.target.value)}
                placeholder="e.g. Table 1 or Final Arena"
                className="w-full bg-black/70 border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d1a058]"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenameModal(null)}
                  className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#d1a058] hover:bg-[#c09048] text-black font-black px-5 py-2 rounded-lg text-xs uppercase tracking-wider"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Seat Warrior */}
      {seatModal && round && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSeatModal(null)}
        >
          <div
            className="bg-[#0f0f0f] border border-[#d1a058]/40 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#d1a058] mb-1 uppercase" style={walkyr}>
              Seat at {round.tables.find(t => t.id === seatModal.tableId)?.name}
            </h3>
            <p className="text-[11px] text-white/40 mb-4">
              Any combination of tribes can sit together. Tap any player to seat them.
            </p>

            <input
              autoFocus
              value={seatSearch}
              onChange={e => setSeatSearch(e.target.value)}
              placeholder="Search by name or number…"
              className="w-full bg-black/70 border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d1a058] mb-3"
            />

            <div className="max-h-72 overflow-y-auto space-y-1.5 mb-4 pr-1">
              {seatPool.length === 0 ? (
                <p className="text-white/30 text-xs italic text-center py-6">No unseated warriors for this round.</p>
              ) : (
                seatPool.map(p => (
                  <button
                    key={p.id}
                    onClick={() => seatPlayer(seatModal.tableId, p.id)}
                    className="w-full text-left px-3 py-2.5 rounded-lg bg-white/5 hover:bg-[#d1a058]/10 border border-white/5 hover:border-[#d1a058]/40 transition-all flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-bold truncate text-white">{p.name}</div>
                      <div className="text-[10px] text-white/40 font-mono">{p.mobile}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {prevWinners.has(p.id) && (
                        <span className="text-[8px] font-black uppercase bg-yellow-400 text-black px-1.5 py-0.5 rounded">
                          Qualified
                        </span>
                      )}
                      <TribeBadge tribe={p.tribe} size="xs" />
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSeatModal(null)}
                className="px-5 py-2.5 text-xs bg-white/10 hover:bg-white/20 rounded-lg uppercase font-bold tracking-wider"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Next Round Generator */}
      {nextRoundOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setNextRoundOpen(false)}
        >
          <div
            className="bg-[#0f0f0f] border border-[#d1a058]/40 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#d1a058] mb-1 uppercase" style={walkyr}>
              {Number(nextRoundTables) === 1 ? 'Create Final Round' : `Create Round ${rounds.length + 1}`}
            </h3>
            <p className="text-[11px] text-white/40 mb-4">
              Round winners are automatically selected below. Check extra warriors for wildcards.
            </p>

            <div className="flex items-center gap-3 mb-4 p-3 bg-white/5 rounded-xl border border-white/10">
              <label className="text-xs uppercase font-bold text-white/70">Tables in next round:</label>
              <input
                type="number"
                min={1}
                value={nextRoundTables}
                onChange={e => setNextRoundTables(Number(e.target.value))}
                className="w-16 bg-black/70 border border-white/20 rounded-lg px-2.5 py-1.5 text-sm text-center text-white focus:outline-none focus:border-[#d1a058]"
              />
              <span className="text-[11px] text-[#d1a058] font-bold">
                {Number(nextRoundTables) === 1 ? '★ Final Round (Winner = Zampion)' : ''}
              </span>
            </div>

            <input
              value={nextRoundSearch}
              onChange={e => setNextRoundSearch(e.target.value)}
              placeholder="Search players to advance…"
              className="w-full bg-black/70 border border-white/20 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d1a058] mb-3"
            />

            <div className="max-h-72 overflow-y-auto space-y-1.5 mb-4 pr-1">
              {nextRoundPool.map(p => {
                const checked = nextRoundSelected.has(p.id)
                const winTable = rounds[rounds.length - 1]?.tables.find(t => t.winnerId === p.id)
                return (
                  <label
                    key={p.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                      checked
                        ? 'bg-[#d1a058]/10 border-[#d1a058]/50'
                        : 'bg-white/[0.03] border-white/5 hover:border-white/15'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const s = new Set(nextRoundSelected)
                        if (s.has(p.id)) s.delete(p.id)
                        else s.add(p.id)
                        setNextRoundSelected(s)
                      }}
                      className="accent-[#d1a058] w-4 h-4"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold truncate text-white">{p.name}</div>
                      <div className="text-[10px] text-white/40">
                        {winTable ? `★ Table Winner (${winTable.name})` : 'Wildcard Candidate'}
                      </div>
                    </div>
                    <TribeBadge tribe={p.tribe} size="xs" />
                  </label>
                )
              })}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">{nextRoundSelected.size} warriors selected</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setNextRoundOpen(false)}
                  className="px-4 py-2 text-xs hover:bg-white/5 rounded-lg uppercase font-semibold text-white/60"
                >
                  Cancel
                </button>
                <button
                  onClick={createNextRound}
                  className="bg-[#d1a058] hover:bg-[#c09048] text-black font-black px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider shadow-md"
                >
                  Create Round →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
