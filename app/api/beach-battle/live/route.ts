import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api-response'
import { getLiveBeachBattleGames, getCompletedBeachBattleGames, getBeachBattleGames } from '@/lib/firestore'

// GET /api/beach-battle/live — public endpoint for pending + live + completed games
export async function GET() {
  try {
    const [pendingResult, live, completed] = await Promise.all([
      getBeachBattleGames({ status: 'pending' }),
      getLiveBeachBattleGames(),
      getCompletedBeachBattleGames(),
    ])
    return successResponse({ pending: pendingResult.games, live, completed })
  } catch (error) {
    console.error('[beach-battle/live] GET Error:', error)
    return serverErrorResponse('Failed to fetch live data')
  }
}
