'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useConfirm } from '@/components/admin/ConfirmProvider'
import { apiClient } from '@/lib/api-client'

const TRIBES = ['Lava', 'Rain', 'Wind', 'Mountain'] as const
const TRIBE_COLORS: Record<string, string> = {
  Lava: '#ef4444', Rain: '#3b82f6', Wind: '#e0e0e0', Mountain: '#a78bfa',
}

interface Matchup {
  table: number
  player1: string
  player2: string
  player1Id?: string
  player2Id?: string
  status: string
  winner?: string
  winnerId?: string
}

interface Game {
  id: string
  slotNumber: number
  tribe: string
  status: string
  matchups: Matchup[]
  warrior?: string
  warriorId?: string
  zampion?: string
  zampionId?: string
  zampionTribe?: string
  createdAt: string
  updatedAt: string
}

interface Registration {
  id: string
  name: string
  tribe: string
  playerNumber: number
}

export default function AdminBeachBattleGames() {
  const [games, setGames] = useState<Game[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [createTribe, setCreateTribe] = useState<string>('Lava')
  const [createSlot, setCreateSlot] = useState<number>(1)
  const [expandedGame, setExpandedGame] = useState<string | null>(null)

  const confirm = useConfirm()

  const fetchGames = async () => {
    setLoading(true)
    try {
      const res = await apiClient.getBeachBattleGames({ limit: 100 })
      if (res.success && res.data) {
        setGames((res.data as any).games || [])
      }
    } catch { /* silent */ }
    setLoading(false)
  }

  const fetchRegistrations = async () => {
    try {
      const res = await apiClient.getBeachBattleRegistrations({ limit: 100 })
      if (res.success && res.data) {
        setRegistrations((res.data as any).registrations || [])
      }
    } catch { /* silent */ }
  }

  useEffect(() => {
    fetchGames()
    fetchRegistrations()
  }, [])

  const getTribePlayers = (tribe: string) =>
    registrations.filter(r => r.tribe === tribe)

  const handleCreateGame = async () => {
    const players = getTribePlayers(createTribe)
    if (players.length < 2) {
      toast.error(`${createTribe} needs at least 2 players`)
      return
    }
    // Create matchups: pair players
    const matchups: Matchup[] = []
    for (let i = 0; i < players.length; i += 2) {
      if (i + 1 < players.length) {
        matchups.push({
          table: Math.floor(i / 2) + 1,
          player1: players[i].name,
          player2: players[i + 1].name,
          player1Id: players[i].id,
          player2Id: players[i + 1].id,
          status: 'pending',
        })
      }
    }
    try {
      const res = await apiClient.createBeachBattleGame({
        slotNumber: createSlot,
        tribe: createTribe,
        matchups,
      })
      if (res.success) {
        toast.success(`${createTribe} game created!`)
        setShowCreate(false)
        fetchGames()
      } else {
        toast.error(res.error || 'Failed to create game')
      }
    } catch {
      toast.error('Failed to create game')
    }
  }

  const handleStartGame = async (id: string) => {
    try {
      const res = await apiClient.updateBeachBattleGame(id, { action: 'start' })
      if (res.success) { toast.success('Game started! LIVE NOW'); fetchGames() }
      else toast.error(res.error || 'Failed to start')
    } catch { toast.error('Failed to start game') }
  }

  const handleEndGame = async (game: Game) => {
    // Ask for warrior selection
    const players = game.matchups.flatMap(m => [
      { name: m.player1, id: m.player1Id },
      { name: m.player2, id: m.player2Id },
    ])
    const warriorName = prompt(
      `Select warrior (qualifier) from: ${players.map(p => p.name).join(', ')}\nEnter exact name:`
    )
    if (!warriorName) return
    const warrior = players.find(p => p.name === warriorName)
    try {
      const res = await apiClient.updateBeachBattleGame(game.id, {
        action: 'end',
        warrior: warriorName,
        warriorId: warrior?.id || '',
      })
      if (res.success) { toast.success(`Game ended! Warrior: ${warriorName}`); fetchGames() }
      else toast.error(res.error || 'Failed to end game')
    } catch { toast.error('Failed to end game') }
  }

  const handleSetZampion = async (game: Game) => {
    // Collect warriors from all completed games in this slot
    const slotGames = games.filter(g => g.slotNumber === game.slotNumber && g.status === 'completed' && g.warrior)
    if (slotGames.length === 0) { toast.error('No warriors yet for this slot'); return }
    const warriors = slotGames.map(g => ({ name: g.warrior!, tribe: g.tribe }))
    const zampionName = prompt(
      `Select Zampion from warriors:\n${warriors.map(w => `${w.name} (${w.tribe})`).join('\n')}\nEnter exact name:`
    )
    if (!zampionName) return
    const zampionW = warriors.find(w => w.name === zampionName)
    if (!zampionW) { toast.error('Warrior not found'); return }
    try {
      const res = await apiClient.updateBeachBattleGame(game.id, {
        action: 'setZampion',
        slotNumber: game.slotNumber,
        zampion: zampionName,
        zampionTribe: zampionW.tribe,
      })
      if (res.success) { toast.success(`Zampion set: ${zampionName}`); fetchGames() }
      else toast.error(res.error || 'Failed to set zampion')
    } catch { toast.error('Failed to set zampion') }
  }

  const handleDeleteGame = async (id: string) => {
    const ok = await confirm.confirm({
      title: 'Delete Game',
      message: 'Are you sure you want to delete this game? This cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
    })
    if (!ok) return
    try {
      const res = await apiClient.deleteBeachBattleGame(id)
      if (res.success) { toast.success('Game deleted'); fetchGames() }
      else toast.error(res.error || 'Failed to delete')
    } catch { toast.error('Failed to delete game') }
  }

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'rgba(251,191,36,0.15)', text: '#fbbf24', label: 'PENDING' },
      live: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', label: 'LIVE NOW' },
      completed: { bg: 'rgba(148,163,184,0.15)', text: '#94a3b8', label: 'COMPLETED' },
    }
    const s = map[status] || map.pending
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
        style={{ background: s.bg, color: s.text, border: `1px solid ${s.text}30` }}>
        {status === 'live' && <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: s.text }} />}
        {s.label}
      </span>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase"
            style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#d1a058' }}>
            Arena Games
          </h1>
          <p className="text-sm text-white/50 mt-1" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
            Manage live games, matchups, warriors & Zampions
          </p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all hover:scale-[1.02]"
          style={{ fontFamily: "'BlinkerSemiBold', sans-serif", background: 'rgba(6,182,212,0.2)', border: '1.5px solid rgba(6,182,212,0.4)', color: '#e0f2fe' }}>
          + Create Game
        </button>
      </div>

      {/* Create Game Form */}
      {showCreate && (
        <div className="bg-black/60 border-2 border-cyan-500/30 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#06b6d4' }}>
            New Tribe Game
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs uppercase tracking-wider mb-1 text-white/50">Tribe</label>
              <select value={createTribe} onChange={e => setCreateTribe(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-black/60 border border-cyan-500/30 text-white text-sm">
                {TRIBES.map(t => (
                  <option key={t} value={t}>{t} ({getTribePlayers(t).length} players)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider mb-1 text-white/50">Slot Number</label>
              <input type="number" value={createSlot} onChange={e => setCreateSlot(parseInt(e.target.value) || 1)} min={1}
                className="w-full px-3 py-2 rounded-lg bg-black/60 border border-cyan-500/30 text-white text-sm" />
            </div>
          </div>
          {/* Preview players */}
          <div className="mb-4">
            <p className="text-xs uppercase tracking-wider text-white/40 mb-2">Players ({getTribePlayers(createTribe).length})</p>
            <div className="flex flex-wrap gap-2">
              {getTribePlayers(createTribe).map(p => (
                <span key={p.id} className="px-2 py-1 rounded text-xs"
                  style={{ background: `${TRIBE_COLORS[createTribe]}15`, border: `1px solid ${TRIBE_COLORS[createTribe]}30`, color: TRIBE_COLORS[createTribe] }}>
                  {p.name} #{p.playerNumber}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreateGame}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all"
              style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)' }}>
              Create & Pair Players
            </button>
            <button onClick={() => setShowCreate(false)}
              className="px-5 py-2 rounded-lg text-sm text-white/50 border border-white/20">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Games List */}
      {loading ? (
        <div className="text-[#d1a058]">Loading games...</div>
      ) : games.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <p className="text-lg mb-2">No games yet</p>
          <p className="text-sm">Create a game to start a tribe battle</p>
        </div>
      ) : (
        <div className="space-y-4">
          {games.map(game => {
            const tribeColor = TRIBE_COLORS[game.tribe] || '#d1a058'
            const isExpanded = expandedGame === game.id
            return (
              <div key={game.id}
                className="bg-black/60 border-2 rounded-lg overflow-hidden transition-all"
                style={{ borderColor: `${tribeColor}30` }}>
                {/* Game Header */}
                <div className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedGame(isExpanded ? null : game.id)}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: `${tribeColor}20`, border: `1.5px solid ${tribeColor}40`, color: tribeColor }}>
                      S{game.slotNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold uppercase" style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: tribeColor }}>
                          {game.tribe}
                        </span>
                        {statusBadge(game.status)}
                      </div>
                      <p className="text-xs text-white/30 mt-0.5">
                        {game.matchups.length} matchup{game.matchups.length !== 1 ? 's' : ''}
                        {game.warrior && ` | Warrior: ${game.warrior}`}
                        {game.zampion && ` | Zampion: ${game.zampion}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {game.status === 'pending' && (
                      <button onClick={(e) => { e.stopPropagation(); handleStartGame(game.id) }}
                        className="px-3 py-1.5 rounded text-xs font-semibold uppercase"
                        style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)', color: '#22c55e' }}>
                        Start Game
                      </button>
                    )}
                    {game.status === 'live' && (
                      <button onClick={(e) => { e.stopPropagation(); handleEndGame(game) }}
                        className="px-3 py-1.5 rounded text-xs font-semibold uppercase"
                        style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444' }}>
                        End Game
                      </button>
                    )}
                    {game.status === 'completed' && !game.zampion && (
                      <button onClick={(e) => { e.stopPropagation(); handleSetZampion(game) }}
                        className="px-3 py-1.5 rounded text-xs font-semibold uppercase"
                        style={{ background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.4)', color: '#fbbf24' }}>
                        Set Zampion
                      </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteGame(game.id) }}
                      className="px-2 py-1.5 rounded text-xs text-red-400/60 hover:text-red-400 transition-colors">
                      Delete
                    </button>
                    <span className="text-white/20 text-sm">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Expanded: Matchups */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t" style={{ borderColor: `${tribeColor}15` }}>
                    <p className="text-xs uppercase tracking-wider text-white/30 mt-3 mb-2">Matchups</p>
                    <div className="space-y-2">
                      {game.matchups.map((m, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg"
                          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-white/20">T{m.table}</span>
                            <span className={`text-sm font-semibold ${m.winner === m.player1 ? 'text-green-400' : 'text-white/70'}`}>
                              {m.player1}
                            </span>
                            <span className="text-xs text-white/20">vs</span>
                            <span className={`text-sm font-semibold ${m.winner === m.player2 ? 'text-green-400' : 'text-white/70'}`}>
                              {m.player2}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {m.winner && (
                              <span className="text-xs text-green-400/70 uppercase">Winner: {m.winner}</span>
                            )}
                            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded"
                              style={{ background: m.status === 'live' ? 'rgba(34,197,94,0.15)' : m.status === 'completed' ? 'rgba(148,163,184,0.1)' : 'rgba(251,191,36,0.1)', color: m.status === 'live' ? '#22c55e' : m.status === 'completed' ? '#94a3b8' : '#fbbf24' }}>
                              {m.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Warriors & Zampion info */}
                    {game.warrior && (
                      <div className="mt-3 p-3 rounded-lg" style={{ background: `${tribeColor}08`, border: `1px solid ${tribeColor}15` }}>
                        <p className="text-xs uppercase tracking-wider text-white/30 mb-1">Round 1 Warrior (Qualifier)</p>
                        <p className="text-sm font-semibold" style={{ color: tribeColor }}>{game.warrior}</p>
                      </div>
                    )}
                    {game.zampion && (
                      <div className="mt-2 p-3 rounded-lg" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}>
                        <p className="text-xs uppercase tracking-wider text-white/30 mb-1">Zampion (Ultimate Winner)</p>
                        <p className="text-sm font-semibold text-yellow-400">{game.zampion} ({game.zampionTribe})</p>
                      </div>
                    )}

                    <p className="text-xs text-white/15 mt-3">
                      Created: {new Date(game.createdAt).toLocaleString()} | Updated: {new Date(game.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
