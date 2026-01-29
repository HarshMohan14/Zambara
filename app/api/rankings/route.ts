import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response'
import { getRankingsByEvent } from '@/lib/firestore'

// GET /api/rankings - Get rankings by event (time-based, lower = better)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const eventId = searchParams.get('eventId')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20')))

    if (!eventId || eventId.trim() === '') {
      return errorResponse('eventId is required', 400)
    }

    const offset = (page - 1) * pageSize
    const result = await getRankingsByEvent({
      eventId: eventId.trim(),
      limit: pageSize,
      offset,
    })

    return successResponse({
      rankings: result.rankings,
      total: result.total,
      event: result.event,
      page,
      pageSize,
      totalPages: Math.ceil(result.total / pageSize),
    })
  } catch (error) {
    console.error('Error fetching rankings:', error)
    return serverErrorResponse('Failed to fetch rankings')
  }
}
