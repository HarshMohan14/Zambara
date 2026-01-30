'use client'

import { usePathname } from 'next/navigation'
import { Layout } from './Layout'

const PAGES_WITHOUT_FOOTER = ['/how-to-play', '/about']

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

  const hideFooter = pathname ? PAGES_WITHOUT_FOOTER.includes(pathname) : false
  return <Layout hideFooter={hideFooter}>{children}</Layout>
}
