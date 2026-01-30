import { NextResponse } from 'next/server'
import { getClearSessionCookieHeader } from '@/lib/admin-auth'

export async function POST() {
  const res = NextResponse.json({ success: true })
  res.headers.set('Set-Cookie', getClearSessionCookieHeader())
  return res
}
