import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response'
import { validateEmail } from '@/lib/validation'
import { getBooking, updateBooking, deleteBooking } from '@/lib/firestore'

// GET /api/bookings/[id] - Get a specific booking
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await getBooking(params.id)
    if (!booking) {
      return errorResponse('Booking not found', 404)
    }
    return successResponse(booking)
  } catch (error) {
    console.error('Error fetching booking:', error)
    return serverErrorResponse('Failed to fetch booking')
  }
}

// PATCH /api/bookings/[id] - Update a booking
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Validate status if provided
    if (body.status) {
      const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed']
      if (!validStatuses.includes(body.status)) {
        return errorResponse('Status must be one of: pending, confirmed, cancelled, completed')
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

    // Validate date if provided
    if (body.date) {
      const dateObj = new Date(body.date)
      if (isNaN(dateObj.getTime())) {
        return errorResponse('Invalid date format')
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

    const booking = await updateBooking(params.id, body)
    if (!booking) {
      return errorResponse('Booking not found', 404)
    }

    return successResponse(booking, 'Booking updated successfully')
  } catch (error: any) {
    console.error('Error updating booking:', error)
    if (error.message) {
      return errorResponse(error.message, 400)
    }
    return serverErrorResponse('Failed to update booking')
  }
}

// DELETE /api/bookings/[id] - Delete a booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await getBooking(params.id)
    if (!booking) {
      return errorResponse('Booking not found', 404)
    }

    await deleteBooking(params.id)
    return successResponse(null, 'Booking deleted successfully')
  } catch (error) {
    console.error('Error deleting booking:', error)
    return serverErrorResponse('Failed to delete booking')
  }
}
