import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response'
import { validateRequired, validateEmail, validateLength } from '@/lib/validation'
import { getBookings, createBooking } from '@/lib/firestore'
import type { CreateBookingRequest } from '@/types/api'

// GET /api/bookings - Get all bookings (admin only - add auth later)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as 'pending' | 'confirmed' | 'cancelled' | 'completed' | null
    const date = searchParams.get('date')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const result = await getBookings({
      status: status || undefined,
      date: date || undefined,
      limit,
      offset,
    })

    return successResponse({
      bookings: result.bookings,
      total: result.total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return serverErrorResponse('Failed to fetch bookings')
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body: CreateBookingRequest = await request.json()

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

    const dateError = validateRequired(body.date, 'Date')
    if (dateError) return errorResponse(dateError)
    
    // Validate date format (ISO date string)
    const dateObj = new Date(body.date)
    if (isNaN(dateObj.getTime())) {
      return errorResponse('Invalid date format')
    }

    const timeError = validateRequired(body.time, 'Time')
    if (timeError) return errorResponse(timeError)

    if (!body.numberOfPlayers || body.numberOfPlayers < 1) {
      return errorResponse('Number of players must be at least 1')
    }
    if (body.numberOfPlayers > 20) {
      return errorResponse('Number of players cannot exceed 20')
    }

    // Validate special requests length if provided
    if (body.specialRequests && body.specialRequests.length > 1000) {
      return errorResponse('Special requests must be at most 1000 characters long')
    }

    const booking = await createBooking({
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      mobile: body.mobile.trim(),
      date: body.date,
      time: body.time.trim(),
      numberOfPlayers: body.numberOfPlayers,
      specialRequests: body.specialRequests?.trim(),
    })

    if (!booking) {
      return serverErrorResponse('Failed to create booking')
    }

    return successResponse(booking, 'Booking created successfully', 201)
  } catch (error: any) {
    console.error('Error creating booking:', error)
    if (error.message) {
      return errorResponse(error.message, 400)
    }
    return serverErrorResponse('Failed to create booking')
  }
}
