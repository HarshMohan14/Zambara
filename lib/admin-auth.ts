import { createHmac, timingSafeEqual } from 'crypto'

const COOKIE_NAME = 'admin_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days in seconds

export function getAdminCredentials(): { email: string; password: string } | null {
  const email = process.env.ADMIN_EMAIL?.trim()
  const password = process.env.ADMIN_PASSWORD?.trim()
  if (!email || !password) return null
  return { email, password }
}

export function verifyCredentials(email: string, password: string): boolean {
  const creds = getAdminCredentials()
  if (!creds) return false
  return email === creds.email && password === creds.password
}

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim()
  if (!secret || secret.length < 16) {
    throw new Error('ADMIN_SESSION_SECRET must be set in .env and at least 16 characters')
  }
  return secret
}

/** Call this before creating a session to avoid 500s; returns a user-friendly message if invalid. */
export function getSessionSecretError(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim()
  if (!secret) return 'ADMIN_SESSION_SECRET is not set in .env'
  if (secret.length < 16) return 'ADMIN_SESSION_SECRET must be at least 16 characters'
  return null
}

export function createSessionToken(): string {
  const payload = JSON.stringify({
    email: process.env.ADMIN_EMAIL,
    exp: Date.now() + COOKIE_MAX_AGE * 1000,
  })
  const payloadB64 = Buffer.from(payload, 'utf8').toString('base64url')
  const secret = getSecret()
  const sig = createHmac('sha256', secret).update(payloadB64).digest('base64url')
  return `${payloadB64}.${sig}`
}

export function verifySessionToken(token: string): boolean {
  try {
    const [payloadB64, sig] = token.split('.')
    if (!payloadB64 || !sig) return false
    const secret = getSecret()
    const expected = createHmac('sha256', secret).update(payloadB64).digest('base64url')
    if (expected.length !== sig.length || !timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(sig, 'utf8'))) {
      return false
    }
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'))
    if (payload.exp && Date.now() > payload.exp) return false
    return true
  } catch {
    return false
  }
}

export function getSessionCookieHeader(): string {
  const token = createSessionToken()
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}${secure}`
}

export function getClearSessionCookieHeader(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
}

export { COOKIE_NAME }
