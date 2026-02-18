import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response'
import { validateEmail } from '@/lib/validation'
import {
  getBeachBattleRegistration,
  updateBeachBattleRegistration,
  deleteBeachBattleRegistration,
} from '@/lib/firestore'

// GET /api/beach-battle/register/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const registration = await getBeachBattleRegistration(params.id)
    if (!registration) {
      return errorResponse('Registration not found', 404)
    }
    return successResponse(registration)
  } catch (error) {
    console.error('[beach-battle/register/id] GET Error:', error)
    return serverErrorResponse('Failed to fetch registration')
  }
}

// PATCH /api/beach-battle/register/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    if (body.email && !validateEmail(body.email)) {
      return errorResponse('Invalid email format')
    }

    if (body.phone) {
      const digitsOnly = body.phone.replace(/\D/g, '')
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        return errorResponse('Phone number must be between 7 and 15 digits')
      }
    }

    const registration = await updateBeachBattleRegistration(params.id, body)
    if (!registration) {
      return errorResponse('Registration not found', 404)
    }

    return successResponse(registration, 'Registration updated successfully')
  } catch (error: any) {
    console.error('[beach-battle/register/id] PATCH Error:', error)
    if (error.message) {
      return errorResponse(error.message, 400)
    }
    return serverErrorResponse('Failed to update registration')
  }
}

// DELETE /api/beach-battle/register/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const registration = await getBeachBattleRegistration(params.id)
    if (!registration) {
      return errorResponse('Registration not found', 404)
    }

    await deleteBeachBattleRegistration(params.id)
    return successResponse(null, 'Registration deleted successfully')
  } catch (error) {
    console.error('[beach-battle/register/id] DELETE Error:', error)
    return serverErrorResponse('Failed to delete registration')
  }
}
