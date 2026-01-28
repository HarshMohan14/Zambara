export interface Player {
  name: string
  mobile: string
}

export interface CreateGameRequest {
  name: string
  description?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  players: Player[] // Array of players with name and mobile (3-6 players)
}

export interface CompleteGameRequest {
  winner: string // Player name who won
  // winnerTime is calculated automatically from startTime
}

export interface SubmitScoreRequest {
  playerName: string
  playerMobile?: string
  playerId?: string // Combination of name_mobile for unique identification
  gameId: string
  score: number
  time?: number
}

export interface CreateBraceletRequest {
  name: string
  description?: string
  element: string
  image?: string
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface ContactRequest {
  name: string
  email: string
  message: string
  subject?: string
}

export interface NewsletterRequest {
  email: string
}

export interface LeaderboardQuery {
  gameId?: string
  limit?: number
  offset?: number
}
