'use client'

import { usePathname } from 'next/navigation'
import { Layout } from './Layout'

export function ConditionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  if (isAdminRoute) {
    return <>{children}</>
  }

  return <Layout>{children}</Layout>
}
