import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('beat_the_host_players')
      .delete()
      .eq('id', params.id)
    if (error) throw error
    return successResponse(null, 'Player removed')
  } catch {
    return serverErrorResponse('Failed to remove player')
  }
}
