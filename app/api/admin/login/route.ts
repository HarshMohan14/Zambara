import { NextRequest, NextResponse } from 'next/server'
import {
  verifyCredentials,
  getSessionCookieHeader,
  getAdminCredentials,
  getSessionSecretError,
} from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    if (!getAdminCredentials()) {
      return NextResponse.json(
        { error: 'Admin credentials not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env' },
        { status: 503 }
      )
    }
    const secretError = getSessionSecretError()
    if (secretError) {
      return NextResponse.json(
        { error: `Session not configured. ${secretError}` },
        { status: 503 }
      )
    }
    const body = await request.json()
    const { email, password } = body
    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }
    if (!verifyCredentials(email.trim(), (password as string).trim())) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }
    const cookieHeader = getSessionCookieHeader()
    const res = NextResponse.json({ success: true })
    res.headers.set('Set-Cookie', cookieHeader)
    return res
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
