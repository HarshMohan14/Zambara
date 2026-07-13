import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response'

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      return successResponse({ players: [], total: 0 })
    }
    const { data, error } = await supabase
      .from('beat_the_host_players')
      .select('*')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
    if (error) throw error
    return successResponse({ players: data || [], total: data?.length || 0 })
  } catch (err: any) {
    console.error('Error fetching queue:', err)
    return successResponse({ players: [], total: 0 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      return errorResponse('Database not connected', 503)
    }
    const body = await request.json()
    if (!body.name?.trim()) return errorResponse('Name is required')
    if (!body.phone?.trim()) return errorResponse('Phone number is required')

    const { data, error } = await supabase
      .from('beat_the_host_players')
      .insert({ name: body.name.trim(), phone: body.phone.trim(), status: 'queued' })
      .select()
      .single()
    if (error) throw error
    return successResponse(data, 'Player added to queue', 201)
  } catch (err: any) {
    console.error('Error adding player:', err)
    return errorResponse('Failed to add player', 500)
  }
}
