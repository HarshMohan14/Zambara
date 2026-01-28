import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response'
import { updateLeaderboard } from '@/lib/firestore'

// POST /api/leaderboard/update - Manually update leaderboard for a game
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gameId } = body

    if (!gameId) {
      return errorResponse('Game ID is required')
    }

    console.log(`[API] Manual leaderboard update requested for game ${gameId}`)
    
    const result = await updateLeaderboard(gameId)
    
    if (result.success) {
      return successResponse(
        {
          gameId: result.gameId,
          entriesUpdated: result.entriesUpdated,
          totalEntries: result.totalEntries,
        },
        `Leaderboard updated: ${result.entriesUpdated} entries`
      )
    } else {
      return errorResponse(result.message || 'Failed to update leaderboard')
    }
  } catch (error: any) {
    console.error('[API] Error updating leaderboard:', error)
    return errorResponse(
      error.message || 'Failed to update leaderboard',
      500
    )
  }
}
