import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response'
import { validateRequired, validateEmail } from '@/lib/validation'
import { getEvents, createEvent } from '@/lib/firestore'
import type { CreateEventRequest } from '@/types/api'

// GET /api/events - Get all events
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | null
    const hostId = searchParams.get('hostId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const result = await getEvents({
      status: status || undefined,
      hostId: hostId || undefined,
      limit,
      offset,
    })

    return successResponse({
      events: result.events,
      total: result.total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return serverErrorResponse('Failed to fetch events')
  }
}

// POST /api/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    const body: CreateEventRequest = await request.json()

    // Validation
    const nameError = validateRequired(body.name, 'Name')
    if (nameError) return errorResponse(nameError)

    const dateError = validateRequired(body.startDate, 'Start Date')
    if (dateError) return errorResponse(dateError)
    
    // Validate date format
    const startDateObj = new Date(body.startDate)
    if (isNaN(startDateObj.getTime())) {
      return errorResponse('Invalid start date format')
    }

    // Validate end date if provided
    if (body.endDate) {
      const endDateObj = new Date(body.endDate)
      if (isNaN(endDateObj.getTime())) {
        return errorResponse('Invalid end date format')
      }
      if (endDateObj < startDateObj) {
        return errorResponse('End date must be after start date')
      }
    }

    // Validate status if provided
    if (body.status) {
      const validStatuses = ['upcoming', 'ongoing', 'completed', 'cancelled']
      if (!validStatuses.includes(body.status)) {
        return errorResponse('Status must be one of: upcoming, ongoing, completed, cancelled')
      }
    }

    // Validate maxParticipants if provided
    if (body.maxParticipants !== undefined && body.maxParticipants < 1) {
      return errorResponse('Max participants must be at least 1')
    }

    const event = await createEvent({
      name: body.name.trim(),
      description: body.description?.trim(),
      startDate: body.startDate,
      endDate: body.endDate,
      location: body.location?.trim(),
      hostId: body.hostId?.trim(),
      status: body.status,
      maxParticipants: body.maxParticipants,
      image: body.image?.trim(),
    })

    if (!event) {
      return serverErrorResponse('Failed to create event')
    }

    return successResponse(event, 'Event created successfully', 201)
  } catch (error: any) {
    console.error('Error creating event:', error)
    if (error.message) {
      return errorResponse(error.message, 400)
    }
    return serverErrorResponse('Failed to create event')
  }
}
