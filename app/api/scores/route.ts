import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response'
import { validateRequired, validateNumber } from '@/lib/validation'
import { getScores, createScore, getGameById } from '@/lib/firestore'
import type { SubmitScoreRequest } from '@/types/api'

// GET /api/scores - Get scores with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const playerName = searchParams.get('playerName')
    const gameId = searchParams.get('gameId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const orderBy = searchParams.get('orderBy') || 'score'
    const order = searchParams.get('order') || 'desc'

    const result = await getScores({
      playerName: playerName || undefined,
      gameId: gameId || undefined,
      limit,
      offset,
      orderBy,
      order: order as 'asc' | 'desc',
    })

    return successResponse({
      scores: result.scores,
      total: result.total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching scores:', error)
    return serverErrorResponse('Failed to fetch scores')
  }
}

// POST /api/scores - Submit a new score
export async function POST(request: NextRequest) {
  try {
    const body: SubmitScoreRequest = await request.json()

    // Validation
    const playerNameError = validateRequired(body.playerName, 'Player Name')
    if (playerNameError) return errorResponse(playerNameError)

    const gameIdError = validateRequired(body.gameId, 'Game ID')
    if (gameIdError) return errorResponse(gameIdError)

    const scoreError = validateNumber(body.score, 0, undefined, 'Score')
    if (scoreError) return errorResponse(scoreError)

    if (body.time !== undefined) {
      const timeError = validateNumber(body.time, 0, undefined, 'Time')
      if (timeError) return errorResponse(timeError)
    }

    // Verify game exists
    const game = await getGameById(body.gameId)

    if (!game) {
      return errorResponse('Game not found', 404)
    }

    if (!game.isActive) {
      return errorResponse('Game is not active', 400)
    }

    // Create score
    const score = await createScore({
      playerName: body.playerName,
      gameId: body.gameId,
      score: body.score,
      time: body.time,
    })

    if (!score) {
      return serverErrorResponse('Failed to submit score')
    }

    // Fetch with game details
    const scoreWithDetails = {
      ...score,
      game: {
        id: game.id,
        name: game.name,
      },
    }

    return successResponse(scoreWithDetails, 'Score submitted successfully', 201)
  } catch (error) {
    console.error('Error submitting score:', error)
    return serverErrorResponse('Failed to submit score')
  }
}
