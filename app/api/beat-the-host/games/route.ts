import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      return successResponse({ games: [], total: 0 })
    }
    const status = request.nextUrl.searchParams.get('status') || undefined
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '100')

    let query = supabase
      .from('beat_the_host_games')
      .select('*, beat_the_host_game_players(id, player_id, player_name)')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) throw error
    return successResponse({ games: data || [], total: data?.length || 0 })
  } catch (err) {
    console.error('Error fetching games:', err)
    return successResponse({ games: [], total: 0 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      return errorResponse('Database not connected', 503)
    }
    const body = await request.json()
    if (!Array.isArray(body.playerIds) || body.playerIds.length < 1) {
      return errorResponse('At least 1 player is required')
    }

    const { data: players, error: pErr } = await supabase
      .from('beat_the_host_players')
      .select('id, name')
      .in('id', body.playerIds)
    if (pErr) throw pErr
    if (!players?.length) return errorResponse('No valid players found')

    const { data: game, error: gErr } = await supabase
      .from('beat_the_host_games')
      .insert({ status: 'live', started_at: new Date().toISOString() })
      .select()
      .single()
    if (gErr) throw gErr

    const { error: linkErr } = await supabase
      .from('beat_the_host_game_players')
      .insert(players.map((p: any) => ({ game_id: game.id, player_id: p.id, player_name: p.name })))
    if (linkErr) throw linkErr

    await supabase
      .from('beat_the_host_players')
      .update({ status: 'in_game', updated_at: new Date().toISOString() })
      .in('id', body.playerIds)

    return successResponse(game, 'Game started!', 201)
  } catch (err) {
    console.error('Error starting game:', err)
    return errorResponse('Failed to start game', 500)
  }
}
