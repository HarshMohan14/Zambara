import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api-response'
import { getBeachBattleTribeScorecard } from '@/lib/firestore'

// GET /api/beach-battle/scorecard — public endpoint for tribe scorecard
export async function GET() {
  try {
    const scorecard = await getBeachBattleTribeScorecard()
    return successResponse(scorecard)
  } catch (error) {
    console.error('[beach-battle/scorecard] GET Error:', error)
    return serverErrorResponse('Failed to fetch scorecard')
  }
}
