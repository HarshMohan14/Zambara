'use client'

import { usePathname } from 'next/navigation'
import { Layout } from './Layout'

const PAGES_WITHOUT_FOOTER = ['/how-to-play', '/about', '/beach-battle', '/beach-battle/register']

export function ConditionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')
  const isKioskRoute = pathname?.startsWith('/reveal') || pathname?.startsWith('/tagcon')

  if (isAdminRoute || isKioskRoute) {
    return <>{children}</>
  }

  const hideFooter = pathname ? PAGES_WITHOUT_FOOTER.includes(pathname) : false
  return <Layout hideFooter={hideFooter}>{children}</Layout>
}
