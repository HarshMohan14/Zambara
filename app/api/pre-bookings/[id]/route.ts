import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response'
import { validateEmail } from '@/lib/validation'
import { getPreBooking, updatePreBooking, deletePreBooking } from '@/lib/firestore'

// GET /api/pre-bookings/[id] - Get a specific pre-booking
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const preBooking = await getPreBooking(params.id)
    if (!preBooking) {
      return errorResponse('Pre-booking not found', 404)
    }
    return successResponse(preBooking)
  } catch (error) {
    console.error('Error fetching pre-booking:', error)
    return serverErrorResponse('Failed to fetch pre-booking')
  }
}

// PATCH /api/pre-bookings/[id] - Update a pre-booking
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Validate status if provided
    if (body.status) {
      const validStatuses = ['pending', 'confirmed', 'cancelled']
      if (!validStatuses.includes(body.status)) {
        return errorResponse('Status must be one of: pending, confirmed, cancelled')
      }
    }

    // Validate email if provided
    if (body.email && !validateEmail(body.email)) {
      return errorResponse('Invalid email format')
    }

    // Validate mobile if provided
    if (body.mobile && !body.mobile.match(/^[0-9]{10,15}$/)) {
      return errorResponse('Mobile number must be 10-15 digits')
    }

    // Validate preferred date if provided
    if (body.preferredDate !== undefined && body.preferredDate) {
      const dateObj = new Date(body.preferredDate)
      if (isNaN(dateObj.getTime())) {
        return errorResponse('Invalid preferred date format')
      }
    }

    // Validate numberOfPlayers if provided
    if (body.numberOfPlayers !== undefined) {
      if (body.numberOfPlayers < 1) {
        return errorResponse('Number of players must be at least 1')
      }
      if (body.numberOfPlayers > 20) {
        return errorResponse('Number of players cannot exceed 20')
      }
    }

    // Validate special requests length if provided
    if (body.specialRequests !== undefined && body.specialRequests.length > 1000) {
      return errorResponse('Special requests must be at most 1000 characters long')
    }

    const preBooking = await updatePreBooking(params.id, body)
    if (!preBooking) {
      return errorResponse('Pre-booking not found', 404)
    }

    return successResponse(preBooking, 'Pre-booking updated successfully')
  } catch (error: any) {
    console.error('Error updating pre-booking:', error)
    if (error.message) {
      return errorResponse(error.message, 400)
    }
    return serverErrorResponse('Failed to update pre-booking')
  }
}

// DELETE /api/pre-bookings/[id] - Delete a pre-booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const preBooking = await getPreBooking(params.id)
    if (!preBooking) {
      return errorResponse('Pre-booking not found', 404)
    }

    await deletePreBooking(params.id)
    return successResponse(null, 'Pre-booking deleted successfully')
  } catch (error) {
    console.error('Error deleting pre-booking:', error)
    return serverErrorResponse('Failed to delete pre-booking')
  }
}
