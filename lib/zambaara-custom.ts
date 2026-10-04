/**
 * Custom Zambaara tournament model (variable player count, table-based rounds).
 *
 * Firestore collections:
 *  - zambaara_custom_tournaments : one doc per tournament, holds rounds -> tables
 *  - zambaara_custom_players     : one doc per player (tournamentId field), holds revealed tribe
 *
 * Tables are NOT tribe-restricted: any mix of tribes can sit at a table.
 * The Zampion (champion) is derived: winner of the last round when that round has exactly one table.
 */

export const CUSTOM_TOURNAMENTS_COLLECTION = 'zambaara_custom_tournaments'
export const CUSTOM_PLAYERS_COLLECTION = 'zambaara_custom_players'

export type Tribe = 'lava' | 'rain' | 'mountain' | 'wind'

export interface CustomPlayer {
  id: string
  tournamentId: string
  name: string
  mobile: string
  tribe: Tribe | null
  revealedAt?: string | null
  createdAt: string
}

export interface CustomTable {
  id: string
  name: string
  playerIds: string[]
  winnerId: string | null
}

export interface CustomRound {
  id: string
  name: string
  tables: CustomTable[]
}

export interface CustomTournament {
  id: string
  name: string
  dateTime?: string
  rounds: CustomRound[]
  createdAt: string
}

export const TRIBE_META: Record<Tribe, { label: string; color: string; card: string; soft: string; border: string }> = {
  lava: { label: 'Lava', color: '#ff4400', card: '/new_LAVA.png', soft: 'rgba(255,68,0,0.14)', border: 'rgba(255,68,0,0.45)' },
  rain: { label: 'Rain', color: '#00aaff', card: '/new_Rain.png', soft: 'rgba(0,170,255,0.14)', border: 'rgba(0,170,255,0.45)' },
  mountain: { label: 'Mountain', color: '#eebb77', card: '/new_Mountain.png', soft: 'rgba(238,187,119,0.14)', border: 'rgba(238,187,119,0.45)' },
  wind: { label: 'Wind', color: '#00ff88', card: '/new_Wind.png', soft: 'rgba(0,255,136,0.12)', border: 'rgba(0,255,136,0.4)' },
}

export const genId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

export const makeTables = (count: number, startIndex = 0): CustomTable[] =>
  Array.from({ length: count }, (_, i) => ({
    id: genId(),
    name: `Table ${startIndex + i + 1}`,
    playerIds: [],
    winnerId: null,
  }))

export const roundLabel = (index: number, tableCount: number, isLast: boolean) => {
  if (isLast && tableCount === 1 && index > 0) return 'Final Round'
  return `Round ${index + 1}`
}

/** Champion = winner of the last round if that round has exactly one table (and it isn't the only round with many tables). */
export const getChampionId = (t: CustomTournament | undefined | null): string | null => {
  if (!t || !t.rounds?.length) return null
  const last = t.rounds[t.rounds.length - 1]
  if (last.tables.length !== 1) return null
  return last.tables[0].winnerId || null
}

/** Players seated in any table of a round */
export const seatedIdsInRound = (round: CustomRound | undefined) =>
  new Set((round?.tables || []).flatMap(tb => tb.playerIds))

/** Winners of a round */
export const winnersOfRound = (round: CustomRound | undefined) =>
  (round?.tables || []).map(tb => tb.winnerId).filter((x): x is string => !!x)

export const normalizeMobile = (m: string) => String(m || '').replace(/\D/g, '')

export const maskMobile = (m: string) => {
  const d = normalizeMobile(m)
  if (d.length <= 4) return d
  return `${'•'.repeat(Math.max(0, d.length - 4))}${d.slice(-4)}`
}
