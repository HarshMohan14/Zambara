import { NextRequest } from 'next/server'
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api-response'
import { getLeaderboard } from '@/lib/firestore'

// GET /api/leaderboard - Get leaderboard
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const gameId = searchParams.get('gameId')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    const excludeDeleted = searchParams.get('excludeDeleted') !== 'false' // Default to true for public API

    console.log('[API Leaderboard] Request params:', { gameId, limit, offset, excludeDeleted })

    const result = await getLeaderboard({
      gameId: gameId || undefined,
      limit,
      offset,
      excludeDeletedGames: excludeDeleted, // Exclude deleted games by default for public API
    })

    console.log('[API Leaderboard] Result:', {
      entriesCount: result.leaderboard?.length || 0,
      total: result.total,
    })

    return successResponse({
      leaderboard: result.leaderboard || [],
      total: result.total || 0,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error('[API Leaderboard] Error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
    })
    return serverErrorResponse('Failed to fetch leaderboard')
  }
}
