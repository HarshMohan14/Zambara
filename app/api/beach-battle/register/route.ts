import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response'
import { validateRequired, validateEmail } from '@/lib/validation'
import { createBeachBattleRegistration, getBeachBattleRegistrations } from '@/lib/firestore'

// GET /api/beach-battle/register — list all registrations
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limitVal = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const result = await getBeachBattleRegistrations({ limit: limitVal, offset })
    return successResponse({
      registrations: result.registrations,
      total: result.total,
      limit: limitVal,
      offset,
    })
  } catch (error) {
    console.error('[beach-battle/register] GET Error:', error)
    return serverErrorResponse('Failed to fetch registrations')
  }
}

// POST /api/beach-battle/register
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation
    const nameError = validateRequired(body.name, 'Name')
    if (nameError) return errorResponse(nameError)

    const emailError = validateRequired(body.email, 'Email')
    if (emailError) return errorResponse(emailError)
    if (!validateEmail(body.email)) {
      return errorResponse('Invalid email format')
    }

    const phoneError = validateRequired(body.phone, 'Phone number')
    if (phoneError) return errorResponse(phoneError)

    // Basic phone validation — at least 7 digits
    const digitsOnly = body.phone.replace(/\D/g, '')
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      return errorResponse('Phone number must be between 7 and 15 digits')
    }

    const registration = await createBeachBattleRegistration({
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(),
    })

    if (!registration) {
      return serverErrorResponse('Failed to register. Please try again.')
    }

    return successResponse(registration, 'Registered successfully!', 201)
  } catch (error: any) {
    console.error('[beach-battle/register] Error:', error)
    if (error.message) {
      return errorResponse(error.message, 400)
    }
    return serverErrorResponse('Failed to register. Please try again.')
  }
}
