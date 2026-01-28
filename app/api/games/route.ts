import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response'
import { validateRequired } from '@/lib/validation'
import { getGames, createGame } from '@/lib/firestore'
import type { CreateGameRequest } from '@/types/api'

// GET /api/games - Get all games
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const difficulty = searchParams.get('difficulty')
    const status = searchParams.get('status') as 'running' | 'completed' | null
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const result = await getGames({
      difficulty: difficulty || undefined,
      status: status || undefined,
      limit,
      offset,
    })

    return successResponse({
      games: result.games,
      total: result.total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching games:', error)
    return serverErrorResponse('Failed to fetch games')
  }
}

// POST /api/games - Create a new game
export async function POST(request: NextRequest) {
  try {
    const body: CreateGameRequest = await request.json()

    // Validation
    const eventIdError = validateRequired(body.eventId, 'Event')
    if (eventIdError) return errorResponse(eventIdError)

    const hostIdError = validateRequired(body.hostId, 'Host')
    if (hostIdError) return errorResponse(hostIdError)

    // Validate players
    if (!body.players || !Array.isArray(body.players)) {
      return errorResponse('Players must be an array')
    }

    if (body.players.length < 3 || body.players.length > 6) {
      return errorResponse('Players must be between 3 and 6')
    }

    // Validate player structure (support both old string format and new object format)
    const validatedPlayers = []
    for (let i = 0; i < body.players.length; i++) {
      const player = body.players[i]
      
      // Legacy support: if it's a string, convert to object
      if (typeof player === 'string') {
        const playerStr = player as string
        if (playerStr.trim().length === 0) {
          return errorResponse(`Player ${i + 1} name is required`)
        }
        validatedPlayers.push({
          name: playerStr.trim(),
          mobile: '', // Empty mobile for legacy data
        })
      } else if (typeof player === 'object' && player !== null) {
        // New format: object with name and mobile
        if (!player.name || typeof player.name !== 'string' || player.name.trim().length === 0) {
          return errorResponse(`Player ${i + 1} name is required`)
        }
        if (!player.mobile || typeof player.mobile !== 'string' || player.mobile.trim().length === 0) {
          return errorResponse(`Player ${i + 1} mobile number is required`)
        }
        // Validate mobile format (10-15 digits)
        if (!player.mobile.match(/^[0-9]{10,15}$/)) {
          return errorResponse(`Player ${i + 1} mobile number must be 10-15 digits`)
        }
        validatedPlayers.push({
          name: player.name.trim(),
          mobile: player.mobile.trim(),
        })
      } else {
        return errorResponse(`Player ${i + 1} must be an object with name and mobile`)
      }
    }

    const game = await createGame({
      players: validatedPlayers,
      eventId: body.eventId,
      hostId: body.hostId,
    })

    if (!game) {
      return serverErrorResponse('Failed to create game')
    }

    return successResponse(game, 'Game created successfully', 201)
  } catch (error) {
    console.error('Error creating game:', error)
    return serverErrorResponse('Failed to create game')
  }
}
