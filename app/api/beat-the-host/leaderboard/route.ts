import { supabase } from '@/lib/supabase'
import { successResponse, serverErrorResponse } from '@/lib/api-response'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('beat_the_host_games')
      .select('id, winner_name, winner_id, duration_seconds, ended_at, started_at')
      .eq('status', 'completed')
      .not('duration_seconds', 'is', null)
      .order('duration_seconds', { ascending: true })
      .limit(50)
    if (error) throw error
    return successResponse({ leaderboard: data || [] })
  } catch {
    return serverErrorResponse('Failed to fetch leaderboard')
  }
}
