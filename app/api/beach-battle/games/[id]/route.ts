import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response'
import {
  getBeachBattleGame,
  updateBeachBattleGame,
  startBeachBattleGame,
  endBeachBattleGame,
  deleteBeachBattleGame,
  updateBeachBattleMatchup,
  setBeachBattleZampion,
} from '@/lib/firestore'

// GET /api/beach-battle/games/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const game = await getBeachBattleGame(params.id)
    if (!game) return errorResponse('Game not found', 404)
    return successResponse(game)
  } catch (error) {
    console.error('[beach-battle/games/[id]] GET Error:', error)
    return serverErrorResponse('Failed to fetch game')
  }
}

// PATCH /api/beach-battle/games/[id]
// Supports: start, end, updateMatchup, setZampion, general update
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { action } = body

    let result

    switch (action) {
      case 'start':
        result = await startBeachBattleGame(params.id)
        break

      case 'end':
        result = await endBeachBattleGame(params.id, {
          warrior: body.warrior,
          warriorId: body.warriorId,
        })
        break

      case 'updateMatchup':
        if (body.matchupIndex === undefined) {
          return errorResponse('matchupIndex is required')
        }
        result = await updateBeachBattleMatchup(params.id, body.matchupIndex, {
          status: body.matchupStatus,
          winner: body.winner,
          winnerId: body.winnerId,
        })
        break

      case 'setZampion':
        if (!body.zampion || !body.zampionTribe || body.slotNumber === undefined) {
          return errorResponse('zampion, zampionTribe, and slotNumber are required')
        }
        await setBeachBattleZampion(body.slotNumber, {
          zampion: body.zampion,
          zampionId: body.zampionId,
          zampionTribe: body.zampionTribe,
        })
        result = await getBeachBattleGame(params.id)
        break

      default:
        // General update
        result = await updateBeachBattleGame(params.id, {
          status: body.status,
          matchups: body.matchups,
          warrior: body.warrior,
          warriorId: body.warriorId,
          zampion: body.zampion,
          zampionId: body.zampionId,
          zampionTribe: body.zampionTribe,
        })
    }

    if (!result) return errorResponse('Game not found', 404)
    return successResponse(result, 'Game updated successfully')
  } catch (error: any) {
    console.error('[beach-battle/games/[id]] PATCH Error:', error)
    return serverErrorResponse(error.message || 'Failed to update game')
  }
}

// DELETE /api/beach-battle/games/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const game = await getBeachBattleGame(params.id)
    if (!game) return errorResponse('Game not found', 404)
    await deleteBeachBattleGame(params.id)
    return successResponse(null, 'Game deleted successfully')
  } catch (error) {
    console.error('[beach-battle/games/[id]] DELETE Error:', error)
    return serverErrorResponse('Failed to delete game')
  }
}
