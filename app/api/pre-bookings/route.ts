import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response'
import { validateRequired, validateEmail } from '@/lib/validation'
import { getPreBookings, createPreBooking } from '@/lib/firestore'
import type { CreatePreBookingRequest } from '@/types/api'

// GET /api/pre-bookings - Get all pre-bookings (admin only - add auth later)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as 'pending' | 'confirmed' | 'cancelled' | null
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const result = await getPreBookings({
      status: status || undefined,
      limit,
      offset,
    })

    return successResponse({
      preBookings: result.preBookings,
      total: result.total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching pre-bookings:', error)
    return serverErrorResponse('Failed to fetch pre-bookings')
  }
}

// POST /api/pre-bookings - Create a new pre-booking
export async function POST(request: NextRequest) {
  try {
    const body: CreatePreBookingRequest = await request.json()

    // Validation
    const nameError = validateRequired(body.name, 'Name')
    if (nameError) return errorResponse(nameError)

    const emailError = validateRequired(body.email, 'Email')
    if (emailError) return errorResponse(emailError)
    if (!validateEmail(body.email)) {
      return errorResponse('Invalid email format')
    }

    const mobileError = validateRequired(body.mobile, 'Mobile')
    if (mobileError) return errorResponse(mobileError)
    if (!body.mobile.match(/^[0-9]{10,15}$/)) {
      return errorResponse('Mobile number must be 10-15 digits')
    }

    if (!body.numberOfPlayers || body.numberOfPlayers < 1) {
      return errorResponse('Number of players must be at least 1')
    }
    if (body.numberOfPlayers > 20) {
      return errorResponse('Number of players cannot exceed 20')
    }

    // Validate preferred date if provided
    if (body.preferredDate) {
      const dateObj = new Date(body.preferredDate)
      if (isNaN(dateObj.getTime())) {
        return errorResponse('Invalid preferred date format')
      }
    }

    // Validate special requests length if provided
    if (body.specialRequests && body.specialRequests.length > 1000) {
      return errorResponse('Special requests must be at most 1000 characters long')
    }

    const preBooking = await createPreBooking({
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      mobile: body.mobile.trim(),
      preferredDate: body.preferredDate,
      preferredTime: body.preferredTime?.trim(),
      numberOfPlayers: body.numberOfPlayers,
      specialRequests: body.specialRequests?.trim(),
      status: body.status,
    })

    if (!preBooking) {
      return serverErrorResponse('Failed to create pre-booking')
    }

    return successResponse(preBooking, 'Pre-booking created successfully', 201)
  } catch (error: any) {
    console.error('Error creating pre-booking:', error)
    if (error.message) {
      return errorResponse(error.message, 400)
    }
    return serverErrorResponse('Failed to create pre-booking')
  }
}
