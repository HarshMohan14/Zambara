import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response'
import { checkGameLeaderboardStatus } from '@/lib/firestore'

// GET /api/leaderboard/status - Check if a game has leaderboard entries
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const gameId = searchParams.get('gameId')

    if (!gameId) {
      return errorResponse('Game ID is required')
    }

    const status = await checkGameLeaderboardStatus(gameId)

    return successResponse(status)
  } catch (error: any) {
    console.error('Error checking leaderboard status:', error)
    return serverErrorResponse('Failed to check leaderboard status')
  }
}
