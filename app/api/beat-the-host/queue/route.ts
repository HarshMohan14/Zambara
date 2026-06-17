import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('beat_the_host_players')
      .select('*')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
    if (error) throw error
    return successResponse({ players: data || [], total: data?.length || 0 })
  } catch (err: any) {
    return serverErrorResponse('Failed to fetch queue')
  }
}

export async function POST(request: NextRequest) {
  try {
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
    return serverErrorResponse('Failed to add player')
  }
}
