import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api-response'
import { migrateBeachBattleGames } from '@/lib/firestore'

// POST /api/beach-battle/migrate — one-time migration for legacy game data
// Derives `players[]` from old `matchups[]` for games missing the players field
export async function POST() {
  try {
    const result = await migrateBeachBattleGames()
    return successResponse(result, `Migration complete: ${result.migrated} of ${result.total} games updated`)
  } catch (error) {
    console.error('[beach-battle/migrate] POST Error:', error)
    return serverErrorResponse('Migration failed')
  }
}
