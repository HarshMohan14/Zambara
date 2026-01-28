import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response'
import { validateRequired, validateEmail } from '@/lib/validation'
import {
  getNewsletterSubscribers,
  subscribeNewsletter,
  unsubscribeNewsletter,
} from '@/lib/firestore'
import type { NewsletterRequest } from '@/types/api'

// GET /api/newsletter - Get all newsletter subscribers (admin only - add auth later)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const subscribed = searchParams.get('subscribed')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const result = await getNewsletterSubscribers({
      subscribed: subscribed !== null ? subscribed === 'true' : undefined,
      limit,
      offset,
    })

    return successResponse({
      subscribers: result.subscribers,
      total: result.total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error)
    return serverErrorResponse('Failed to fetch newsletter subscribers')
  }
}

// POST /api/newsletter - Subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    const body: NewsletterRequest = await request.json()

    // Validation
    const emailError = validateRequired(body.email, 'Email')
    if (emailError) return errorResponse(emailError)
    if (!validateEmail(body.email)) {
      return errorResponse('Invalid email format')
    }

    try {
      const subscriber = await subscribeNewsletter(body.email)
      return successResponse(
        subscriber,
        'Successfully subscribed to newsletter',
        201
      )
    } catch (error: any) {
      if (error.message === 'Email is already subscribed') {
        return errorResponse(error.message, 409)
      }
      throw error
    }
  } catch (error: any) {
    console.error('Error subscribing to newsletter:', error)
    if (error.message === 'Email is already subscribed') {
      return errorResponse(error.message, 409)
    }
    return serverErrorResponse('Failed to subscribe to newsletter')
  }
}

// DELETE /api/newsletter - Unsubscribe from newsletter
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')

    if (!email) {
      return errorResponse('Email is required')
    }

    if (!validateEmail(email)) {
      return errorResponse('Invalid email format')
    }

    try {
      await unsubscribeNewsletter(email)
      return successResponse(null, 'Successfully unsubscribed from newsletter')
    } catch (error: any) {
      if (error.message === 'Email not found in newsletter list') {
        return errorResponse(error.message, 404)
      }
      throw error
    }
  } catch (error: any) {
    console.error('Error unsubscribing from newsletter:', error)
    if (error.message === 'Email not found in newsletter list') {
      return errorResponse(error.message, 404)
    }
    return serverErrorResponse('Failed to unsubscribe from newsletter')
  }
}
