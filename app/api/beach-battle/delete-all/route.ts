import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api-response'
import {
  deleteAllBeachBattleGames,
  deleteAllBeachBattleRegistrations,
} from '@/lib/firestore'

// DELETE /api/beach-battle/delete-all — wipe all beach battle games and registrations
export async function DELETE() {
  try {
    const [gamesResult, regsResult] = await Promise.all([
      deleteAllBeachBattleGames(),
      deleteAllBeachBattleRegistrations(),
    ])

    return successResponse(
      {
        gamesDeleted: gamesResult.deleted,
        registrationsDeleted: regsResult.deleted,
      },
      `Deleted ${gamesResult.deleted} games and ${regsResult.deleted} registrations`
    )
  } catch (error) {
    console.error('[beach-battle/delete-all] Error:', error)
    return serverErrorResponse('Failed to delete beach battle data')
  }
}
