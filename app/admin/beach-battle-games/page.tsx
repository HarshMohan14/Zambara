'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useConfirm } from '@/components/admin/ConfirmProvider'
import { apiClient } from '@/lib/api-client'

const TRIBES = ['Lava', 'Rain', 'Wind', 'Mountain'] as const
const TRIBE_COLORS: Record<string, string> = {
  Lava: '#ef4444', Rain: '#3b82f6', Wind: '#e0e0e0', Mountain: '#a78bfa',
}

interface Player {
  name: string
  id?: string
  playerNumber?: number
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
  players: Player[]
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

// ═══════════════════════════════════════════════════════════
// Themed Modal Component
// ═══════════════════════════════════════════════════════════
function ThemedModal({ open, onClose, children }: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, rgba(6,30,50,0.95), rgba(0,0,0,0.98))',
          border: '1.5px solid rgba(6,182,212,0.2)',
          boxShadow: '0 0 60px rgba(6,182,212,0.08), 0 25px 50px rgba(0,0,0,0.5)',
        }}>
        {children}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Player Selection Modal — for choosing warrior or zampion
// ═══════════════════════════════════════════════════════════
function PlayerSelectModal({ open, onClose, title, subtitle, players, accentColor, onSelect }: {
  open: boolean
  onClose: () => void
  title: string
  subtitle: string
  players: { name: string; id?: string; tribe?: string }[]
  accentColor: string
  onSelect: (player: { name: string; id?: string; tribe?: string }) => void
}) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <ThemedModal open={open} onClose={onClose}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl font-bold uppercase"
            style={{ fontFamily: "'TheWalkyrDemo', serif", color: accentColor }}>
            {title}
          </h3>
          <p className="text-xs text-white/40 mt-1 uppercase tracking-wider"
            style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
            {subtitle}
          </p>
        </div>

        {/* Player cards */}
        <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
          {players.map((p) => {
            const isSelected = selected === p.name
            const playerColor = p.tribe ? (TRIBE_COLORS[p.tribe] || accentColor) : accentColor
            return (
              <button key={p.name}
                onClick={() => setSelected(p.name)}
                className="w-full p-3 rounded-xl text-left transition-all duration-300 flex items-center gap-3"
                style={{
                  background: isSelected ? `${playerColor}15` : 'rgba(0,0,0,0.3)',
                  border: `1.5px solid ${isSelected ? `${playerColor}50` : 'rgba(255,255,255,0.05)'}`,
                  boxShadow: isSelected ? `0 0 20px ${playerColor}10` : 'none',
                }}>
                {/* Radio indicator */}
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ border: `2px solid ${isSelected ? playerColor : 'rgba(255,255,255,0.15)'}` }}>
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: playerColor }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: isSelected ? playerColor : '#e2e8f0' }}>
                    {p.name}
                  </p>
                  {p.tribe && (
                    <p className="text-[10px] uppercase tracking-wider"
                      style={{ color: isSelected ? `${playerColor}80` : 'rgba(255,255,255,0.25)' }}>
                      {p.tribe} Tribe
                    </p>
                  )}
                </div>
                {isSelected && (
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill={playerColor}>
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (!selected) { toast.error('Please select a player'); return }
              const player = players.find(p => p.name === selected)
              if (player) onSelect(player)
            }}
            disabled={!selected}
            className="flex-1 py-3 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all"
            style={{
              fontFamily: "'BlinkerSemiBold', sans-serif",
              background: selected ? `${accentColor}20` : 'rgba(255,255,255,0.03)',
              border: `1.5px solid ${selected ? `${accentColor}50` : 'rgba(255,255,255,0.08)'}`,
              color: selected ? accentColor : 'rgba(255,255,255,0.2)',
              cursor: selected ? 'pointer' : 'not-allowed',
            }}>
            Confirm Selection
          </button>
          <button onClick={onClose}
            className="px-5 py-3 rounded-xl text-sm text-white/40 transition-all hover:text-white/60"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            Cancel
          </button>
        </div>
      </div>
    </ThemedModal>
  )
}

// ═══════════════════════════════════════════════════════════
// Confirm Action Modal — themed replacement for window.confirm
// ═══════════════════════════════════════════════════════════
function ConfirmModal({ open, onClose, title, message, confirmLabel, onConfirm, accentColor, variant }: {
  open: boolean
  onClose: () => void
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
  accentColor: string
  variant?: 'danger' | 'warning' | 'success'
}) {
  const variantColor = variant === 'danger' ? '#ef4444' : variant === 'success' ? '#22c55e' : accentColor
  return (
    <ThemedModal open={open} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-bold uppercase mb-2"
          style={{ fontFamily: "'TheWalkyrDemo', serif", color: variantColor }}>
          {title}
        </h3>
        <p className="text-sm text-white/50 mb-6" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
          {message}
        </p>
        <div className="flex gap-3">
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all"
            style={{
              fontFamily: "'BlinkerSemiBold', sans-serif",
              background: `${variantColor}20`,
              border: `1.5px solid ${variantColor}50`,
              color: variantColor,
            }}>
            {confirmLabel}
          </button>
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/60 transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            Cancel
          </button>
        </div>
      </div>
    </ThemedModal>
  )
}

// ═══════════════════════════════════════════════════════════
// Main Admin Page
// ═══════════════════════════════════════════════════════════
export default function AdminBeachBattleGames() {
  const [games, setGames] = useState<Game[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [createTribe, setCreateTribe] = useState<string>('Lava')
  const [createSlot, setCreateSlot] = useState<number>(1)
  const [expandedGame, setExpandedGame] = useState<string | null>(null)

  // Modal states
  const [warriorModal, setWarriorModal] = useState<{ open: boolean; game: Game | null }>({ open: false, game: null })
  const [zampionModal, setZampionModal] = useState<{ open: boolean; game: Game | null }>({ open: false, game: null })
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; gameId: string | null }>({ open: false, gameId: null })
  const [startModal, setStartModal] = useState<{ open: boolean; gameId: string | null }>({ open: false, gameId: null })
  const [deleteAllModal, setDeleteAllModal] = useState(false)
  const [deletingAll, setDeletingAll] = useState(false)

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

  // Get all players for a game (from players array or fallback to matchups)
  const getGamePlayers = (game: Game): { name: string; id?: string }[] => {
    if (game.players && game.players.length > 0) {
      return game.players.map(p => ({ name: p.name, id: p.id }))
    }
    // Fallback for legacy matchup-based games
    const playerSet = new Map<string, string | undefined>()
    game.matchups.forEach(m => {
      playerSet.set(m.player1, m.player1Id)
      playerSet.set(m.player2, m.player2Id)
    })
    return Array.from(playerSet.entries()).map(([name, id]) => ({ name, id }))
  }

  const handleCreateGame = async () => {
    const players = getTribePlayers(createTribe)
    if (players.length < 4) {
      toast.error(`${createTribe} needs 4 players to start a game (currently ${players.length})`)
      return
    }
    const gamePlayers = players.slice(0, 4).map(p => ({
      name: p.name,
      id: p.id,
      playerNumber: p.playerNumber,
    }))
    try {
      const res = await apiClient.createBeachBattleGame({
        slotNumber: createSlot,
        tribe: createTribe,
        players: gamePlayers,
      })
      if (res.success) {
        toast.success(`${createTribe} tribe game created with 4 players!`)
        setShowCreate(false)
        fetchGames()
      } else {
        toast.error(res.error || 'Failed to create game')
      }
    } catch {
      toast.error('Failed to create game')
    }
  }

  const handleStartGame = async () => {
    if (!startModal.gameId) return
    try {
      const res = await apiClient.updateBeachBattleGame(startModal.gameId, { action: 'start' })
      if (res.success) { toast.success('Game started! LIVE NOW'); fetchGames() }
      else toast.error(res.error || 'Failed to start')
    } catch { toast.error('Failed to start game') }
    setStartModal({ open: false, gameId: null })
  }

  const handleEndGame = async (player: { name: string; id?: string }) => {
    if (!warriorModal.game) return
    try {
      const res = await apiClient.updateBeachBattleGame(warriorModal.game.id, {
        action: 'end',
        warrior: player.name,
        warriorId: player.id || '',
      })
      if (res.success) { toast.success(`Game ended! Warrior: ${player.name}`); fetchGames() }
      else toast.error(res.error || 'Failed to end game')
    } catch { toast.error('Failed to end game') }
    setWarriorModal({ open: false, game: null })
  }

  const handleSetZampion = async (player: { name: string; id?: string; tribe?: string }) => {
    if (!zampionModal.game) return
    try {
      const res = await apiClient.updateBeachBattleGame(zampionModal.game.id, {
        action: 'setZampion',
        slotNumber: zampionModal.game.slotNumber,
        zampion: player.name,
        zampionTribe: player.tribe || '',
      })
      if (res.success) { toast.success(`Zampion crowned: ${player.name}!`); fetchGames() }
      else toast.error(res.error || 'Failed to set zampion')
    } catch { toast.error('Failed to set zampion') }
    setZampionModal({ open: false, game: null })
  }

  const handleDeleteGame = async () => {
    if (!deleteModal.gameId) return
    try {
      const res = await apiClient.deleteBeachBattleGame(deleteModal.gameId)
      if (res.success) { toast.success('Game deleted'); fetchGames() }
      else toast.error(res.error || 'Failed to delete')
    } catch { toast.error('Failed to delete game') }
    setDeleteModal({ open: false, gameId: null })
  }

  // Delete ALL beach battle data
  const handleDeleteAllData = async () => {
    setDeletingAll(true)
    try {
      const res = await apiClient.deleteAllBeachBattleData()
      if (res.success) {
        const data = res.data as any
        toast.success(`Deleted ${data.gamesDeleted} games and ${data.registrationsDeleted} registrations`)
        fetchGames()
        fetchRegistrations()
      } else {
        toast.error(res.error || 'Failed to delete data')
      }
    } catch {
      toast.error('Failed to delete all data')
    }
    setDeletingAll(false)
    setDeleteAllModal(false)
  }

  // Get warriors for Zampion selection
  const getSlotWarriors = (game: Game) => {
    return games
      .filter(g => g.slotNumber === game.slotNumber && g.status === 'completed' && g.warrior)
      .map(g => ({ name: g.warrior!, id: g.warriorId, tribe: g.tribe }))
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
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase"
            style={{ fontFamily: "'TheWalkyrDemo', serif", color: '#d1a058' }}>
            Arena Games
          </h1>
          <p className="text-sm text-white/50 mt-1" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
            4 players per tribe compete — 1 warrior qualifies — 4 warriors clash in Zampion round
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowCreate(!showCreate)}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all hover:scale-[1.02]"
            style={{ fontFamily: "'BlinkerSemiBold', sans-serif", background: 'rgba(6,182,212,0.2)', border: '1.5px solid rgba(6,182,212,0.4)', color: '#e0f2fe' }}>
            + Create Tribe Game
          </button>
          <button onClick={() => setDeleteAllModal(true)}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all hover:scale-[1.02]"
            style={{ fontFamily: "'BlinkerSemiBold', sans-serif", background: 'rgba(239,68,68,0.12)', border: '1.5px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
            Delete All Data
          </button>
        </div>
      </div>

      {/* ── GAME FLOW INFO ── */}
      <div className="mb-6 p-4 rounded-xl" style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.15)' }}>
        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wider" style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>
          <span style={{ color: '#06b6d4' }}>4 Players/Tribe</span>
          <span className="text-white/15">→</span>
          <span style={{ color: '#22c55e' }}>Tribe Fight (Live)</span>
          <span className="text-white/15">→</span>
          <span style={{ color: '#ef4444' }}>1 Warrior/Tribe</span>
          <span className="text-white/15">→</span>
          <span style={{ color: '#fbbf24' }}>4 Warriors → Zampion Round → 1 Zampion</span>
        </div>
      </div>

      {/* ── CREATE GAME FORM ── */}
      {showCreate && (
        <div className="rounded-xl p-6 mb-6"
          style={{ background: 'linear-gradient(160deg, rgba(6,30,50,0.6), rgba(0,0,0,0.8))', border: '1.5px solid rgba(6,182,212,0.25)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: '#06b6d4' }}>
            New Tribe Game
          </h3>
          <p className="text-xs text-white/35 mb-4" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
            Select a tribe with 4 registered players. All 4 will compete at one table — the winner becomes the tribe&apos;s Warrior.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs uppercase tracking-wider mb-1 text-white/50">Tribe</label>
              <select value={createTribe} onChange={e => setCreateTribe(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-black/60 border border-cyan-500/30 text-white text-sm">
                {TRIBES.map(t => {
                  const count = getTribePlayers(t).length
                  return (
                    <option key={t} value={t}>
                      {t} ({count}/4 players) {count >= 4 ? '✓ Ready' : ''}
                    </option>
                  )
                })}
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
            <p className="text-xs uppercase tracking-wider text-white/40 mb-2">
              Players ({getTribePlayers(createTribe).length}/4)
              {getTribePlayers(createTribe).length < 4 && (
                <span className="text-red-400/60 ml-2">Need {4 - getTribePlayers(createTribe).length} more</span>
              )}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {getTribePlayers(createTribe).slice(0, 4).map((p, i) => (
                <div key={p.id} className="p-2.5 rounded-lg text-center"
                  style={{ background: `${TRIBE_COLORS[createTribe]}10`, border: `1px solid ${TRIBE_COLORS[createTribe]}25` }}>
                  <p className="text-xs font-bold" style={{ color: TRIBE_COLORS[createTribe] }}>{p.name}</p>
                  <p className="text-[10px] text-white/25">Player #{p.playerNumber}</p>
                </div>
              ))}
              {getTribePlayers(createTribe).length < 4 && Array.from({ length: 4 - getTribePlayers(createTribe).length }).map((_, i) => (
                <div key={`empty-${i}`} className="p-2.5 rounded-lg text-center"
                  style={{ border: '1px dashed rgba(255,255,255,0.08)' }}>
                  <p className="text-xs text-white/15">Empty</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleCreateGame}
              disabled={getTribePlayers(createTribe).length < 4}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
              style={{
                background: getTribePlayers(createTribe).length >= 4 ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${getTribePlayers(createTribe).length >= 4 ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: getTribePlayers(createTribe).length >= 4 ? '#22c55e' : 'rgba(255,255,255,0.2)',
                cursor: getTribePlayers(createTribe).length >= 4 ? 'pointer' : 'not-allowed',
              }}>
              Create Tribe Game (4 Players)
            </button>
            <button onClick={() => setShowCreate(false)}
              className="px-5 py-2.5 rounded-lg text-sm text-white/50 border border-white/20">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── GAMES LIST ── */}
      {loading ? (
        <div className="text-[#d1a058]">Loading games...</div>
      ) : games.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <p className="text-lg mb-2" style={{ fontFamily: "'TheWalkyrDemo', serif" }}>No games yet</p>
          <p className="text-sm" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>Create a tribe game when 4 players are registered</p>
        </div>
      ) : (
        <div className="space-y-4">
          {games.map(game => {
            const tribeColor = TRIBE_COLORS[game.tribe] || '#d1a058'
            const isExpanded = expandedGame === game.id
            const gamePlayers = getGamePlayers(game)

            return (
              <div key={game.id}
                className="rounded-xl overflow-hidden transition-all"
                style={{
                  background: 'linear-gradient(160deg, rgba(6,30,50,0.3), rgba(0,0,0,0.7))',
                  border: `1.5px solid ${game.status === 'live' ? 'rgba(34,197,94,0.3)' : `${tribeColor}25`}`,
                  boxShadow: game.status === 'live' ? '0 0 20px rgba(34,197,94,0.05)' : 'none',
                }}>
                {/* Game Header */}
                <div className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedGame(isExpanded ? null : game.id)}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: `${tribeColor}15`, border: `1.5px solid ${tribeColor}35`, color: tribeColor }}>
                      S{game.slotNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold uppercase" style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: tribeColor }}>
                          {game.tribe} Tribe
                        </span>
                        {statusBadge(game.status)}
                      </div>
                      <p className="text-xs text-white/30 mt-0.5" style={{ fontFamily: "'BlinkerRegular', sans-serif" }}>
                        {gamePlayers.length} players competing
                        {game.warrior && <span> · <span style={{ color: tribeColor }}>Warrior: {game.warrior}</span></span>}
                        {game.zampion && <span> · <span style={{ color: '#fbbf24' }}>Zampion: {game.zampion}</span></span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Action buttons */}
                    {game.status === 'pending' && (
                      <button onClick={(e) => { e.stopPropagation(); setStartModal({ open: true, gameId: game.id }) }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all"
                        style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)', color: '#22c55e' }}>
                        Start Game
                      </button>
                    )}
                    {game.status === 'live' && (
                      <button onClick={(e) => { e.stopPropagation(); setWarriorModal({ open: true, game }) }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all"
                        style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: '#ef4444' }}>
                        End & Select Warrior
                      </button>
                    )}
                    {game.status === 'completed' && !game.zampion && (
                      <button onClick={(e) => { e.stopPropagation(); setZampionModal({ open: true, game }) }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all"
                        style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.35)', color: '#fbbf24' }}>
                        Crown Zampion
                      </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); setDeleteModal({ open: true, gameId: game.id }) }}
                      className="px-2 py-1.5 rounded text-xs text-red-400/40 hover:text-red-400 transition-colors">
                      Delete
                    </button>
                    <span className="text-white/15 text-sm transition-transform duration-300"
                      style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                      &#9660;
                    </span>
                  </div>
                </div>

                {/* ── Expanded Details ── */}
                {isExpanded && (
                  <div className="px-4 pb-4" style={{ borderTop: `1px solid ${tribeColor}10` }}>
                    {/* Players Grid */}
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/25 mt-3 mb-2"
                      style={{ fontFamily: "'BlinkerSemiBold', sans-serif" }}>
                      Players at Table
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                      {gamePlayers.map((p, i) => {
                        const isWarrior = game.warrior === p.name
                        return (
                          <div key={i} className="p-3 rounded-lg text-center relative"
                            style={{
                              background: isWarrior ? `${tribeColor}12` : 'rgba(0,0,0,0.3)',
                              border: `1px solid ${isWarrior ? `${tribeColor}40` : 'rgba(255,255,255,0.05)'}`,
                              boxShadow: isWarrior ? `0 0 15px ${tribeColor}10` : 'none',
                            }}>
                            {isWarrior && (
                              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[8px] uppercase tracking-wider"
                                style={{ background: `${tribeColor}25`, color: tribeColor, border: `1px solid ${tribeColor}40` }}>
                                Warrior
                              </div>
                            )}
                            <p className={`text-sm font-bold ${isWarrior ? '' : 'text-white/70'}`}
                              style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: isWarrior ? tribeColor : undefined }}>
                              {p.name}
                            </p>
                          </div>
                        )
                      })}
                    </div>

                    {/* Warrior result */}
                    {game.warrior && (
                      <div className="p-3 rounded-lg mb-3" style={{ background: `${tribeColor}08`, border: `1px solid ${tribeColor}15` }}>
                        <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Tribe Warrior (Qualifier for Zampion Round)</p>
                        <p className="text-sm font-bold" style={{ fontFamily: "'BlinkerSemiBold', sans-serif", color: tribeColor }}>{game.warrior}</p>
                      </div>
                    )}

                    {/* Zampion result */}
                    {game.zampion && (
                      <div className="p-3 rounded-lg mb-3" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}>
                        <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Zampion of the Tides</p>
                        <p className="text-sm font-bold" style={{ color: '#fbbf24' }}>{game.zampion} ({game.zampionTribe})</p>
                      </div>
                    )}

                    <p className="text-[10px] text-white/15 mt-3">
                      Created: {new Date(game.createdAt).toLocaleString()} · Updated: {new Date(game.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ═══ MODALS ═══ */}

      {/* Start Game Modal */}
      <ConfirmModal
        open={startModal.open}
        onClose={() => setStartModal({ open: false, gameId: null })}
        title="Start Game"
        message="This will set the game to LIVE. All 4 tribe players will be competing. The game will appear on the public website."
        confirmLabel="Go Live"
        onConfirm={handleStartGame}
        accentColor="#22c55e"
        variant="success"
      />

      {/* Select Warrior Modal */}
      {warriorModal.game && (
        <PlayerSelectModal
          open={warriorModal.open}
          onClose={() => setWarriorModal({ open: false, game: null })}
          title="Select Tribe Warrior"
          subtitle={`Choose the winner of the ${warriorModal.game.tribe} tribe fight — this player advances to the Zampion Round`}
          players={getGamePlayers(warriorModal.game)}
          accentColor={TRIBE_COLORS[warriorModal.game.tribe] || '#06b6d4'}
          onSelect={handleEndGame}
        />
      )}

      {/* Crown Zampion Modal */}
      {zampionModal.game && (
        <PlayerSelectModal
          open={zampionModal.open}
          onClose={() => setZampionModal({ open: false, game: null })}
          title="Crown the Zampion"
          subtitle={`Select the ultimate winner from Slot #${zampionModal.game.slotNumber} — the Zampion of the Tides`}
          players={getSlotWarriors(zampionModal.game)}
          accentColor="#fbbf24"
          onSelect={handleSetZampion}
        />
      )}

      {/* Delete Game Modal */}
      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, gameId: null })}
        title="Delete Game"
        message="Are you sure you want to delete this game? This action cannot be undone."
        confirmLabel="Delete Game"
        onConfirm={handleDeleteGame}
        accentColor="#ef4444"
        variant="danger"
      />

      {/* Delete All Data Modal */}
      <ConfirmModal
        open={deleteAllModal}
        onClose={() => setDeleteAllModal(false)}
        title="Delete All Beach Battle Data"
        message="This will permanently delete ALL games AND all player registrations. This cannot be undone. The arena will be completely reset."
        confirmLabel={deletingAll ? 'Deleting...' : 'Delete Everything'}
        onConfirm={handleDeleteAllData}
        accentColor="#ef4444"
        variant="danger"
      />
    </div>
  )
}
