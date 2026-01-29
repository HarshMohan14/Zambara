import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api-response'
import { getGameById, updateGame, deleteGame, completeGame } from '@/lib/firestore'
import type { CreateGameRequest, UpdateGameRequest, CompleteGameRequest } from '@/types/api'

// GET /api/games/[id] - Get game by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const game = await getGameById(resolvedParams.id)

    if (!game) {
      return notFoundResponse('Game')
    }

    return successResponse(game)
  } catch (error) {
    console.error('Error fetching game:', error)
    return serverErrorResponse('Failed to fetch game')
  }
}

// PATCH /api/games/[id] - Update game or complete game
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const body: Partial<CreateGameRequest> | CompleteGameRequest = await request.json()

    // Check if this is a complete game request
    if ('winner' in body) {
      const completeBody = body as CompleteGameRequest
      
      if (!completeBody.winner) {
        return errorResponse('Winner is required')
      }

      try {
        const game = await completeGame(resolvedParams.id, completeBody.winner)
        return successResponse(game, 'Game completed successfully')
      } catch (error: any) {
        if (error.message === 'Game not found') {
          return notFoundResponse('Game')
        }
        if (error.message === 'Game is already completed') {
          return errorResponse(error.message, 400)
        }
        if (error.message === 'Game start time not found') {
          return errorResponse(error.message, 400)
        }
        throw error
      }
    }

    // Regular update
    const updateBody = body as UpdateGameRequest

    if (updateBody.difficulty) {
      const validDifficulties = ['easy', 'medium', 'hard']
      if (!validDifficulties.includes(updateBody.difficulty)) {
        return errorResponse('Difficulty must be one of: easy, medium, hard')
      }
    }

    const game = await updateGame(resolvedParams.id, {
      ...(updateBody.name && { name: updateBody.name }),
      ...(updateBody.description !== undefined && { description: updateBody.description }),
      ...(updateBody.difficulty && { difficulty: updateBody.difficulty }),
    })

    if (!game) {
      return notFoundResponse('Game')
    }

    return successResponse(game, 'Game updated successfully')
  } catch (error: any) {
    console.error('Error updating game:', error)
    if (error.message) {
      return errorResponse(error.message, 500)
    }
    return serverErrorResponse('Failed to update game')
  }
}

// DELETE /api/games/[id] - Delete game
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const game = await getGameById(resolvedParams.id)
    if (!game) {
      return notFoundResponse('Game')
    }

    await deleteGame(resolvedParams.id)
    return successResponse(null, 'Game deleted successfully')
  } catch (error) {
    console.error('Error deleting game:', error)
    return serverErrorResponse('Failed to delete game')
  }
}
