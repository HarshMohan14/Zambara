'use client'

import { ConfirmProvider } from '@/components/admin/ConfirmProvider'
import { AdminLayoutWrapper } from '@/components/admin/AdminLayoutWrapper'

export function AdminClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConfirmProvider>
      <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
    </ConfirmProvider>
  )
}
