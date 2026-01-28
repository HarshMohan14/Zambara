import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api-response'
import { deleteScore } from '@/lib/firestore'

// DELETE /api/scores/[id] - Delete a score
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    await deleteScore(resolvedParams.id)
    return successResponse(null, 'Score deleted successfully')
  } catch (error) {
    console.error('Error deleting score:', error)
    return serverErrorResponse('Failed to delete score')
  }
}
