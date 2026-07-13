import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      return errorResponse('Database not connected', 503)
    }
    const { error } = await supabase
      .from('beat_the_host_players')
      .delete()
      .eq('id', params.id)
    if (error) throw error
    return successResponse(null, 'Player removed')
  } catch (err) {
    console.error('Error removing player:', err)
    return errorResponse('Failed to remove player', 500)
  }
}
