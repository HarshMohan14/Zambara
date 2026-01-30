import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionCookieEdge, getAdminSessionCookieName } from '@/lib/admin-auth-edge'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)

  if (pathname === '/admin/login') {
    const cookie = request.cookies.get(getAdminSessionCookieName())?.value
    if (cookie && (await verifySessionCookieEdge(cookie))) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
