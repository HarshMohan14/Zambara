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
  where,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore'
import { toast } from 'sonner'
import Link from 'next/link'

interface QueueUser {
  id: string
  name: string
  number: string
  status: 'waiting' | 'playing' | 'done'
  createdAt: any
}

interface BthPlayer {
  id: string
  name: string
  number: string
}

interface BthGame {
  id: string
  players: BthPlayer[]
  startTime: any
  endTime?: any
  status: 'active' | 'ended'
  winnerId?: string
  winnerName?: string
  duration?: number // in seconds
}

// Live timer component for active games
function ActiveTimer({ startTime }: { startTime: any }) {
  const [elapsed, setElapsed] = useState('00:00')

  useEffect(() => {
    if (!startTime) return

    const startMs = startTime instanceof Timestamp 
      ? startTime.toMillis() 
      : (startTime?.seconds ? startTime.seconds * 1000 : Date.now())

    const updateTimer = () => {
      const diffSecs = Math.floor((Date.now() - startMs) / 1000)
      if (diffSecs < 0) {
        setElapsed('00:00')
        return
      }
      const mins = Math.floor(diffSecs / 60)
      const secs = diffSecs % 60
      setElapsed(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  return <span className="font-mono text-[#d1a058] font-bold">{elapsed}</span>
}

export default function AdminBeatTheHost() {
  const [queue, setQueue] = useState<QueueUser[]>([])
  const [activeGames, setActiveGames] = useState<BthGame[]>([])
  const [leaderboard, setLeaderboard] = useState<BthGame[]>([])
  const [history, setHistory] = useState<BthGame[]>([])
  
  const [playerName, setPlayerName] = useState('')
  const [playerNumber, setPlayerNumber] = useState('')
  const [submittingPlayer, setSubmittingPlayer] = useState(false)
  
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([])
  const [startingGame, setStartingGame] = useState(false)
  
  const [endGameModalOpen, setEndGameModalOpen] = useState(false)
  const [selectedGame, setSelectedGame] = useState<BthGame | null>(null)
  const [selectedWinnerId, setSelectedWinnerId] = useState('')
  const [endingGame, setEndingGame] = useState(false)

  // CRUD Edit/Delete States
  const [editingQueueUser, setEditingQueueUser] = useState<QueueUser | null>(null)
  const [editingQueueName, setEditingQueueName] = useState('')
  const [editingQueueNumber, setEditingQueueNumber] = useState('')
  const [editingQueueStatus, setEditingQueueStatus] = useState<'waiting' | 'playing' | 'done'>('waiting')
  const [updatingQueueUser, setUpdatingQueueUser] = useState(false)

  const [editingGame, setEditingGame] = useState<BthGame | null>(null)
  const [editingGameWinnerId, setEditingGameWinnerId] = useState('')
  const [editingGameDurationMins, setEditingGameDurationMins] = useState(0)
  const [editingGameDurationSecs, setEditingGameDurationSecs] = useState(0)
  const [editingGamePlayers, setEditingGamePlayers] = useState<BthPlayer[]>([])
  const [updatingGame, setUpdatingGame] = useState(false)

  // Listeners for Real-time Firestore Updates
  useEffect(() => {
    // 1. Listen BTH queue
    const qQueue = query(collection(db, 'bth_queue'), orderBy('createdAt', 'desc'))
    const unsubscribeQueue = onSnapshot(qQueue, (snapshot) => {
      const data: QueueUser[] = []
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as QueueUser)
      })
      setQueue(data)
    }, (err) => {
      console.error('BTH Queue listener error:', err)
      toast.error('Failed to load player queue')
    })

    // 2. Listen Active BTH Games
    const qActive = query(collection(db, 'bth_games'), where('status', '==', 'active'))
    const unsubscribeActive = onSnapshot(qActive, (snapshot) => {
      const data: BthGame[] = []
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as BthGame)
      })
      // Sort client-side by start time desc
      data.sort((a, b) => {
        const tA = a.startTime?.seconds || 0
        const tB = b.startTime?.seconds || 0
        return tB - tA
      })
      setActiveGames(data)
    }, (err) => {
      console.error('Active games listener error:', err)
      toast.error('Failed to load active games')
    })

    // 3. Listen Ended Games (for leaderboard and history)
    const qEnded = query(collection(db, 'bth_games'), where('status', '==', 'ended'))
    const unsubscribeEnded = onSnapshot(qEnded, (snapshot) => {
      const endedData: BthGame[] = []
      snapshot.forEach((doc) => {
        endedData.push({ id: doc.id, ...doc.data() } as BthGame)
      })

      // Sort client-side by duration asc for leaderboard (only players who beat host)
      const winners = endedData.filter(g => g.winnerName && g.winnerName !== 'Host')
      winners.sort((a, b) => (a.duration || 0) - (b.duration || 0))
      setLeaderboard(winners)

      // Sort client-side by end time desc for match history
      endedData.sort((a, b) => {
        const tA = a.endTime?.seconds || 0
        const tB = b.endTime?.seconds || 0
        return tB - tA
      })
      setHistory(endedData)
    }, (err) => {
      console.error('Ended games listener error:', err)
      toast.error('Failed to load game history')
    })

    return () => {
      unsubscribeQueue()
      unsubscribeActive()
      unsubscribeEnded()
    }
  }, [])

  // Add player to BTH Queue
  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!playerName.trim() || !playerNumber.trim()) return

    try {
      setSubmittingPlayer(true)
      await addDoc(collection(db, 'bth_queue'), {
        name: playerName.trim(),
        number: playerNumber.trim(),
        status: 'waiting',
        createdAt: serverTimestamp(),
      })
      toast.success(`${playerName} added to Beat the Host queue!`)
      setPlayerName('')
      setPlayerNumber('')
    } catch (err) {
      console.error(err)
      toast.error('Failed to add player to queue')
    } finally {
      setSubmittingPlayer(false)
    }
  }

  // Delete player from BTH Queue
  const handleDeleteQueue = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from the queue?`)) return
    try {
      await deleteDoc(doc(db, 'bth_queue', id))
      toast.success(`Removed ${name} from queue`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to remove player')
    }
  }

  // Toggle player selection for starting a game
  const handleTogglePlayerSelection = (id: string) => {
    if (selectedPlayerIds.includes(id)) {
      setSelectedPlayerIds(prev => prev.filter(pId => pId !== id))
    } else {
      setSelectedPlayerIds(prev => [...prev, id])
    }
  }

  // Start BTH Game
  const handleStartGame = async () => {
    if (selectedPlayerIds.length === 0) {
      toast.error('Please select at least 1 player to start the battle')
      return
    }

    try {
      setStartingGame(true)
      const selectedPlayersData: BthPlayer[] = queue
        .filter(user => selectedPlayerIds.includes(user.id))
        .map(user => ({
          id: user.id,
          name: user.name,
          number: user.number
        }))

      // Create new BTH Game
      await addDoc(collection(db, 'bth_games'), {
        players: selectedPlayersData,
        startTime: serverTimestamp(),
        status: 'active',
        winnerId: '',
        winnerName: '',
        duration: 0
      })

      // Update statuses of players in the queue to 'playing'
      for (const id of selectedPlayerIds) {
        await updateDoc(doc(db, 'bth_queue', id), {
          status: 'playing'
        })
      }

      toast.success('Beat the Host battle initiated successfully!')
      setSelectedPlayerIds([])
    } catch (err) {
      console.error(err)
      toast.error('Failed to start the game')
    } finally {
      setStartingGame(false)
    }
  }

  // Prepare ending of BTH Game
  const handleOpenEndGameModal = (game: BthGame) => {
    setSelectedGame(game)
    setSelectedWinnerId(game.players[0]?.id || '') // Default to first player
    setEndGameModalOpen(true)
  }

  // End BTH Game
  const handleEndGame = async () => {
    if (!selectedGame) return

    try {
      setEndingGame(true)
      const endTimeVal = Date.now()
      
      const startMs = selectedGame.startTime instanceof Timestamp
        ? selectedGame.startTime.toMillis()
        : (selectedGame.startTime?.seconds ? selectedGame.startTime.seconds * 1000 : Date.now())
        
      const durationSecs = Math.max(0, Math.floor((endTimeVal - startMs) / 1000))

      let winnerNameStr = 'Host'
      if (selectedWinnerId !== 'host') {
        const foundPlayer = selectedGame.players.find(p => p.id === selectedWinnerId)
        winnerNameStr = foundPlayer ? foundPlayer.name : 'Unknown'
      }

      // Update BTH Game Record
      await updateDoc(doc(db, 'bth_games', selectedGame.id), {
        status: 'ended',
        endTime: serverTimestamp(),
        winnerId: selectedWinnerId,
        winnerName: winnerNameStr,
        duration: durationSecs
      })

      // Set players status to 'done' (or delete them to keep queue small)
      for (const player of selectedGame.players) {
        await updateDoc(doc(db, 'bth_queue', player.id), {
          status: 'done'
        })
      }

      toast.success(selectedWinnerId === 'host' ? 'Host won the battle!' : `🏆 ${winnerNameStr} beat the host in ${formatDuration(durationSecs)}!`)
      setEndGameModalOpen(false)
      setSelectedGame(null)
    } catch (err) {
      console.error(err)
      toast.error('Failed to end game')
    } finally {
      setEndingGame(false)
    }
  }

  // Start editing queue user
  const handleStartEditingQueue = (user: QueueUser) => {
    setEditingQueueUser(user)
    setEditingQueueName(user.name)
    setEditingQueueNumber(user.number)
    setEditingQueueStatus(user.status)
  }

  // Update queue user
  const handleUpdateQueueUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingQueueUser) return

    try {
      setUpdatingQueueUser(true)
      await updateDoc(doc(db, 'bth_queue', editingQueueUser.id), {
        name: editingQueueName.trim(),
        number: editingQueueNumber.trim(),
        status: editingQueueStatus
      })
      toast.success('Queue participant updated successfully')
      setEditingQueueUser(null)
    } catch (err) {
      console.error(err)
      toast.error('Failed to update participant')
    } finally {
      setUpdatingQueueUser(false)
    }
  }

  // Start editing ended game
  const handleStartEditingGame = (game: BthGame) => {
    setEditingGame(game)
    setEditingGameWinnerId(game.winnerId || '')
    const totalSecs = game.duration || 0
    setEditingGameDurationMins(Math.floor(totalSecs / 60))
    setEditingGameDurationSecs(totalSecs % 60)
    setEditingGamePlayers(game.players || [])
  }

  // Update game record
  const handleUpdateGame = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingGame) return

    try {
      setUpdatingGame(true)
      const totalSecs = (editingGameDurationMins * 60) + editingGameDurationSecs

      let winnerNameStr = 'Host'
      if (editingGameWinnerId !== 'host' && editingGameWinnerId !== '') {
        const foundPlayer = editingGamePlayers.find(p => p.id === editingGameWinnerId)
        winnerNameStr = foundPlayer ? foundPlayer.name : 'Unknown'
      }

      await updateDoc(doc(db, 'bth_games', editingGame.id), {
        players: editingGamePlayers,
        winnerId: editingGameWinnerId,
        winnerName: winnerNameStr,
        duration: totalSecs
      })
      toast.success('Game record updated successfully')
      setEditingGame(null)
    } catch (err) {
      console.error(err)
      toast.error('Failed to update game record')
    } finally {
      setUpdatingGame(false)
    }
  }

  // Delete game record (handles active and ended games)
  const handleDeleteGame = async (game: BthGame) => {
    if (!confirm('Are you sure you want to delete this battle record? This will permanently delete it.')) return
    try {
      if (game.status === 'active') {
        for (const p of game.players) {
          await updateDoc(doc(db, 'bth_queue', p.id), {
            status: 'waiting'
          })
        }
      }
      await deleteDoc(doc(db, 'bth_games', game.id))
      toast.success('Battle record deleted successfully')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete battle record')
    }
  }

  // Helper formatting for durations
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const waitingPlayers = queue.filter(user => user.status === 'waiting')

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase text-[#d1a058]" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>
            ⚔️ Beat the Host Manager
          </h1>
          <p className="text-white/60 font-sans text-sm mt-1">
            Register event participants, launch live battles, and manage active stopwatches and rankings.
          </p>
        </div>
        <Link 
          href="/beat-the-host" 
          target="_blank" 
          className="bg-black border border-[#d1a058]/50 text-[#d1a058] hover:bg-[#d1a058]/10 font-bold px-6 py-2.5 rounded uppercase tracking-wider transition-all text-center text-sm"
          style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
        >
          View Live Arena Portal ↗
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Register Player & Queue Selector */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Form: Add Player */}
          <div className="bg-black/40 border border-[#d1a058]/30 rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-bold uppercase text-[#d1a058] mb-4" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>
              Add Participant
            </h2>
            <form onSubmit={handleAddPlayer} className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>Name *</label>
                <input
                  type="text"
                  required
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Player's full name"
                  className="w-full bg-black/60 border border-[#d1a058]/40 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d1a058]"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={playerNumber}
                  onChange={(e) => setPlayerNumber(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-black/60 border border-[#d1a058]/40 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d1a058]"
                />
              </div>
              <button
                type="submit"
                disabled={submittingPlayer}
                className="w-full bg-[#d1a058] hover:bg-[#c09048] text-black font-bold py-3 rounded text-sm uppercase tracking-wider transition-colors disabled:opacity-50"
                style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
              >
                {submittingPlayer ? 'Adding...' : 'Add to Queue'}
              </button>
            </form>
          </div>

          {/* Quick Launch Panel */}
          <div className="bg-black/40 border border-[#d1a058]/30 rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-bold uppercase text-[#d1a058] mb-4" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>
              Battle Starter
            </h2>
            <p className="text-white/60 text-xs mb-4">
              Select one or more players from the waiting list checkboxes on the right and click below to launch their battle.
            </p>
            <div className="bg-black/30 border border-white/5 rounded-lg p-4 mb-4 text-center">
              <div className="text-3xl font-black text-[#d1a058]">{selectedPlayerIds.length}</div>
              <div className="text-xs uppercase tracking-widest text-white/50 mt-1">Players Staged</div>
            </div>
            <button
              onClick={handleStartGame}
              disabled={selectedPlayerIds.length === 0 || startingGame}
              className="w-full bg-red-950/40 border border-red-500/50 hover:bg-red-900/50 text-red-400 font-bold py-3 rounded text-sm uppercase tracking-wider transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
            >
              {startingGame ? 'Staging Battle...' : '⚔️ Launch BTH Battle'}
            </button>
          </div>

        </div>

        {/* Right Column: Queue Roster & Active Matches */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Battles Panel */}
          <div className="bg-black/40 border border-[#d1a058]/30 rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-bold uppercase text-[#d1a058] mb-4" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>
              Active Battles ({activeGames.length})
            </h2>
            {activeGames.length === 0 ? (
              <div className="bg-black/20 border border-white/5 rounded-lg p-6 text-center text-white/40 text-sm">
                No active games currently. Start a battle by selecting players in the queue below.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeGames.map((game) => (
                  <div key={game.id} className="bg-black/80 border border-red-500/20 rounded-lg p-4 flex flex-col justify-between space-y-4 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-2xl rounded-full" />
                    <button
                      onClick={() => handleDeleteGame(game)}
                      className="absolute top-2.5 right-2.5 text-white/40 hover:text-red-500 transition-colors text-xs p-1 z-20"
                      title="Abort & Delete Battle"
                    >
                      🗑️
                    </button>
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] uppercase tracking-wider font-mono bg-red-950/40 border border-red-500/30 text-red-400 px-2 py-0.5 rounded">
                          ACTIVE MATCH
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-white/60">
                          ⏱️ <ActiveTimer startTime={game.startTime} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className="text-xs text-white/40 block">WARRIORS:</span>
                        <div className="font-bold text-white text-base truncate">
                          {game.players.map(p => p.name).join(', ')}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenEndGameModal(game)}
                      className="w-full bg-[#d1a058] hover:bg-[#c09048] text-black font-bold py-2 rounded text-xs uppercase tracking-wider transition-colors"
                      style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
                    >
                      🏆 End Battle & Decide
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Queue Table */}
          <div className="bg-black/40 border border-[#d1a058]/30 rounded-xl overflow-hidden shadow-md">
            <div className="p-6 border-b border-[#d1a058]/20 flex justify-between items-center">
              <h2 className="text-xl font-bold uppercase text-[#d1a058]" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>
                Queue Roster ({waitingPlayers.length} Waiting)
              </h2>
            </div>
            
            <div className="overflow-x-auto max-h-[350px]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-black/90 sticky top-0 border-b border-[#d1a058]/25 z-10">
                  <tr>
                    <th className="p-4 w-12 text-center">Select</th>
                    <th className="p-4 font-semibold text-white/80 uppercase text-xs tracking-wider">Player Name</th>
                    <th className="p-4 font-semibold text-white/80 uppercase text-xs tracking-wider">Mobile</th>
                    <th className="p-4 font-semibold text-white/80 uppercase text-xs tracking-wider">Status</th>
                    <th className="p-4 font-semibold text-white/80 uppercase text-xs tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-white/40 text-sm">
                        No players currently in queue. Add a participant to get started.
                      </td>
                    </tr>
                  ) : (
                    queue.map((user) => (
                      <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 text-center">
                          {user.status === 'waiting' && (
                            <input
                              type="checkbox"
                              checked={selectedPlayerIds.includes(user.id)}
                              onChange={() => handleTogglePlayerSelection(user.id)}
                              className="w-4 h-4 rounded border-[#d1a058]/40 bg-black text-[#d1a058] focus:ring-[#d1a058] focus:ring-opacity-20 cursor-pointer"
                            />
                          )}
                        </td>
                        <td className="p-4 font-semibold text-white">{user.name}</td>
                        <td className="p-4 font-mono text-white/50">{user.number}</td>
                        <td className="p-4 text-xs font-mono">
                          {user.status === 'waiting' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">Waiting</span>
                          )}
                          {user.status === 'playing' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20">Playing</span>
                          )}
                          {user.status === 'done' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-green-500/10 text-green-500 border border-green-500/20">Completed</span>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => handleStartEditingQueue(user)}
                            className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 p-2 rounded transition-colors"
                            title="Edit participant"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteQueue(user.id, user.name)}
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded transition-colors"
                            title="Remove player"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

      {/* Row 2: Leaderboard & Match History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Leaderboard Table */}
        <div className="bg-black/40 border border-[#d1a058]/30 rounded-xl overflow-hidden shadow-md">
          <div className="p-6 border-b border-[#d1a058]/20">
            <h2 className="text-xl font-bold uppercase text-[#d1a058]" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>
              🏆 Leaderboard (Fastest Winners)
            </h2>
          </div>
          <div className="overflow-x-auto max-h-[350px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-black/90 sticky top-0 border-b border-[#d1a058]/25 z-10">
                <tr>
                  <th className="p-4 font-semibold text-white/80 uppercase text-xs tracking-wider">Rank</th>
                  <th className="p-4 font-semibold text-white/80 uppercase text-xs tracking-wider">Winner</th>
                  <th className="p-4 font-semibold text-white/80 uppercase text-xs tracking-wider">Time (MM:SS)</th>
                  <th className="p-4 font-semibold text-white/80 uppercase text-xs tracking-wider text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-white/40 text-sm">
                      No records set yet. Players who successfully beat the host will appear here.
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((game, index) => (
                    <tr key={game.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono font-bold text-white/85">
                        {index === 0 && '👑 1'}
                        {index === 1 && '🥈 2'}
                        {index === 2 && '🥉 3'}
                        {index > 2 && `${index + 1}`}
                      </td>
                      <td className="p-4 font-semibold text-white">{game.winnerName}</td>
                      <td className="p-4 font-mono text-[#d1a058] font-bold">
                        {game.duration ? formatDuration(game.duration) : '00:00'}
                      </td>
                      <td className="p-4 font-mono text-white/50 text-right text-xs">
                        {game.endTime instanceof Timestamp
                          ? game.endTime.toDate().toLocaleDateString()
                          : (game.endTime?.seconds ? new Date(game.endTime.seconds * 1000).toLocaleDateString() : 'N/A')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-black/40 border border-[#d1a058]/30 rounded-xl overflow-hidden shadow-md">
          <div className="p-6 border-b border-[#d1a058]/20">
            <h2 className="text-xl font-bold uppercase text-[#d1a058]" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>
              📜 Match History
            </h2>
          </div>
          <div className="overflow-x-auto max-h-[350px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-black/90 sticky top-0 border-b border-[#d1a058]/25 z-10">
                <tr>
                  <th className="p-4 font-semibold text-white/80 uppercase text-xs tracking-wider">Warriors</th>
                  <th className="p-4 font-semibold text-white/80 uppercase text-xs tracking-wider">Winner</th>
                  <th className="p-4 font-semibold text-white/80 uppercase text-xs tracking-wider">Duration</th>
                  <th className="p-4 font-semibold text-white/80 uppercase text-xs tracking-wider">Date</th>
                  <th className="p-4 font-semibold text-white/80 uppercase text-xs tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-white/40 text-sm">
                      No matches played yet.
                    </td>
                  </tr>
                ) : (
                  history.map((game) => (
                    <tr key={game.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-white text-sm truncate max-w-[150px]" title={game.players.map(p => p.name).join(', ')}>
                        {game.players.map(p => p.name).join(', ')}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-xs border font-mono ${
                          game.winnerName === 'Host' 
                            ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                            : 'bg-green-500/10 border-green-500/20 text-green-400'
                        }`}>
                          {game.winnerName}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-white/60 text-sm">
                        {game.duration ? formatDuration(game.duration) : '00:00'}
                      </td>
                      <td className="p-4 font-mono text-white/50 text-xs">
                        {game.endTime instanceof Timestamp
                          ? game.endTime.toDate().toLocaleDateString()
                          : (game.endTime?.seconds ? new Date(game.endTime.seconds * 1000).toLocaleDateString() : 'N/A')}
                      </td>
                      <td className="p-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleStartEditingGame(game)}
                          className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 p-2 rounded transition-colors"
                          title="Edit match"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteGame(game)}
                          className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded transition-colors"
                          title="Delete match"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* End Game Modal */}
      {endGameModalOpen && selectedGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-black border-2 border-[#d1a058] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <h3 className="text-xl font-bold uppercase text-[#d1a058] text-center" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>
              🏆 Record Battle Outcome
            </h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-xs text-white/40 block">MATCH PARTICIPANTS:</span>
                <span className="text-white font-semibold text-base">{selectedGame.players.map(p => p.name).join(', ')}</span>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>
                  Select the Winner:
                </label>
                <select
                  value={selectedWinnerId}
                  onChange={(e) => setSelectedWinnerId(e.target.value)}
                  className="w-full bg-black/60 border border-[#d1a058]/40 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d1a058]"
                >
                  {selectedGame.players.map((player) => (
                    <option key={player.id} value={player.id}>
                      🏆 {player.name} (Player)
                    </option>
                  ))}
                  <option value="host">👹 The Host (Host Won)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleEndGame}
                disabled={endingGame}
                className="flex-1 bg-[#d1a058] hover:bg-[#c09048] text-black font-bold py-2.5 rounded text-sm uppercase tracking-wider transition-colors disabled:opacity-50"
                style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
              >
                {endingGame ? 'Saving...' : 'End Battle'}
              </button>
              <button
                onClick={() => {
                  setEndGameModalOpen(false)
                  setSelectedGame(null)
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2.5 rounded text-sm uppercase tracking-wider transition-colors"
                style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Queue User Modal */}
      {editingQueueUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleUpdateQueueUser} className="bg-black border-2 border-[#d1a058] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-6 animate-fadeIn">
            <h3 className="text-xl font-bold uppercase text-[#d1a058] text-center" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>
              ✏️ Edit Participant
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>Name</label>
                <input
                  type="text"
                  required
                  value={editingQueueName}
                  onChange={(e) => setEditingQueueName(e.target.value)}
                  className="w-full bg-black/60 border border-[#d1a058]/40 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d1a058]"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={editingQueueNumber}
                  onChange={(e) => setEditingQueueNumber(e.target.value)}
                  className="w-full bg-black/60 border border-[#d1a058]/40 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d1a058]"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>Queue Status</label>
                <select
                  value={editingQueueStatus}
                  onChange={(e) => setEditingQueueStatus(e.target.value as any)}
                  className="w-full bg-black/60 border border-[#d1a058]/40 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d1a058]"
                >
                  <option value="waiting">Waiting</option>
                  <option value="playing">Playing</option>
                  <option value="done">Completed</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={updatingQueueUser}
                className="flex-1 bg-[#d1a058] hover:bg-[#c09048] text-black font-bold py-2.5 rounded text-sm uppercase tracking-wider transition-colors disabled:opacity-50"
                style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
              >
                {updatingQueueUser ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setEditingQueueUser(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2.5 rounded text-sm uppercase tracking-wider transition-colors"
                style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Game Record Modal */}
      {editingGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleUpdateGame} className="bg-black border-2 border-[#d1a058] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-6 animate-fadeIn">
            <h3 className="text-xl font-bold uppercase text-[#d1a058] text-center" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>
              ✏️ Edit Battle Record
            </h3>
            
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              
              {/* Players list names editing */}
              <div className="space-y-3">
                <span className="text-xs text-white/40 block uppercase tracking-wider font-semibold">Edit Player Names:</span>
                {editingGamePlayers.map((player, idx) => (
                  <div key={player.id} className="space-y-1">
                    <label className="block text-white/70 text-xs font-semibold">Player {idx + 1} Name</label>
                    <input
                      type="text"
                      required
                      value={player.name}
                      onChange={(e) => {
                        const updated = [...editingGamePlayers]
                        updated[idx] = { ...updated[idx], name: e.target.value }
                        setEditingGamePlayers(updated)
                      }}
                      className="w-full bg-black/60 border border-[#d1a058]/35 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d1a058]"
                    />
                  </div>
                ))}
              </div>

              {/* Winner Selector */}
              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>
                  Winner Outcome:
                </label>
                <select
                  value={editingGameWinnerId}
                  onChange={(e) => setEditingGameWinnerId(e.target.value)}
                  className="w-full bg-black/60 border border-[#d1a058]/40 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d1a058]"
                >
                  {editingGamePlayers.map((player) => (
                    <option key={player.id} value={player.id}>
                      🏆 {player.name} (Player)
                    </option>
                  ))}
                  <option value="host">👹 The Host (Host Won)</option>
                </select>
              </div>

              {/* Duration fields */}
              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>
                  Completion Duration:
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] text-white/40 block mb-1">MINUTES</span>
                    <input
                      type="number"
                      min={0}
                      value={editingGameDurationMins}
                      onChange={(e) => setEditingGameDurationMins(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-black/60 border border-[#d1a058]/40 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d1a058]"
                    />
                  </div>
                  <div className="text-white font-bold self-end mb-2">:</div>
                  <div className="flex-1">
                    <span className="text-[10px] text-white/40 block mb-1">SECONDS</span>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={editingGameDurationSecs}
                      onChange={(e) => setEditingGameDurationSecs(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-full bg-black/60 border border-[#d1a058]/40 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d1a058]"
                    />
                  </div>
                </div>
              </div>

            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={updatingGame}
                className="flex-1 bg-[#d1a058] hover:bg-[#c09048] text-black font-bold py-2.5 rounded text-sm uppercase tracking-wider transition-colors disabled:opacity-50"
                style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
              >
                {updatingGame ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setEditingGame(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2.5 rounded text-sm uppercase tracking-wider transition-colors"
                style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
