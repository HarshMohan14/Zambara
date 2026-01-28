import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api-response'
import { deleteNewsletterSubscriber } from '@/lib/firestore'

// DELETE /api/newsletter/[id] - Delete a newsletter subscriber
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    await deleteNewsletterSubscriber(resolvedParams.id)
    return successResponse(null, 'Newsletter subscriber deleted successfully')
  } catch (error) {
    console.error('Error deleting newsletter subscriber:', error)
    return serverErrorResponse('Failed to delete newsletter subscriber')
  }
}
