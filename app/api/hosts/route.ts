import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response'
import { validateRequired, validateEmail } from '@/lib/validation'
import { getHosts, createHost } from '@/lib/firestore'
import type { CreateHostRequest } from '@/types/api'

// GET /api/hosts - Get all hosts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as 'active' | 'inactive' | null
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const result = await getHosts({
      status: status || undefined,
      limit,
      offset,
    })

    return successResponse({
      hosts: result.hosts,
      total: result.total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching hosts:', error)
    return serverErrorResponse('Failed to fetch hosts')
  }
}

// POST /api/hosts - Create a new host
export async function POST(request: NextRequest) {
  try {
    const body: CreateHostRequest = await request.json()

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

    // Validate status if provided
    if (body.status) {
      const validStatuses = ['active', 'inactive']
      if (!validStatuses.includes(body.status)) {
        return errorResponse('Status must be one of: active, inactive')
      }
    }

    const host = await createHost({
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      mobile: body.mobile.trim(),
      bio: body.bio?.trim(),
      image: body.image?.trim(),
      status: body.status,
    })

    if (!host) {
      return serverErrorResponse('Failed to create host')
    }

    return successResponse(host, 'Host created successfully', 201)
  } catch (error: any) {
    console.error('Error creating host:', error)
    if (error.message) {
      return errorResponse(error.message, 400)
    }
    return serverErrorResponse('Failed to create host')
  }
}
