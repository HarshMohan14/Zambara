import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifySessionToken, COOKIE_NAME } from '@/lib/admin-auth'
import { AdminClientLayout } from './AdminClientLayout'

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = headers().get('x-pathname') || ''
  const isLoginPage = pathname === '/admin/login'

  if (isLoginPage) {
    return <AdminClientLayout>{children}</AdminClientLayout>
  }

  const cookieStore = cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token || !verifySessionToken(token)) {
    redirect(`/admin/login?redirect=${encodeURIComponent(pathname || '/admin')}`)
  }

  return <AdminClientLayout>{children}</AdminClientLayout>
}
