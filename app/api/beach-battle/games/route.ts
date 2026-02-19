import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response'
import {
  getBeachBattleGames,
  createBeachBattleGame,
} from '@/lib/firestore'

// GET /api/beach-battle/games — list games with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tribe = searchParams.get('tribe') || undefined
    const status = searchParams.get('status') || undefined
    const slotNumber = searchParams.get('slotNumber')
      ? parseInt(searchParams.get('slotNumber')!)
      : undefined
    const limitVal = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const result = await getBeachBattleGames({
      tribe,
      status,
      slotNumber,
      limit: limitVal,
      offset,
    })

    return successResponse({
      games: result.games,
      total: result.total,
      limit: limitVal,
      offset,
    })
  } catch (error) {
    console.error('[beach-battle/games] GET Error:', error)
    return serverErrorResponse('Failed to fetch games')
  }
}

// POST /api/beach-battle/games — create a new game
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.tribe || !['Lava', 'Rain', 'Wind', 'Mountain'].includes(body.tribe)) {
      return errorResponse('Valid tribe is required (Lava, Rain, Wind, Mountain)')
    }
    if (body.slotNumber === undefined || typeof body.slotNumber !== 'number') {
      return errorResponse('Slot number is required')
    }
    if (!body.players || !Array.isArray(body.players) || body.players.length === 0) {
      return errorResponse('Players array is required')
    }

    const game = await createBeachBattleGame({
      slotNumber: body.slotNumber,
      tribe: body.tribe,
      players: body.players,
      matchups: body.matchups || [],
    })

    if (!game) {
      return serverErrorResponse('Failed to create game')
    }

    return successResponse(game, 'Game created successfully!', 201)
  } catch (error: any) {
    console.error('[beach-battle/games] POST Error:', error)
    return serverErrorResponse(error.message || 'Failed to create game')
  }
}
