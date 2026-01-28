import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api-response'
import { validateRequired } from '@/lib/validation'
import {
  getBraceletById,
  assignBracelet,
  userBraceletsCollection,
  convertTimestamps,
} from '@/lib/firestore'
import { query, where, limit, getDocs, orderBy } from 'firebase/firestore'

// POST /api/bracelets/[id]/users - Assign bracelet to player
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { playerName } = body

    const playerNameError = validateRequired(playerName, 'Player Name')
    if (playerNameError) return errorResponse(playerNameError)

    // Verify bracelet exists
    const bracelet = await getBraceletById(params.id)
    if (!bracelet) {
      return notFoundResponse('Bracelet')
    }

    try {
      const playerBracelet = await assignBracelet(params.id, playerName)
      return successResponse(playerBracelet, 'Bracelet assigned successfully', 201)
    } catch (error: any) {
      if (error.message === 'Player already has this bracelet') {
        return errorResponse(error.message, 409)
      }
      throw error
    }
  } catch (error: any) {
    console.error('Error assigning bracelet:', error)
    if (error.message === 'Player already has this bracelet') {
      return errorResponse(error.message, 409)
    }
    return serverErrorResponse('Failed to assign bracelet')
  }
}

// GET /api/bracelets/[id]/users - Get players who have this bracelet
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limitParam = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const bracelet = await getBraceletById(params.id)
    if (!bracelet) {
      return notFoundResponse('Bracelet')
    }

    const q = query(
      userBraceletsCollection,
      where('braceletId', '==', params.id),
      orderBy('earnedAt', 'desc'),
      limit(limitParam + offset)
    )
    
    const querySnapshot = await getDocs(q)
    const playerBracelets = querySnapshot.docs.slice(offset).map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...convertTimestamps(data),
        playerName: data.playerName,
      }
    })

    const total = querySnapshot.size

    return successResponse({
      players: playerBracelets,
      total,
      limit: limitParam,
      offset,
    })
  } catch (error) {
    console.error('Error fetching bracelet players:', error)
    return serverErrorResponse('Failed to fetch bracelet players')
  }
}
