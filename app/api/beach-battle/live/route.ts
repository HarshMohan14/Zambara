import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api-response'
import { getLiveBeachBattleGames, getCompletedBeachBattleGames } from '@/lib/firestore'

// GET /api/beach-battle/live — public endpoint for live arena + completed games
export async function GET() {
  try {
    const [live, completed] = await Promise.all([
      getLiveBeachBattleGames(),
      getCompletedBeachBattleGames(),
    ])
    return successResponse({ live, completed })
  } catch (error) {
    console.error('[beach-battle/live] GET Error:', error)
    return serverErrorResponse('Failed to fetch live data')
  }
}
