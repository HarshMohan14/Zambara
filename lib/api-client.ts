import type {
  CreateGameRequest,
  SubmitScoreRequest,
  CreateBraceletRequest,
  ContactRequest,
  NewsletterRequest,
  CreateBookingRequest,
  CreatePreBookingRequest,
} from '@/types/api'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  status?: number // HTTP status code for error handling
}

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}/api${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      })

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        // If response is not JSON, return text error
        const text = await response.text()
        return {
          success: false,
          error: text || `Request failed with status ${response.status}`,
          status: response.status,
        }
      }
      
      // Include status code in response for better error handling
      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Request failed with status ${response.status}`,
          status: response.status,
        }
      }
      
      return data
    } catch (error: any) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        status: error.status,
      }
    }
  }

  // Games
  async getGames(params?: {
    difficulty?: string
    status?: 'running' | 'completed'
    limit?: number
    offset?: number
  }) {
    const query = new URLSearchParams()
    if (params?.difficulty) query.append('difficulty', params.difficulty)
    if (params?.status) query.append('status', params.status)
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.offset) query.append('offset', params.offset.toString())
    return this.request(`/games?${query.toString()}`)
  }

  async getGame(id: string) {
    return this.request(`/games/${id}`)
  }

  async createGame(data: CreateGameRequest) {
    return this.request('/games', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateGame(id: string, data: Partial<CreateGameRequest>) {
    return this.request(`/games/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteGame(id: string) {
    return this.request(`/games/${id}`, {
      method: 'DELETE',
    })
  }

  async completeGame(id: string, winner: string) {
    return this.request(`/games/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ winner }),
    })
  }

  // Scores
  async getScores(params?: {
    playerName?: string
    gameId?: string
    limit?: number
    offset?: number
    orderBy?: string
    order?: string
  }) {
    const query = new URLSearchParams()
    if (params?.playerName) query.append('playerName', params.playerName)
    if (params?.gameId) query.append('gameId', params.gameId)
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.offset) query.append('offset', params.offset.toString())
    if (params?.orderBy) query.append('orderBy', params.orderBy)
    if (params?.order) query.append('order', params.order)
    return this.request(`/scores?${query.toString()}`)
  }

  async submitScore(data: SubmitScoreRequest) {
    return this.request('/scores', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async deleteScore(id: string) {
    return this.request(`/scores/${id}`, {
      method: 'DELETE',
    })
  }

  // Leaderboard
  async getLeaderboard(params?: {
    gameId?: string
    limit?: number
    offset?: number
    excludeDeleted?: boolean // For admin panel, set to false to show deleted games
  }) {
    const query = new URLSearchParams()
    if (params?.gameId) query.append('gameId', params.gameId)
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.offset) query.append('offset', params.offset.toString())
    // excludeDeleted defaults to true in API, but admin can explicitly set to false
    if (params?.excludeDeleted === false) {
      query.append('excludeDeleted', 'false')
    }
    return this.request(`/leaderboard?${query.toString()}`)
  }

  async updateLeaderboard(gameId: string) {
    return this.request('/leaderboard/update', {
      method: 'POST',
      body: JSON.stringify({ gameId }),
    })
  }

  async checkGameLeaderboardStatus(gameId: string) {
    return this.request(`/leaderboard/status?gameId=${encodeURIComponent(gameId)}`)
  }

  async deleteLeaderboardEntry(id: string) {
    return this.request(`/leaderboard/${id}`, {
      method: 'DELETE',
    })
  }

  // Bracelets
  async getBracelets(params?: {
    element?: string
    rarity?: string
    limit?: number
    offset?: number
  }) {
    const query = new URLSearchParams()
    if (params?.element) query.append('element', params.element)
    if (params?.rarity) query.append('rarity', params.rarity)
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.offset) query.append('offset', params.offset.toString())
    return this.request(`/bracelets?${query.toString()}`)
  }

  async assignBracelet(braceletId: string, playerName: string) {
    return this.request(`/bracelets/${braceletId}/users`, {
      method: 'POST',
      body: JSON.stringify({ playerName }),
    })
  }

  // Contact
  async getContactMessages(params?: {
    read?: boolean
    limit?: number
    offset?: number
  }) {
    const query = new URLSearchParams()
    if (params?.read !== undefined) query.append('read', params.read.toString())
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.offset) query.append('offset', params.offset.toString())
    return this.request(`/contact?${query.toString()}`)
  }

  async submitContact(data: ContactRequest) {
    return this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateContactMessage(id: string, data: { read?: boolean }) {
    return this.request(`/contact/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteContactMessage(id: string) {
    return this.request(`/contact/${id}`, {
      method: 'DELETE',
    })
  }

  // Newsletter
  async getNewsletterSubscribers(params?: {
    subscribed?: boolean
    limit?: number
    offset?: number
  }) {
    const query = new URLSearchParams()
    if (params?.subscribed !== undefined) query.append('subscribed', params.subscribed.toString())
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.offset) query.append('offset', params.offset.toString())
    return this.request(`/newsletter?${query.toString()}`)
  }

  async subscribeNewsletter(data: NewsletterRequest) {
    return this.request('/newsletter', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async unsubscribeNewsletter(email: string) {
    return this.request(`/newsletter?email=${encodeURIComponent(email)}`, {
      method: 'DELETE',
    })
  }

  async deleteNewsletterSubscriber(id: string) {
    return this.request(`/newsletter/${id}`, {
      method: 'DELETE',
    })
  }

  // Bookings
  async getBookings(params?: {
    status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
    date?: string
    limit?: number
    offset?: number
  }) {
    const query = new URLSearchParams()
    if (params?.status) query.append('status', params.status)
    if (params?.date) query.append('date', params.date)
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.offset) query.append('offset', params.offset.toString())
    const queryString = query.toString()
    return this.request(`/bookings${queryString ? `?${queryString}` : ''}`)
  }

  async getBooking(id: string) {
    return this.request(`/bookings/${id}`)
  }

  async createBooking(data: CreateBookingRequest) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateBooking(id: string, data: {
    status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
    name?: string
    email?: string
    mobile?: string
    date?: string
    time?: string
    numberOfPlayers?: number
    specialRequests?: string
  }) {
    return this.request(`/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteBooking(id: string) {
    return this.request(`/bookings/${id}`, {
      method: 'DELETE',
    })
  }

  // Pre-Bookings
  async getPreBookings(params?: {
    status?: 'pending' | 'confirmed' | 'cancelled'
    limit?: number
    offset?: number
  }) {
    const query = new URLSearchParams()
    if (params?.status) query.append('status', params.status)
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.offset) query.append('offset', params.offset.toString())
    const queryString = query.toString()
    return this.request(`/pre-bookings${queryString ? `?${queryString}` : ''}`)
  }

  async getPreBooking(id: string) {
    return this.request(`/pre-bookings/${id}`)
  }

  async createPreBooking(data: CreatePreBookingRequest) {
    return this.request('/pre-bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updatePreBooking(id: string, data: {
    status?: 'pending' | 'confirmed' | 'cancelled'
    name?: string
    email?: string
    mobile?: string
    preferredDate?: string
    preferredTime?: string
    numberOfPlayers?: number
    specialRequests?: string
  }) {
    return this.request(`/pre-bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deletePreBooking(id: string) {
    return this.request(`/pre-bookings/${id}`, {
      method: 'DELETE',
    })
  }

  // Health check
  async healthCheck() {
    return this.request('/health')
  }
}

export const apiClient = new ApiClient()
