import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response'
import { validateRequired, validateEmail, validateLength } from '@/lib/validation'
import { getContactMessages, createContactMessage } from '@/lib/firestore'
import type { ContactRequest } from '@/types/api'

// GET /api/contact - Get all contact messages (admin only - add auth later)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const read = searchParams.get('read')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const result = await getContactMessages({
      read: read !== null ? read === 'true' : undefined,
      limit,
      offset,
    })

    return successResponse({
      messages: result.messages,
      total: result.total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching contact messages:', error)
    return serverErrorResponse('Failed to fetch contact messages')
  }
}

// POST /api/contact - Submit a contact form
export async function POST(request: NextRequest) {
  try {
    const body: ContactRequest = await request.json()

    // Validation
    const nameError = validateRequired(body.name, 'Name')
    if (nameError) return errorResponse(nameError)

    const emailError = validateRequired(body.email, 'Email')
    if (emailError) return errorResponse(emailError)
    if (!validateEmail(body.email)) {
      return errorResponse('Invalid email format')
    }

    const messageError = validateRequired(body.message, 'Message')
    if (messageError) return errorResponse(messageError)

    // Trim message and validate length
    const trimmedMessage = body.message.trim()
    if (trimmedMessage.length < 5) {
      return errorResponse('Message must be at least 5 characters long')
    }
    if (trimmedMessage.length > 5000) {
      return errorResponse('Message must be at most 5000 characters long')
    }

    // Only include subject if it has a value
    const subject = body.subject?.trim() || undefined

    const contact = await createContactMessage({
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      message: trimmedMessage,
      subject: subject && subject.length > 0 ? subject : undefined,
    })

    if (!contact) {
      return serverErrorResponse('Failed to submit contact form')
    }

    return successResponse(contact, 'Message sent successfully', 201)
  } catch (error: any) {
    console.error('Error submitting contact form:', error)
    // Return more specific error if available
    if (error.message) {
      return errorResponse(error.message, 400)
    }
    return serverErrorResponse('Failed to submit contact form')
  }
}
