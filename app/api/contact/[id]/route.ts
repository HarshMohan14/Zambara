import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api-response'
import { deleteContactMessage, updateContactMessage } from '@/lib/firestore'

// PATCH /api/contact/[id] - Update contact message (mark as read/unread)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const body = await request.json()
    const message = await updateContactMessage(resolvedParams.id, body)
    return successResponse(message, 'Contact message updated successfully')
  } catch (error) {
    console.error('Error updating contact message:', error)
    return serverErrorResponse('Failed to update contact message')
  }
}

// DELETE /api/contact/[id] - Delete a contact message
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    await deleteContactMessage(resolvedParams.id)
    return successResponse(null, 'Contact message deleted successfully')
  } catch (error) {
    console.error('Error deleting contact message:', error)
    return serverErrorResponse('Failed to delete contact message')
  }
}
