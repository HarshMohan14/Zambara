import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      return errorResponse('Database not connected', 503)
    }
    const body = await request.json()
    if (body.action !== 'end') return errorResponse('Invalid action')
    if (!body.winnerId || !body.winnerName) return errorResponse('Winner required')

    const { data: game, error: fetchErr } = await supabase
      .from('beat_the_host_games')
      .select('started_at')
      .eq('id', params.id)
      .single()
    if (fetchErr || !game) return errorResponse('Game not found', 404)

    const endedAt = new Date()
    const durationSeconds = Math.round((endedAt.getTime() - new Date(game.started_at).getTime()) / 1000)

    const { data: updated, error: updErr } = await supabase
      .from('beat_the_host_games')
      .update({ status: 'completed', ended_at: endedAt.toISOString(), duration_seconds: durationSeconds, winner_id: body.winnerId, winner_name: body.winnerName })
      .eq('id', params.id)
      .select()
      .single()
    if (updErr) throw updErr

    const { data: gps } = await supabase
      .from('beat_the_host_game_players')
      .select('player_id')
      .eq('game_id', params.id)
    if (gps?.length) {
      await supabase
        .from('beat_the_host_players')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .in('id', gps.map((g: any) => g.player_id))
    }

    return successResponse(updated, 'Game ended!')
  } catch (err) {
    console.error('Error ending game:', err)
    return errorResponse('Failed to end game', 500)
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      return errorResponse('Database not connected', 503)
    }
    const { data: gps } = await supabase
      .from('beat_the_host_game_players')
      .select('player_id')
      .eq('game_id', params.id)

    const { error } = await supabase.from('beat_the_host_games').delete().eq('id', params.id)
    if (error) throw error

    if (gps?.length) {
      await supabase
        .from('beat_the_host_players')
        .update({ status: 'queued', updated_at: new Date().toISOString() })
        .in('id', gps.map((g: any) => g.player_id))
    }
    return successResponse(null, 'Game deleted')
  } catch (err) {
    console.error('Error deleting game:', err)
    return errorResponse('Failed to delete game', 500)
  }
}
