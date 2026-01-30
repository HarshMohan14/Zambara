/**
 * Edge-compatible session verification (no Node crypto).
 * Used only in middleware.
 */

const COOKIE_NAME = 'admin_session'

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) base64 += '='
  const bin = atob(base64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

function base64UrlEncode(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes)
  let bin = ''
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i])
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function verifySessionCookieEdge(cookieValue: string): Promise<boolean> {
  try {
    const secret = process.env.ADMIN_SESSION_SECRET?.trim()
    if (!secret || secret.length < 16) return false
    const [payloadB64, sig] = cookieValue.split('.')
    if (!payloadB64 || !sig) return false

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const payloadBytes = new TextEncoder().encode(payloadB64)
    const sigBuffer = await crypto.subtle.sign('HMAC', key, payloadBytes)
    const expectedSig = base64UrlEncode(sigBuffer)

    if (expectedSig.length !== sig.length) return false
    const sigBytes = base64UrlDecode(sig)
    const expectedBytes = base64UrlDecode(expectedSig)
    if (sigBytes.length !== expectedBytes.length) return false
    let diff = 0
    for (let i = 0; i < sigBytes.length; i++) diff |= sigBytes[i] ^ expectedBytes[i]
    if (diff !== 0) return false

    const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadB64))
    const payload = JSON.parse(payloadJson)
    if (payload.exp && Date.now() > payload.exp) return false
    return true
  } catch {
    return false
  }
}

export function getAdminSessionCookieName(): string {
  return COOKIE_NAME
}
