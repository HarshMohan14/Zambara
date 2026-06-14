'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Player {
  id: string
  name: string
  phone: string
  status: string
  created_at: string
}

interface GamePlayer {
  id: string
  player_id: string
  player_name: string
}

interface Game {
  id: string
  status: string
  started_at: string
  ended_at: string | null
  duration_seconds: number | null
  winner_id: string | null
  winner_name: string | null
  created_at: string
  beat_the_host_game_players: GamePlayer[]
}

interface LeaderboardEntry {
  id: string
  winner_name: string
  duration_seconds: number
  ended_at: string
}

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
}

function ElapsedTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const start = new Date(startedAt).getTime()
    const tick = () => setElapsed(Math.round((Date.now() - start) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [startedAt])
  return <span className="font-mono text-xl" style={{ color: '#22c55e' }}>{fmt(elapsed)}</span>
}

export default function AdminBeatTheHost() {
  const [queue, setQueue] = useState<Player[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [addName, setAddName] = useState('')
  const [addPhone, setAddPhone] = useState('')
  const [adding, setAdding] = useState(false)
  const [endingGame, setEndingGame] = useState<string | null>(null)
  const [winnerPick, setWinnerPick] = useState<string | null>(null)

  const refresh = async () => {
    try {
      const [qRes, gRes, lRes] = await Promise.all([
        fetch('/api/beat-the-host/queue'),
        fetch('/api/beat-the-host/games'),
        fetch('/api/beat-the-host/leaderboard'),
      ])
      const [qD, gD, lD] = await Promise.all([qRes.json(), gRes.json(), lRes.json()])
      if (qD.success) setQueue(qD.data.players)
      if (gD.success) setGames(gD.data.games)
      if (lD.success) setLeaderboard(lD.data.leaderboard)
    } catch { toast.error('Failed to load data') }
    setLoading(false)
  }

  useEffect(() => { refresh() }, [])

  const addPlayer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addName.trim() || !addPhone.trim()) { toast.error('Name and phone required'); return }
    setAdding(true)
    const res = await fetch('/api/beat-the-host/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: addName.trim(), phone: addPhone.trim() }),
    })
    const d = await res.json()
    if (d.success) { toast.success(`${addName.trim()} added!`); setAddName(''); setAddPhone(''); refresh() }
    else toast.error(d.error || 'Failed to add')
    setAdding(false)
  }

  const removePlayer = async (id: string, name: string) => {
    const res = await fetch(`/api/beat-the-host/queue/${id}`, { method: 'DELETE' })
    const d = await res.json()
    if (d.success) { toast.success(`${name} removed`); setSelected(p => { const n = new Set(p); n.delete(id); return n }); refresh() }
    else toast.error(d.error || 'Failed to remove')
  }

  const startGame = async () => {
    if (selected.size < 1) { toast.error('Select at least 1 player'); return }
    const res = await fetch('/api/beat-the-host/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerIds: Array.from(selected) }),
    })
    const d = await res.json()
    if (d.success) { toast.success('Game started!'); setSelected(new Set()); refresh() }
    else toast.error(d.error || 'Failed to start game')
  }

  const endGame = async (gameId: string, winnerId: string, winnerName: string) => {
    const res = await fetch(`/api/beat-the-host/games/${gameId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'end', winnerId, winnerName }),
    })
    const d = await res.json()
    if (d.success) { toast.success(`Winner: ${winnerName}`); setEndingGame(null); setWinnerPick(null); refresh() }
    else toast.error(d.error || 'Failed to end game')
  }

  const deleteGame = async (gameId: string) => {
    const res = await fetch(`/api/beat-the-host/games/${gameId}`, { method: 'DELETE' })
    const d = await res.json()
    if (d.success) { toast.success('Game deleted'); refresh() }
    else toast.error(d.error || 'Failed to delete')
  }

  const toggle = (id: string) => setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })

  const liveGames = games.filter(g => g.status === 'live')
  const completedGames = games.filter(g => g.status === 'completed')

  if (loading) return <div className="text-[#d1a058]">Loading...</div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold uppercase" style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#d1a058' }}>
          Beat The Host
        </h1>
        <p className="text-sm text-white/50 mt-1" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
          Manage the player queue, start battles, and track champions
        </p>
      </div>

      {/* ── SECTION A: QUEUE ── */}
      <div className="rounded-xl p-6" style={{ background: 'rgba(209,160,88,0.05)', border: '1.5px solid rgba(209,160,88,0.2)' }}>
        <h2 className="text-lg font-bold uppercase mb-4" style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#d1a058' }}>
          Player Queue ({queue.length})
        </h2>

        {/* Add Player Form */}
        <form onSubmit={addPlayer} className="flex flex-wrap gap-3 mb-5">
          <input
            type="text" placeholder="Player Name" value={addName}
            onChange={e => setAddName(e.target.value)}
            className="flex-1 min-w-[140px] px-4 py-2.5 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none text-sm placeholder:text-white/30"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
          />
          <input
            type="tel" placeholder="Phone Number" value={addPhone}
            onChange={e => setAddPhone(e.target.value)}
            className="flex-1 min-w-[140px] px-4 py-2.5 bg-black/60 border-2 border-[#d1a058]/30 rounded-lg text-white focus:border-[#d1a058] focus:outline-none text-sm placeholder:text-white/30"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}
          />
          <button type="submit" disabled={adding}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all hover:scale-[1.02]"
            style={{ fontFamily: "'BlinkerSemiBold', sans-serif", background: 'rgba(34,197,94,0.2)', border: '1.5px solid rgba(34,197,94,0.4)', color: '#22c55e' }}>
            {adding ? 'Adding...' : '+ Add to Queue'}
          </button>
        </form>

        {queue.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-6">Queue is empty. Add players above.</p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setSelected(selected.size === queue.length ? new Set() : new Set(queue.map(p => p.id)))}
                className="text-xs text-[#d1a058]/70 hover:text-[#d1a058] transition-colors"
                style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
                {selected.size === queue.length ? 'Deselect All' : 'Select All'}
              </button>
              {selected.size > 0 && (
                <button onClick={startGame}
                  className="px-5 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all hover:scale-[1.02]"
                  style={{ fontFamily: "'BlinkerSemiBold', sans-serif", background: 'rgba(239,68,68,0.2)', border: '1.5px solid rgba(239,68,68,0.4)', color: '#ef4444', animation: 'pulse 2s infinite' }}>
                  ▶ Start Game ({selected.size})
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#d1a058]/20">
                    {['', '#', 'Name', 'Phone', 'Added', 'Action'].map((h, i) => (
                      <th key={h} className={`${i === 5 ? 'text-right' : 'text-left'} py-2 px-3 text-xs uppercase tracking-wider`}
                        style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#d1a058' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {queue.map((p, idx) => (
                    <tr key={p.id} className="border-b border-[#d1a058]/10 hover:bg-[#d1a058]/5 transition-all">
                      <td className="py-2.5 px-3">
                        <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)}
                          className="w-4 h-4 accent-[#d1a058] cursor-pointer" />
                      </td>
                      <td className="py-2.5 px-3 text-white/40 text-sm">{idx + 1}</td>
                      <td className="py-2.5 px-3 text-white font-semibold text-sm" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>{p.name}</td>
                      <td className="py-2.5 px-3 text-white/70 text-sm" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>{p.phone}</td>
                      <td className="py-2.5 px-3 text-white/40 text-xs">{new Date(p.created_at).toLocaleTimeString()}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button onClick={() => removePlayer(p.id, p.name)}
                          className="px-3 py-1 bg-red-500/15 border border-red-500/30 rounded text-red-400 text-xs hover:bg-red-500/25 transition-all">
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── SECTION B: ACTIVE GAMES ── */}
      <div className="rounded-xl p-6" style={{ background: 'rgba(34,197,94,0.03)', border: '1.5px solid rgba(34,197,94,0.2)' }}>
        <h2 className="text-lg font-bold uppercase mb-4 flex items-center gap-2"
          style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#22c55e' }}>
          {liveGames.length > 0 && <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />}
          Active Games ({liveGames.length})
        </h2>
        {liveGames.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-6">No active games. Select players from the queue above.</p>
        ) : (
          <div className="grid gap-4">
            {liveGames.map(game => (
              <div key={game.id} className="rounded-xl p-5"
                style={{ background: 'rgba(0,0,0,0.4)', border: '1.5px solid rgba(34,197,94,0.25)', boxShadow: '0 0 20px rgba(34,197,94,0.05)' }}>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                      style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />LIVE
                    </span>
                    <ElapsedTimer startedAt={game.started_at} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEndingGame(game.id); setWinnerPick(null) }}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all"
                      style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.35)', color: '#fbbf24' }}>
                      End Game
                    </button>
                    <button onClick={() => deleteGame(game.id)}
                      className="px-3 py-1.5 rounded-lg text-xs text-red-400/50 hover:text-red-400 transition-colors"
                      style={{ border: '1px solid rgba(239,68,68,0.15)' }}>
                      Delete
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {game.beat_the_host_game_players.map(gp => (
                    <span key={gp.id} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: 'rgba(209,160,88,0.1)', border: '1px solid rgba(209,160,88,0.25)', color: '#d1a058', fontFamily: "'BlinkerSemiBold', sans-serif" }}>
                      {gp.player_name}
                    </span>
                  ))}
                  <span className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: 'rgba(239,68,68,0.7)', fontFamily: "'TheWalkyrDemo', serif" }}>
                    THE HOST
                  </span>
                </div>

                {endingGame === game.id && (
                  <div className="mt-3 p-4 rounded-lg" style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)' }}>
                    <p className="text-xs uppercase tracking-wider mb-3"
                      style={{ color: '#fbbf24', fontFamily: "'BlinkerSemiBold', sans-serif" }}>
                      Select the Winner:
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {game.beat_the_host_game_players.map(gp => (
                        <button key={gp.id} onClick={() => setWinnerPick(gp.player_id)}
                          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                          style={{
                            background: winnerPick === gp.player_id ? 'rgba(251,191,36,0.2)' : 'rgba(0,0,0,0.3)',
                            border: `1.5px solid ${winnerPick === gp.player_id ? '#fbbf24' : 'rgba(255,255,255,0.1)'}`,
                            color: winnerPick === gp.player_id ? '#fbbf24' : 'rgba(255,255,255,0.6)',
                            fontFamily: "'BlinkerSemiBold', sans-serif",
                          }}>
                          {gp.player_name}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        disabled={!winnerPick}
                        onClick={() => {
                          const w = game.beat_the_host_game_players.find(gp => gp.player_id === winnerPick)
                          if (w) endGame(game.id, w.player_id, w.player_name)
                        }}
                        className="px-5 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all"
                        style={{
                          background: winnerPick ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${winnerPick ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.08)'}`,
                          color: winnerPick ? '#22c55e' : 'rgba(255,255,255,0.2)',
                          cursor: winnerPick ? 'pointer' : 'not-allowed',
                        }}>
                        Confirm Winner
                      </button>
                      <button onClick={() => { setEndingGame(null); setWinnerPick(null) }}
                        className="px-4 py-2 rounded-lg text-sm text-white/40 hover:text-white/60 transition-colors"
                        style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SECTION C: LEADERBOARD ── */}
      <div className="rounded-xl p-6" style={{ background: 'rgba(251,191,36,0.03)', border: '1.5px solid rgba(251,191,36,0.2)' }}>
        <h2 className="text-lg font-bold uppercase mb-4" style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#fbbf24' }}>
          Fastest Players Leaderboard
        </h2>
        {leaderboard.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-6">No completed games yet. Leaderboard populates after games end.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#fbbf24]/20">
                  {['Rank', 'Player', 'Time (mm:ss)', 'Date'].map((h, i) => (
                    <th key={h} className="text-left py-2 px-3 text-xs uppercase tracking-wider"
                      style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#fbbf24' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, idx) => (
                  <tr key={entry.id} className="border-b border-[#fbbf24]/10 hover:bg-[#fbbf24]/5 transition-all">
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        idx === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' :
                        idx === 1 ? 'bg-gray-400/20 text-gray-300 border border-gray-400/40' :
                        idx === 2 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/40' :
                        'bg-white/5 text-white/40 border border-white/10'
                      }`}>{idx + 1}</span>
                    </td>
                    <td className="py-2.5 px-3 text-white font-semibold text-sm" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>{entry.winner_name}</td>
                    <td className="py-2.5 px-3 font-mono text-sm font-bold" style={{ color: '#22c55e' }}>{fmt(entry.duration_seconds)}</td>
                    <td className="py-2.5 px-3 text-white/40 text-xs">{new Date(entry.ended_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── COMPLETED GAMES ── */}
      {completedGames.length > 0 && (
        <div className="rounded-xl p-6" style={{ background: 'rgba(148,163,184,0.03)', border: '1.5px solid rgba(148,163,184,0.15)' }}>
          <h2 className="text-lg font-bold uppercase mb-4" style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#94a3b8' }}>
            Completed Games ({completedGames.length})
          </h2>
          <div className="space-y-2">
            {completedGames.slice(0, 15).map(game => (
              <div key={game.id} className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-xs text-white/40 truncate max-w-[200px]">
                  {game.beat_the_host_game_players.map(p => p.player_name).join(', ')}
                </span>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-xs" style={{ color: '#fbbf24' }}>W: {game.winner_name}</span>
                  <span className="font-mono text-xs" style={{ color: '#22c55e' }}>
                    {game.duration_seconds ? fmt(game.duration_seconds) : '--:--'}
                  </span>
                  <button onClick={() => deleteGame(game.id)} className="text-xs text-red-400/40 hover:text-red-400 transition-colors">
                    Del
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
