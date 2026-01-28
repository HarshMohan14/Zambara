import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response'
import { validateEmail } from '@/lib/validation'
import { getHost, updateHost, deleteHost } from '@/lib/firestore'

// GET /api/hosts/[id] - Get a specific host
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const host = await getHost(params.id)
    if (!host) {
      return errorResponse('Host not found', 404)
    }
    return successResponse(host)
  } catch (error) {
    console.error('Error fetching host:', error)
    return serverErrorResponse('Failed to fetch host')
  }
}

// PATCH /api/hosts/[id] - Update a host
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Validate email if provided
    if (body.email && !validateEmail(body.email)) {
      return errorResponse('Invalid email format')
    }

    // Validate mobile if provided
    if (body.mobile && !body.mobile.match(/^[0-9]{10,15}$/)) {
      return errorResponse('Mobile number must be 10-15 digits')
    }

    // Validate status if provided
    if (body.status) {
      const validStatuses = ['active', 'inactive']
      if (!validStatuses.includes(body.status)) {
        return errorResponse('Status must be one of: active, inactive')
      }
    }

    const host = await updateHost(params.id, body)
    if (!host) {
      return errorResponse('Host not found', 404)
    }

    return successResponse(host, 'Host updated successfully')
  } catch (error: any) {
    console.error('Error updating host:', error)
    if (error.message) {
      return errorResponse(error.message, 400)
    }
    return serverErrorResponse('Failed to update host')
  }
}

// DELETE /api/hosts/[id] - Delete a host
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const host = await getHost(params.id)
    if (!host) {
      return errorResponse('Host not found', 404)
    }

    await deleteHost(params.id)
    return successResponse(null, 'Host deleted successfully')
  } catch (error) {
    console.error('Error deleting host:', error)
    return serverErrorResponse('Failed to delete host')
  }
}
