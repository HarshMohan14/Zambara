import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api-response'
import { deleteLeaderboardEntry } from '@/lib/firestore'

// DELETE /api/leaderboard/[id] - Delete a leaderboard entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    await deleteLeaderboardEntry(resolvedParams.id)
    return successResponse(null, 'Leaderboard entry deleted successfully')
  } catch (error) {
    console.error('Error deleting leaderboard entry:', error)
    return serverErrorResponse('Failed to delete leaderboard entry')
  }
}
