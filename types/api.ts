export interface Player {
  name: string
  mobile: string
}

export interface CreateGameRequest {
  players: Player[] // Array of players with name and mobile (3-6 players)
  eventId: string // Reference to event (required)
  hostId: string // Reference to host (required)
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

export interface CreateBookingRequest {
  name: string
  email: string
  mobile: string
  date: string // ISO date string
  time: string // Time slot (e.g., "10:00 AM", "2:00 PM")
  numberOfPlayers: number
  specialRequests?: string
}

export interface CreatePreBookingRequest {
  name: string
  email: string
  mobile: string
  preferredDate?: string // ISO date string (optional)
  preferredTime?: string // Time slot (optional)
  numberOfPlayers: number
  specialRequests?: string
  status?: 'pending' | 'confirmed' | 'cancelled'
}

export interface CreateEventRequest {
  name: string
  description?: string
  startDate: string // ISO date string
  endDate?: string // ISO date string (optional)
  location?: string
  hostId?: string // Reference to host
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  maxParticipants?: number
  image?: string
}

export interface CreateHostRequest {
  name: string
  email: string
  mobile: string
  bio?: string
  image?: string
  status?: 'active' | 'inactive'
}
