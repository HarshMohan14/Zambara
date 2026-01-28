import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response'
import { validateEmail } from '@/lib/validation'
import { getEvent, updateEvent, deleteEvent } from '@/lib/firestore'

// GET /api/events/[id] - Get a specific event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await getEvent(params.id)
    if (!event) {
      return errorResponse('Event not found', 404)
    }
    return successResponse(event)
  } catch (error) {
    console.error('Error fetching event:', error)
    return serverErrorResponse('Failed to fetch event')
  }
}

// PATCH /api/events/[id] - Update an event
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Validate status if provided
    if (body.status) {
      const validStatuses = ['upcoming', 'ongoing', 'completed', 'cancelled']
      if (!validStatuses.includes(body.status)) {
        return errorResponse('Status must be one of: upcoming, ongoing, completed, cancelled')
      }
    }

    // Validate dates if provided
    if (body.startDate) {
      const startDateObj = new Date(body.startDate)
      if (isNaN(startDateObj.getTime())) {
        return errorResponse('Invalid start date format')
      }
    }

    if (body.endDate) {
      const endDateObj = new Date(body.endDate)
      if (isNaN(endDateObj.getTime())) {
        return errorResponse('Invalid end date format')
      }
      if (body.startDate) {
        const startDateObj = new Date(body.startDate)
        if (endDateObj < startDateObj) {
          return errorResponse('End date must be after start date')
        }
      }
    }

    // Validate maxParticipants if provided
    if (body.maxParticipants !== undefined && body.maxParticipants < 1) {
      return errorResponse('Max participants must be at least 1')
    }

    const event = await updateEvent(params.id, body)
    if (!event) {
      return errorResponse('Event not found', 404)
    }

    return successResponse(event, 'Event updated successfully')
  } catch (error: any) {
    console.error('Error updating event:', error)
    if (error.message) {
      return errorResponse(error.message, 400)
    }
    return serverErrorResponse('Failed to update event')
  }
}

// DELETE /api/events/[id] - Delete an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await getEvent(params.id)
    if (!event) {
      return errorResponse('Event not found', 404)
    }

    await deleteEvent(params.id)
    return successResponse(null, 'Event deleted successfully')
  } catch (error) {
    console.error('Error deleting event:', error)
    return serverErrorResponse('Failed to delete event')
  }
}
